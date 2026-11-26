// Motion graphics for "Can you spot a fake smile?", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** One eye with crinkle lines that draw in: smiling with your eyes. */
const Eye: React.FC<{ crinkle: number; size?: number; gold?: boolean }> = ({ crinkle, size = 420, gold = true }) => (
  <svg viewBox="0 0 300 160" style={{ width: size, height: size * 0.53 }}>
    <path d={`M30 ${90 - 10 * crinkle} Q150 ${10 + 25 * crinkle} 270 ${90 - 10 * crinkle} Q150 ${150 - 25 * crinkle} 30 ${90 - 10 * crinkle} Z`} fill="none" stroke="#fff" strokeWidth="6" />
    <circle cx="150" cy="88" r={30 - 6 * crinkle} fill="#fff" />
    {[[-18, 0], [0, 1], [18, 2]].map(([dy, i]) => (
      <path key={i} d={`M278 ${85 + dy} L${296} ${80 + dy * 1.6}`} stroke={gold ? FLASH : "#fff"} strokeWidth="6" strokeLinecap="round" opacity={crinkle} />
    ))}
  </svg>
);

/** "smize": an eye that crinkles, with the definition. */
export const Smize: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, display: "flex", justifyContent: "center", opacity: p(f, from, 8) }}><Eye crinkle={p(f, at, 14)} size={600} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, at, 10) }}>SMILE WITH YOUR EYES</div>
    </AbsoluteFill>
  );
};

/** A face outline with electrode points and little sparks: Duchenne's electric experiments. */
export const Currents: React.FC<{ from: number; nameAt: number }> = ({ from, nameAt }) => {
  const f = useCurrentFrame();
  const z = (i: number) => (Math.floor((f - from) / 4 + i) % 3 === 0 ? 1 : 0.25);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 460" style={{ position: "absolute", left: 240, top: 780, width: 600, height: 690, opacity: p(f, from, 8) }}>
        <ellipse cx="200" cy="220" rx="140" ry="185" fill="rgba(255,255,255,0.05)" stroke="#fff" strokeWidth="5" />
        <path d="M130 200 Q155 185 180 200 M220 200 Q245 185 270 200" stroke="#fff" strokeWidth="5" fill="none" />
        <path d="M140 300 Q200 345 260 300" stroke="#fff" strokeWidth="5" fill="none" />
        {[[110, 215], [290, 215], [125, 300], [275, 300]].map(([x, y], i) => (
          <g key={i}><circle cx={x} cy={y} r="11" fill={FLASH} /><path d={`M${x} ${y} l${i % 2 ? 22 : -22} -14 l${i % 2 ? -8 : 8} 14 l${i % 2 ? 22 : -22} -14`} stroke={FLASH} strokeWidth="4" fill="none" opacity={z(i)} /></g>
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", ...serif(96), opacity: p(f, nameAt, 10) }}>Guillaume Duchenne</div>
      {note("FRANCE · 1860s · ELECTRIC CURRENTS ON FACIAL MUSCLES", 1620)}
    </AbsoluteFill>
  );
};

/** A smile, then the eye muscle ring lights gold, then crinkle lines. */
export const Muscle: React.FC<{ from: number; muscleAt: number; crinkleAt: number; purposeAt: number }> = ({ from, muscleAt, crinkleAt, purposeAt }) => {
  const f = useCurrentFrame();
  const m = p(f, muscleAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, display: "flex", justifyContent: "center", gap: 60, opacity: p(f, from, 8) }}>
        {[0, 1].map((i) => (
          <div key={i} style={{ position: "relative", transform: i ? "scaleX(-1)" : undefined }}>
            <div style={{ position: "absolute", left: -20, top: -30, width: 360, height: 200, borderRadius: "50%", border: `6px solid ${FLASH}`, opacity: m }} />
            <Eye crinkle={p(f, crinkleAt, 12)} size={320} />
          </div>
        ))}
      </div>
      <svg viewBox="0 0 400 100" style={{ position: "absolute", left: 290, top: 1130, width: 500, height: 125, opacity: p(f, from + 6, 8) }}>
        <path d="M30 20 Q200 110 370 20" stroke="#fff" strokeWidth="8" fill="none" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", ...lab, fontSize: 26, color: FLASH, opacity: m }}>THE MUSCLE AROUND THE EYES</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1430, textAlign: "center", ...serif(100), opacity: p(f, purposeAt, 10) }}>hard to fake?</div>
    </AbsoluteFill>
  );
};

/** Ten eyes; seven crinkle gold: about seven in ten put-on smiles had the crinkle. */
export const Seven: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 840, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "34px 30px" }}>
        {Array.from({ length: 10 }, (_, i) => {
          const on = i < 7 ? p(f, at + i * 3, 8) : 0;
          return <div key={i} style={{ opacity: p(f, from + i * 2, 6) }}><Eye crinkle={on} size={150} gold /></div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", ...serif(150, FLASH), opacity: p(f, at, 10) }}>7 in 10</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, at + 10, 10) }}>PUT-ON SMILES WITH THE EYE CRINKLE</div>
      {note("GUNNERY, HALL & RUBEN · J. NONVERBAL BEHAVIOR · 2013", 1580)}
    </AbsoluteFill>
  );
};

/** Smile strength over time: put-on (white) snaps on and off; real (gold) builds and fades slowly. */
export const Timing: React.FC<{ from: number; fakeAt: number; realAt: number }> = ({ from, fakeAt, realAt }) => {
  const f = useCurrentFrame();
  const draw = (at: number) => interpolate(f, [at, at + 26], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>SMILE OVER TIME</div>
      <svg viewBox="0 0 840 340" style={{ position: "absolute", left: 120, top: 880, width: 840, height: 340, overflow: "visible" }}>
        <line x1="0" y1="320" x2="840" y2="320" stroke="rgba(255,255,255,0.45)" strokeWidth="3" />
        <path d="M0 320 L120 320 L160 60 L520 60 L560 320 L840 320" fill="none" stroke="#fff" strokeWidth="8" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw(fakeAt)} />
        <path d="M0 320 C150 320 200 80 330 70 C460 60 560 120 840 300" fill="none" stroke={FLASH} strokeWidth="8" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw(realAt)} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 1260, ...lab, fontSize: 24, color: "#fff", opacity: p(f, fakeAt, 8) }}>PUT-ON: SNAPS ON AND OFF</div>
      <div style={{ position: "absolute", left: 120, top: 1310, ...lab, fontSize: 24, color: FLASH, opacity: p(f, realAt, 8) }}>REAL: BUILDS AND FADES SLOWLY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(120), opacity: p(f, realAt + 20, 10) }}>watch the <span style={{ color: FLASH }}>fade</span></div>
      {note("ILLUSTRATION · TIMING STUDIES OF POSED VS FELT SMILES", 1580)}
    </AbsoluteFill>
  );
};
