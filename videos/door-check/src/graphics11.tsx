// Motion graphics for the door-check video: white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;

/** "Turn it off and check it, again and again, twenty times": a grid of 20 check marks filling up, and a counter. */
export const Checks: React.FC<{ from: number; againAt: number; twentyAt: number }> = ({ from, againAt, twentyAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  const n = Math.round(interpolate(f, [from + 20, againAt, twentyAt + 6], [1, 6, 20], clamp));
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 190, letterSpacing: "-0.04em", color: n >= 20 ? FLASH : "#fff" }}>×{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1085, textAlign: "center", ...lab, fontSize: 30, color: "rgba(255,255,255,0.85)" }}>CHECKS OF THE SAME STOVE</div>
      <div style={{ position: "absolute", left: 140, top: 1180, width: 800, display: "grid", gridTemplateColumns: "repeat(5, 1fr)", gap: 22 }}>
        {Array.from({ length: 20 }, (_, i) => {
          const on = i < n;
          return (
            <div key={i} style={{ height: 96, borderRadius: 20, border: `3px solid ${on ? "#fff" : "rgba(255,255,255,0.3)"}`, background: on ? "rgba(255,255,255,0.14)" : "transparent",
              display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 54, color: i === 19 && on ? FLASH : "#fff" }}>{on ? "✓" : ""}</div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** Two bars per measure: accuracy is the same for the checkers and everyone else; (later) belief in the memory is not. */
export const SameAccuracy: React.FC<{ from: number; sameAt: number; knewAt: number }> = ({ from, sameAt, knewAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12), g = p(f, sameAt, 24), kn = p(f, knewAt, 12);
  const bar = (y: number, label: string, gold: boolean) => (
    <div style={{ position: "absolute", left: 130, width: 820, top: y }}>
      <div style={{ ...lab, fontSize: 30, color: gold ? FLASH : "#fff", marginBottom: 12 }}>{label}</div>
      <div style={{ height: 64, borderRadius: 32, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${86 * g}%`, height: "100%", borderRadius: 32, background: gold ? FLASH : "#fff" }} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", ...lab, fontSize: 34, color: "#fff" }}>HOW ACCURATE WAS THEIR MEMORY?</div>
      {bar(990, "CHECKED 20 TIMES", true)}
      {bar(1170, "EVERYONE ELSE", false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", fontFamily: SERIF2, fontStyle: "italic", fontSize: 84, color: "#fff", opacity: g }}>the same</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center", ...lab, fontSize: 30, color: FLASH, opacity: kn }}>THEY STILL KNEW THE STOVE WAS OFF</div>
    </AbsoluteFill>
  );
};

/** "The more you check, the less you trust your own memory": one line climbs, the other falls. */
export const MoreLess: React.FC<{ from: number; moreAt: number; lessAt: number }> = ({ from, moreAt, lessAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  const a = interpolate(f, [moreAt, moreAt + 30], [0, 1], clamp), b = interpolate(f, [lessAt, lessAt + 30], [0, 1], clamp);
  const X0 = 150, X1 = 930, Y0 = 1520, Y1 = 1000;
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={X0} x2={X1} y1={Y0} y2={Y0} stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
        <line x1={X0} x2={X0} y1={Y0} y2={Y1 - 40} stroke="rgba(255,255,255,0.4)" strokeWidth={4} />
        <line x1={X0} y1={Y0 - 60} x2={X0 + (X1 - X0) * a} y2={Y0 - 60 - (Y0 - Y1 - 60) * a} stroke="#fff" strokeWidth={10} strokeLinecap="round" />
        <line x1={X0} y1={Y1} x2={X0 + (X1 - X0) * b} y2={Y1 + (Y0 - Y1 - 60) * b} stroke={FLASH} strokeWidth={10} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 12px rgba(243,194,29,0.8))" }} />
        <text x={X1} y={Y1 - 24} textAnchor="end" fill="#fff" fontSize={32} opacity={a} {...lab}>CHECKS ↑</text>
        <text x={X1} y={Y0 - 84} textAnchor="end" fill={FLASH} fontSize={32} opacity={b} {...lab}>TRUST IN YOUR MEMORY ↓</text>
      </svg>
    </AbsoluteFill>
  );
};
