// Motion graphics for the Dunning-Kruger video (mosquito look: thin serif, small labels, light shapes).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const RED = "#ff5a5a";
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
/** A big serif line that fades and lifts in at `at`. */
const Line: React.FC<{ at: number; top: number; size: number; color?: string; children: React.ReactNode }> = ({ at, top, size, color = "#fff", children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", ...serif(size, color), opacity: p(f, at, 10), transform: `translateY(${(1 - p(f, at, 12)) * 30}px)` }}>{children}</div>;
};
/** A small label that fades in at `at`. */
const Lab: React.FC<{ at: number; top: number; color?: string; size?: number; children: React.ReactNode }> = ({ at, top, color = "#fff", size = 28, children }) => {
  const f = useCurrentFrame();
  return <div style={{ position: "absolute", left: 60, right: 60, top, textAlign: "center", ...lab, fontSize: size, color, opacity: p(f, at, 8) }}>{children}</div>;
};
/** Simple person icon (head + shoulders). */
const Person: React.FC<{ on: boolean; size?: number; dim?: boolean }> = ({ on, size = 110, dim }) => (
  <svg viewBox="0 0 60 90" style={{ width: size, height: size * 1.5 }}><circle cx="30" cy="18" r="15" fill={on ? FLASH : dim ? "rgba(255,255,255,0.3)" : "#fff"} /><path d="M4 88 C4 45 56 45 56 88 Z" fill={on ? FLASH : dim ? "rgba(255,255,255,0.3)" : "#fff"} /></svg>
);
void RED; void interpolate; void clamp; void note; void Person; void Lab; void Line;

/** Lemon juice as "invisible ink": a face outline fading away, "invisible?" */
export const Ink: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const fade = interpolate(f, [from + 10, from + 40], [1, 0.12], clamp);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 200 240" style={{ position: "absolute", left: 340, top: 800, width: 400, height: 480, opacity: fade }}>
        <ellipse cx="100" cy="110" rx="70" ry="90" fill="none" stroke="#fff" strokeWidth="6" />
        <circle cx="75" cy="95" r="7" fill="#fff" /><circle cx="125" cy="95" r="7" fill="#fff" /><path d="M75 150 Q100 165 125 150" stroke="#fff" strokeWidth="6" fill="none" />
      </svg>
      <Line at={from + 18} top={1340} size={120} color={FLASH}>invisible?</Line>
    </AbsoluteFill>
  );
};

/** "How well did you do?" with a slider. */
export const Rate: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [from + 6, from + 30], [0.2, 0.75], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <AbsoluteFill>
      <Line at={from} top={900} size={110}>how well did you do?</Line>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1180, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.4)", opacity: p(f, from, 8) }} />
      <div style={{ position: "absolute", left: 140 + 800 * x - 26, top: 1158, width: 52, height: 52, borderRadius: 26, background: FLASH, opacity: p(f, from, 8) }} />
    </AbsoluteFill>
  );
};

/** A 0-100 percentile line: the real score at 12, the guess at 62. */
export const Percentile: React.FC<{ realAt: number; guessAt: number }> = ({ realAt, guessAt }) => {
  const f = useCurrentFrame();
  const X = (v: number) => 120 + 8.4 * v;
  const g = interpolate(f, [guessAt, guessAt + 20], [12, 62], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, width: 840, top: 1150, height: 6, background: "rgba(255,255,255,0.5)" }} />
      {[0, 50, 100].map((v) => <div key={v} style={{ position: "absolute", left: X(v) - 60, width: 120, top: 1180, textAlign: "center", ...serif(48) }}>{v}</div>)}
      <div style={{ position: "absolute", left: X(12) - 22, top: 1130, width: 44, height: 44, borderRadius: 22, background: "#fff", opacity: p(f, realAt, 8) }} />
      <div style={{ position: "absolute", left: X(12) - 150, width: 300, top: 1000, textAlign: "center", opacity: p(f, realAt, 8) }}><div style={serif(110)}>12th</div><div style={{ ...lab, fontSize: 22, color: "#fff", marginTop: 8 }}>REAL SCORE</div></div>
      <div style={{ position: "absolute", left: X(g) - 22, top: 1130, width: 44, height: 44, borderRadius: 22, background: FLASH, opacity: p(f, guessAt, 6) }} />
      <div style={{ position: "absolute", left: X(62) - 150, width: 300, top: 1260, textAlign: "center", opacity: p(f, guessAt + 12, 8) }}><div style={serif(110, FLASH)}>62nd</div><div style={{ ...lab, fontSize: 22, color: FLASH, marginTop: 8 }}>THEIR GUESS</div></div>
      {note("KRUGER & DUNNING · JPSP · 1999 · CORNELL", 1620)}
    </AbsoluteFill>
  );
};

/** The skill to do it = the skill to judge it. */
export const SameSkill: React.FC<{ from: number; sameAt: number }> = ({ from, sameAt }) => {
  const f = useCurrentFrame();
  const k = p(f, sameAt, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 200 + 140 * k, top: 920, width: 260, height: 260, borderRadius: 130, border: "6px solid #fff", opacity: p(f, from, 8) }} />
      <div style={{ position: "absolute", left: 620 - 140 * k, top: 920, width: 260, height: 260, borderRadius: 130, border: `6px solid ${FLASH}`, opacity: p(f, from + 6, 8) }} />
      <Lab at={from} top={1220} size={24}>DOING IT · JUDGING IT</Lab>
      <Line at={sameAt + 10} top={1290} size={110} color={FLASH}>the same skill</Line>
    </AbsoluteFill>
  );
};

/** The title card: the Dunning-Kruger effect. */
export const Named: React.FC<{ from: number }> = ({ from }) => (
  <AbsoluteFill>
    <Line at={from} top={980} size={100}>the</Line>
    <Line at={from + 4} top={1090} size={140} color={FLASH}>Dunning-Kruger</Line>
    <Line at={from + 8} top={1240} size={100}>effect</Line>
  </AbsoluteFill>
);

/** The best students underestimated themselves: "easy for me = easy for everyone". */
export const Flip: React.FC<{ from: number; underAt: number; easyAt: number }> = ({ from, underAt, easyAt }) => {
  const f = useCurrentFrame();
  const d = interpolate(f, [underAt, underAt + 20], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <AbsoluteFill>
      <Lab at={from} top={840} size={24}>THE BEST STUDENTS</Lab>
      <svg viewBox="0 0 100 160" style={{ position: "absolute", left: 470, top: 900, width: 140, height: 224, opacity: p(f, underAt, 8), transform: `translateY(${d * 30}px)` }}><path d="M40 0 H60 V110 H85 L50 160 L15 110 H40 Z" fill={FLASH} /></svg>
      <Line at={underAt + 6} top={1160} size={100}>rated themselves lower</Line>
      <Line at={easyAt} top={1330} size={86} color={FLASH}>"if it's easy for me, it's easy for everyone"</Line>
    </AbsoluteFill>
  );
};
