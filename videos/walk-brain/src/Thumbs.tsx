// Thumbnail options for "What happens to your brain when you go for a walk". Our type, blue and gold, no brand logos.
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
    <Photo src="t-street.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="GO FOR" size={220} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="A WALK" size={220} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>your brain <span style={{ color: FLASH }}>changes</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>HERE'S HOW</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-path.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="DARWIN'S" size={190} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="SECRET" size={220} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>just <span style={{ color: FLASH }}>walk</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE THINKING PATH</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(100) }}>your brain on a <span style={{ color: FLASH }}>walk</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="+60% IDEAS" size={150} face={FLASH} depth="#fff" /></div>
    <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 130, top: 740, width: 700, height: 700 }}>
      <path d="M110 390 L110 320 C60 295 40 240 45 185 C52 95 125 35 210 35 C300 35 355 100 350 170 L378 222 L350 232 L355 268 C355 292 326 298 296 296 L290 340 L290 390" fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <g transform="translate(195 160)"><circle cy="-50" r="16" fill="#F3C21D" /><path d="M0 -32 L0 30 M0 30 L-20 90 M0 30 L22 90 M0 0 L-24 34 M0 0 L26 28" stroke="#F3C21D" strokeWidth="10" strokeLinecap="round" fill="none" /></g>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1480, textAlign: "center", ...serif(96) }}>here's <span style={{ color: FLASH }}>why</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-forest.jpg" pos="50% 40%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="WALK" size={240} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="IT OFF" size={220} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>your brain <span style={{ color: FLASH }}>grows</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>SCIENCE OF WALKING</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

