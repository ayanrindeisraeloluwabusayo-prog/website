// Thumbnail options for "Why we forget our dreams". Our type, blue and gold, no brand logos.
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
    <Photo src="t-2197947.jpg" pos="50% 40%" scale={1.05} filter="saturate(1.12) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="WHERE DID" size={165} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center" }}><Big text="MY DREAM GO?" size={130} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(100) }}>your brain <span style={{ color: FLASH }}>deleted it</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>WHY WE FORGET OUR DREAMS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-1836316.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.12) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="GONE IN" size={210} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="SECONDS" size={210} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(100) }}>here's <span style={{ color: FLASH }}>why</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE SCIENCE OF DREAMS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(115) }}>why we <span style={{ color: FLASH }}>forget</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center" }}><Big text="OUR DREAMS" size={165} face={FLASH} depth="#fff" /></div>
    <svg viewBox="0 0 400 300" style={{ position: "absolute", left: 140, top: 820, width: 700, height: 525 }}>
      <path d="M90 230 C30 230 30 150 90 150 C90 90 170 70 200 110 C230 60 320 80 310 150 C370 150 370 230 310 230 Z" fill="rgba(255,255,255,0.92)" />
      {[0, 1, 2, 3, 4, 5].map((i) => <rect key={i} x={250 + i * 22} y={120 + (i % 3) * 30} width={14} height={14} fill="#fff" opacity={0.9 - i * 0.15} transform={`rotate(${i * 15} ${257 + i * 22} ${127 + (i % 3) * 30})`} />)}
      <path d="M150 190 C160 180 170 180 180 190 M220 190 C230 180 240 180 250 190" stroke={BLUE_DEEP} strokeWidth="7" fill="none" strokeLinecap="round" />
      <text x="180" y="60" fill={FLASH} fontFamily="serif" fontSize="44">z</text><text x="215" y="34" fill={FLASH} fontFamily="serif" fontSize="30">z</text>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1420, textAlign: "center", ...serif(110) }}>your brain <span style={{ color: FLASH }}>deletes them</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-945881.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.12) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="FORGOT YOUR" size={140} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="DREAM?" size={230} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(100) }}>it was <span style={{ color: FLASH }}>on purpose</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>YOUR BRAIN'S DELETE BUTTON</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

