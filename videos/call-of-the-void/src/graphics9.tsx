// Motion graphics for "Why do you get a sudden urge to jump?": white on blue, gold for the key fact, red for the alarm.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const RED = "#ff5a4f";

/** 431 students; of those who had never thought about ending their life, about half had felt the urge. */
export const HalfCount: React.FC<{ from: number; halfAt: number }> = ({ from, halfAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14);
  const n = Math.round(431 * interpolate(f, [from, from + 26], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) }));
  const COLS = 10, ROWS = 4, X0 = 150, Y0 = 1130, DX = 87, DY = 96;
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em", color: "#fff" }}>{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", ...lab, fontSize: 30, color: "rgba(255,255,255,0.85)" }}>STUDENTS ASKED</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: COLS * ROWS }, (_, i) => {
          const c = i % COLS, r = Math.floor(i / COLS);
          const show = p(f, from + 10 + i * 0.6, 8);
          const half = r < 2 ? p(f, halfAt + (c + r * COLS) * 1.2, 8) : 0;   // top two rows of four = half
          const x = X0 + c * DX, y = Y0 + r * DY;
          const col = half > 0.5 ? FLASH : "#fff";
          return (
            <g key={i} opacity={show * (half > 0 ? 1 : 0.75)} transform={`translate(${x} ${y}) scale(${1 + 0.18 * half})`} style={half > 0.5 ? { filter: "drop-shadow(0 0 10px rgba(243,194,29,0.8))" } : undefined}>
              <circle cx={0} cy={-22} r={13} fill={col} />
              <path d="M -20 30 C -20 2, 20 2, 20 30 Z" fill={col} />
            </g>
          );
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 30, color: "#fff", opacity: 1 - p(f, halfAt, 10) }}>NEVER THOUGHT OF ENDING THEIR LIFE</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 34, color: FLASH, opacity: p(f, halfAt, 10) }}>ABOUT HALF FELT THE URGE</div>
    </AbsoluteFill>
  );
};

/** Two tracks: the fast alarm has already stepped you back; the slow thinking arrives late, asks why, and guesses wrong. */
export const WrongGuess: React.FC<{ from: number; askAt: number; wrongAt: number; decideAt: number }> = ({ from, askAt, wrongAt, decideAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  const fast = p(f, from + 4, 8);                 // snaps across
  const slow = interpolate(f, [from + 8, askAt], [0, 1], clamp);   // crawls
  const ask = p(f, askAt, 12), wrong = p(f, wrongAt, 10), decide = p(f, decideAt, 14);
  const shake = f >= wrongAt && f < wrongAt + 10 ? Math.sin(f * 2.4) * 8 : 0;
  const X0 = 110, X1 = 970, Y1 = 960, Y2 = 1150;
  const track = (y: number, t: number, color: string, name: string, end: string, endO: number) => (
    <g>
      <text x={X0} y={y - 38} fill={color} fontSize={30} {...lab}>{name}</text>
      <line x1={X0} x2={X1} y1={y} y2={y} stroke="rgba(255,255,255,0.25)" strokeWidth={6} strokeLinecap="round" />
      <line x1={X0} x2={X0 + (X1 - X0) * t} y1={y} y2={y} stroke={color} strokeWidth={8} strokeLinecap="round" style={{ filter: `drop-shadow(0 0 10px ${color})` }} />
      <circle cx={X0 + (X1 - X0) * t} cy={y} r={16} fill={color} style={{ filter: `drop-shadow(0 0 12px ${color})` }} />
      <text x={X1} y={y - 38} textAnchor="end" fill={color} fontSize={30} {...lab} opacity={endO}>{end}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {track(Y1, fast, RED, "FAST · ALARM", "STEPPED BACK ✓", fast)}
        {track(Y2, slow, "#fff", "SLOW · THINKING", "ARRIVES LATE", slow > 0.98 ? 1 : 0)}
      </svg>
      {/* the question */}
      <div style={{ position: "absolute", left: 110, width: 860, top: 1250, opacity: ask, transform: `translate(${shake}px, ${(1 - ask) * 40}px)`, background: "rgba(255,255,255,0.12)",
        border: `3px solid ${wrong > 0.5 ? RED : "rgba(255,255,255,0.5)"}`, borderRadius: 28, padding: "34px 40px", boxSizing: "border-box", boxShadow: "0 30px 60px rgba(0,0,0,0.35)" }}>
        <div style={{ fontFamily: SERIF2, fontStyle: "italic", fontSize: 58, color: "#fff", lineHeight: 1.15 }}>“Why did I just step back?”</div>
        <div style={{ ...lab, fontSize: 28, color: RED, marginTop: 18, opacity: wrong }}>✕ WRONG GUESS</div>
      </div>
      {/* the wrong answer */}
      <div style={{ position: "absolute", left: 110, width: 860, top: 1520, opacity: decide, transform: `translateY(${(1 - decide) * 40}px) scale(${0.96 + 0.04 * decide})`, background: FLASH, color: "#111",
        borderRadius: 28, padding: "30px 40px", boxSizing: "border-box", boxShadow: "0 30px 70px rgba(0,0,0,0.4), 0 0 50px rgba(243,194,29,0.5)" }}>
        <div style={{ fontFamily: SERIF2, fontStyle: "italic", fontSize: 56, lineHeight: 1.15 }}>“I must have wanted to jump.”</div>
      </div>
    </AbsoluteFill>
  );
};
