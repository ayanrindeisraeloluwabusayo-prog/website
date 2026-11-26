// Motion graphics for "What happens to your brain when you go for a walk", in the mosquito look: thin serif for big words
// and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** A looping path with a gold dot walking round; a pile of flints loses one each lap. */
export const Flints: React.FC<{ from: number; knockAt: number }> = ({ from, knockAt }) => {
  const f = useCurrentFrame();
  const t = (f - from) / 70;
  const a = t * Math.PI * 2 - Math.PI / 2;
  const laps = Math.max(0, Math.floor((f - knockAt) / 18) + 1);
  const left = Math.max(1, 6 - laps);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 420" style={{ position: "absolute", left: 90, top: 820, width: 900, height: 630, opacity: p(f, from, 8) }}>
        <ellipse cx="300" cy="210" rx="240" ry="150" fill="none" stroke="rgba(255,255,255,0.7)" strokeWidth="10" strokeDasharray="2 18" strokeLinecap="round" />
        <circle cx={300 + Math.cos(a) * 240} cy={210 + Math.sin(a) * 150} r="16" fill={FLASH} />
        {Array.from({ length: 6 }, (_, i) => (
          <path key={i} d={`M${60 + (i % 3) * 22} ${54 - Math.floor(i / 3) * 18} l10 -12 l12 4 l2 12 l-14 6 Z`} fill={i < left ? "#fff" : "transparent"} stroke={i < left ? "#fff" : "rgba(255,255,255,0.25)"} strokeWidth="2" />
        ))}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, knockAt, 10) }}>ONE FLINT KNOCKED AWAY EACH LAP</div>
    </AbsoluteFill>
  );
};

/** Everyday objects with question marks; SITTING then WALKING labels. */
export const Uses: React.FC<{ from: number; sitAt: number; walkAt: number }> = ({ from, sitAt, walkAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 200" style={{ position: "absolute", left: 140, top: 860, width: 800, height: 266, opacity: p(f, from, 8) }}>
        <path d="M60 50 L140 50 L130 170 L70 170 Z" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <rect x="230" y="80" width="140" height="80" rx="6" fill="none" stroke="#fff" strokeWidth="6" />
        <path d="M470 60 C430 60 430 170 470 170 C510 170 510 80 480 80 C455 80 455 150 480 150" fill="none" stroke="#fff" strokeWidth="6" />
      </svg>
      <div style={{ position: "absolute", left: 140, top: 1180, ...lab, fontSize: 28, color: "#fff", opacity: p(f, sitAt, 8) }}>ONCE SITTING</div>
      <div style={{ position: "absolute", right: 140, top: 1180, ...lab, fontSize: 28, color: FLASH, opacity: p(f, walkAt, 8) }}>ONCE WALKING</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(110), opacity: p(f, from + 6, 10) }}>new uses?</div>
    </AbsoluteFill>
  );
};

/** Sitting vs walking bars: about +60% creative ideas when walking. */
export const Sixty: React.FC<{ from: number; at: number; label?: string }> = ({ from, at, label = "CREATIVE IDEAS" }) => {
  const f = useCurrentFrame();
  const bar = (left: number, h: number, name: string, gold: boolean, start: number) => {
    const g = interpolate(f, [start, start + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left, top: 880, width: 340, textAlign: "center" }}>
      <div style={{ position: "relative", height: 480 }}><div style={{ position: "absolute", left: 110, right: 110, bottom: 0, height: h * g, borderRadius: "12px 12px 0 0", background: gold ? FLASH : "#fff" }} /></div>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginTop: 16 }}>{name}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>{label}</div>
      {bar(150, 270, "SITTING", false, from + 4)}
      {bar(590, 432, "WALKING", true, at - 10)}
      <div style={{ position: "absolute", left: 590, width: 340, top: 800, textAlign: "center", ...serif(100, FLASH), opacity: p(f, at, 10) }}>+60%</div>
      {note("OPPEZZO & SCHWARTZ · STANFORD · 2014 · ONE EXPERIMENT", 1500)}
    </AbsoluteFill>
  );
};

/** Turning back the clock: "1-2 years" of age-related shrinkage reversed. */
export const Years: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const r = interpolate(f, [at, at + 40], [0, -720], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 300 300" style={{ position: "absolute", left: 390, top: 820, width: 300, height: 300, opacity: p(f, from, 8) }}>
        <circle cx="150" cy="150" r="130" fill="none" stroke="#fff" strokeWidth="6" />
        <line x1="150" y1="150" x2="150" y2="45" stroke={FLASH} strokeWidth="7" strokeLinecap="round" transform={`rotate(${r} 150 150)`} />
        <path d="M40 110 A120 120 0 0 1 120 30" fill="none" stroke={FLASH} strokeWidth="6" markerEnd="" opacity={p(f, at, 8)} />
        <circle cx="150" cy="150" r="9" fill={FLASH} />
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", ...serif(130, FLASH), opacity: p(f, at, 10) }}>1-2 years back</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, at + 10, 10) }}>OF AGE-RELATED SHRINKING, REVERSED</div>
      {note("ERICKSON ET AL. · PNAS · 2011 · 120 OLDER ADULTS · +2% HIPPOCAMPUS", 1500)}
    </AbsoluteFill>
  );
};

/** A treadmill facing a blank wall. */
export const Treadmill: React.FC<{ from: number; wallAt: number }> = ({ from, wallAt }) => {
  const f = useCurrentFrame();
  const belt = (f * 6) % 40;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 800, width: 120, height: 640, borderRadius: 10, background: "rgba(255,255,255,0.15)", border: "4px solid rgba(255,255,255,0.6)", opacity: p(f, wallAt - 8, 10) }} />
      <div style={{ position: "absolute", left: 140, top: 1460, ...lab, fontSize: 22, color: "#fff", opacity: p(f, wallAt, 10) }}>BLANK WALL</div>
      <svg viewBox="0 0 600 400" style={{ position: "absolute", left: 300, top: 900, width: 660, height: 440, opacity: p(f, from, 8) }}>
        <path d="M40 300 L520 300 L560 340 L60 340 Z" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        {Array.from({ length: 12 }, (_, i) => <line key={i} x1={60 + i * 40 + belt} y1="305" x2={70 + i * 40 + belt} y2="335" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />)}
        <path d="M80 300 L60 120 L110 110" fill="none" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <g transform="translate(300 120)"><circle cy="-60" r="22" fill={FLASH} /><path d={`M0 -36 L0 60 M0 60 L${-25 + 15 * Math.sin(f * 0.3)} 170 M0 60 L${25 - 15 * Math.sin(f * 0.3)} 170 M0 0 L${-30 * Math.sin(f * 0.3)} 60 M0 0 L${30 * Math.sin(f * 0.3)} 60`} stroke={FLASH} strokeWidth="12" strokeLinecap="round" fill="none" /></g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1520, textAlign: "center", ...serif(110), opacity: p(f, wallAt + 10, 10) }}>no view needed</div>
    </AbsoluteFill>
  );
};

/** Two heads: after a nature walk the worry area dims; after a city walk it stays lit. */
export const Nature: React.FC<{ from: number; natureAt: number; cityAt: number }> = ({ from, natureAt, cityAt }) => {
  const f = useCurrentFrame();
  const head = (left: number, label: string, dim: number, gold: boolean, at: number) => (
    <div style={{ position: "absolute", left, top: 860, width: 400, textAlign: "center", opacity: p(f, at - 6, 8) }}>
      <svg viewBox="0 0 400 400" style={{ width: 340, height: 340 }}>
        <path d="M110 390 L110 320 C60 295 40 240 45 185 C52 95 125 35 210 35 C300 35 355 100 350 170 L378 222 L350 232 L355 268 C355 292 326 298 296 296 L290 340 L290 390" fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth="6" strokeLinejoin="round" />
        <circle cx="270" cy="150" r="46" fill="#ff5a5a" opacity={0.85 - 0.7 * dim} />
      </svg>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginTop: 14 }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {head(90, "90 MIN IN NATURE", p(f, natureAt + 6, 20), true, natureAt)}
      {head(590, "90 MIN IN THE CITY", 0, false, cityAt)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, natureAt + 10, 10) }}>AREA LINKED TO REPETITIVE DARK THOUGHTS</div>
      {note("BRATMAN ET AL. · PNAS · 2015 · STANFORD · SMALL STUDY", 1500)}
    </AbsoluteFill>
  );
};
