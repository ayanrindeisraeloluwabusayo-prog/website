// Motion graphics for "Your phone drains your brain even when it's switched off", in the mosquito look: thin serif for
// big words and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
const grow = (f: number, at: number, len = 20) => interpolate(f, [at, at + len], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });

/** A plain phone outline (no brand), face down = dark slab. */
const Phone: React.FC<{ color: string; size?: number; down?: boolean }> = ({ color, size = 90, down }) => (
  <svg viewBox="0 0 50 90" style={{ width: size, height: size * 1.8 }}>
    <rect x="3" y="3" width="44" height="84" rx="8" fill={down ? color : "none"} stroke={color} strokeWidth="4" />
    {down ? null : <rect x="18" y="9" width="14" height="3" rx="1.5" fill={color} />}
  </svg>
);

/** The quote, as words on a card (we never show the person). */
export const Quote: React.FC<{ from: number; secondAt: number }> = ({ from, secondAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 840, opacity: p(f, from, 8) }}>
        <div style={{ ...serif(240, FLASH), height: 120 }}>“</div>
        <div style={{ ...serif(110), marginTop: 10 }}>They haven't used it.</div>
        <div style={{ ...serif(64, "rgba(255,255,255,0.85)"), marginTop: 40, lineHeight: 1.15, opacity: p(f, secondAt, 10) }}>We limit how much technology our kids use at home.</div>
      </div>
      {note("STEVE JOBS · TO NICK BILTON · NEW YORK TIMES, 2014", 1560)}
    </AbsoluteFill>
  );
};

/** Three groups: phone on the desk, in a pocket or bag, in another room. Then bars: another room does best. */
export const Rooms: React.FC<{ from: number; at: [number, number, number]; bestAt: number }> = ({ from, at, bestAt }) => {
  const f = useCurrentFrame();
  const col = (i: number, label: string, icon: React.ReactNode) => {
    const h = [0.55, 0.72, 1][i] * 300 * grow(f, bestAt + i * 4);
    const gold = i === 2;
    return (
      <div key={i} style={{ position: "absolute", left: 110 + i * 300, top: 820, width: 260, textAlign: "center", opacity: p(f, at[i], 8) }}>
        <div style={{ height: 200, display: "flex", alignItems: "center", justifyContent: "center" }}>{icon}</div>
        <div style={{ ...lab, fontSize: 25, color: gold ? FLASH : "#fff", marginTop: 14, height: 56 }}>{label}</div>
        <div style={{ height: 320, display: "flex", alignItems: "flex-end", justifyContent: "center", borderBottom: "4px solid rgba(255,255,255,0.5)" }}>
          <div style={{ width: 120, height: h, borderRadius: "12px 12px 0 0", background: gold ? FLASH : "rgba(255,255,255,0.55)" }} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {col(0, "ON THE DESK", <Phone color="#fff" size={105} down />)}
      {col(1, "POCKET OR BAG", <svg viewBox="0 0 100 100" style={{ width: 190, height: 190 }}><path d="M18 30 L82 30 L76 88 L24 88 Z M36 30 C36 12 64 12 64 30" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" /></svg>)}
      {col(2, "ANOTHER ROOM", <svg viewBox="0 0 100 100" style={{ width: 190, height: 190 }}><rect x="26" y="10" width="48" height="82" rx="3" fill="none" stroke={FLASH} strokeWidth="5" /><circle cx="64" cy="54" r="4" fill={FLASH} /></svg>)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.8)", opacity: p(f, bestAt, 8) }}>MEMORY & PROBLEM-SOLVING SCORES · ILLUSTRATION</div>
      {note("WARD, DUKE, GNEEZY & BOS · 2017 · UNIVERSITY OF TEXAS · ~800 PEOPLE", 1520)}
    </AbsoluteFill>
  );
};

/** On or off: same result. */
export const OnOff: React.FC<{ from: number; eqAt: number }> = ({ from, eqAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, display: "flex", justifyContent: "center", alignItems: "center", gap: 70, opacity: p(f, from, 8) }}>
        <div style={{ textAlign: "center" }}><Phone color="#fff" size={150} /><div style={{ ...lab, fontSize: 26, color: "#fff", marginTop: 20 }}>ON</div></div>
        <div style={{ ...serif(200, FLASH), opacity: p(f, eqAt, 10), transform: `scale(${0.6 + 0.4 * p(f, eqAt, 12)})` }}>=</div>
        <div style={{ textAlign: "center" }}><Phone color="#fff" size={150} down /><div style={{ ...lab, fontSize: 26, color: "#fff", marginTop: 20 }}>OFF</div></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(110, FLASH), opacity: p(f, eqAt + 6, 10) }}>no difference</div>
    </AbsoluteFill>
  );
};

/** The more people depend on their phone, the bigger the hit. */
export const Depend: React.FC<{ from: number; hitAt: number }> = ({ from, hitAt }) => {
  const f = useCurrentFrame();
  const k = grow(f, hitAt - 10, 26);
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <svg viewBox="0 0 800 520" style={{ position: "absolute", left: 140, top: 820, width: 800, height: 520 }}>
        <line x1="60" y1="460" x2="780" y2="460" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
        <line x1="60" y1="460" x2="60" y2="30" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
        <path d="M60 430 C300 410 520 300 760 60" fill="none" stroke={FLASH} strokeWidth="10" strokeLinecap="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - k} />
        <text x="420" y="505" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="22" letterSpacing="3">HOW MUCH THEY DEPEND ON THEIR PHONE →</text>
        <text x="30" y="250" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="22" letterSpacing="3" transform="rotate(-90 30 250)">BRAIN DRAIN →</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(110, FLASH), opacity: p(f, hitAt + 8, 10) }}>hit the hardest</div>
      {note("WARD ET AL. · 2017 · ILLUSTRATION", 1560)}
    </AbsoluteFill>
  );
};

/** A scale that tips both ways: the evidence is mixed. */
export const Mixed: React.FC<{ from: number; noAt: number; yesAt: number }> = ({ from, noAt, yesAt }) => {
  const f = useCurrentFrame();
  const tilt = interpolate(f, [noAt, noAt + 14, yesAt, yesAt + 14, yesAt + 40], [0, -10, -10, 6, 0], clamp);
  const pan = (x: number, label: string, sub: string, at: number, gold: boolean) => (
    <g opacity={p(f, at, 8)}>
      <line x1={x} y1="110" x2={x - 70} y2="220" stroke="#fff" strokeWidth="3" /><line x1={x} y1="110" x2={x + 70} y2="220" stroke="#fff" strokeWidth="3" />
      <path d={`M${x - 90} 220 Q${x} 270 ${x + 90} 220 Z`} fill={gold ? "rgba(243,194,29,0.25)" : "rgba(255,255,255,0.15)"} stroke={gold ? FLASH : "#fff"} strokeWidth="4" />
      <text x={x} y="320" textAnchor="middle" fill={gold ? FLASH : "#fff"} fontFamily={SERIF2} fontSize="52">{label}</text>
      <text x={x} y="360" textAnchor="middle" fill="rgba(255,255,255,0.8)" fontFamily={SANS2} fontWeight={800} fontSize="18" letterSpacing="3">{sub}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <svg viewBox="0 0 800 520" style={{ position: "absolute", left: 140, top: 840, width: 800, height: 520 }}>
        <line x1="400" y1="110" x2="400" y2="470" stroke="#fff" strokeWidth="6" /><path d="M330 480 L470 480" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
        <g transform={`rotate(${tilt} 400 110)`}>
          <line x1="180" y1="110" x2="620" y2="110" stroke="#fff" strokeWidth="6" strokeLinecap="round" />
          {pan(180, "no clear drain", "REPEAT STUDY · 2022", noAt, false)}
          {pan(620, "found it again", "OTHER STUDIES", yesAt, true)}
        </g>
      </svg>
      {note("RUIZ PARDO & MINDA · ACTA PSYCHOLOGICA · 2022 · BÖTTGER ET AL. · 2023", 1500)}
    </AbsoluteFill>
  );
};
