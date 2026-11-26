// Thumbnail options for "Some people can't picture anything in their mind". Our type, blue and gold, no brand logos.
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
    <Photo src="t-apples.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="PICTURE" size={180} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="AN APPLE" size={165} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>can you <span style={{ color: FLASH }}>see it?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>SOME PEOPLE CAN'T</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-eye.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="BLIND" size={200} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="MIND'S EYE" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}>it has a <span style={{ color: FLASH }}>name</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>APHANTASIA</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(100) }}>can you <span style={{ color: FLASH }}>picture</span> it?</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="NOTHING THERE" size={118} face={FLASH} depth="#fff" /></div>
    <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 130, top: 740, width: 700, height: 700 }}>
      <path d="M110 390 L110 320 C60 295 40 240 45 185 C52 95 125 35 210 35 C300 35 355 100 350 170 L378 222 L350 232 L355 268 C355 292 326 298 296 296 L290 340 L290 390" fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
      <g transform="translate(200 165)">
        <path d="M0 -30 C-30 -50 -70 -30 -66 10 C-62 50 -30 78 0 66 C30 78 62 50 66 10 C70 -30 30 -50 0 -30 Z" fill="none" stroke={FLASH} strokeWidth="5" strokeDasharray="10 10" />
        <path d="M0 -30 C2 -44 8 -54 16 -60" fill="none" stroke={FLASH} strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1480, textAlign: "center", ...serif(88) }}>a mind <span style={{ color: FLASH }}>without pictures</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-thinker.jpg" pos="50% 35%" scale={1.05} filter="saturate(1.05) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="NO PICTURES" size={130} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="IN MY HEAD" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(105) }}><span style={{ color: FLASH }}>2-3%</span> of people</div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>WHY IT HAPPENS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

