// Type system v2, matched against the reference frames:
//   small words  : Inter Tight 400, ~4.7 % of the width, tight letter-spacing (the Helvetica role)
//   key word     : Newsreader 500, condensed to 88 % with tight letter-spacing (the narrow newspaper serif)
//   statement    : Inter Tight 800 (the heavy grotesk key word on cards)
//   quote        : Newsreader 500 italic
// Small lead-in words nestle into the ascender space of the key word below them, like the reference.
import { loadFont } from "@remotion/fonts";
import { getInputProps, staticFile, useCurrentFrame } from "remotion";
import { p, W } from "./kit";

for (const w of ["400", "500", "700", "800"]) {
  loadFont({ family: "Inter Tight", url: staticFile(`fonts/inter-tight-latin-${w}-normal.woff2`), weight: w, format: "woff2" });
}
loadFont({ family: "Newsreader", url: staticFile("fonts/newsreader-latin-500-normal.woff2"), weight: "500", format: "woff2" });
loadFont({ family: "Newsreader", url: staticFile("fonts/newsreader-latin-500-italic.woff2"), weight: "500", style: "italic", format: "woff2" });

export const SANS2 = "'Inter Tight', 'Helvetica Neue', Arial, sans-serif";
export const SERIF2 = "Newsreader, 'Times New Roman', serif";
export const S = 51; // small words
export const B = 200; // serif key word

export type Kind = "s" | "serif" | "bold" | "quote";
export type TWord = { w: string; at: number };
export type TLine = { kind?: Kind; words: TWord[]; align?: "flex-start" | "center" | "flex-end"; indent?: number; size?: number };

const look = (kind: Kind, size?: number): React.CSSProperties => {
  if (kind === "serif") return { fontFamily: SERIF2, fontWeight: 500, fontSize: size ?? B, letterSpacing: "-0.045em", lineHeight: 0.84 };
  if (kind === "bold") return { fontFamily: SANS2, fontWeight: 800, fontSize: size ?? B * 0.7, letterSpacing: "-0.05em", lineHeight: 0.9 };
  if (kind === "quote") return { fontFamily: SERIF2, fontStyle: "italic", fontWeight: 500, fontSize: size ?? B * 0.62, letterSpacing: "-0.03em", lineHeight: 0.95 };
  return { fontFamily: SANS2, fontWeight: 400, fontSize: size ?? S, letterSpacing: "-0.018em", lineHeight: 1.02 };
};
const isBig = (k: Kind) => k !== "s";


// ---------- measured lockups: small words never touch the big word's tall or hanging letters ----------
let ctx2: CanvasRenderingContext2D | null | undefined;
const canvas = () => {
  if (ctx2 === undefined) ctx2 = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  return ctx2;
};
type Span = [number, number];
type LineMetrics = { width: number; tall: Span[]; low: (Span & { d?: number })[]; lowDepth: number[]; baseline: number; tallTop: number; xTop: number; box: number; cap: number; maxDescent: number };
/** Measures one rendered line: glyph intervals of tall letters (above x-height) and hanging letters (below the baseline),
 *  the baseline inside the CSS line box, and the line's width. x positions are unscaled, from the text's left edge. */
const measureLine = (text: string[], st: React.CSSProperties, gapPx: number): LineMetrics | null => {
  const c = canvas();
  if (!c) return null;
  const size = Number(st.fontSize);
  c.font = `${st.fontStyle ?? "normal"} ${st.fontWeight ?? 400} ${size}px ${st.fontFamily}`;
  const ls = parseFloat(String(st.letterSpacing ?? "0")) * size;
  (c as unknown as { letterSpacing: string }).letterSpacing = `${ls}px`;
  const fm = c.measureText("Hxgy");
  const A = fm.fontBoundingBoxAscent;
  const D = fm.fontBoundingBoxDescent;
  const box = Number(st.lineHeight) * size;
  const baseline = (box - (A + D)) / 2 + A;
  const xh = c.measureText("x").actualBoundingBoxAscent;
  const cap = c.measureText("H").actualBoundingBoxAscent;
  const tall: Span[] = [];
  const low: Span[] = [];
  const lowDepth: number[] = [];
  let tallTop = baseline - xh;
  let maxDescent = 0;
  let x = 0;
  text.forEach((word, wi) => {
    let pre = 0;
    for (const ch of word) {
      const m = c.measureText(ch);
      const a = x + pre + m.actualBoundingBoxLeft * -1;
      const b = x + pre + m.actualBoundingBoxRight;
      if (m.actualBoundingBoxAscent > xh * 1.12) {
        tall.push([Math.min(a, x + pre), Math.max(b, x + pre + m.width)]);
        tallTop = Math.min(tallTop, baseline - m.actualBoundingBoxAscent);
      }
      if (m.actualBoundingBoxDescent > size * 0.06) {
        low.push([Math.min(a, x + pre), Math.max(b, x + pre + m.width)]);
        lowDepth.push(m.actualBoundingBoxDescent);
      }
      maxDescent = Math.max(maxDescent, m.actualBoundingBoxDescent);
      pre += m.width + ls;
    }
    x += c.measureText(word).width + (wi < text.length - 1 ? gapPx : 0);
  });
  return { width: x, tall, low, lowDepth, baseline, tallTop, xTop: baseline - xh, box, cap, maxDescent };
};
/** Where the line's text starts inside the lockup (after alignment and the serif's horizontal squeeze). */
const placeLine = (width: number, textW: number, align: string, indent: number, squeeze: number) => {
  if (align === "flex-start") return { start: indent, k: squeeze, origin: indent };
  if (align === "flex-end") return { start: width - indent - textW, k: squeeze, origin: width };
  return { start: (width - textW) / 2, k: squeeze, origin: width / 2 };
};
const toScreen = (x: number, pl: { start: number; k: number; origin: number }) => pl.origin + (pl.start + x - pl.origin) * pl.k;

/** A phrase that builds word by word. `x`/`width` place the block where the scene has room. */
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
  if (f >= until) return null;
  const left = x ?? (W - width) / 2;
  return (
    <div style={{ position: "absolute", left, top, width, display: "flex", flexDirection: "column", color }}>
      {lines.map((line, i) => {
        const kind = line.kind ?? "s";
        const next = lines[i + 1]?.kind ?? "s";
        const prev = i > 0 ? (lines[i - 1].kind ?? "s") : null;
        const L = look(kind, line.size);
        const size = Number(L.fontSize);
        let align = line.align ?? "center";
        let indent = line.indent ?? 0;
        let marginBottom = 0;
        let marginTop = prev && isBig(kind) && isBig(prev) ? -size * 0.1 : 0;
        const gapOf = (k: Kind, sz: number) => sz * (isBig(k) ? 0.18 : 0.26);
        const squeezeOf = (k: Kind) => (k === "serif" ? 0.88 : 1);
        // small words directly above a big word: tuck into a gap between its tall letters if one is wide enough,
        // otherwise sit fully above the tallest letter. Never touch.
        if (kind === "s" && isBig(next)) {
          const bl = lines[i + 1];
          const BL = look(next, bl.size);
          const bm = measureLine(bl.words.map((w) => w.w), BL, gapOf(next, Number(BL.fontSize)));
          const sm = measureLine(line.words.map((w) => w.w), L, gapOf(kind, size));
          if (bm && sm) {
            const bp = placeLine(width, bm.width, bl.align ?? "center", bl.indent ?? 0, squeezeOf(next));
            const tall = bm.tall.map(([a, b]) => [toScreen(a, bp), toScreen(b, bp)] as Span).sort((u, v) => u[0] - v[0]);
            const pad = B * 0.05;
            const own = placeLine(width, sm.width, align, indent, 1).start;
            const clear = (x0: number) => tall.every(([a, b]) => x0 + sm.width + pad <= a || x0 - pad >= b);
            const inside = (x0: number) => x0 >= toScreen(0, bp) - pad && x0 + sm.width <= toScreen(bm.width, bp) + pad;
            let spot: number | null = clear(own) && inside(own) ? own : null;
            if (spot === null) {
              const w0 = toScreen(0, bp);
              const w1 = toScreen(bm.width, bp);
              const edges = [w0, ...tall.flatMap(([a, b]) => [a, b]), w1];
              let best = Infinity;
              for (let e = 0; e < edges.length; e += 2) {
                const lo = edges[e] + pad;
                const hi = edges[e + 1] - pad - sm.width;
                if (hi < lo) continue;
                const xx = Math.min(hi, Math.max(lo, own));
                if (clear(xx) && inside(xx) && Math.abs(xx - own) < best) {
                  best = Math.abs(xx - own);
                  spot = xx;
                }
              }
            }
            const smallBase = sm.baseline;
            const smallBox = sm.box;
            if (spot !== null) {
              // tucked: the small baseline sits just above the big word's x-height
              const baseAbs = bm.xTop - B * 0.05;
              marginBottom = -(baseAbs - smallBase + smallBox);
              align = "flex-start";
              indent = spot;
            } else {
              // stacked: the small words' lowest point sits clear above the tallest letter
              const baseAbs = bm.tallTop - B * 0.045 - sm.maxDescent;
              marginBottom = -(baseAbs - smallBase + smallBox);
            }
          }
        }
        // small words directly under a big word: clear its hanging letters (p, g, j, y, commas)
        if (kind === "s" && prev && isBig(prev)) {
          const pl = lines[i - 1];
          const PL = look(prev, pl.size);
          const pm = measureLine(pl.words.map((w) => w.w), PL, gapOf(prev, Number(PL.fontSize)));
          const sm = measureLine(line.words.map((w) => w.w), L, gapOf(kind, size));
          if (pm && sm) {
            const pp = placeLine(width, pm.width, pl.align ?? "center", pl.indent ?? 0, squeezeOf(prev));
            const own = placeLine(width, sm.width, align, indent, 1).start;
            let bottom = pm.baseline + B * 0.02;
            pm.low.forEach(([a, b], k) => {
              const A2 = toScreen(a, pp);
              const B2 = toScreen(b, pp);
              if (!(own + sm.width < A2 || own > B2)) bottom = Math.max(bottom, pm.baseline + pm.lowDepth[k]);
            });
            const glyphTopInBox = sm.baseline - sm.cap;
            marginTop = bottom + B * 0.04 - pm.box - glyphTopInBox;
          }
        }
        const origin = align === "flex-start" ? `${indent}px 50%` : align === "flex-end" ? "100% 50%" : "50% 50%";
        const dbg = (getInputProps() as { debug?: boolean }).debug && isBig(kind) ? (() => {
          const m = measureLine(line.words.map((w) => w.w), L, gapOf(kind, size));
          if (!m) return null;
          const pl = placeLine(width, m.width, line.align ?? "center", line.indent ?? 0, squeezeOf(kind));
          return m.tall.map(([a, b], k) => <div key={k} style={{ position: "absolute", left: toScreen(a, pl), width: toScreen(b, pl) - toScreen(a, pl), top: m.tallTop, height: m.xTop - m.tallTop, background: "rgba(255,0,0,0.45)", zIndex: 5 }} />);
        })() : null;
        return (
          <div
            key={i}
            style={{
              ...L,
              display: "flex",
              justifyContent: align,
              paddingLeft: align === "flex-start" ? indent : 0,
              paddingRight: align === "flex-end" ? indent : 0,
              gap: size * (isBig(kind) ? 0.18 : 0.26),
              marginTop,
              marginBottom,
              transform: kind === "serif" ? "scaleX(0.88)" : undefined,
              transformOrigin: origin,
              position: "relative",
              zIndex: isBig(kind) ? 1 : 2,
              textShadow: shadow && color === "#fff" ? "0 2px 22px rgba(0,0,0,0.32)" : undefined,
            }}
          >
            {dbg ? <div style={{ position: "absolute", left: 0, top: 0, width, height: 0, transform: kind === "serif" ? "scaleX(1.136)" : undefined, transformOrigin: origin }}>{dbg}</div> : null}
            {line.words.map((w, wi) => {
              const t = p(f, w.at, 4);
              return (
                <span key={wi} style={{ display: "inline-block", whiteSpace: "pre", opacity: t, filter: t < 1 ? `blur(${(1 - t) * 10}px)` : undefined, translate: `0px ${(1 - t) * 6}px` }}>
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

/** Words of one line, spaced `gap` frames apart. */
export const ws = (text: string, at: number, gap = 7): TWord[] => text.split(" ").map((w, i) => ({ w, at: at + i * gap }));
