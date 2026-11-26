// Motion graphics for "Sleep paralysis: awake but unable to move", in the mosquito look: thin serif for big words and
// numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** Brain and body joined by a line; while dreaming the switch flips to OFF and the body dims. */
export const Switch: React.FC<{ from: number; offAt: number }> = ({ from, offAt }) => {
  const f = useCurrentFrame();
  const k = p(f, offAt, 10);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 640" style={{ position: "absolute", left: 240, top: 780, width: 600, height: 640, opacity: p(f, from, 8) }}>
        <path d="M200 40 C130 40 110 120 150 150 C120 200 200 230 240 200 C280 240 360 220 360 170 C410 150 400 60 330 60 C300 20 230 20 200 40 Z" fill="rgba(255,255,255,0.08)" stroke={FLASH} strokeWidth="5" />
        <line x1="255" y1="215" x2="255" y2="330" stroke="#fff" strokeWidth="5" strokeDasharray="10 8" />
        <rect x="205" y="330" width="100" height="56" rx="28" fill={k > 0.5 ? "rgba(255,255,255,0.25)" : FLASH} />
        <circle cx={233 + 44 * (1 - k)} cy="358" r="22" fill="#fff" />
        <line x1="255" y1="386" x2="255" y2="440" stroke="#fff" strokeWidth="5" strokeDasharray="10 8" opacity={1 - 0.7 * k} />
        <g opacity={1 - 0.65 * k}>
          <circle cx="255" cy="470" r="26" fill="#fff" />
          <path d="M215 610 L225 510 L285 510 L295 610 M225 520 L185 590 M285 520 L325 590" stroke="#fff" strokeWidth="14" strokeLinecap="round" fill="none" />
        </g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, textAlign: "center", ...serif(110, FLASH), opacity: k }}>muscles off</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1590, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, from + 4, 8) }}>WHILE YOU DREAM</div>
    </AbsoluteFill>
  );
};

/** Three things that spill in from the dream: a shadow, a figure, a weight on the chest. */
export const Spill: React.FC<{ at: number[] }> = ({ at }) => {
  const f = useCurrentFrame();
  const items = ["A SHADOW", "A FIGURE", "A WEIGHT ON YOUR CHEST"];
  return (
    <AbsoluteFill>
      {items.map((t, i) => {
        const k = p(f, at[i], 10);
        return <div key={t} style={{ position: "absolute", left: 140, right: 140, top: 860 + i * 230, display: "flex", alignItems: "center", gap: 40, opacity: k, transform: `translateX(${(1 - k) * -40}px)` }}>
          <svg viewBox="0 0 100 100" style={{ width: 150, height: 150 }}>
            {i === 0 ? <ellipse cx="50" cy="55" rx="34" ry="42" fill="rgba(0,0,30,0.7)" stroke="rgba(255,255,255,0.4)" strokeWidth="3" /> : null}
            {i === 1 ? <g fill="none" stroke="#fff" strokeWidth="4"><circle cx="50" cy="26" r="14" /><path d="M24 96 C24 52 76 52 76 96" /></g> : null}
            {i === 2 ? <g><rect x="18" y="20" width="64" height="44" rx="8" fill={FLASH} /><path d="M10 84 L90 84" stroke="#fff" strokeWidth="5" /><path d="M50 64 L50 80" stroke={FLASH} strokeWidth="5" /></g> : null}
          </svg>
          <div style={{ ...lab, fontSize: 30, color: i === 2 ? FLASH : "#fff" }}>{t}</div>
        </div>;
      })}
    </AbsoluteFill>
  );
};

/** 35 studies stacking up, then a counter to 36,000+ people. */
export const Meta: React.FC<{ from: number; studiesAt: number; peopleAt: number }> = ({ from, studiesAt, peopleAt }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [peopleAt - 4, peopleAt + 30], [0, 36000], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, right: 150, top: 820, display: "flex", flexWrap: "wrap", gap: 14, justifyContent: "center" }}>
        {Array.from({ length: 35 }, (_, i) => <div key={i} style={{ width: 92, height: 66, borderRadius: 8, border: "3px solid #fff", background: "rgba(255,255,255,0.08)", opacity: p(f, studiesAt - 10 + i * 0.8, 4) }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, studiesAt, 8) }}>35 STUDIES</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...serif(170, FLASH), opacity: p(f, peopleAt - 4, 8) }}>{n.toLocaleString("en-US")}+</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1510, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, peopleAt + 10, 8) }}>PEOPLE</div>
      {note("SHARPLESS & BARBER · SLEEP MEDICINE REVIEWS · 2011", 1600)}
      <div style={{ opacity: p(f, from, 1) }} />
    </AbsoluteFill>
  );
};

/** Rates: about 8 in 100 people overall; more than 1 in 4 students. */
export const Rates: React.FC<{ from: number; allAt: number; studentsAt: number }> = ({ from, allAt, studentsAt }) => {
  const f = useCurrentFrame();
  const lit = [4, 17, 29, 38, 52, 66, 77, 91];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 220, top: 800, width: 640, display: "flex", flexWrap: "wrap", gap: 18, opacity: p(f, from, 8) }}>
        {Array.from({ length: 100 }, (_, i) => {
          const on = lit.indexOf(i) >= 0 && f >= allAt + lit.indexOf(i) * 2;
          return <div key={i} style={{ width: 46, height: 46, borderRadius: 23, background: on ? FLASH : "rgba(255,255,255,0.3)" }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...serif(110, FLASH), opacity: p(f, allAt, 10) }}>about 8 in 100</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, studentsAt, 10) }}>STUDENTS: MORE THAN 1 IN 4</div>
    </AbsoluteFill>
  );
};

/** Egypt vs Denmark: what people blame, then how common it was and how scary. */
export const Countries: React.FC<{ from: number; egyptAt: number; denmarkAt: number; resultAt?: number; fearAt?: number }> = ({ from, egyptAt, denmarkAt, resultAt, fearAt }) => {
  const f = useCurrentFrame();
  const col = (left: number, name: string, blame: string, pct: number, at: number, gold: boolean) => {
    const g = resultAt === undefined ? 0 : interpolate(f, [resultAt, resultAt + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left, top: 820, width: 400, textAlign: "center", opacity: p(f, at, 8) }}>
      <div style={{ ...serif(100, gold ? FLASH : "#fff") }}>{name}</div>
      <div style={{ ...lab, fontSize: 24, color: "#fff", marginTop: 20 }}>{blame}</div>
      <div style={{ position: "relative", height: 380, marginTop: 30 }}><div style={{ position: "absolute", left: 130, right: 130, bottom: 0, height: 760 * (pct / 100) * g, borderRadius: "12px 12px 0 0", background: gold ? FLASH : "#fff" }} /></div>
      <div style={{ ...serif(80, gold ? FLASH : "#fff"), marginTop: 14, opacity: g }}>{pct}%</div>
    </div>;
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {col(90, "Egypt", "OFTEN BLAMED ON A JINN", 44, egyptAt, true)}
      {col(590, "Denmark", "MOSTLY SEEN AS A BRAIN GLITCH", 25, denmarkAt, false)}
      {resultAt !== undefined ? <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, resultAt, 8) }}>HAD SLEEP PARALYSIS</div> : null}
      {fearAt !== undefined ? <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center", ...serif(90, FLASH), opacity: p(f, fearAt, 10) }}>more fear, frozen longer</div> : null}
      {note("JALAL & HINTON · 2013 & 2014 · A LINK, NOT PROOF", 1650)}
    </AbsoluteFill>
  );
};
