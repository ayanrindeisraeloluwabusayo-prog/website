// Thumbnail options for "The halo effect". Our type, blue and gold, no brand logos.
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
    <Photo src="t-8881740.jpg" pos="50% 35%" scale={1.0} filter="saturate(1.05) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}66 32%, transparent 46%, transparent 62%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}><Big text="PRETTY = SMART?" size={140} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(110) }}>your brain <span style={{ color: FLASH }}>thinks so</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE HALO EFFECT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: a job interview handshake, "HIRED BEFORE SHE SPOKE" */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-10559064.jpg" pos="45% 50%" scale={1.05} filter="saturate(1.1) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="HIRED BEFORE" size={150} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center" }}><Big text="SHE SPOKE" size={170} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(110) }}>the <span style={{ color: FLASH }}>halo effect</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: graphic: a head silhouette with a glowing gold halo, "THE HALO EFFECT" */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(100) }}><span style={{ color: FLASH }}>good-looking</span> = good?</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center" }}><Big text="THE HALO EFFECT" size={118} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 370, top: 760, width: 340, height: 340, borderRadius: "50%", border: `16px solid ${FLASH}`, boxShadow: `0 0 50px ${FLASH}, inset 0 0 30px ${FLASH}`, transform: "rotateX(70deg)" }} />
    <svg viewBox="0 0 200 220" style={{ position: "absolute", left: 340, top: 900, width: 400, height: 440 }}>
      <circle cx="100" cy="70" r="55" fill="#fff" /><path d="M10 220 C10 130 190 130 190 220 Z" fill="#fff" />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1420, textAlign: "center", ...serif(100) }}>one good trait <span style={{ color: FLASH }}>shines over all</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: a woman posing, "LOOKS GOOD = IS GOOD?" */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-9769334.jpg" pos="72% 45%" scale={1.0} filter="saturate(1.15) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="LOOKS GOOD" size={150} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="= IS GOOD?" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(110) }}>that's the <span style={{ color: FLASH }}>trap</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE HALO EFFECT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
