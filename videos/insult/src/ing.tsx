// Motion graphics for "Why one insult beats ten compliments": white on blue, gold = good, red = bad.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a", RED = "#ff3b3b";

const Pill: React.FC<{ text: string; x: number; y: number; k: number; bg: string; fg?: string; size?: number; o?: number }> = ({ text, x, y, k, bg, fg = INK, size = 34, o = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, opacity: k * o, transform: `scale(${0.6 + 0.4 * k})`, background: bg, color: fg, borderRadius: 30, padding: "14px 26px",
    fontFamily: SANS2, fontWeight: 900, fontSize: size, whiteSpace: "nowrap", boxShadow: "0 16px 30px rgba(0,0,0,0.3)" }}>{text}</div>
);

/** Ten compliments pop in, then one insult lands big and the compliments fade. */
export const Compliments: React.FC<{ from: number; badAt: number }> = ({ from, badAt }) => {
  const f = useCurrentFrame();
  const words = ["Looks great!", "Love it!", "So nice", "Stunning", "Great fit!", "Wow!", "Perfect", "Beautiful", "Yes!!", "Amazing"];
  const dim = 1 - 0.75 * p(f, badAt + 6, 14);
  return (
    <AbsoluteFill>
      {words.map((w, i) => <Pill key={i} text={w} x={90 + (i % 3) * 300 + (Math.floor(i / 3) % 2) * 60} y={760 + Math.floor(i / 3) * 170} k={p(f, from + 4 + i * 3, 10)} bg={FLASH} o={dim} />)}
      <Pill text="it looks weird." x={190} y={1150} k={p(f, badAt, 8)} bg={RED} fg="#fff" size={80} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", ...lab, fontSize: 32, color: "#fff", opacity: p(f, badAt + 10, 10) }}>10 GOOD · <span style={{ color: RED }}>1 BAD</span></div>
    </AbsoluteFill>
  );
};

/** A balance: one side heavier. ratio=false: BAD sinks; ratio=true: five good vs one bad, level. */
export const Scale: React.FC<{ from: number; at: number; ratio?: boolean }> = ({ from, at, ratio }) => {
  const f = useCurrentFrame();
  const k = p(f, at, 20);
  const tilt = ratio ? 14 * (1 - k) : -14 * k;
  const pan = (side: -1 | 1, items: React.ReactNode, label: string, col: string) => {
    const dy = side * Math.sin((tilt * Math.PI) / 180) * 300;
    return (
      <g transform={`translate(${540 + side * 300} ${1050 - dy})`}>
        <line x1={0} y1={-140} x2={-110} y2={0} stroke="#fff" strokeWidth={4} /><line x1={0} y1={-140} x2={110} y2={0} stroke="#fff" strokeWidth={4} />
        <path d="M -140 0 Q 0 60 140 0 Z" fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth={5} />
        {items}
        <text y={120} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={34} letterSpacing="0.14em" fill={col}>{label}</text>
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={530} y={910} width={20} height={520} fill="#fff" /><path d="M 440 1440 L 640 1440 L 600 1400 L 480 1400 Z" fill="#fff" />
        <g transform={`rotate(${tilt} 540 910)`}><rect x={230} y={902} width={620} height={16} rx={8} fill="#fff" /></g>
        {pan(-1, ratio ? [0, 1, 2, 3, 4].map((i) => <circle key={i} cx={-60 + (i % 3) * 60} cy={i < 3 ? -24 : -74} r={26} fill={FLASH} opacity={p(f, at + i * 4, 8)} />) : <circle cx={0} cy={-30} r={34} fill={FLASH} />, ratio ? "5 GOOD" : "GOOD", FLASH)}
        {pan(1, <circle cx={0} cy={-40} r={ratio ? 26 : 56} fill={RED} />, ratio ? "1 BAD" : "BAD", RED)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 30, color: ratio ? FLASH : "#fff", opacity: p(f, at + 20, 10) }}>{ratio ? "ABOUT 5 : 1 · GOTTMAN" : "BAD IS STRONGER THAN GOOD"}</div>
    </AbsoluteFill>
  );
};

/** Losing $100 vs winning $100: the loss bar is about twice as tall. */
export const Money: React.FC<{ loseAt: number; winAt: number }> = ({ loseAt, winAt }) => {
  const f = useCurrentFrame();
  const bar = (x: number, label: string, h: number, col: string, at: number, tag: string) => {
    const g = interpolate(f, [at, at + 22], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    return (
      <div style={{ position: "absolute", left: x, top: 760, width: 340, textAlign: "center", opacity: p(f, at - 4, 8) }}>
        <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 80, color: col }}>{label}</div>
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginTop: 6 }}>{tag}</div>
        <div style={{ position: "relative", margin: "30px auto 0", width: 170, height: 560 }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * g, borderRadius: "16px 16px 0 0", background: col }} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {bar(130, "−$100", 520, RED, loseAt, "HOW MUCH IT HURTS")}
      {bar(610, "+$100", 260, FLASH, winAt, "HOW GOOD IT FEELS")}
      <div style={{ position: "absolute", left: 140, right: 140, top: 1500, height: 4, background: "rgba(255,255,255,0.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 30, color: "#fff", opacity: p(f, winAt + 20, 10) }}>LOSSES HURT ABOUT 2×</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1620, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>KAHNEMAN & TVERSKY</div>
    </AbsoluteFill>
  );
};

/** Count the good ones: 1 to 5. */
export const Count: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const n = Math.min(5, Math.max(1, Math.floor((f - from) / 8) + 1));
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingTop: 260 }}>
      <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 320, color: FLASH, lineHeight: 1, transform: `scale(${1 + 0.15 * Math.max(0, 1 - ((f - from) % 8) / 6)})` }}>{n}</div>
      <div style={{ ...lab, fontSize: 36, color: "#fff" }}>COUNT THE GOOD ONES</div>
    </AbsoluteFill>
  );
};
