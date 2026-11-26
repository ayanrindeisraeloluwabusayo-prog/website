// Lockup v3: the words are placed from measurements of the real rendered letters, so small words never
// touch the big word's tall letters (b d f h k l t, capitals, i/j dots) or hanging letters (g j p q y , ;).
// A small line above a big word tucks into a gap between its tall letters when one is wide enough
// (like the reference "is expressing / hatred"), otherwise it sits clear above the tallest letter.
import { useLayoutEffect, useRef, useState } from "react";
import { getInputProps, useCurrentFrame } from "remotion";
import { p, W } from "./kit";
import { B, S, SANS2, SERIF2, type Kind, type TLine } from "./type";

const TALL = /[A-Z0-9bdfhklt'’"!?ij]/;
const HANG = /[gjpqy,;]/;
const isBig = (k: Kind) => k !== "s";

const look = (kind: Kind, size?: number): React.CSSProperties => {
  if (kind === "serif") return { fontFamily: SERIF2, fontWeight: 500, fontSize: size ?? B, letterSpacing: "-0.045em", lineHeight: 0.84 };
  if (kind === "bold") return { fontFamily: SANS2, fontWeight: 800, fontSize: size ?? B * 0.7, letterSpacing: "-0.05em", lineHeight: 0.9 };
  if (kind === "quote") return { fontFamily: SERIF2, fontStyle: "italic", fontWeight: 500, fontSize: size ?? B * 0.62, letterSpacing: "-0.03em", lineHeight: 0.95 };
  return { fontFamily: SANS2, fontWeight: 400, fontSize: size ?? S, letterSpacing: "-0.018em", lineHeight: 1.02 };
};

// vertical glyph metrics (ascender of a tall letter, x-height, cap height, descender) from the font itself
let cv: CanvasRenderingContext2D | null | undefined;
const vmetrics = (st: React.CSSProperties) => {
  if (cv === undefined) cv = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  const size = Number(st.fontSize);
  if (!cv) return { asc: size * 0.75, xh: size * 0.48, cap: size * 0.7, desc: size * 0.22 };
  cv.font = `${st.fontStyle ?? "normal"} ${st.fontWeight ?? 400} ${size}px ${st.fontFamily}`;
  return {
    asc: Math.max(cv.measureText("k").actualBoundingBoxAscent, cv.measureText("l").actualBoundingBoxAscent, cv.measureText("i").actualBoundingBoxAscent),
    xh: cv.measureText("x").actualBoundingBoxAscent,
    cap: cv.measureText("H").actualBoundingBoxAscent,
    desc: Math.max(cv.measureText("g").actualBoundingBoxDescent, cv.measureText("p").actualBoundingBoxDescent, cv.measureText("y").actualBoundingBoxDescent),
  };
};

type Fit = { mb: number[]; mt: number[]; indent: (number | null)[] };

export const Lockup: React.FC<{ lines: TLine[]; top: number; x?: number; width?: number; color?: string; until?: number; shadow?: boolean }> = ({
  lines,
  top,
  x,
  width = 880,
  color = "#fff",
  until = 1e9,
  shadow = true,
}) => {
  const f = useCurrentFrame();
  const box = useRef<HTMLDivElement>(null);
  const zero: Fit = { mb: lines.map(() => 0), mt: lines.map(() => 0), indent: lines.map(() => null) };
  const [fit, setFit] = useState<Fit>(zero);
  const [fontsReady, setFontsReady] = useState(0);
  useLayoutEffect(() => {
    if (typeof document !== "undefined" && document.fonts && document.fonts.status !== "loaded") {
      document.fonts.ready.then(() => setFontsReady((n) => n + 1));
    }
  }, []);

  useLayoutEffect(() => {
    const el = box.current;
    if (!el) return;
    const crect = el.getBoundingClientRect();
    const k = crect.width / el.offsetWidth || 1; // the preview/render may scale the page
    const rel = (r: DOMRect) => ({ l: (r.left - crect.left) / k, r: (r.right - crect.left) / k, t: (r.top - crect.top) / k, b: (r.bottom - crect.top) / k });
    const rows = [...el.querySelectorAll<HTMLElement>("[data-row]")];
    const info = rows.map((row, i) => {
      const kind = lines[i].kind ?? "s";
      const st = look(kind, lines[i].size);
      const base = rel(row.querySelector<HTMLElement>("[data-base]")!.getBoundingClientRect()).b;
      const chars: { ch: string; l: number; r: number; t: number; b: number }[] = [];
      if (isBig(kind)) {
        row.querySelectorAll<HTMLElement>("[data-w]").forEach((w) => {
          const node = w.firstChild;
          if (!node || node.nodeType !== 3) return;
          const text = node.textContent ?? "";
          for (let c = 0; c < text.length; c++) {
            const range = document.createRange();
            range.setStart(node, c);
            range.setEnd(node, c + 1);
            chars.push({ ch: text[c], ...rel(range.getBoundingClientRect()) });
          }
        });
      }
      const words = [...row.querySelectorAll<HTMLElement>("[data-w]")].map((w) => rel(w.getBoundingClientRect()));
      const textL = Math.min(...words.map((w) => w.l));
      const textR = Math.max(...words.map((w) => w.r));
      return { kind, st, base, chars, textL, textR, vm: vmetrics(st) };
    });
    const next: Fit = { mb: [...fit.mb], mt: [...fit.mt], indent: [...fit.indent] };
    for (let i = 0; i < lines.length; i++) {
      const me = info[i];
      if (me.kind !== "s") continue;
      const ws = me.textR - me.textL;
      const align = lines[i].align ?? "center";
      const ind = lines[i].indent ?? 0;
      const own = align === "flex-start" ? ind : align === "flex-end" ? width - ind - ws : (width - ws) / 2;
      // ---- small line above a big word
      const nx = info[i + 1];
      if (nx && isBig(nx.kind)) {
        const pad = B * 0.05;
        const tall = nx.chars.filter((c) => TALL.test(c.ch)).map((c) => [c.l, c.r] as [number, number]);
        const clear = (x0: number) => tall.every(([a, b]) => x0 + ws + pad <= a || x0 - pad >= b);
        const inside = (x0: number) => x0 >= nx.textL - pad && x0 + ws <= nx.textR + pad;
        let spot: number | null = clear(own) && inside(own) ? own : null;
        if (spot === null) {
          const edges = [nx.textL, ...tall.flatMap(([a, b]) => [a, b]), nx.textR];
          let best = Infinity;
          for (let e = 0; e < edges.length; e += 2) {
            const lo = edges[e] + pad;
            const hi = edges[e + 1] - pad - ws;
            if (hi < lo) continue;
            const xx = Math.min(hi, Math.max(lo, own));
            if (clear(xx) && inside(xx) && Math.abs(xx - own) < best) {
              best = Math.abs(xx - own);
              spot = xx;
            }
          }
        }
        const smallDesc = /[gjpqy,;]/.test(lines[i].words.map((w) => w.w).join("")) ? me.vm.desc : me.vm.desc * 0.15;
        // target distance from the small baseline down to the big baseline
        const D = spot !== null ? nx.vm.xh + B * 0.06 : nx.vm.asc + B * 0.045 + smallDesc;
        next.mb[i] = fit.mb[i] + (D - (nx.base - me.base));
        next.indent[i] = spot;
      }
      // ---- small line under a big word: clear its hanging letters
      const pv = info[i - 1];
      if (pv && isBig(pv.kind)) {
        const x0 = next.indent[i] ?? own;
        let deep = B * 0.03;
        pv.chars.filter((c) => HANG.test(c.ch)).forEach((c) => {
          if (!(x0 + ws < c.l || x0 > c.r)) deep = Math.max(deep, pv.vm.desc);
        });
        const D = deep + B * 0.05 + me.vm.cap;
        next.mt[i] = fit.mt[i] + (D - (me.base - pv.base));
      }
    }
    const moved = next.mb.some((v, i) => Math.abs(v - fit.mb[i]) > 0.5) || next.mt.some((v, i) => Math.abs(v - fit.mt[i]) > 0.5) || next.indent.some((v, i) => (v ?? -1) !== (fit.indent[i] ?? -1) && Math.abs((v ?? -1) - (fit.indent[i] ?? -1)) > 0.5);
    if (moved) setFit(next);
  });

  if (f >= until) return null;
  const debug = (getInputProps() as { debug?: boolean }).debug;
  const left = x ?? (W - width) / 2;
  return (
    <div ref={box} data-fonts={fontsReady} style={{ position: "absolute", left, top, width, display: "flex", flexDirection: "column", color }}>
      {lines.map((line, i) => {
        const kind = line.kind ?? "s";
        const prev = i > 0 ? (lines[i - 1].kind ?? "s") : null;
        const L = look(kind, line.size);
        const size = Number(L.fontSize);
        const tucked = fit.indent[i];
        const align = tucked !== null ? "flex-start" : (line.align ?? "center");
        const indent = tucked !== null ? tucked : (line.indent ?? 0);
        const origin = align === "flex-start" ? `${indent}px 50%` : align === "flex-end" ? "100% 50%" : "50% 50%";
        return (
          <div
            key={i}
            data-row
            style={{
              ...L,
              display: "flex",
              alignItems: "baseline",
              justifyContent: align,
              paddingLeft: align === "flex-start" ? indent : 0,
              paddingRight: align === "flex-end" ? indent : 0,
              gap: size * (isBig(kind) ? 0.18 : 0.26),
              marginTop: (prev && isBig(kind) && isBig(prev) ? -size * 0.1 : 0) + fit.mt[i],
              marginBottom: fit.mb[i],
              transform: kind === "serif" ? "scaleX(0.88)" : undefined,
              transformOrigin: origin,
              position: "relative",
              zIndex: isBig(kind) ? 1 : 2,
              textShadow: shadow && color === "#fff" ? "0 2px 22px rgba(0,0,0,0.32)" : undefined,
              outline: debug ? "1px dashed rgba(255,0,0,0.6)" : undefined,
            }}
          >
            <span data-base style={{ display: "inline-block", width: 0, height: 0 }} />
            {line.words.map((w, wi) => {
              const t = p(f, w.at, 4);
              return (
                <span key={wi} data-w style={{ display: "inline-block", whiteSpace: "pre", opacity: t, filter: t < 1 ? `blur(${(1 - t) * 10}px)` : undefined, translate: `0px ${(1 - t) * 6}px` }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};
