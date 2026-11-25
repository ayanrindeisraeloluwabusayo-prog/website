// Thumbnail options for "Why the least skilled feel the most confident". Our type, blue and gold, no brand logos.
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
    <Photo src="t-1868750.jpg" pos="60% 40%" scale={1.1} filter="saturate(1.12) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="TOO" size={230} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="CONFIDENT?" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(100) }}>that's the <span style={{ color: FLASH }}>warning sign</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE DUNNING-KRUGER EFFECT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-2039830.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.12) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="LEMON JUICE" size={145} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="BANK ROBBER" size={140} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(100) }}>he thought he was <span style={{ color: FLASH }}>invisible</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>THE TRUE STORY BEHIND IT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center", ...serif(110) }}>why the <span style={{ color: FLASH }}>least skilled</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 410, textAlign: "center" }}><Big text="FEEL SMARTEST" size={135} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 140, right: 230, top: 840, height: 560, display: "flex", alignItems: "flex-end", gap: 50 }}>
      {[["SKILL", 130, "#fff"], ["CONFIDENCE", 500, FLASH]].map(([t, h, c]) => (
        <div key={t as string} style={{ flex: 1, textAlign: "center" }}>
          <div style={{ height: h as number, borderRadius: "18px 18px 0 0", background: c as string, boxShadow: c === FLASH ? "0 0 60px rgba(243,194,29,0.6)" : "none" }} />
          <div style={{ ...lab, fontSize: 30, marginTop: 16 }}>{t}</div>
        </div>
      ))}
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1520, textAlign: "center", ...serif(100) }}>the <span style={{ color: FLASH }}>Dunning-Kruger</span> effect</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="t-7267534.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.12) contrast(1.08)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="HE THOUGHT" size={150} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="NO ONE SAW" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1320, textAlign: "center", ...serif(100) }}>the cameras <span style={{ color: FLASH }}>did</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1570, textAlign: "center", ...lab, fontSize: 36 }}>WHY THE CLUELESS FEEL SMART</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

