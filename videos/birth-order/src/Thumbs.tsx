// Thumbnail options for "Does being the oldest, middle or youngest child shape you?". Our type, blue and gold, no brand logos.
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




export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-family.jpg" pos="50% 45%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="OLDEST?" size={200} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="YOUNGEST?" size={165} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>does it <span style={{ color: FLASH }}>shape you?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>BIRTH ORDER</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-meal.jpg" pos="40% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="MIDDLE" size={210} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="CHILD MYTH" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>science <span style={{ color: FLASH }}>checked</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>20,000+ PEOPLE</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(100) }}>oldest, middle, <span style={{ color: FLASH }}>youngest</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="DOES IT MATTER?" size={112} face={FLASH} depth="#fff" /></div>
    <svg viewBox="0 0 500 420" style={{ position: "absolute", left: 90, top: 760, width: 760, height: 640 }}>
      {[[100, 1.5, "#F3C21D"], [250, 1.2, "#fff"], [400, 0.9, "#fff"]].map(([x, s, c], i) => (
        <g key={i} transform={`translate(${x} 330) scale(${s})`}><circle cy="-70" r="26" fill={c as string} /><path d="M-44 0 C-44 -50 44 -50 44 0 Z" fill={c as string} /></g>
      ))}
      <line x1="40" y1="345" x2="460" y2="345" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
      {["1ST", "2ND", "3RD"].map((t, i) => <text key={t} x={100 + i * 150} y="390" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="22" letterSpacing="3">{t}</text>)}
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1480, textAlign: "center", ...serif(96) }}>the <span style={{ color: FLASH }}>surprising</span> answer</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-twokids.jpg" pos="50% 40%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="FIRSTBORN" size={150} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="SMARTER?" size={180} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}><span style={{ color: FLASH }}>barely</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>WHAT SCIENCE FOUND</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

