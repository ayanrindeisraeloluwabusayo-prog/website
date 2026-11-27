// Motion graphics for "Study shows people who stay up late are smarter", in the mosquito look: thin serif for big words
// and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 40, right: 40, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
const grow = (f: number, at: number, len = 20) => interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

const Sun: React.FC<{ color: string; size?: number }> = ({ color, size = 120 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }}><circle cx="50" cy="50" r="20" fill={color} />
    {Array.from({ length: 8 }, (_, i) => <line key={i} x1={50 + Math.cos(i * 0.785) * 30} y1={50 + Math.sin(i * 0.785) * 30} x2={50 + Math.cos(i * 0.785) * 44} y2={50 + Math.sin(i * 0.785) * 44} stroke={color} strokeWidth="6" strokeLinecap="round" />)}</svg>
);
const Moon: React.FC<{ color: string; size?: number }> = ({ color, size = 120 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }}><path d="M62 14 A38 38 0 1 0 86 70 A30 30 0 1 1 62 14 Z" fill={color} /></svg>
);

/** The old saying, then a question mark. */
export const Saying: React.FC<{ from: number; checkAt: number }> = ({ from, checkAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 860, textAlign: "center", opacity: p(f, from, 8) }}>
        <Sun color={FLASH} size={150} />
        <div style={{ ...serif(84), marginTop: 30, lineHeight: 1.12 }}>Early to bed, early to rise…</div>
        <div style={{ ...serif(64, "rgba(255,255,255,0.8)"), marginTop: 26, lineHeight: 1.15 }}>healthy, wealthy and wise</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", ...serif(200, FLASH), opacity: p(f, checkAt, 10), transform: `scale(${0.6 + 0.4 * p(f, checkAt, 12)})` }}>?</div>
    </AbsoluteFill>
  );
};

/** 26,820 adults counting up, a field of dots. */
export const Count: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const n = Math.round(26820 * grow(f, at - 6, 30));
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 150, right: 150, top: 820, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {Array.from({ length: 120 }, (_, i) => <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: i / 120 < n / 26820 ? "#fff" : "rgba(255,255,255,0.2)" }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(170, FLASH) }}>{n.toLocaleString("en-GB")}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center", ...lab, fontSize: 26, color: "#fff" }}>ADULTS AGED 53-86 · UK BIOBANK</div>
    </AbsoluteFill>
  );
};

/** Morning, in between, night: test scores. */
export const Scores: React.FC<{ from: number; at: [number, number, number] }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const col = (i: number, label: string, icon: React.ReactNode, h: number, gold: boolean) => (
    <div key={i} style={{ position: "absolute", left: 110 + i * 300, top: 800, width: 260, textAlign: "center", opacity: p(f, at[i] - 4, 8) }}>
      <div style={{ height: 150, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
      <div style={{ ...lab, fontSize: 22, color: gold ? FLASH : "#fff", marginTop: 10, height: 40 }}>{label}</div>
      <div style={{ height: 380, display: "flex", alignItems: "flex-end", justifyContent: "center", borderBottom: "4px solid rgba(255,255,255,0.5)" }}>
        <div style={{ width: 130, height: 380 * h * grow(f, at[i]), borderRadius: "12px 12px 0 0", background: gold ? FLASH : "rgba(255,255,255,0.55)" }} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {col(0, "MORNING", <Sun color="#fff" size={120} />, 0.72, false)}
      {col(1, "IN BETWEEN", <svg viewBox="0 0 100 100" style={{ width: 120, height: 120 }}><circle cx="50" cy="50" r="30" fill="none" stroke="#fff" strokeWidth="6" /><path d="M50 20 A30 30 0 0 1 50 80 Z" fill="#fff" /></svg>, 0.8, false)}
      {col(2, "NIGHT OWL", <Moon color={FLASH} size={120} />, 0.88, true)}
      <div style={{ position: "absolute", left: 750, width: 300, top: 1400, textAlign: "center", ...serif(90, FLASH), opacity: p(f, at[2] + 14, 10) }}>+13.5%</div>
      {note("IMPERIAL COLLEGE LONDON · BMJ PUBLIC HEALTH · 2024 · ILLUSTRATION", 1560)}
    </AbsoluteFill>
  );
};

/** Bedtimes by IQ in their twenties. */
export const Bedtime: React.FC<{ from: number; lowAt: number; highAt: number }> = ({ from, lowAt, highAt }) => {
  const f = useCurrentFrame();
  const clock = (left: number, h: number, m: number, label: string, time: string, at: number, gold: boolean) => {
    const k = grow(f, at, 24);
    const mA = (m / 60) * 360 * k, hA = ((h % 12) + m / 60) * 30 * k;
    const c = gold ? FLASH : "#fff";
    return (
      <div style={{ position: "absolute", left, top: 830, width: 400, textAlign: "center", opacity: p(f, at - 4, 8) }}>
        <svg viewBox="0 0 200 200" style={{ width: 300, height: 300 }}>
          <circle cx="100" cy="100" r="88" fill="rgba(255,255,255,0.06)" stroke={c} strokeWidth="6" />
          {Array.from({ length: 12 }, (_, i) => <line key={i} x1={100 + Math.sin(i * 0.5236) * 72} y1={100 - Math.cos(i * 0.5236) * 72} x2={100 + Math.sin(i * 0.5236) * 82} y2={100 - Math.cos(i * 0.5236) * 82} stroke={c} strokeWidth="4" />)}
          <line x1="100" y1="100" x2="100" y2="52" stroke={c} strokeWidth="8" strokeLinecap="round" transform={`rotate(${hA} 100 100)`} />
          <line x1="100" y1="100" x2="100" y2="30" stroke={c} strokeWidth="5" strokeLinecap="round" transform={`rotate(${mA} 100 100)`} />
        </svg>
        <div style={{ ...serif(90, c), marginTop: 20 }}>{time}</div>
        <div style={{ ...lab, fontSize: 22, color: c, marginTop: 14 }}>{label}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 770, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>WEEKNIGHT BEDTIME IN THEIR 20S</div>
      {clock(100, 0, 29, "HIGHEST IQ SCORES", "12:29", highAt, true)}
      {clock(580, 11, 41, "LOWEST IQ SCORES", "11:41", lowAt, false)}
      {note("KANAZAWA & PERINA · PERSONALITY AND INDIVIDUAL DIFFERENCES · 2009", 1500)}
    </AbsoluteFill>
  );
};

/** Hours of sleep vs scores: a sweet spot from 7 to 9 hours. */
export const Sweet: React.FC<{ from: number; lowAt: number; highAt: number }> = ({ from, lowAt, highAt }) => {
  const f = useCurrentFrame();
  const x = (h: number) => 60 + (h - 4) * 130;
  const draw = grow(f, from + 4, 30);
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>TEST SCORES BY HOURS OF SLEEP</div>
      <svg viewBox="0 0 900 560" style={{ position: "absolute", left: 90, top: 850, width: 900, height: 560 }}>
        <rect x={x(7)} y="40" width={x(9) - x(7)} height="420" fill="rgba(243,194,29,0.15)" opacity={p(f, from + 20, 10)} />
        <line x1="40" y1="460" x2="880" y2="460" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
        <path d={`M${x(4)} 400 C${x(5.5)} 330 ${x(6.5)} 120 ${x(8)} 110 C${x(9.5)} 120 ${x(10)} 300 ${x(10.3)} 380`} fill="none" stroke={FLASH} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        {[4, 5, 6, 7, 8, 9, 10].map((h) => <text key={h} x={x(h)} y="505" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="26">{h}h</text>)}
        <text x={x(5)} y="300" textAnchor="middle" fill="#fff" fontFamily={SERIF2} fontSize="56" opacity={p(f, lowAt, 10)}>lower</text>
        <text x={x(10)} y="230" textAnchor="middle" fill="#fff" fontFamily={SERIF2} fontSize="56" opacity={p(f, highAt, 10)}>lower</text>
        <text x={x(8)} y="80" textAnchor="middle" fill={FLASH} fontFamily={SANS2} fontWeight={800} fontSize="24" letterSpacing="3" opacity={p(f, from + 24, 10)}>7-9 HOURS</text>
      </svg>
      {note("IMPERIAL COLLEGE LONDON · BMJ PUBLIC HEALTH · 2024 · ILLUSTRATION", 1500)}
    </AbsoluteFill>
  );
};

/** Only a link: not proven cause, education not counted, gap is small. */
export const Link: React.FC<{ from: number; eduAt: number; smallAt: number }> = ({ from, eduAt, smallAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, text: string, at: number, gold: boolean) => (
    <div style={{ position: "absolute", left: 140, right: 140, top, display: "flex", alignItems: "center", gap: 30, opacity: p(f, at, 8), transform: `translateY(${(1 - p(f, at, 12)) * 24}px)` }}>
      <div style={{ width: 22, height: 22, borderRadius: 11, background: gold ? FLASH : "#fff", flex: "none" }} />
      <div style={{ ...serif(78, gold ? FLASH : "#fff") }}>{text}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {row(880, "a link, not proof", from, false)}
      {row(1060, "education not counted", eduAt, false)}
      {row(1240, "the gap is small", smallAt, true)}
    </AbsoluteFill>
  );
};
