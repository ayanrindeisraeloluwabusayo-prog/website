// Motion graphics for the déjà vu video: white on blue, gold for the key fact. The Matrix only as quoted text.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BLUE_DEEP, FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const big = (size: number, face = "#fff", depth = FLASH): React.CSSProperties => ({ fontFamily: SANS2, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.04em", color: face,
  textShadow: `${Array.from({ length: 12 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < 6 ? depth : BLUE_DEEP}`).join(", ")}, 0 0 70px rgba(243,194,29,0.6)` });
const note = (text: string, top = 1640) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>
);

/** A video player stuck on replay: the progress bar runs, snaps back, runs again. */
export const Replay: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const loop = ((f - from) % 40) / 40;
  const spin = (f - from) * 9;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 820, height: 560, borderRadius: 30, background: "rgba(5,10,45,0.9)", border: "5px solid rgba(255,255,255,0.5)", opacity: p(f, from, 8),
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width="220" height="220" viewBox="0 0 100 100" style={{ transform: `rotate(${-spin}deg)` }}>
          <path d="M80 50 A30 30 0 1 1 65 24" stroke={FLASH} strokeWidth="9" fill="none" strokeLinecap="round" />
          <path d="M58 12 L72 26 L54 32 Z" fill={FLASH} />
        </svg>
        <div style={{ position: "absolute", left: 50, right: 50, bottom: 50, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.25)" }}>
          <div style={{ width: `${loop * 100}%`, height: "100%", borderRadius: 7, background: FLASH }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1430, textAlign: "center", ...big(110, "#fff") }}>REPLAY</div>
    </AbsoluteFill>
  );
};

/** The same black cat crosses the frame twice; "×2" stamps on the second pass. */
export const Cat: React.FC<{ from: number; twiceAt: number }> = ({ from, twiceAt }) => {
  const f = useCurrentFrame();
  const pass = (start: number, dur = 26) => interpolate(f, [start, start + dur], [-700, 1080], clamp);
  const card = (x: number, op: number) => (
    <div style={{ position: "absolute", left: x, top: 880, width: 640, height: 430, borderRadius: 26, overflow: "hidden", border: "6px solid #fff", opacity: op, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
      <Img src={staticFile("media/d-2690236.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "40% 60%" }} />
    </div>
  );
  return (
    <AbsoluteFill>
      {card(pass(from + 2, Math.max(26, twiceAt - 22 - from)), 1)}
      {card(pass(twiceAt - 20), 0.9)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...big(200, FLASH, "#fff"), opacity: p(f, twiceAt, 8), transform: `scale(${1.6 - 0.6 * p(f, twiceAt, 8)})` }}>×2</div>
    </AbsoluteFill>
  );
};

/** The film line as a glitching quote card. */
export const Trinity: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from + 2, 12);
  const jitter = (f - from) % 17 < 2 ? 14 : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 860, padding: "60px 56px", borderRadius: 34, background: "rgba(5,10,45,0.9)", border: "4px solid rgba(255,255,255,0.35)",
        opacity: k, transform: `translateX(${jitter}px)`, boxShadow: jitter ? "-14px 0 0 rgba(255,60,120,0.5), 14px 0 0 rgba(60,220,255,0.5)" : "0 40px 90px rgba(0,0,0,0.5)" }}>
        <div style={{ position: "absolute", left: 40, top: -70, fontFamily: SERIF2, fontSize: 240, color: FLASH, lineHeight: 1 }}>“</div>
        <div style={{ fontFamily: SERIF2, fontSize: 96, color: "#fff", lineHeight: 1 }}>A déjà vu is usually a <span style={{ color: FLASH }}>glitch</span> in the Matrix.</div>
        <div style={{ ...lab, fontSize: 26, color: "#fff", marginTop: 36 }}>TRINITY · THE MATRIX · 1999</div>
      </div>
    </AbsoluteFill>
  );
};

/** "MEMORY" in big type, sliced and shifted like a glitch. */
export const MemGlitch: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const slices = [0, 1, 2, 3, 4];
  return (
    <AbsoluteFill>
      {slices.map((i) => {
        const off = Math.sin((f - from) * 1.7 + i * 2.1) * 40 * (((f - from) % 12) < 5 ? 1 : 0.15);
        return <div key={i} style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", ...big(190, i === 2 ? FLASH : "#fff"), clipPath: `inset(${i * 20}% 0 ${80 - i * 20}% 0)`, transform: `translateX(${off}px)`, opacity: p(f, from, 6) }}>MEMORY</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1260, textAlign: "center", ...lab, fontSize: 40, color: FLASH, opacity: p(f, from + 6, 8) }}>GLITCH</div>
    </AbsoluteFill>
  );
};

/** Two out of three people light up: "2 in 3". */
export const TwoThirds: React.FC<{ from: number; litAt: number }> = ({ from, litAt }) => {
  const f = useCurrentFrame();
  const person = (x: number, lit: boolean) => {
    const c = lit && f >= litAt ? FLASH : "rgba(255,255,255,0.35)";
    return <div key={x} style={{ position: "absolute", left: x, top: 880, width: 220, opacity: p(f, from, 8) }}>
      <div style={{ width: 120, height: 120, borderRadius: 60, background: c, margin: "0 auto", boxShadow: lit && f >= litAt ? "0 0 40px rgba(243,194,29,0.8)" : "none" }} />
      <div style={{ width: 200, height: 260, borderRadius: "100px 100px 20px 20px", background: c, margin: "14px auto 0" }} />
    </div>;
  };
  return (
    <AbsoluteFill>
      {person(110, true)}{person(430, true)}{person(750, false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...big(190, FLASH, "#fff"), opacity: p(f, litAt, 8) }}>2 in 3</div>
      {note("ALAN S. BROWN · THE DÉJÀ VU ILLUSION", 1560)}
    </AbsoluteFill>
  );
};

/** Two rooms seen from above: different colours, same layout. The first fades (forgotten). */
export const Rooms: React.FC<{ from: number; sameAt: number; forgetAt: number }> = ({ from, sameAt, forgetAt }) => {
  const f = useCurrentFrame();
  const plan = (left: number, color: string, fill: string, op: number, label: string) => (
    <div style={{ position: "absolute", left, top: 860, width: 380, opacity: op }}>
      <svg viewBox="0 0 100 100" style={{ width: 380, height: 380 }}>
        <rect x="4" y="4" width="92" height="92" fill={fill} stroke={color} strokeWidth="3" />
        <path d="M4 50 H40 M60 50 H96 M50 4 V30 M50 70 V96" stroke={color} strokeWidth="3" />
        <rect x="14" y="14" width="18" height="10" fill={color} /><circle cx="78" cy="78" r="7" fill={color} /><rect x="66" y="12" width="20" height="20" fill="none" stroke={color} strokeWidth="2.5" />
      </svg>
      <div style={{ ...lab, fontSize: 28, color, textAlign: "center", marginTop: 16 }}>{label}</div>
    </div>
  );
  const fade = 1 - 0.75 * p(f, forgetAt, 14);
  return (
    <AbsoluteFill>
      {plan(100, "#fff", "rgba(255,255,255,0.08)", p(f, from, 8) * fade, "EARLIER ROOM")}
      {plan(600, FLASH, "rgba(243,194,29,0.12)", p(f, from + 8, 8), "NEW ROOM")}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...big(120, FLASH, "#fff"), opacity: p(f, sameAt, 8) }}>SAME LAYOUT</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1470, textAlign: "center", fontFamily: SERIF2, fontSize: 80, color: "#fff", opacity: p(f, forgetAt, 10) }}>but you don't remember it</div>
      {note("CLEARY & CLAXTON · PSYCHOLOGICAL SCIENCE · 2018 · ILLUSTRATION", 1600)}
    </AbsoluteFill>
  );
};

/** A fork: LEFT or RIGHT? A "feels like I know" meter fills up. */
export const Turn: React.FC<{ from: number; turnAt: number }> = ({ from, turnAt }) => {
  const f = useCurrentFrame();
  const m = interpolate(f, [from + 6, turnAt + 10], [0.1, 0.92], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 200 140" style={{ position: "absolute", left: 190, top: 800, width: 700, height: 490, opacity: p(f, from, 8) }}>
        <path d="M100 136 V80 L40 24 M100 80 L160 24" stroke="#fff" strokeWidth="10" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M28 12 L52 14 L40 34 Z" fill="#fff" /><path d="M172 12 L148 14 L160 34 Z" fill="#fff" />
      </svg>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1340, ...lab, fontSize: 30, color: "#fff" }}>FEELING OF "I KNOW WHAT'S NEXT"</div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1400, height: 60, borderRadius: 30, background: "rgba(255,255,255,0.2)" }}>
        <div style={{ width: `${m * 100}%`, height: "100%", borderRadius: 30, background: FLASH, boxShadow: "0 0 30px rgba(243,194,29,0.8)" }} />
      </div>
    </AbsoluteFill>
  );
};

/** Their real accuracy: a 50/50 coin, "NO BETTER THAN A GUESS". */
export const Guess: React.FC<{ from: number; guessAt: number }> = ({ from, guessAt }) => {
  const f = useCurrentFrame();
  const flip = Math.cos((f - from) * 0.45);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 340, top: 820, width: 400, height: 400, borderRadius: 200, background: FLASH, border: "14px solid #fff", transform: `scaleX(${f < guessAt ? flip : 1})`,
        display: "flex", alignItems: "center", justifyContent: "center", ...big(120, "#111", "#fff"), textShadow: "none", opacity: p(f, from, 8) }}>50/50</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...big(110, "#fff"), opacity: p(f, guessAt, 8) }}>NO BETTER</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...big(110, FLASH, "#fff"), opacity: p(f, guessAt + 5, 8) }}>THAN A GUESS</div>
    </AbsoluteFill>
  );
};

/** Brain scan result: MEMORY areas stay dim, ERROR-CHECK areas light up. */
export const BrainMap: React.FC<{ memAt: number; checkAt: number }> = ({ memAt, checkAt }) => {
  const f = useCurrentFrame();
  const glow = p(f, checkAt, 10);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 200 160" style={{ position: "absolute", left: 140, top: 780, width: 800, height: 640 }}>
        <path d="M40 120 C10 110 8 60 30 40 C45 10 95 2 125 12 C165 20 192 55 185 90 C180 120 150 132 120 128 L110 150 L90 150 L88 128 C70 130 55 126 40 120 Z" fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth="3" />
        <ellipse cx="110" cy="95" rx="22" ry="12" fill="rgba(255,255,255,0.25)" opacity={p(f, memAt, 8)} />
        <ellipse cx="55" cy="55" rx="28" ry="20" fill={FLASH} opacity={0.9 * glow} />
        <ellipse cx="55" cy="55" rx="40" ry="30" fill={FLASH} opacity={0.25 * glow} />
      </svg>
      <div style={{ position: "absolute", left: 560, top: 1180, ...lab, fontSize: 30, color: "rgba(255,255,255,0.8)", opacity: p(f, memAt, 8) }}>MEMORY: QUIET</div>
      <div style={{ position: "absolute", left: 130, top: 790, ...lab, fontSize: 30, color: FLASH, opacity: glow }}>ERROR-CHECKING: BUSY</div>
      {note("URQUHART, O'CONNOR ET AL. · UNIVERSITY OF ST ANDREWS · ILLUSTRATION", 1500)}
    </AbsoluteFill>
  );
};
