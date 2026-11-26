// Thumbnail options for "Sleep paralysis: awake but unable to move". Our type, blue and gold, no brand logos.
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
    <Photo src="t-eyes.jpg" pos="50% 35%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="AWAKE" size={220} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="CAN'T MOVE" size={160} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>what's <span style={{ color: FLASH }}>happening?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>SLEEP PARALYSIS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-shadow.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="WHO'S IN" size={190} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="THE ROOM?" size={180} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>it's your <span style={{ color: FLASH }}>brain</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>SLEEP PARALYSIS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(100) }}>awake but <span style={{ color: FLASH }}>frozen</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="SLEEP PARALYSIS" size={112} face={FLASH} depth="#fff" /></div>
    <svg viewBox="0 0 500 360" style={{ position: "absolute", left: 90, top: 820, width: 800, height: 576 }}>
      <rect x="30" y="230" width="440" height="40" rx="10" fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth="5" />
      <rect x="30" y="190" width="40" height="90" rx="8" fill="none" stroke="#fff" strokeWidth="5" />
      <circle cx="120" cy="205" r="30" fill="none" stroke="#F3C21D" strokeWidth="6" />
      <circle cx="120" cy="205" r="52" fill="#F3C21D" opacity="0.18" />
      <path d="M150 215 L420 215 L420 235 L150 235 Z" fill="rgba(120,140,255,0.5)" />
      {[200, 280, 360].map((x) => <rect key={x} x={x} y="200" width="16" height="50" rx="6" fill="#6f8cff" />)}
      <ellipse cx="380" cy="90" rx="44" ry="70" fill="rgba(0,0,20,0.75)" />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1480, textAlign: "center", ...serif(96) }}>here's <span style={{ color: FLASH }}>why</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-window.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="FROZEN" size={210} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="AT NIGHT?" size={180} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>1 in 4 <span style={{ color: FLASH }}>students</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>YOU'RE NOT ALONE</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

