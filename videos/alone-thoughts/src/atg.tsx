// Motion graphics for "alone with your thoughts" (mosquito look: thin serif, small labels, light shapes).
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

/** A stopwatch counting up: how long before you reach for your phone? */
export const Stopwatch: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const s = Math.floor((f - from) / 3);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 200 220" style={{ position: "absolute", left: 340, top: 820, width: 400, height: 440, opacity: p(f, from, 8) }}>
        <rect x="88" y="4" width="24" height="20" rx="4" fill="#fff" /><circle cx="100" cy="122" r="86" fill="none" stroke="#fff" strokeWidth="8" />
        <line x1="100" y1="122" x2={100 + Math.sin(s / 9) * 70} y2={122 - Math.cos(s / 9) * 70} stroke={FLASH} strokeWidth="8" strokeLinecap="round" />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", ...serif(140, FLASH) }}>0:{String(s % 60).padStart(2, "0")}</div>
    </AbsoluteFill>
  );
};

/** A phone battery draining to empty. */
export const Battery: React.FC<{ from: number; deadAt: number }> = ({ from, deadAt }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, deadAt], [0.18, 0], clamp);
  const dead = f >= deadAt;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 340, top: 760, width: 400, height: 720, borderRadius: 60, border: "8px solid #fff", background: dead ? "#000" : "rgba(0,8,40,0.6)", opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: 140, top: 300, width: 120, height: 60, borderRadius: 10, border: "5px solid #fff" }}>
          <div style={{ width: `${k * 100}%`, height: "100%", background: RED }} />
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center", ...lab, fontSize: 26, color: RED }}>{Math.round(k * 100)}%</div>
      </div>
    </AbsoluteFill>
  );
};

/** A plain room: a chair, a clock, phone and book crossed out, "think". */
export const Room: React.FC<{ from: number; minAt: number; thinkAt: number }> = ({ from, minAt, thinkAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 300" style={{ position: "absolute", left: 140, top: 760, width: 800, height: 600, opacity: p(f, from, 8) }}>
        <rect x="20" y="20" width="360" height="260" fill="none" stroke="#fff" strokeWidth="4" />
        <path d="M170 270 V200 H230 V270 M170 200 V150 H230 V200" fill="none" stroke="#fff" strokeWidth="5" />
        <circle cx="320" cy="70" r="26" fill="none" stroke="#fff" strokeWidth="4" /><line x1="320" y1="70" x2="320" y2="54" stroke={FLASH} strokeWidth="4" />
      </svg>
      <Line at={minAt} top={1400} size={110} color={FLASH}>6-15 minutes</Line>
      <Lab at={thinkAt} top={1540}>ONE JOB: THINK · NO PHONE · NO BOOK</Lab>
      {note("WILSON ET AL. · SCIENCE · 2014 · UNIVERSITY OF VIRGINIA", 1620)}
    </AbsoluteFill>
  );
};

/** Two results: didn't enjoy it, hard to focus. */
export const Enjoy: React.FC<{ enjoyAt: number; focusAt: number }> = ({ enjoyAt, focusAt }) => (
  <AbsoluteFill>
    <Lab at={enjoyAt} top={900} color="rgba(255,255,255,0.75)" size={24}>MOST PEOPLE</Lab>
    <Line at={enjoyAt} top={950} size={120}>didn't enjoy it</Line>
    <Lab at={focusAt} top={1180} color="rgba(255,255,255,0.75)" size={24}>MANY</Lab>
    <Line at={focusAt} top={1230} size={120} color={FLASH}>couldn't focus</Line>
  </AbsoluteFill>
);

/** First a small shock (a bolt), then "they'd pay to avoid it". */
export const Pay: React.FC<{ shockAt: number; payAt: number }> = ({ shockAt, payAt }) => {
  const f = useCurrentFrame();
  const flash = f >= shockAt ? Math.max(0, 1 - (f - shockAt) / 10) : 0;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 100 160" style={{ position: "absolute", left: 440, top: 800, width: 200, height: 320, opacity: p(f, shockAt - 4, 6), filter: `drop-shadow(0 0 ${30 * flash}px ${FLASH})` }}><path d="M60 0 L18 88 H48 L36 160 L84 64 H54 Z" fill={FLASH} /></svg>
      <Line at={payAt} top={1200} size={110}>they'd <span style={{ color: FLASH }}>pay</span> to avoid it</Line>
    </AbsoluteFill>
  );
};

/** Men: 2 of 3 pressed it. Women: 1 of 4. */
export const Pressed: React.FC<{ menAt: number; womenAt: number }> = ({ menAt, womenAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <Lab at={menAt} top={820} size={26}>MEN</Lab>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", gap: 30, opacity: p(f, menAt, 8) }}>{[0, 1, 2].map((i) => <Person key={i} on={i < 2} size={100} dim={i >= 2} />)}</div>
      <Line at={menAt + 6} top={1050} size={90} color={FLASH}>2 in 3</Line>
      <Lab at={womenAt} top={1180} size={26}>WOMEN</Lab>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, display: "flex", justifyContent: "center", gap: 30, opacity: p(f, womenAt, 8) }}>{[0, 1, 2, 3].map((i) => <Person key={i} on={i < 1} size={100} dim={i >= 1} />)}</div>
      <Line at={womenAt + 6} top={1410} size={90} color={FLASH}>1 in 4</Line>
    </AbsoluteFill>
  );
};

/** A counter racing to 190. */
export const Count: React.FC<{ from: number; doneAt: number }> = ({ from, doneAt }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [from + 2, doneAt], [0, 190], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", ...serif(300, FLASH) }}>{n}</div>
      <Lab at={from} top={1260}>SHOCKS · ONE MAN</Lab>
    </AbsoluteFill>
  );
};

/** Doing something beats doing nothing: a balance tipping toward "something". */
export const Something: React.FC<{ from: number; tipAt: number }> = ({ from, tipAt }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [tipAt, tipAt + 20], [0, 10], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 535, top: 1100, width: 8, height: 300, background: "#fff", opacity: p(f, from, 8) }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 1090, height: 8, background: "#fff", transform: `rotate(${-t}deg)`, opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: -40, width: 360, top: -190, textAlign: "center", ...serif(84, "#fff") }}>doing nothing</div>
        <div style={{ position: "absolute", right: -40, width: 360, top: -190, textAlign: "center", ...serif(84, FLASH) }}>doing something</div>
      </div>
    </AbsoluteFill>
  );
};

/** One minute, counting down: "no phone. just you." */
export const Minute: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const s = Math.max(0, 60 - Math.floor(interpolate(f, [from, to], [0, 60], clamp)));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", ...serif(260, FLASH), opacity: p(f, from, 8) }}>{Math.floor(s / 60)}:{String(s % 60).padStart(2, "0")}</div>
      <Lab at={from + 10} top={1240}>NO PHONE · JUST YOU</Lab>
    </AbsoluteFill>
  );
};
