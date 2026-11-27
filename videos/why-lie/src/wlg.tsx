// Motion graphics for "Why people lie, and who does most of it", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
const Person: React.FC<{ color: string; size?: number }> = ({ color, size = 110 }) => (
  <svg viewBox="0 0 60 90" style={{ width: size, height: size * 1.5 }}><circle cx="30" cy="18" r="15" fill={color} /><path d="M4 88 C4 45 56 45 56 88 Z" fill={color} /></svg>
);

/** Lies per day: students about 2, other adults about 1. */
export const PerDay: React.FC<{ from: number; studentsAt: number; adultsAt: number }> = ({ from, studentsAt, adultsAt }) => {
  const f = useCurrentFrame();
  const col = (left: number, n: number, label: string, at: number, gold: boolean) => (
    <div style={{ position: "absolute", left, top: 860, width: 400, textAlign: "center", opacity: p(f, at, 8) }}>
      <div style={{ display: "flex", justifyContent: "center", gap: 20, height: 220, alignItems: "flex-end" }}>
        {Array.from({ length: n }, (_, i) => <div key={i} style={{ width: 90, height: 190, borderRadius: 14, border: `4px solid ${gold ? FLASH : "#fff"}`, background: gold ? "rgba(243,194,29,0.2)" : "rgba(255,255,255,0.08)", transform: `scale(${p(f, at + i * 5, 8)})` }} />)}
      </div>
      <div style={{ ...serif(120, gold ? FLASH : "#fff"), marginTop: 30 }}>~{n}</div>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginTop: 14 }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>LIES PER DAY</div>
      {col(100, 2, "COLLEGE STUDENTS", studentsAt, true)}
      {col(580, 1, "OTHER ADULTS", adultsAt, false)}
      {note("DEPAULO ET AL. · JPSP · 1996 · WEEK-LONG DIARIES", 1560)}
    </AbsoluteFill>
  );
};

/** Three reasons people gave. */
export const Why: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const items = ["to look better", "to feel better", "to spare feelings"];
  return (
    <AbsoluteFill>
      {items.map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 0, right: 0, top: 880 + i * 220, textAlign: "center", ...serif(120, i === 2 ? FLASH : "#fff"), opacity: p(f, at[i], 10), transform: `translateY(${(1 - p(f, at[i], 12)) * 30}px)` }}>{t}</div>
      ))}
    </AbsoluteFill>
  );
};

/** Lying over the lifespan: rises in childhood, peaks in the teens, falls with age. */
export const Age: React.FC<{ from: number; peakAt: number; dropAt: number }> = ({ from, peakAt, dropAt }) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [from + 4, peakAt + 6], [0, 0.4], clamp) + interpolate(f, [dropAt, dropAt + 24], [0, 0.6], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>HOW OFTEN PEOPLE LIE, BY AGE</div>
      <svg viewBox="0 0 900 520" style={{ position: "absolute", left: 90, top: 860, width: 900, height: 520, opacity: p(f, from, 8) }}>
        <line x1="60" y1="460" x2="880" y2="460" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
        <path d="M60 400 C140 300 200 80 260 70 C340 60 420 200 560 300 C680 380 780 410 880 420" fill="none" stroke={FLASH} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        {[["6", 60], ["TEENS", 260], ["40", 560], ["77", 880]].map(([t, x]) => <text key={t} x={x} y="505" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="24" letterSpacing="2">{t}</text>)}
      </svg>
      <div style={{ position: "absolute", left: 230, top: 840, ...serif(90, FLASH), opacity: p(f, peakAt, 10) }}>peak</div>
      {note("DEBEY ET AL. · ACTA PSYCHOLOGICA · 2015 · 1,005 PEOPLE AGED 6-77 · ILLUSTRATION", 1480)}
    </AbsoluteFill>
  );
};

/** Ten people; six told no lies that day. */
export const None: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, right: 150, top: 860, display: "flex", flexWrap: "wrap", gap: 34, justifyContent: "center" }}>
        {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ opacity: p(f, from + i * 2, 6) }}><Person color={i < 6 && f >= at + i * 2 ? "#fff" : "rgba(255,255,255,0.3)"} size={112} /></div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(140, FLASH), opacity: p(f, at, 10) }}>6 in 10</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, at + 8, 10) }}>TOLD NO LIES THAT DAY</div>
      {note("SEROTA, LEVINE & BOSTER · HUMAN COMMUNICATION RESEARCH · 2010 · 1,000 US ADULTS", 1560)}
    </AbsoluteFill>
  );
};

/** Two bars: 5% of people, 50% of all lies. */
export const Half: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [at - 6, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 120, right: 120, top: 860 }}>
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginBottom: 14 }}>PEOPLE</div>
        <div style={{ height: 70, borderRadius: 12, background: "rgba(255,255,255,0.25)", position: "relative" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${5 * g}%`, borderRadius: 12, background: FLASH }} /></div>
        <div style={{ ...serif(80, FLASH), marginTop: 14, opacity: g }}>5%</div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1160 }}>
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginBottom: 14 }}>ALL THE LIES</div>
        <div style={{ height: 70, borderRadius: 12, background: "rgba(255,255,255,0.25)", position: "relative" }}><div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${50 * g}%`, borderRadius: 12, background: FLASH }} /></div>
        <div style={{ ...serif(80, FLASH), marginTop: 14, opacity: g }}>50%</div>
      </div>
      {note("SEROTA, LEVINE & BOSTER · 2010 · HALF OF LIES FROM 5.3% OF PEOPLE", 1560)}
    </AbsoluteFill>
  );
};
