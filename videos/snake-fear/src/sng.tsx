// Motion graphics for "Are we born scared of snakes and spiders?", in the mosquito look: thin serif for big words and
// numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const RED = "#ff5a5a";
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

const Icon: React.FC<{ kind: "spider" | "snake" | "flower" | "fish"; color: string; size?: number }> = ({ kind, color, size = 160 }) => (
  <svg viewBox="0 0 100 100" style={{ width: size, height: size }}>
    {kind === "spider" ? <g stroke={color} strokeWidth="4" fill="none" strokeLinecap="round">
      <circle cx="50" cy="52" r="12" fill={color} /><circle cx="50" cy="34" r="7" fill={color} />
      {[-1, 1].map((s) => [0, 1, 2, 3].map((i) => <path key={`${s}${i}`} d={`M${50 + s * 10} ${46 + i * 5} Q${50 + s * 30} ${30 + i * 10} ${50 + s * 40} ${40 + i * 14}`} />))}
    </g> : null}
    {kind === "snake" ? <path d="M15 75 C30 55 45 85 60 65 C75 45 55 30 72 22 L84 26" fill="none" stroke={color} strokeWidth="9" strokeLinecap="round" /> : null}
    {kind === "flower" ? <g fill={color}>{[0, 72, 144, 216, 288].map((a) => <ellipse key={a} cx="50" cy="30" rx="10" ry="18" transform={`rotate(${a} 50 50)`} />)}<circle cx="50" cy="50" r="9" fill="#123dd6" /></g> : null}
    {kind === "fish" ? <path d="M15 50 C35 25 65 25 78 50 C65 75 35 75 15 50 Z M78 50 L92 36 L92 64 Z" fill={color} /> : null}
  </svg>
);

/** Four pictures shown to the babies: spider and snake (gold) vs flower and fish (white). */
export const Pics: React.FC<{ from: number; scaryAt: number; calmAt: number }> = ({ from, scaryAt, calmAt }) => {
  const f = useCurrentFrame();
  const card = (left: number, top: number, kind: "spider" | "snake" | "flower" | "fish", at: number, gold: boolean) => (
    <div style={{ position: "absolute", left, top, width: 360, height: 300, borderRadius: 20, border: `4px solid ${gold ? FLASH : "rgba(255,255,255,0.7)"}`, background: "rgba(255,255,255,0.06)",
      display: "flex", alignItems: "center", justifyContent: "center", opacity: p(f, at, 8), transform: `scale(${0.85 + 0.15 * p(f, at, 10)})` }}>
      <Icon kind={kind} color={gold ? FLASH : "#fff"} size={200} />
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {card(150, 830, "spider", scaryAt, true)}{card(570, 830, "snake", scaryAt + 6, true)}
      {card(150, 1170, "flower", calmAt, false)}{card(570, 1170, "fish", calmAt + 6, false)}
      {note("HOEHL ET AL. · FRONTIERS IN PSYCHOLOGY · 2017 · 6-MONTH-OLDS", 1540)}
    </AbsoluteFill>
  );
};

/** An eye whose pupil widens: arousal, "on alert". */
export const Pupil: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 300 160" style={{ position: "absolute", left: 140, top: 880, width: 800, height: 426, opacity: p(f, from, 8) }}>
        <path d="M20 80 Q150 -10 280 80 Q150 170 20 80 Z" fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth="5" />
        <circle cx="150" cy="80" r="50" fill="none" stroke="#fff" strokeWidth="4" />
        <circle cx="150" cy="80" r={16 + 20 * k} fill={k > 0.3 ? FLASH : "#fff"} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...serif(130, FLASH), opacity: p(f, at + 14, 10) }}>on alert</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1510, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, at + 20, 10) }}>BIGGER PUPILS FOR SPIDERS AND SNAKES</div>
    </AbsoluteFill>
  );
};

/** A snake video with two voices; babies looked longer with the frightened voice, but showed no fear. */
export const Voices: React.FC<{ from: number; happyAt: number; scaredAt: number; longerAt: number; noAt: number }> = ({ from, happyAt, scaredAt, longerAt, noAt }) => {
  const f = useCurrentFrame();
  const bar = (top: number, label: string, w: number, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left: 140, right: 140, top, opacity: p(f, at - 4, 6) }}>
      <div style={{ ...lab, fontSize: 22, color: gold ? FLASH : "#fff", marginBottom: 10 }}>{label}</div>
      <div style={{ height: 40, width: w * g, borderRadius: 10, background: gold ? FLASH : "#fff" }} />
    </div>;
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 330, top: 800, width: 420, height: 250, borderRadius: 20, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,8,40,0.5)" }}>
        <Icon kind="snake" color="#fff" size={180} />
      </div>
      <div style={{ position: "absolute", left: 140, top: 1090, ...lab, fontSize: 24, color: "#fff", opacity: p(f, happyAt, 8) }}>☺ HAPPY VOICE</div>
      <div style={{ position: "absolute", right: 140, top: 1090, ...lab, fontSize: 24, color: FLASH, opacity: p(f, scaredAt, 8) }}>FRIGHTENED VOICE</div>
      <div style={{ position: "absolute", left: 140, top: 1150, ...lab, fontSize: 20, color: "rgba(255,255,255,0.7)", opacity: p(f, longerAt - 4, 8) }}>TIME SPENT LOOKING AT THE SNAKE</div>
      {bar(1200, "HAPPY", 420, false, longerAt)}
      {bar(1300, "FRIGHTENED", 700, true, longerAt + 4)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...serif(110), opacity: p(f, noAt, 10) }}>but <span style={{ color: FLASH }}>no fear</span></div>
      {note("DELOACHE & LOBUE · 2009 · ILLUSTRATION", 1620)}
    </AbsoluteFill>
  );
};

/** A road with a fast lane: born ready to learn the fear, not born with it. */
export const Lane: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [at, at + 22], [0, 1], { ...clamp, easing: (t) => t * t });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 900, height: 360, borderTop: "5px solid #fff", borderBottom: "5px solid #fff", opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: 0, right: 0, top: 178, borderTop: "5px dashed rgba(255,255,255,0.6)" }} />
        <div style={{ position: "absolute", left: 30, top: 50, ...lab, fontSize: 22, color: "rgba(255,255,255,0.8)" }}>FLOWERS</div>
        <div style={{ position: "absolute", left: 30 + 120 * p(f, from + 4, 40), top: 100, width: 60, height: 40, borderRadius: 10, background: "#fff" }} />
        <div style={{ position: "absolute", left: 30, top: 230, ...lab, fontSize: 22, color: FLASH }}>SNAKES & SPIDERS</div>
        <div style={{ position: "absolute", left: 30 + 740 * x, top: 280, width: 90, height: 44, borderRadius: 10, background: FLASH }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...serif(130, FLASH), opacity: p(f, at, 10) }}>a fast lane</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1510, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, at + 10, 10) }}>FOR LEARNING THE FEAR</div>
    </AbsoluteFill>
  );
};

/** The monkey video test: fear learned for snakes, never for flowers. */
export const Learned: React.FC<{ from: number; snakeAt: number; flowerAt: number; neverAt: number }> = ({ from, snakeAt, flowerAt, neverAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, kind: "snake" | "flower", label: string, at: number, result: string, gold: boolean, resAt: number) => (
    <div style={{ position: "absolute", left: 120, right: 120, top, display: "flex", alignItems: "center", gap: 40, opacity: p(f, at, 8) }}>
      <div style={{ width: 220, height: 180, borderRadius: 18, border: "4px solid #fff", display: "flex", alignItems: "center", justifyContent: "center" }}><Icon kind={kind} color="#fff" size={130} /></div>
      <div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.8)" }}>{label}</div>
        <div style={{ ...serif(84, gold ? FLASH : "#fff"), marginTop: 12, opacity: p(f, resAt, 10) }}>{result}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {row(860, "snake", "MONKEY PANICS AT A SNAKE", snakeAt, "fear learned", true, snakeAt + 10)}
      {row(1150, "flower", "EDITED: MONKEY 'PANICS' AT FLOWERS", flowerAt, "never learned", false, neverAt)}
      <div style={{ position: "absolute", left: 120, right: 120, top: 1360, height: 6, background: RED, transform: `scaleX(${p(f, neverAt + 4, 10)})`, transformOrigin: "left", opacity: 0 }} />
      {note("MINEKA ET AL. 1984 · COOK & MINEKA 1989 · LAB-RAISED MONKEYS", 1560)}
    </AbsoluteFill>
  );
};
