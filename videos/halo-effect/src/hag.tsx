// Motion graphics for the halo-effect video (mosquito look: thin serif, small labels, light shapes).
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

/** Three snap judgements tick in: smart, kind, good at their job. */
export const Decided: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const f = useCurrentFrame();
  const items = ["smart", "kind", "good at their job"];
  return (
    <AbsoluteFill>
      <Lab at={at[0] - 20} top={840} size={24} color="rgba(255,255,255,0.75)">BEFORE A SINGLE WORD</Lab>
      {items.map((t, i) => (
        <div key={t} style={{ position: "absolute", left: 200, top: 920 + i * 160, display: "flex", alignItems: "center", gap: 36, opacity: p(f, at[i], 8), transform: `translateX(${(1 - p(f, at[i], 10)) * 60}px)` }}>
          <div style={{ width: 70, height: 70, borderRadius: 35, border: `4px solid ${FLASH}`, display: "flex", alignItems: "center", justifyContent: "center", ...serif(56, FLASH) }}>✓</div>
          <div style={serif(100)}>{t}</div>
        </div>
      ))}
    </AbsoluteFill>
  );
};

/** An officer's rating sheet: four traits whose bars move together. */
export const Ratings: React.FC<{ from: number; stuckAt: number }> = ({ from, stuckAt }) => {
  const f = useCurrentFrame();
  const traits = ["PHYSIQUE", "INTELLIGENCE", "LEADERSHIP", "CHARACTER"];
  const wobble = (i: number) => 0.35 + 0.3 * Math.sin((f - from) / 9 + i * 1.7);
  const together = p(f, stuckAt, 18);
  return (
    <AbsoluteFill>
      {traits.map((t, i) => {
        const v = wobble(i) * (1 - together) + (0.55 + 0.25 * Math.sin((f - from) / 14)) * together;
        return <div key={t} style={{ position: "absolute", left: 140, right: 140, top: 860 + i * 150, opacity: p(f, from + i * 4, 8) }}>
          <div style={{ ...lab, fontSize: 24, color: "#fff" }}>{t}</div>
          <div style={{ marginTop: 12, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.18)" }}><div style={{ width: `${v * 100}%`, height: "100%", borderRadius: 15, background: i === 0 ? FLASH : "#fff" }} /></div>
        </div>;
      })}
      <Line at={stuckAt + 6} top={1480} size={90} color={FLASH}>stuck together</Line>
      {note("THORNDIKE · JOURNAL OF APPLIED PSYCHOLOGY · 1920", 1640)}
    </AbsoluteFill>
  );
};

/** Good-looking pulls everything else up: one gold bar rises, the rest follow. */
export const Pull: React.FC<{ from: number; upAt: number }> = ({ from, upAt }) => {
  const f = useCurrentFrame();
  const cols = ["LOOKS", "SMARTS", "LEADING"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 160, right: 160, top: 840, height: 560, display: "flex", alignItems: "flex-end", gap: 60, borderBottom: "4px solid rgba(255,255,255,0.6)" }}>
        {cols.map((c, i) => {
          const h = interpolate(f, [i ? upAt : from + 4, (i ? upAt : from + 4) + 20], [80, 480 - i * 40], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
          return <div key={c} style={{ flex: 1, height: h, borderRadius: "14px 14px 0 0", background: i ? "#fff" : FLASH }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 160, right: 160, top: 1420, display: "flex", justifyContent: "space-around", ...lab, fontSize: 24, color: "#fff" }}>{cols.map((c) => <span key={c}>{c}</span>)}</div>
    </AbsoluteFill>
  );
};

/** Title card: the halo effect, with a thin gold ring. */
export const Named: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 340, top: 900, width: 400, height: 110, borderRadius: "50%", border: `8px solid ${FLASH}`, boxShadow: `0 0 40px ${FLASH}`, opacity: p(f, from, 10) }} />
      <Line at={from + 4} top={1080} size={100}>the</Line>
      <Line at={from + 8} top={1190} size={170} color={FLASH}>halo effect</Line>
    </AbsoluteFill>
  );
};

/** Two screens: the same teacher, warm vs cold. */
export const Split: React.FC<{ warmAt: number; coldAt: number }> = ({ warmAt, coldAt }) => {
  const f = useCurrentFrame();
  const screen = (left: number, label: string, warm: boolean, at: number) => (
    <div style={{ position: "absolute", left, top: 880, width: 380, opacity: p(f, at, 8) }}>
      <div style={{ height: 300, borderRadius: 20, border: `5px solid ${warm ? FLASH : "#fff"}`, background: "rgba(0,8,40,0.6)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg viewBox="0 0 100 100" style={{ width: 170, height: 170 }}><circle cx="50" cy="50" r="40" fill="none" stroke={warm ? FLASH : "#fff"} strokeWidth="5" /><circle cx="36" cy="42" r="4" fill={warm ? FLASH : "#fff"} /><circle cx="64" cy="42" r="4" fill={warm ? FLASH : "#fff"} />
          <path d={warm ? "M32 62 Q50 78 68 62" : "M34 66 H66"} stroke={warm ? FLASH : "#fff"} strokeWidth="5" fill="none" strokeLinecap="round" /></svg>
      </div>
      <div style={{ ...lab, fontSize: 26, color: warm ? FLASH : "#fff", textAlign: "center", marginTop: 18 }}>{label}</div>
    </div>
  );
  return <AbsoluteFill>{screen(120, "WARM", true, warmAt)}{screen(580, "COLD", false, coldAt)}<Lab at={coldAt + 8} top={1300} size={24}>SAME TEACHER · SAME ACCENT</Lab></AbsoluteFill>;
};

/** The same three traits judged by each group: appealing vs irritating. */
export const Judged: React.FC<{ from: number; warmAt: number; coldAt: number }> = ({ from, warmAt, coldAt }) => {
  const f = useCurrentFrame();
  const traits = ["looks", "mannerisms", "accent"];
  return (
    <AbsoluteFill>
      {traits.map((t, i) => <div key={t} style={{ position: "absolute", left: 0, right: 0, top: 860 + i * 120, textAlign: "center", ...serif(86), opacity: p(f, from + i * 5, 8) }}>{t}</div>)}
      <div style={{ position: "absolute", left: 100, width: 400, top: 1260, textAlign: "center", opacity: p(f, warmAt, 8) }}><div style={{ ...lab, fontSize: 22, color: FLASH }}>WARM VERSION</div><div style={{ ...serif(96, FLASH), marginTop: 10 }}>appealing</div></div>
      <div style={{ position: "absolute", left: 580, width: 400, top: 1260, textAlign: "center", opacity: p(f, coldAt, 8) }}><div style={{ ...lab, fontSize: 22, color: RED }}>COLD VERSION</div><div style={{ ...serif(96, RED), marginTop: 10 }}>irritating</div></div>
      {note("NISBETT & WILSON · JPSP · 1977 · UNIVERSITY OF MICHIGAN", 1600)}
    </AbsoluteFill>
  );
};

/** A student's claim as a quote card. */
export const Denied: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from + 2, 12);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 900, padding: "50px 50px", borderRadius: 30, border: "4px solid rgba(255,255,255,0.4)", background: "rgba(5,10,45,0.85)", opacity: k, transform: `translateY(${(1 - k) * 50}px)` }}>
        <div style={serif(96)}>"Liking him had <span style={{ color: FLASH }}>nothing</span> to do with it."</div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)", marginTop: 24 }}>WHAT THE STUDENTS SAID</div>
      </div>
    </AbsoluteFill>
  );
};

/** What really happened vs what they claimed: arrows in opposite directions. */
export const Reverse: React.FC<{ from: number; claimAt: number }> = ({ from, claimAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, a: string, b: string, label: string, color: string, at: number) => (
    <div style={{ position: "absolute", left: 120, right: 120, top, opacity: p(f, at, 8) }}>
      <div style={{ ...lab, fontSize: 22, color }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24, marginTop: 12 }}><span style={{ ...serif(72), whiteSpace: "nowrap" }}>{a}</span><span style={serif(72, color)}>→</span><span style={{ ...serif(72), whiteSpace: "nowrap" }}>{b}</span></div>
    </div>
  );
  return <AbsoluteFill>{row(900, "liking him", "his accent", "WHAT REALLY HAPPENED", FLASH, from + 4)}{row(1160, "his accent", "disliking him", "WHAT THEY CLAIMED", RED, claimAt)}</AbsoluteFill>;
};
