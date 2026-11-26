// Thumbnail options for "Why you can feel lonely around people". Our type, blue and gold, no brand logos.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BLUE, BLUE_DEEP, FLASH, Grain } from "./kit";
import { SANS2, SERIF2 } from "./type";

const serif = (size: number): React.CSSProperties => ({ fontFamily: SERIF2, fontWeight: 500, fontSize: size, letterSpacing: "-0.045em", lineHeight: 0.84, color: "#fff" });
const lab: React.CSSProperties = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em", color: "#fff" };
const Photo: React.FC<{ src: string; pos?: string; filter?: string; scale?: number }> = ({ src, pos = "50% 50%", filter = "", scale = 1 }) => (
  <Img src={staticFile(`media/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter, transform: `scale(${scale})` }} />
);
/** Big extruded "GTA 6" in our own type: white face, gold-to-blue depth, glow. */
const Big: React.FC<{ text?: string; size: number; face?: string; depth?: string; glow?: string }> = ({ text = "GTA 6", size, face = "#fff", depth = FLASH, glow = "rgba(243,194,29,0.8)" }) => {
  const steps = Array.from({ length: 14 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < 7 ? depth : BLUE_DEEP}`).join(", ");
  return <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.04em", color: face, textShadow: `${steps}, 0 0 80px ${glow}, 0 30px 60px rgba(0,0,0,0.6)` }}>{text}</div>;
};
export const Banner: React.FC<{ children: React.ReactNode; rot?: number; bg?: string }> = ({ children, rot = -3, bg = BLUE }) => (
  <div style={{ display: "inline-block", background: bg, padding: "18px 34px 26px", transform: `rotate(${rot}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>{children}</div>
);




/** A: a smiling face with a gold halo drawn over her head, "PRETTY = SMART?" */

export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-2666433.jpg" pos="50% 50%" scale={1.1} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="SURROUNDED" size={140} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center" }}><Big text="& STILL ALONE" size={130} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>here's <span style={{ color: FLASH }}>why</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>LONELY IN A CROWD</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-9456749.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="TOGETHER" size={170} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center" }}><Big text="BUT LONELY" size={155} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>it's not about <span style={{ color: FLASH }}>how many</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE PSYCHOLOGY OF LONELINESS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(100) }}>why you feel <span style={{ color: FLASH }}>lonely</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="AROUND PEOPLE" size={118} face={FLASH} depth="#fff" /></div>
    <svg viewBox="0 0 500 420" style={{ position: "absolute", left: 60, top: 760, width: 780, height: 655 }}>
      {Array.from({ length: 22 }, (_, i) => { const x = 40 + (i % 6) * 84 + (Math.floor(i / 6) % 2) * 40; const y = 40 + Math.floor(i / 6) * 95; return (i === 9 ? null :
        <g key={i} transform={`translate(${x} ${y})`} opacity={0.35}><circle cy="-18" r="14" fill="#fff" /><path d="M-24 34 C-24 0 24 0 24 34 Z" fill="#fff" /></g>); })}
      <g transform="translate(250 230) scale(1.6)"><circle cy="-18" r="14" fill={FLASH} /><path d="M-24 34 C-24 0 24 0 24 34 Z" fill={FLASH} /></g>
      <circle cx="250" cy="236" r="78" fill="none" stroke={FLASH} strokeWidth="3" strokeDasharray="6 8" />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1480, textAlign: "center", ...serif(100) }}>it's not <span style={{ color: FLASH }}>how many</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-1822702.jpg" pos="50% 55%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="LONELY" size={240} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center" }}><Big text="AT A PARTY?" size={145} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>your brain is <span style={{ color: FLASH }}>on guard</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>WHY IT HAPPENS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

