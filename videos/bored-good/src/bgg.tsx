// Motion graphics for "Why being bored is good for you", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const RED = "#ff5a5a";
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** A clock whose hand crawls: one minute that feels like an hour. */
export const Clock: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const a = (f - from) * 0.6;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 290, top: 820, width: 500, height: 500, opacity: p(f, from, 8) }}>
        <circle cx="200" cy="200" r="170" fill="none" stroke="#fff" strokeWidth="6" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1="200" y1="44" x2="200" y2="64" stroke="rgba(255,255,255,0.7)" strokeWidth="5" transform={`rotate(${i * 30} 200 200)`} />)}
        <line x1="200" y1="200" x2="200" y2="70" stroke={FLASH} strokeWidth="7" strokeLinecap="round" transform={`rotate(${a} 200 200)`} />
        <circle cx="200" cy="200" r="10" fill={FLASH} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", ...serif(110), opacity: p(f, from + 6, 10) }}>1 min <span style={{ color: FLASH }}>= 1 hour</span></div>
    </AbsoluteFill>
  );
};

/** A pen that doesn't work: a scribble that stays empty, crossed out. */
export const Pen: React.FC<{ from: number; satAt: number }> = ({ from, satAt }) => {
  const f = useCurrentFrame();
  const x = p(f, from + 14, 10);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 200" style={{ position: "absolute", left: 140, top: 900, width: 800, height: 266, opacity: p(f, from, 8) }}>
        <path d="M40 140 L470 60 L520 52 L540 70 L500 88 L60 168 Z" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <path d="M470 60 L500 88" stroke="#fff" strokeWidth="6" />
        <line x1="60" y1="40" x2="560" y2="180" stroke={RED} strokeWidth="8" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - x} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: x }}>NO WORKING PEN</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...serif(120, FLASH), opacity: p(f, satAt, 10) }}>just thinking</div>
    </AbsoluteFill>
  );
};

/** Two cups and a counter of ideas popping up around them. */
export const Cups: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const n = Math.min(12, Math.floor(Math.max(0, f - from - 10) / 6));
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 300" style={{ position: "absolute", left: 290, top: 960, width: 500, height: 375, opacity: p(f, from, 8) }}>
        {[90, 250].map((x) => <path key={x} d={`M${x - 55} 60 L${x + 55} 60 L${x + 40} 260 L${x - 40} 260 Z`} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />)}
      </svg>
      {Array.from({ length: n }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 140 + ((i * 271) % 760), top: 820 + ((i * 113) % 140) + (i % 2) * 520, width: 54, height: 54, borderRadius: 27, background: i % 3 ? "rgba(255,255,255,0.85)" : FLASH, opacity: p(f, from + 10 + i * 6, 5) }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 26, color: "#fff" }}>HOW MANY USES CAN YOU THINK OF?</div>
    </AbsoluteFill>
  );
};

/** Bars for ideas: control vs copying numbers vs only reading numbers. */
export const Ideas: React.FC<{ from: number; copyAt: number; readAt?: number }> = ({ from, copyAt, readAt }) => {
  const f = useCurrentFrame();
  const bars: [string, number, number | undefined, boolean][] = [["NO BORING TASK", 260, from + 4, false], ["COPIED NUMBERS", 360, copyAt, false], ["ONLY READ THEM", 460, readAt, true]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>IDEAS FOR THE CUPS</div>
      {bars.map(([label, h, at, gold], i) => {
        if (at === undefined) return null;
        const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
        return <div key={label} style={{ position: "absolute", left: 90 + i * 310, top: 880, width: 280, textAlign: "center", opacity: p(f, at - 4, 6) }}>
          <div style={{ position: "relative", height: 500 }}><div style={{ position: "absolute", left: 80, right: 80, bottom: 0, height: h * g, borderRadius: "12px 12px 0 0", background: gold ? FLASH : i === 1 ? "#fff" : "rgba(255,255,255,0.5)" }} /></div>
          <div style={{ ...lab, fontSize: 20, color: gold ? FLASH : "#fff", marginTop: 16 }}>{label}</div>
        </div>;
      })}
      {note("MANN & CADMAN · CREATIVITY RESEARCH JOURNAL · 2014 · ILLUSTRATION", 1500)}
    </AbsoluteFill>
  );
};
