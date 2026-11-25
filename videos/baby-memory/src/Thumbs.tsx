// Thumbnail options for "Why you can't remember being a baby". Our type, blue and gold, no brand logos.
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
const Banner: React.FC<{ children: React.ReactNode; rot?: number; bg?: string }> = ({ children, rot = -3, bg = BLUE }) => (
  <div style={{ display: "inline-block", background: bg, padding: "18px 34px 26px", transform: `rotate(${rot}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>{children}</div>
);



/** A: a baby's face, "YOU WERE HERE" and "…but you don't remember it." */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="b-1284444.jpg" pos="45% 45%" scale={1.1} filter="saturate(1.05) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}77 34%, transparent 48%, transparent 62%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="THIS WAS YOU" size={170} /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1300 }}><Banner><div style={{ ...serif(118) }}>…so why can't you <span style={{ color: FLASH }}>remember?</span></div></Banner></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1600, ...lab, fontSize: 36 }}>THE SCIENCE OF BABY MEMORIES</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: a first-birthday cupcake, "YOUR 1ST BIRTHDAY?" and "gone." */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="b-2940556.jpg" pos="45% 50%" scale={1.05} filter="saturate(1.1) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}66 36%, transparent 50%, transparent 62%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="YOUR 1ST" size={200} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center" }}><Big text="BIRTHDAY?" size={165} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1380, textAlign: "center", ...serif(140) }}><span style={{ color: FLASH }}>gone.</span> here's why</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: graphic: a memory timeline, ages 0-3 locked behind a padlock, "BABY MEMORIES" big. */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", ...serif(100) }}>why you can't remember</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center" }}><Big text="BEING A BABY" size={140} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 90, right: 230, top: 940, display: "flex", gap: 14 }}>
      {[0, 1, 2, 3, 4, 5].map((y) => (
        <div key={y} style={{ flex: 1, height: 260, borderRadius: 22, background: y < 3 ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.9)", border: y < 3 ? "4px dashed rgba(255,255,255,0.45)" : "4px solid #fff",
          display: "flex", alignItems: "flex-end", justifyContent: "center", paddingBottom: 16, ...lab, fontSize: 34, color: y < 3 ? "rgba(255,255,255,0.6)" : BLUE_DEEP }}>{y}</div>
      ))}
    </div>
    <svg viewBox="0 0 100 120" style={{ position: "absolute", left: 250, top: 830, width: 170, height: 204 }}>
      <path d="M25 55 V35 A25 25 0 0 1 75 35 V55" fill="none" stroke={FLASH} strokeWidth="12" />
      <rect x="10" y="52" width="80" height="62" rx="12" fill={FLASH} /><circle cx="50" cy="80" r="9" fill={BLUE_DEEP} /><rect x="46" y="84" width="8" height="18" rx="4" fill={BLUE_DEEP} />
    </svg>
    <div style={{ position: "absolute", left: 90, right: 230, top: 1230, display: "flex", justifyContent: "space-between", ...lab, fontSize: 30 }}><span style={{ color: FLASH }}>LOCKED</span><span>YOUR AGE</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1420, textAlign: "center", ...serif(110) }}>they're <span style={{ color: FLASH }}>still in there</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: scattered old photos, "YOUR FIRST MEMORY" and "might be fake." */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="b-7666143.jpg" pos="50% 50%" scale={1.1} filter="saturate(0.9) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, transparent 40%, transparent 58%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="YOUR FIRST" size={170} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center" }}><Big text="MEMORY" size={220} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1300, textAlign: "center", ...serif(140) }}>might be <span style={{ color: FLASH }}>fake.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>WHY YOU CAN'T REMEMBER BEING A BABY</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
