// Motion graphics for "Why talking to yourself is actually smart": white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a";

const Bubble: React.FC<{ text: string; x: number; y: number; k: number; gold?: boolean; dim?: boolean; size?: number; tail?: "l" | "r" }> = ({ text, x, y, k, gold, dim, size = 64, tail = "l" }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: k * (dim ? 0.45 : 1), transform: `scale(${0.6 + 0.4 * k})`, transformOrigin: tail === "l" ? "0% 100%" : "100% 100%" }}>
    <div style={{ background: gold ? FLASH : "#fbfaf7", color: INK, borderRadius: 40, padding: "26px 40px", fontFamily: SANS2, fontWeight: 900, fontSize: size, boxShadow: "0 24px 50px rgba(0,0,0,0.35)", whiteSpace: "nowrap" }}>{text}</div>
    <div style={{ position: "absolute", bottom: -24, [tail === "l" ? "left" : "right"]: 50, width: 0, height: 0, borderLeft: "22px solid transparent", borderRight: "22px solid transparent", borderTop: `30px solid ${gold ? FLASH : "#fbfaf7"}` } as React.CSSProperties} />
  </div>
);

/** "keys, keys, where are my keys?" as speech bubbles. */
export const KeysBubbles: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Bubble text="keys…" x={140} y={820} k={p(f, at[0], 10)} />
      <Bubble text="keys…" x={520} y={1060} k={p(f, at[1], 10)} tail="r" />
      <Bubble text="where are my keys?" x={120} y={1320} k={p(f, at[2], 10)} gold size={58} />
    </AbsoluteFill>
  );
};

/** Malala's words, as a quote card; her name lights up gold. */
export const Quote: React.FC<{ from: number; nameAt: number }> = ({ from, nameAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14), n = p(f, nameAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, top: 780, width: 880, borderRadius: 26, background: "#fbfaf7", color: INK, padding: "60px 60px 50px", boxShadow: "0 40px 80px rgba(0,0,0,0.45)",
        opacity: k, transform: `translateY(${(1 - k) * 80}px) rotate(${-2 + 2 * k}deg)` }}>
        <div style={{ fontFamily: SERIF2, fontSize: 200, lineHeight: 0.5, color: "#0b2a8f", height: 70 }}>“</div>
        <div style={{ fontFamily: SERIF2, fontSize: 76, lineHeight: 1.08 }}>If he comes, what would you do, <span style={{ background: `linear-gradient(90deg, ${FLASH} ${n * 100}%, transparent ${n * 100}%)`, padding: "0 6px" }}>Malala?</span></div>
        <div style={{ ...lab, fontSize: 22, marginTop: 30, color: "#b0362c" }}>MALALA YOUSAFZAI · TV INTERVIEW · 2013</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, textAlign: "center", ...lab, fontSize: 34, color: FLASH, opacity: n }}>SHE TALKED TO HERSELF BY NAME</div>
    </AbsoluteFill>
  );
};

/** The object-search test: a grid of objects; saying "banana" finds it faster. */
export const Search: React.FC<{ from: number; sayAt: number; foundAt: number }> = ({ from, sayAt, foundAt }) => {
  const f = useCurrentFrame();
  const icons = ["🍌", "☕", "🔑", "⚽", "📱", "🎧", "📚", "🕶️", "🧢", "🍎", "✂️", "⏰"];
  const shape = (i: number) => {
    const c = ["#ffd60a", "#8b5a2b", "#c0c0c0", "#fff", "#333", "#a855f7", "#3b82f6", "#111", "#ff3b3b", "#ef4444", "#14b8a6", "#f97316"][i];
    if (i === 0) return <path d="M -40 10 Q 0 50 45 -20 Q 10 25 -40 10 Z" fill={c} stroke={INK} strokeWidth={4} />;
    return i % 3 === 0 ? <circle r={34} fill={c} stroke={INK} strokeWidth={4} /> : i % 3 === 1 ? <rect x={-32} y={-32} width={64} height={64} rx={10} fill={c} stroke={INK} strokeWidth={4} /> : <polygon points="0,-38 36,30 -36,30" fill={c} stroke={INK} strokeWidth={4} />;
  };
  void icons;
  const order = [7, 2, 10, 5, 0, 8, 3, 11, 1, 6, 9, 4];
  const found = p(f, foundAt, 10);
  const bar = (y: number, label: string, end: number, gold: boolean) => {
    const g = interpolate(f, [from + 10, end], [0, 1], clamp);
    return <div style={{ position: "absolute", left: 140, width: 800, top: y }}>
      <div style={{ ...lab, fontSize: 26, color: gold ? FLASH : "#fff" }}>{label}</div>
      <div style={{ marginTop: 10, height: 34, borderRadius: 17, background: "rgba(255,255,255,0.15)" }}><div style={{ width: `${g * 100}%`, height: "100%", borderRadius: 17, background: gold ? FLASH : "#fff" }} /></div>
    </div>;
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={140} y={760} width={800} height={600} rx={24} fill="rgba(255,255,255,0.08)" stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
        {order.map((o, i) => { const x = 240 + (i % 4) * 200, y = 860 + Math.floor(i / 4) * 200; return <g key={i} transform={`translate(${x} ${y})`} opacity={found > 0.5 && o !== 0 ? 0.3 : 1}>{shape(o)}</g>; })}
        {(() => { const i = order.indexOf(0), x = 240 + (i % 4) * 200, y = 860 + Math.floor(i / 4) * 200; return <circle cx={x} cy={y} r={70 + 20 * (1 - found)} fill="none" stroke={FLASH} strokeWidth={10} opacity={found} />; })()}
      </svg>
      <Bubble text="banana, banana…" x={420} y={600} k={p(f, sayAt, 10)} gold size={52} tail="r" />
      {bar(1420, "SEARCHING IN SILENCE", foundAt + 40, false)}
      {bar(1530, "SAYING THE NAME OUT LOUD", foundAt, true)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", ...lab, fontSize: 26, color: "rgba(255,255,255,0.8)" }}>LUPYAN & SWINGLEY · 2012</div>
    </AbsoluteFill>
  );
};

/** Three ways to coach yourself: your name, "you", and "I" (struck out). */
export const Voices: React.FC<{ nameAt: number; youAt: number; iAt: number }> = ({ nameAt, youAt, iAt }) => {
  const f = useCurrentFrame();
  const strike = p(f, iAt + 6, 10);
  return (
    <AbsoluteFill>
      <Bubble text="Mike, you've got this" x={110} y={760} k={p(f, nameAt, 10)} gold size={60} />
      <Bubble text="You can do this" x={330} y={1020} k={p(f, youAt, 10)} gold size={60} tail="r" />
      <div style={{ position: "absolute", left: 110, top: 1290 }}>
        <Bubble text="I can do this" x={0} y={0} k={p(f, iAt, 10)} dim size={60} />
        <div style={{ position: "absolute", left: 20, top: 58, height: 10, width: 440 * strike, background: "#ff3b3b", borderRadius: 5 }} />
      </div>
    </AbsoluteFill>
  );
};

/** Three results, each ticked. */
export const Results: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const f = useCurrentFrame();
  const rows = ["FELT MORE CONFIDENT", "GAVE BETTER SPEECHES", "BROODED LESS AFTER"];
  return (
    <AbsoluteFill>
      {rows.map((r, i) => {
        const k = p(f, at[i], 12);
        return <div key={i} style={{ position: "absolute", left: 120, width: 840, top: 820 + i * 230, height: 190, borderRadius: 24, background: "rgba(255,255,255,0.1)", border: "3px solid rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", padding: "0 40px", gap: 30, opacity: k, transform: `translateX(${(1 - k) * 80}px)` }}>
          <div style={{ width: 110, height: 110, borderRadius: 55, background: FLASH, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(f, at[i] + 6, 10)})` }}>
            <svg width={64} height={64}><path d="M 8 34 L 26 52 L 58 14" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ ...lab, fontSize: 40, color: "#fff" }}>{r}</div>
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, textAlign: "center", ...lab, fontSize: 26, color: "rgba(255,255,255,0.8)" }}>KROSS ET AL. · 2014</div>
    </AbsoluteFill>
  );
};

/** An emotional-reaction trace that spikes, then settles within about a second (an illustration). */
export const Wave: React.FC<{ from: number; calmAt: number }> = ({ from, calmAt }) => {
  const f = useCurrentFrame();
  const N = 120;
  const pts = Array.from({ length: N }, (_, i) => {
    const t = i / N, x = 140 + t * 800;
    const amp = t < 0.3 ? 30 : t < 0.45 ? 30 + 230 * Math.sin(((t - 0.3) / 0.15) * Math.PI / 2) : 260 * Math.exp(-(t - 0.45) * 9) + 30;
    return [x, 1200 - amp * (0.5 + 0.5 * Math.sin(i * 1.7))] as [number, number];
  });
  const draw = interpolate(f, [from + 4, calmAt + 20], [0, 1], clamp);
  const shown = pts.slice(0, Math.max(2, Math.round(draw * N)));
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>THE BRAIN'S EMOTIONAL REACTION</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={140} x2={940} y1={1230} y2={1230} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
        <polyline points={shown.map(([x, y]) => `${x},${y}`).join(" ")} fill="none" stroke={FLASH} strokeWidth={6} strokeLinejoin="round" />
        <g opacity={p(f, calmAt, 10)}>
          <line x1={500} x2={640} y1={1300} y2={1300} stroke="#fff" strokeWidth={4} />
          <line x1={500} x2={500} y1={1285} y2={1315} stroke="#fff" strokeWidth={4} /><line x1={640} x2={640} y1={1285} y2={1315} stroke="#fff" strokeWidth={4} />
          <text x={570} y={1360} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={40} fill={FLASH}>~1 SECOND</text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.7)" }}>ILLUSTRATION · MOSER, KROSS ET AL. · 2017</div>
    </AbsoluteFill>
  );
};
