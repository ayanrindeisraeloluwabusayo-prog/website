// Motion graphics for "Some people have no voice in their head", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
const Bubble: React.FC<{ w: number; gold?: boolean; empty?: boolean; style?: React.CSSProperties }> = ({ w, gold, empty, style }) => (
  <div style={{ width: w, height: w * 0.55, borderRadius: w * 0.28, border: `4px ${empty ? "dashed" : "solid"} ${gold ? FLASH : "#fff"}`, background: empty ? "transparent" : gold ? "rgba(243,194,29,0.18)" : "rgba(255,255,255,0.1)",
    display: "flex", alignItems: "center", justifyContent: "center", gap: w * 0.08, ...style }}>
    {empty ? null : [0, 1, 2].map((i) => <div key={i} style={{ width: w * 0.09, height: w * 0.09, borderRadius: w, background: gold ? FLASH : "#fff" }} />)}
  </div>
);

/** A stream of speech bubbles: a running commentary all day long. */
export const Chatter: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {Array.from({ length: 9 }, (_, i) => {
        const at = from + i * 5, k = p(f, at, 8);
        return <div key={i} style={{ position: "absolute", left: 120 + ((i * 263) % 640), top: 820 + ((i * 151) % 640), opacity: k, transform: `scale(${0.6 + 0.4 * k}) translateY(${-(f - at) * 0.6}px)` }}>
          <Bubble w={160 + (i % 3) * 40} gold={i % 4 === 1} />
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, from + 10, 10) }}>ALL DAY LONG</div>
    </AbsoluteFill>
  );
};

/** Two groups: almost never hear an inner voice (empty bubble) vs almost constantly (full bubble). */
export const Groups: React.FC<{ from: number; neverAt: number; alwaysAt: number }> = ({ from, neverAt, alwaysAt }) => {
  const f = useCurrentFrame();
  const col = (left: number, label: string, at: number, empty: boolean) => (
    <div style={{ position: "absolute", left, top: 900, width: 400, display: "flex", flexDirection: "column", alignItems: "center", opacity: p(f, at, 8), transform: `translateY(${(1 - p(f, at, 10)) * 30}px)` }}>
      <Bubble w={300} empty={empty} gold={!empty} />
      <div style={{ ...lab, fontSize: 24, color: empty ? "#fff" : FLASH, marginTop: 30, textAlign: "center" }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>HOW OFTEN THEY HEAR AN INNER VOICE</div>
      {col(80, "ALMOST NEVER", neverAt, true)}
      {col(600, "ALMOST CONSTANTLY", alwaysAt, false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(110), opacity: p(f, alwaysAt + 16, 10) }}>quiet <span style={{ color: FLASH }}>vs</span> chatty</div>
    </AbsoluteFill>
  );
};

/** The two tests: holding a word list, and judging whether two picture names rhyme. */
export const Tests: React.FC<{ from: number; memAt: number; rhymeAt: number }> = ({ from, memAt, rhymeAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, label: string, at: number, result: string) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left: 120, right: 120, top, opacity: p(f, at - 4, 6) }}>
      <div style={{ ...lab, fontSize: 24, color: "#fff", marginBottom: 16 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 20, marginBottom: 12 }}><div style={{ width: 210, ...lab, fontSize: 20, color: FLASH }}>CHATTY</div><div style={{ height: 30, width: 560 * g, borderRadius: 8, background: FLASH }} /></div>
      <div style={{ display: "flex", alignItems: "center", gap: 20 }}><div style={{ width: 210, ...lab, fontSize: 20, color: "#fff" }}>QUIET</div><div style={{ height: 30, width: 440 * g, borderRadius: 8, background: "#fff" }} /></div>
      <div style={{ ...serif(64, "#fff"), marginTop: 16, opacity: p(f, at + 18, 8) }}>{result}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      {row(820, "HOLD A LIST OF WORDS IN MEMORY", memAt, "quiet group: worse")}
      {row(1170, "DO TWO PICTURE NAMES RHYME?", rhymeAt, "quiet group: slower")}
      {note("NEDERGAARD & LUPYAN · PSYCHOLOGICAL SCIENCE · 2024 · ILLUSTRATION", 1560)}
      <div style={{ opacity: p(f, from, 1) }} />
    </AbsoluteFill>
  );
};

/** A ring filling to just over a quarter: how often inner speech showed up when beeped. */
export const Quarter: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at - 10, at + 20], [0, 0.28], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const C = 2 * Math.PI * 220;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 600" style={{ position: "absolute", left: 240, top: 780, width: 600, height: 600, opacity: p(f, from, 8) }}>
        <circle cx="300" cy="300" r="220" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="48" />
        <circle cx="300" cy="300" r="220" fill="none" stroke={FLASH} strokeWidth="48" strokeDasharray={`${C * k} ${C}`} transform="rotate(-90 300 300)" />
        <text x="300" y="320" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="26" letterSpacing="4">INNER SPEECH</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(110, FLASH), opacity: p(f, at, 10) }}>just over a quarter</div>
      {note("HURLBURT · RANDOM BEEP SAMPLING · ABOUT 28% OF MOMENTS", 1580)}
    </AbsoluteFill>
  );
};

/** Words, pictures, feelings light up in turn. */
export const Ways: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {["words", "pictures", "feelings"].map((w, i) => (
        <div key={w} style={{ position: "absolute", left: 0, right: 0, top: 880 + i * 220, textAlign: "center", ...serif(150, i === 1 ? FLASH : "#fff"), opacity: p(f, at[i], 10), transform: `translateY(${(1 - p(f, at[i], 12)) * 30}px)` }}>{w}</div>
      ))}
    </AbsoluteFill>
  );
};
