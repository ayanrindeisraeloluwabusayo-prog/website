// Motion graphics for "Why are some people left-handed?", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** A simple open hand; flip = left hand. */
const Hand: React.FC<{ flip?: boolean; color: string; size?: number }> = ({ flip, color, size = 120 }) => (
  <svg viewBox="0 0 100 120" style={{ width: size, height: size * 1.2, transform: flip ? "scaleX(-1)" : undefined }}>
    <path d="M30 115 L28 70 L14 50 C10 44 18 38 24 44 L32 54 L32 18 C32 10 42 10 42 18 L42 48 L44 10 C44 2 54 2 54 10 L54 48 L58 16 C58 8 68 8 68 16 L66 50 L72 28 C74 20 84 22 82 30 L76 72 L72 115 Z" fill={color} />
  </svg>
);

/** Ten hands; one is a gold left hand. */
export const Ten: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 860, display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "40px 36px" }}>
        {Array.from({ length: 10 }, (_, i) => {
          const left = i === 6 && f >= at;
          return <div key={i} style={{ opacity: p(f, from + i * 2, 6) }}><Hand flip={i === 6} color={left ? FLASH : "rgba(255,255,255,0.75)"} size={130} /></div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(140, FLASH), opacity: p(f, at, 10) }}>9 in 10: right</div>
    </AbsoluteFill>
  );
};

/** 100 dots; about 10.6 lit; counter to 10.6%. */
export const Pct: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const n = interpolate(f, [at - 6, at + 24], [0, 10.6], clamp);
  const lit = [3, 14, 27, 31, 46, 52, 65, 73, 88, 94, 99];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 220, top: 800, width: 640, display: "flex", flexWrap: "wrap", gap: 18, opacity: p(f, from, 8) }}>
        {Array.from({ length: 100 }, (_, i) => {
          const on = lit.indexOf(i) >= 0 && lit.indexOf(i) < Math.round(n);
          return <div key={i} style={{ width: 46, height: 46, borderRadius: 23, background: on ? FLASH : "rgba(255,255,255,0.3)" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...serif(150, FLASH), opacity: p(f, at - 6, 8) }}>{n.toFixed(1)}%</div>
      {note("PAPADATOU-PASTOU ET AL. · PSYCHOLOGICAL BULLETIN · 2020 · 2.4 MILLION PEOPLE", 1640)}
    </AbsoluteFill>
  );
};

/** A ring: genes about a quarter, the rest other things. */
export const Quarter: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at - 12, at + 16], [0, 0.25], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const C = 2 * Math.PI * 220;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 600" style={{ position: "absolute", left: 240, top: 780, width: 600, height: 600, opacity: p(f, from, 8) }}>
        <circle cx="300" cy="300" r="220" fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="48" />
        <circle cx="300" cy="300" r="220" fill="none" stroke={FLASH} strokeWidth="48" strokeDasharray={`${C * k} ${C}`} transform="rotate(-90 300 300)" />
        <text x="300" y="315" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="30" letterSpacing="4">GENES</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(120, FLASH), opacity: p(f, at, 10) }}>about a quarter</div>
      {note("MEDLAND ET AL. · TWIN STUDIES · 2006 & 2009", 1580)}
    </AbsoluteFill>
  );
};

/** Many tiny gene bars, each nudging a dial a little. */
export const Dozens: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const n = Math.min(48, Math.max(0, Math.floor((f - at + 6) * 1.6)));
  const ang = -60 + n * 1.1;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 830, display: "flex", flexWrap: "wrap", gap: 10, justifyContent: "center", opacity: p(f, from, 8) }}>
        {Array.from({ length: 48 }, (_, i) => <div key={i} style={{ width: 26, height: 70, borderRadius: 6, background: i < n ? FLASH : "rgba(255,255,255,0.3)" }} />)}
      </div>
      <svg viewBox="0 0 400 220" style={{ position: "absolute", left: 340, top: 1120, width: 400, height: 220, opacity: p(f, from + 6, 8) }}>
        <path d="M40 200 A160 160 0 0 1 360 200" fill="none" stroke="#fff" strokeWidth="6" />
        <line x1="200" y1="200" x2="200" y2="70" stroke={FLASH} strokeWidth="8" strokeLinecap="round" transform={`rotate(${ang} 200 200)`} />
        <text x="40" y="218" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="18">RIGHT</text>
        <text x="315" y="218" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="18">LEFT</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, at, 10) }}>48 TINY GENETIC DIFFERENCES</div>
      {note("CUELLAR-PARTIDA ET AL. · NATURE HUMAN BEHAVIOUR · 2021", 1520)}
    </AbsoluteFill>
  );
};

/** Thumb-sucking in the womb vs handedness at 10-12. */
export const Thumbs: React.FC<{ from: number; rightAt: number; leftAt: number }> = ({ from, rightAt, leftAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, label: string, result: string, sub: string, at: number, gold: boolean, flip: boolean) => (
    <div style={{ position: "absolute", left: 120, right: 120, top, display: "flex", alignItems: "center", gap: 40, opacity: p(f, at, 8) }}>
      <Hand flip={flip} color={gold ? FLASH : "#fff"} size={150} />
      <div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.8)" }}>{label}</div>
        <div style={{ ...serif(96, gold ? FLASH : "#fff"), marginTop: 10 }}>{result}</div>
        <div style={{ ...lab, fontSize: 22, color: "#fff", marginTop: 8 }}>{sub}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {row(830, "SUCKED RIGHT THUMB IN THE WOMB", "60 of 60", "RIGHT-HANDED AT 10-12", rightAt, false, false)}
      {row(1170, "SUCKED LEFT THUMB IN THE WOMB", "10 of 15", "LEFT-HANDED AT 10-12", leftAt, true, true)}
      {note("HEPPER, WELLS & LYNCH · NEUROPSYCHOLOGIA · 2005 · QUEEN'S UNIVERSITY BELFAST", 1560)}
    </AbsoluteFill>
  );
};

/** Genes + chance, starting in the womb. */
export const Mix: React.FC<{ from: number; genesAt: number; chanceAt: number }> = ({ from, genesAt, chanceAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", ...serif(150), opacity: p(f, genesAt, 10) }}>genes</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1070, textAlign: "center", ...serif(110, "rgba(255,255,255,0.7)"), opacity: p(f, genesAt + 6, 10) }}>+</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", ...serif(150, FLASH), opacity: p(f, chanceAt, 10) }}>chance</div>
    </AbsoluteFill>
  );
};
