// Motion graphics that explain the science (the reference style mixes these with real pictures):
// a layered blue stage, a dopamine molecule that draws itself, and a graph showing dopamine rising
// before the musical peak (Salimpoor et al. 2011: caudate release during anticipation).
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE_DEEP, EASE_OUT, FLASH, p, W } from "./kit";
import { SANS2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** The stage: electric blue with a glow and a faint dot grid that drifts. */
export const BlueStage: React.FC<{ glowY?: number }> = ({ glowY = 60 }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% ${glowY}%, #2d66ff 0%, #0243F1 42%, ${BLUE_DEEP} 100%)` }}>
      <AbsoluteFill
        style={{
          backgroundImage: "radial-gradient(rgba(255,255,255,0.22) 1.6px, transparent 1.8px)",
          backgroundSize: "44px 44px",
          backgroundPosition: `0 ${-f * 0.4}px`,
          maskImage: "radial-gradient(ellipse 70% 55% at 50% 60%, #000 30%, transparent 100%)",
          WebkitMaskImage: "radial-gradient(ellipse 70% 55% at 50% 60%, #000 30%, transparent 100%)",
        }}
      />
    </AbsoluteFill>
  );
};

/** A floating panel: rises in with a small 3D tilt that settles, long soft shadow. */
export const Panel: React.FC<{ from: number; x: number; y: number; w: number; h: number; children: React.ReactNode }> = ({ from, x, y, w, h, children }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 16, EASE_OUT);
  return (
    <AbsoluteFill style={{ perspective: 1800 }}>
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          width: w,
          height: h,
          opacity: k,
          transform: `translateY(${(1 - k) * 80}px) rotateX(${(1 - k) * 18}deg) scale(${0.92 + 0.08 * k})`,
          background: "linear-gradient(180deg, rgba(255,255,255,0.10), rgba(255,255,255,0.04))",
          border: "1.5px solid rgba(255,255,255,0.22)",
          borderRadius: 28,
          boxShadow: "0 70px 120px rgba(0,8,60,0.55), 0 14px 30px rgba(0,8,60,0.35)",
        }}
      >
        {children}
      </div>
    </AbsoluteFill>
  );
};

/** Dopamine (C8H11NO2): a benzene ring with two OH groups and an ethylamine chain, drawn bond by bond. */
export const Molecule: React.FC<{ from: number; cx?: number; cy?: number; r?: number }> = ({ from, cx = 470, cy = 1180, r = 135 }) => {
  const f = useCurrentFrame();
  const pt = (a: number, rr = r): [number, number] => [cx + rr * Math.cos((a * Math.PI) / 180), cy + rr * Math.sin((a * Math.PI) / 180)];
  const V = [-90, -30, 30, 90, 150, 210].map((a) => pt(a));
  const step = (from: [number, number], deg: number, len = r): [number, number] => [from[0] + len * Math.cos((deg * Math.PI) / 180), from[1] + len * Math.sin((deg * Math.PI) / 180)];
  // chain from the upper-right carbon: zig-zag to the right, ending in NH2
  const c1 = step(V[1], -30 + 60);
  const c2 = step(c1, -30);
  const n = step(c2, 30);
  // OH groups on the two left carbons
  const o1 = step(V[4], 150, r * 0.9);
  const o2 = step(V[5], 210, r * 0.9);
  const bonds: [[number, number], [number, number]][] = [
    [V[0], V[1]], [V[1], V[2]], [V[2], V[3]], [V[3], V[4]], [V[4], V[5]], [V[5], V[0]],
    [V[1], c1], [c1, c2], [c2, n], [V[4], o1], [V[5], o2],
  ];
  // inner double bonds on alternate ring edges
  const inner = [[0, 1], [2, 3], [4, 5]].map(([a, b]) => {
    const A = V[a], B = V[b];
    const sh = (q: [number, number]): [number, number] => [cx + (q[0] - cx) * 0.78, cy + (q[1] - cy) * 0.78];
    const a2 = sh(A), b2 = sh(B);
    const t = 0.14;
    return [[a2[0] + (b2[0] - a2[0]) * t, a2[1] + (b2[1] - a2[1]) * t], [b2[0] - (b2[0] - a2[0]) * t, b2[1] - (b2[1] - a2[1]) * t]] as [[number, number], [number, number]];
  });
  const label = (q: [number, number], text: string, at: number, anchor: "start" | "end" | "middle" = "middle") => (
    <text x={q[0]} y={q[1] + 16} textAnchor={anchor} fill="#fff" fontFamily={SANS2} fontSize={46} fontWeight={600} opacity={p(f, at, 8)}>
      {text}
    </text>
  );
  const glow = interpolate(f, [from + 30, from + 50], [0, 1], clamp);
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0, filter: `drop-shadow(0 0 ${18 * glow}px rgba(170,200,255,0.8))` }}>
      {bonds.map(([a, b], i) => {
        const d = p(f, from + i * 2.5, 10);
        const end: [number, number] = [a[0] + (b[0] - a[0]) * d, a[1] + (b[1] - a[1]) * d];
        // stop bonds short of atom labels
        const shorten = (i >= 8 ? 0.72 : 1) * d;
        const e2: [number, number] = i >= 8 ? [a[0] + (b[0] - a[0]) * shorten, a[1] + (b[1] - a[1]) * shorten] : end;
        return <line key={i} x1={a[0]} y1={a[1]} x2={e2[0]} y2={e2[1]} stroke="#fff" strokeWidth={7} strokeLinecap="round" opacity={d > 0 ? 1 : 0} />;
      })}
      {inner.map(([a, b], i) => {
        const d = p(f, from + 18 + i * 3, 8);
        return <line key={`i${i}`} x1={a[0]} y1={a[1]} x2={a[0] + (b[0] - a[0]) * d} y2={a[1] + (b[1] - a[1]) * d} stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={d > 0 ? 0.9 : 0} />;
      })}
      {label([n[0] + 26, n[1]], "NH₂", from + 26, "start")}
      {label([o1[0] - 20, o1[1]], "HO", from + 28, "end")}
      {label([o2[0] - 20, o2[1]], "HO", from + 30, "end")}
      <text x={W / 2} y={cy + 330} textAnchor="middle" fill="#fff" fontFamily={SANS2} fontSize={36} letterSpacing="0.18em" opacity={0.75 * p(f, from + 34, 10)}>
        DOPAMINE · C₈H₁₁NO₂
      </text>
    </svg>
  );
};

/** The key graph: the music builds to the drop; dopamine (yellow) climbs before it. */
export const BeforeGraph: React.FC<{ from: number; mark?: string; dur?: number }> = ({ from, mark = "the drop", dur = 30 }) => {
  const f = useCurrentFrame();
  const X0 = 150, X1 = 930, Y0 = 1560, HGT = 520;
  const N = 160;
  const music = (u: number) => (u < 0.78 ? 0.08 + 0.92 * Math.pow(u / 0.78, 2.6) : 0.95 - (u - 0.78) * 2.2);
  const dopa = (u: number) => 0.06 + 0.78 * Math.exp(-Math.pow((u - 0.6) / 0.13, 2));
  const path = (fn: (u: number) => number) => {
    let d = "";
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      d += `${i ? "L" : "M"}${(X0 + u * (X1 - X0)).toFixed(1)},${(Y0 - Math.max(0.02, fn(u)) * HGT).toFixed(1)} `;
    }
    return d;
  };
  const draw = p(f, from + 4, dur);
  const tipU = draw;
  const xAt = (u: number) => X0 + u * (X1 - X0);
  const dropOn = p(f, from + dur + 2, 10);
  const dopaOn = p(f, from + Math.round(dur * 0.8), 10);
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      {/* axes */}
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
      <text x={X1} y={Y0 + 52} textAnchor="end" fill="rgba(255,255,255,0.7)" fontFamily={SANS2} fontSize={30} letterSpacing="0.12em">TIME →</text>
      {/* the drop marker */}
      <g opacity={dropOn}>
        <line x1={xAt(0.78)} y1={Y0} x2={xAt(0.78)} y2={Y0 - HGT - 40} stroke="#fff" strokeWidth={2} strokeDasharray="10 10" />
        <text x={xAt(0.78)} y={Y0 - HGT - 60} textAnchor="middle" fill="#fff" fontFamily={SANS2} fontSize={36} fontWeight={600}>{mark}</text>
      </g>
      {/* music loudness */}
      <path d={path(music)} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {/* dopamine */}
      <path d={path(dopa)} fill="none" stroke={FLASH} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} style={{ filter: "drop-shadow(0 0 10px rgba(243,194,29,0.7))" }} />
      {/* travelling dots at the drawing tip */}
      {draw > 0 && draw < 1 ? (
        <>
          <circle cx={xAt(tipU)} cy={Y0 - music(tipU) * HGT} r={11} fill="#fff" />
          <circle cx={xAt(tipU)} cy={Y0 - dopa(tipU) * HGT} r={13} fill={FLASH} />
        </>
      ) : null}
      {/* labels */}
      <g opacity={dopaOn}>
        <circle cx={xAt(0.6)} cy={Y0 - dopa(0.6) * HGT} r={16} fill={FLASH} />
        <text x={xAt(0.6) - 26} y={Y0 - dopa(0.6) * HGT - 34} textAnchor="end" fill={FLASH} fontFamily={SANS2} fontSize={38} fontWeight={700}>dopamine</text>
      </g>
      <text x={X0} y={Y0 - music(0.05) * HGT - 26} fill="#fff" fontFamily={SANS2} fontSize={32} opacity={0.85 * p(f, from + 6, 10)}>the music</text>
    </svg>
  );
};
