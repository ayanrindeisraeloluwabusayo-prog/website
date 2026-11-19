// Motion graphics for "The airport trick": white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const easeOut = (t: number) => 1 - Math.pow(1 - t, 3);

const Person: React.FC<{ x: number; y: number; s?: number; color: string; o?: number }> = ({ x, y, s = 1, color, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-22} r={13} fill={color} />
    <path d="M -20 30 C -20 2, 20 2, 20 30 Z" fill={color} />
  </g>
);
void H; void W; void SERIF2;

/** Two labelled bars that fill to a percentage, with little figures above each. */
export const TwoBars: React.FC<{ from: number; at1: number; at2: number; title: string; footer: string;
  rows: [{ label: string; pct: number; people: number; gold: boolean; text?: string }, { label: string; pct: number; people: number; gold: boolean; text?: string }] }> = ({ from, at1, at2, title, footer, rows }) => {
  const f = useCurrentFrame();
  const row = (y: number, r: (typeof rows)[0], at: number) => {
    const k = p(f, at, 12);
    const g = interpolate(f, [at, at + 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    const col = r.gold ? FLASH : "#fff";
    return (
      <div style={{ position: "absolute", left: 110, width: 860, top: y, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ ...lab, fontSize: 30, color: col }}>{r.label}</div>
        <svg width={860} height={r.people ? 90 : 10} style={{ display: "block", marginTop: 6 }}>
          {Array.from({ length: r.people }, (_, i) => <Person key={i} x={30 + i * 62} y={50} s={1.15} color={i === 0 ? col : "rgba(255,255,255,0.55)"} />)}
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 8 }}>
          <div style={{ flex: 1, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <div style={{ width: `${r.pct * g}%`, height: "100%", borderRadius: 32, background: col, boxShadow: r.gold ? "0 0 30px rgba(243,194,29,0.8)" : "none" }} />
          </div>
          <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: r.text ? 44 : 96, letterSpacing: "-0.03em", color: col, width: 230, textAlign: "right" }}>{r.text ?? `${Math.round(r.pct * g)}%`}</div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 12) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", ...lab, fontSize: 32, color: "#fff" }}>{title}</div>
      {row(900, rows[0], at1)}
      {row(1250, rows[1], at2)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1620, textAlign: "center", ...lab, fontSize: 28, color: "rgba(255,255,255,0.8)" }}>{footer}</div>
    </AbsoluteFill>
  );
};

/** "Got the wait down to about eight minutes": a ring that fills while the number counts up to 8. */
export const WaitDown: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  const g = easeOut(interpolate(f, [from + 4, from + 40], [0, 1], clamp));
  const R = 250, C = 2 * Math.PI * R;
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={1230} r={R} fill="none" stroke="rgba(255,255,255,0.15)" strokeWidth={34} />
        <circle cx={540} cy={1230} r={R} fill="none" stroke={FLASH} strokeWidth={34} strokeLinecap="round" strokeDasharray={`${C * (8 / 12) * g} ${C}`} transform="rotate(-90 540 1230)" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1090, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 230, lineHeight: 1, color: "#fff", letterSpacing: "-0.04em" }}>{Math.round(8 * g)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...lab, fontSize: 34, color: "#fff" }}>MINUTES</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 30, color: "rgba(255,255,255,0.8)" }}>AVERAGE WAIT FOR BAGS</div>
    </AbsoluteFill>
  );
};

/** Complaint cards that keep piling up, then (at dropAt) fall away to almost nothing. */
export const Complaints: React.FC<{ from: number; dropAt?: number; startFull?: boolean }> = ({ from, dropAt = 1e9, startFull = false }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 10);
  const n = 14;
  const gone = easeOut(interpolate(f, [dropAt, dropAt + 30], [0, 1], clamp));
  return (
    <AbsoluteFill style={{ opacity: k }}>
      {Array.from({ length: n }, (_, i) => {
        const at = startFull ? from - 100 : from + i * 4;
        const a = p(f, at, 10);
        const keep = i < 1;
        const fall = keep ? 0 : gone * (1 + (i % 4) * 0.2);
        const x = 190 + ((i * 137) % 520), y = 1500 - i * 46;
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y + fall * 900, width: 330, height: 170, borderRadius: 14, background: "#fbfaf7", color: "#16161a",
            boxShadow: "0 16px 40px rgba(0,0,0,0.35)", opacity: a * (1 - Math.min(1, fall * 1.4)), transform: `rotate(${((i * 53) % 24) - 12}deg) scale(${0.8 + 0.2 * a})`, padding: "22px 26px" }}>
            <div style={{ ...lab, fontSize: 22, color: "#b0362c" }}>COMPLAINT</div>
            {[0.9, 0.7, 0.8].map((w, j) => <div key={j} style={{ marginTop: 14, height: 12, width: `${w * 100}%`, borderRadius: 6, background: "rgba(0,0,0,0.18)" }} />)}
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", ...lab, fontSize: 32, color: "#fff" }}>{f >= dropAt ? "COMPLAINTS: ALMOST ZERO" : "COMPLAINTS"}</div>
    </AbsoluteFill>
  );
};

/** One minute walking + seven standing, versus six times the walk: the bags arrive at the same moment. */
export const Journey: React.FC<{ from: number; at1: number; at2: number }> = ({ from, at1, at2 }) => {
  const f = useCurrentFrame();
  const L = 860, unit = L / 8;
  const row = (y: number, label: string, walk: number, at: number, walkTxt: string, standTxt: string) => {
    const k = p(f, at, 12);
    const g = easeOut(interpolate(f, [at + 4, at + 34], [0, 1], clamp));
    const wW = walk * unit * g, sW = (8 - walk) * unit * g;
    const walkerX = Math.min(wW, walk * unit);
    return (
      <div style={{ position: "absolute", left: 110, top: y, width: L, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ ...lab, fontSize: 30, color: "#fff" }}>{label}</div>
        <svg width={L} height={110} style={{ display: "block", marginTop: 10, overflow: "visible" }}>
          <Person x={Math.max(22, walkerX - 4)} y={50} s={1.4} color={FLASH} />
          <g transform={`translate(${L - 30} 40)`}><rect x={-22} y={-18} width={44} height={40} rx={8} fill="#fff" /><rect x={-9} y={-28} width={18} height={12} rx={4} fill="none" stroke="#fff" strokeWidth={4} /></g>
        </svg>
        <div style={{ display: "flex", height: 70, marginTop: 6, borderRadius: 35, overflow: "hidden", background: "rgba(255,255,255,0.1)" }}>
          <div style={{ width: wW, background: FLASH, boxShadow: "0 0 30px rgba(243,194,29,0.7)" }} />
          <div style={{ width: sW, background: "rgba(255,255,255,0.85)" }} />
        </div>
        <div style={{ display: "flex", gap: 26, marginTop: 14, ...lab, fontSize: 28, opacity: g }}>
          <div style={{ color: FLASH }}>{walkTxt}</div>
          <div style={{ color: "#fff" }}>{standTxt}</div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 12) }}>
      {row(830, "BEFORE", 1, at1, "WALK 1 MIN", "STAND 7 MIN")}
      {row(1210, "AFTER", 6, at2, "WALK 6× LONGER", "STAND LESS")}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1620, textAlign: "center", ...lab, fontSize: 28, color: "rgba(255,255,255,0.85)", opacity: p(f, at2 + 30, 12) }}>THE BAGS ARRIVE AT THE SAME TIME</div>
    </AbsoluteFill>
  );
};

/** Alone in a plain room for fifteen minutes, with one red button. */
export const ShockRoom: React.FC<{ from: number; buttonAt: number }> = ({ from, buttonAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14), b = p(f, buttonAt, 12);
  const secs = Math.max(0, 15 * 60 - Math.floor((f - from) * 1.5));
  const mm = String(Math.floor(secs / 60)).padStart(2, "0"), ss = String(secs % 60).padStart(2, "0");
  const glow = 0.6 + 0.4 * Math.sin(f / 5);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={110} y={860} width={860} height={760} rx={24} fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth={6} />
        <rect x={360} y={1430} width={140} height={20} rx={6} fill="rgba(255,255,255,0.7)" />
        <rect x={372} y={1450} width={14} height={110} fill="rgba(255,255,255,0.7)" /><rect x={474} y={1450} width={14} height={110} fill="rgba(255,255,255,0.7)" />
        <Person x={430} y={1380} s={2.6} color="#fff" />
        <g opacity={b} transform={`translate(700 1430) scale(${0.6 + 0.4 * b})`}>
          <rect x={-70} y={-10} width={140} height={60} rx={10} fill="#2a2d3a" stroke="#fff" strokeWidth={4} />
          <ellipse cx={0} cy={-8} rx={46} ry={20} fill="#e2342b" />
          <ellipse cx={0} cy={-8} rx={80} ry={40} fill="#e2342b" opacity={0.25 * glow} />
          <path d="M -14 -96 L 8 -96 L -4 -66 L 14 -66 L -12 -30 L -4 -58 L -20 -58 Z" fill={FLASH} />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 110, color: "#fff", letterSpacing: "0.02em" }}>{mm}:{ss}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1680, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>ALONE WITH THEIR THOUGHTS</div>
    </AbsoluteFill>
  );
};

/** "More than half of them yawned within five minutes": 20 viewers in front of a screen, 11 light up gold one by one. */
export const HalfYawn: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  const order = [3, 14, 7, 18, 0, 11, 5, 16, 9, 1, 12];
  const secs = Math.min(300, Math.max(0, Math.floor((f - from) * 2.4)));
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <div style={{ position: "absolute", left: 240, top: 800, width: 600, height: 230, borderRadius: 18, border: "5px solid #fff", background: "rgba(255,255,255,0.08)",
        display: "flex", alignItems: "center", justifyContent: "center", ...lab, fontSize: 30, color: "#fff" }}>YAWNING FACES</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 20 }, (_, i) => {
          const x = 190 + (i % 5) * 175, y = 1150 + Math.floor(i / 5) * 160;
          const n = order.indexOf(i);
          const lit = n >= 0 ? p(f, at + n * 4, 8) : 0;
          return (
            <g key={i}>
              <Person x={x} y={y} s={1.6} color={lit > 0.5 ? FLASH : "rgba(255,255,255,0.6)"} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1760, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>
        {f >= at + 40 ? "11 OUT OF 20 · MORE THAN HALF" : `TIMER ${Math.floor(secs / 60)}:${String(secs % 60).padStart(2, "0")}`}
      </div>
    </AbsoluteFill>
  );
};
