// Motion graphics for "What happens in your brain when you die", in the mosquito look: thin serif for big words and
// numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** 344 small dots; 62 of them (18%) light up gold. */
export const Nde: React.FC<{ from: number; litAt: number }> = ({ from, litAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 800, width: 800, display: "flex", flexWrap: "wrap", gap: 9 }}>
        {Array.from({ length: 344 }, (_, i) => {
          const on = (i * 37) % 344 < 62 && f >= litAt + ((i * 7) % 20);
          return <div key={i} style={{ width: 26, height: 26, borderRadius: 13, background: on ? FLASH : "rgba(255,255,255,0.3)", opacity: p(f, from + (i % 40) * 0.4, 5) }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...serif(150, FLASH), opacity: p(f, litAt, 10) }}>18%</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, litAt + 8, 10) }}>DESCRIBED A NEAR-DEATH EXPERIENCE</div>
      {note("VAN LOMMEL ET AL. · THE LANCET · 2001 · 344 PATIENTS", 1590)}
    </AbsoluteFill>
  );
};

/** Four brain-wave lines; they flatten when life support is switched off; with surgeAt, two of them burst gold. */
export const Eeg: React.FC<{ from: number; offAt: number; surgeAt?: number; zoneAt?: number }> = ({ from, offAt, surgeAt, zoneAt }) => {
  const f = useCurrentFrame();
  const flat = p(f, offAt, 20);
  const surge = surgeAt === undefined ? 0 : p(f, surgeAt, 10);
  const line = (row: number, gold: boolean) => {
    const amp = 26 * (1 - 0.85 * flat) + (gold ? 60 * surge : 0);
    const speed = gold && surge > 0 ? 0.9 : 0.35;
    let d = "";
    for (let x = 0; x <= 840; x += 8) {
      const y = 60 + Math.sin((x + f * 9) * 0.045 * (1 + row * 0.2)) * amp * Math.sin((x * 0.013 + row) + f * 0.02) + Math.sin(x * speed + f) * amp * 0.25;
      d += `${x ? "L" : "M"}${x} ${y.toFixed(1)} `;
    }
    return <path d={d} fill="none" stroke={gold && surge > 0.3 ? FLASH : "#fff"} strokeWidth="4" opacity={0.85} />;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>BRAIN WAVES OF 4 PATIENTS</div>
      <svg viewBox="0 0 840 520" style={{ position: "absolute", left: 120, top: 860, width: 840, height: 520, opacity: p(f, from, 8) }}>
        {[0, 1, 2, 3].map((r) => <g key={r} transform={`translate(0 ${r * 130})`}>{line(r, r === 1 || r === 3)}</g>)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(110, surge > 0 ? FLASH : "#fff"), opacity: surgeAt === undefined ? p(f, offAt, 10) : surge }}>{surgeAt === undefined ? "life support off" : "gamma surge"}</div>
      {zoneAt !== undefined ? <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, zoneAt, 10) }}>STRONGEST IN AREAS FOR SEEING AND DREAMING</div> : null}
      {note("XU, BORJIGIN ET AL. · PNAS · 2023 · 2 OF 4 PATIENTS", 1640)}
    </AbsoluteFill>
  );
};

/** A clock at 4 hours after death; brain cells light up one by one; then "no sign of awareness". */
export const Pig: React.FC<{ from: number; hoursAt: number; cellsAt: number; noAt: number }> = ({ from, hoursAt, cellsAt, noAt }) => {
  const f = useCurrentFrame();
  const h = interpolate(f, [from + 4, hoursAt + 10], [0, 4], clamp);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 300 300" style={{ position: "absolute", left: 140, top: 820, width: 340, height: 340, opacity: p(f, from, 8) }}>
        <circle cx="150" cy="150" r="130" fill="none" stroke="#fff" strokeWidth="6" />
        <line x1="150" y1="150" x2="150" y2="40" stroke={FLASH} strokeWidth="7" strokeLinecap="round" transform={`rotate(${h * 30} 150 150)`} />
        <circle cx="150" cy="150" r="9" fill={FLASH} />
      </svg>
      <div style={{ position: "absolute", left: 140, width: 340, top: 1180, textAlign: "center", ...serif(76, FLASH), opacity: p(f, hoursAt, 10) }}>4 hours</div>
      <div style={{ position: "absolute", left: 540, top: 840, width: 400, display: "flex", flexWrap: "wrap", gap: 16 }}>
        {Array.from({ length: 30 }, (_, i) => {
          const on = f >= cellsAt + ((i * 11) % 30) * 0.8;
          return <div key={i} style={{ width: 62, height: 62, borderRadius: 31, border: `3px solid ${on ? FLASH : "rgba(255,255,255,0.4)"}`, background: on ? "rgba(243,194,29,0.35)" : "transparent", opacity: p(f, from + 6, 8) }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 540, width: 400, top: 1250, textAlign: "center", ...lab, fontSize: 22, color: "#fff", opacity: p(f, cellsAt, 8) }}>SOME CELLS WORKING AGAIN</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(100), opacity: p(f, noAt, 10) }}>no sign of awareness</div>
      {note("VRSELJA ET AL. · NATURE · 2019 · YALE · PIG BRAINS", 1580)}
    </AbsoluteFill>
  );
};
