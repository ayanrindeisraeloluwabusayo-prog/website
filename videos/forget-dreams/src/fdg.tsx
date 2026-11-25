// Motion graphics for "why we forget our dreams" (mosquito look: thin serif, small labels, light shapes).
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

const Cloud: React.FC<{ size: number; o?: number; blur?: number }> = ({ size, o = 1, blur = 0 }) => (
  <svg viewBox="0 0 300 180" style={{ width: size, height: size * 0.6, opacity: o, filter: blur ? `blur(${blur}px)` : undefined }}>
    <path d="M70 160 C20 160 20 90 70 90 C70 40 140 20 165 60 C190 20 270 40 260 100 C300 100 300 160 250 160 Z" fill="#fff" />
  </svg>
);

/** A dream cloud that dissolves when the phone lights up. */
export const Gone: React.FC<{ from: number; goneAt: number }> = ({ from, goneAt }) => {
  const f = useCurrentFrame();
  const k = p(f, goneAt - 6, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 240, top: 860 - 60 * k, transform: `scale(${1 + 0.3 * k})` }}><Cloud size={600} o={(1 - k) * p(f, from, 8)} blur={14 * k} /></div>
      <Line at={goneAt} top={1300} size={130} color={FLASH}>gone</Line>
    </AbsoluteFill>
  );
};

/** The sleeping brain can't save: a save icon with a cross. */
export const NoSave: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 100 100" style={{ position: "absolute", left: 390, top: 820, width: 300, height: 300, opacity: p(f, from, 8) }}>
        <path d="M10 10 H75 L90 25 V90 H10 Z" fill="none" stroke="#fff" strokeWidth="5" /><rect x="28" y="10" width="38" height="24" fill="none" stroke="#fff" strokeWidth="5" /><rect x="22" y="55" width="56" height="35" fill="none" stroke="#fff" strokeWidth="5" />
        <path d="M30 60 L70 86 M70 60 L30 86" stroke={RED} strokeWidth="6" opacity={p(f, from + 12, 6)} />
      </svg>
      <Line at={from + 8} top={1200} size={100}>asleep, it can't <span style={{ color: FLASH }}>save</span></Line>
    </AbsoluteFill>
  );
};

/** A night of sleep as a line with small wake-ups; a dream gets saved at a wake-up. */
export const Night: React.FC<{ from: number; wakeAt: number; double?: boolean }> = ({ from, wakeAt, double }) => {
  const f = useCurrentFrame();
  const blips = double ? [0.15, 0.3, 0.45, 0.6, 0.75, 0.9] : [0.3, 0.6, 0.9];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, width: 840, top: 1150, height: 6, background: "rgba(255,255,255,0.5)", opacity: p(f, from, 8) }} />
      {blips.map((b, i) => <div key={i} style={{ position: "absolute", left: 120 + 840 * b - 6, top: 1050, width: 12, height: 100, borderRadius: 6, background: FLASH, opacity: p(f, wakeAt + i * 4, 6) }} />)}
      <Lab at={from} top={1190} size={24}>{double ? "HIGH RECALLERS: ABOUT TWICE AS MANY WAKE-UPS" : "ASLEEP · · · BRIEFLY AWAKE"}</Lab>
      {!double ? <Line at={wakeAt + 10} top={850} size={100} color={FLASH}>a chance to save it</Line> : null}
      {double ? note("EICHENLAUB, RUBY ET AL. · INSERM, LYON · 2013-14", 1620) : null}
    </AbsoluteFill>
  );
};

/** Two calendars: 5 mornings a week vs 2 a month. */
export const Recallers: React.FC<{ highAt: number; lowAt: number }> = ({ highAt, lowAt }) => {
  const f = useCurrentFrame();
  const cal = (left: number, lit: number[], total: number, cols: number, at: number, gold: boolean, label: string) => (
    <div style={{ position: "absolute", left, top: 860, width: 360, opacity: p(f, at, 8) }}>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>{Array.from({ length: total }, (_, i) => <div key={i} style={{ width: (360 - 8 * (cols - 1)) / cols, height: 40, borderRadius: 6, background: lit.includes(i) ? (gold ? FLASH : "#fff") : "rgba(255,255,255,0.15)" }} />)}</div>
      <div style={{ ...lab, fontSize: 22, color: gold ? FLASH : "#fff", marginTop: 16, textAlign: "center" }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {cal(100, [0, 1, 2, 3, 4], 7, 7, highAt, true, "5 MORNINGS A WEEK")}
      {cal(620, [6, 19], 28, 7, lowAt, false, "2 A MONTH")}
      <Line at={highAt} top={1200} size={90}>dream rememberers</Line>
    </AbsoluteFill>
  );
};

/** "on purpose" */
export const Purpose: React.FC<{ from: number }> = ({ from }) => <AbsoluteFill><Line at={from} top={1050} size={180} color={FLASH}>on purpose</Line></AbsoluteFill>;

/** A mouse with blinking brain cells during dream sleep: "forgetting" cells. */
export const Cells: React.FC<{ from: number; forgetAt: number }> = ({ from, forgetAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 300 180" style={{ position: "absolute", left: 140, top: 820, width: 800, height: 480, opacity: p(f, from, 8) }}>
        <path d="M40 140 C40 80 110 50 170 60 C220 66 250 100 255 130 L280 140 C250 150 120 155 40 140 Z" fill="none" stroke="#fff" strokeWidth="5" />
        <circle cx="205" cy="62" r="22" fill="none" stroke="#fff" strokeWidth="5" /><circle cx="250" cy="122" r="5" fill="#fff" />
        <path d="M40 140 C10 140 0 120 10 100" fill="none" stroke="#fff" strokeWidth="4" />
        {[0, 1, 2, 3, 4].map((i) => <circle key={i} cx={200 + (i % 3) * 14} cy={95 + Math.floor(i / 3) * 14} r="5" fill={FLASH} opacity={0.3 + 0.7 * Math.abs(Math.sin((f - from) / 6 + i))} />)}
      </svg>
      <Lab at={from + 6} top={1330} size={24}>ACTIVE DURING DREAM SLEEP (REM)</Lab>
      <Line at={forgetAt} top={1390} size={110} color={FLASH}>forgetting</Line>
      {note("IZAWA, YAMANAKA ET AL. · SCIENCE · 2019 · MICE", 1620)}
    </AbsoluteFill>
  );
};

/** A switch flipped off, then a memory bar rising: "remembered more". */
export const SwitchOff: React.FC<{ offAt: number; moreAt: number }> = ({ offAt, moreAt }) => {
  const f = useCurrentFrame();
  const off = p(f, offAt, 8);
  const m = interpolate(f, [moreAt, moreAt + 20], [0.3, 0.85], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 200, top: 900, width: 240, height: 120, borderRadius: 60, background: off > 0.5 ? "rgba(255,255,255,0.2)" : FLASH, border: "5px solid #fff" }}>
        <div style={{ position: "absolute", top: 10, left: 10 + 120 * (1 - off), width: 90, height: 90, borderRadius: 45, background: "#fff" }} />
      </div>
      <Lab at={offAt - 10} top={1050} size={22}>FORGETTING CELLS</Lab>
      <div style={{ position: "absolute", left: 640, top: 820, width: 120, height: 500, borderRadius: 16, border: "5px solid #fff" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${m * 100}%`, borderRadius: 10, background: FLASH }} />
      </div>
      <Lab at={moreAt} top={1350} size={22}>MEMORY</Lab>
      <Line at={moreAt + 6} top={1420} size={100} color={FLASH}>remembered more</Line>
    </AbsoluteFill>
  );
};
