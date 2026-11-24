// Thumbnail options for "Why the wait for GTA 6 felt so good": blue serif explainer look, no game footage or logos.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BLUE, BLUE_DEEP, FLASH, Grain } from "./kit";
import { SANS2, SERIF2 } from "./type";

const serif = (size: number): React.CSSProperties => ({ fontFamily: SERIF2, fontWeight: 500, fontSize: size, letterSpacing: "-0.045em", lineHeight: 0.84, color: "#fff" });
const lab: React.CSSProperties = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em", color: "#fff" };
const Photo: React.FC<{ src: string; pos?: string; filter?: string; scale?: number }> = ({ src, pos = "50% 50%", filter = "", scale = 1 }) => (
  <Img src={staticFile(`media/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter, transform: `scale(${scale})` }} />
);

/** A: dark controller, "The WAIT was the best part." */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="g-pad.jpg" pos="62% 50%" scale={1.1} filter="contrast(1.1) brightness(0.9)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE}cc 36%, transparent 62%, #000b 95%)` }} />
    <div style={{ position: "absolute", left: 70, top: 300, ...lab, fontSize: 44 }}>GTA 6 · 13 YEARS LATER</div>
    <div style={{ position: "absolute", left: 60, top: 380, ...serif(200) }}>The <span style={{ color: FLASH }}>wait</span></div>
    <div style={{ position: "absolute", left: 60, top: 560, ...serif(150) }}>was the best part.</div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1540, textAlign: "center", ...lab, fontSize: 38 }}>HERE'S WHAT IT DID TO YOUR BRAIN</div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);

/** B: a loading bar stuck at 99%, "13 years." */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${BLUE} 0%, ${BLUE_DEEP} 85%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 320, textAlign: "center" }}>
      <div style={{ ...lab, fontSize: 46 }}>WAITING FOR GTA 6</div>
      <div style={{ ...serif(330), color: FLASH, marginTop: 30 }}>13 years</div>
    </div>
    <div style={{ position: "absolute", left: 110, right: 110, top: 1020, height: 110, borderRadius: 55, border: "8px solid #fff", padding: 12 }}>
      <div style={{ width: "99%", height: "100%", borderRadius: 40, background: FLASH, boxShadow: "0 0 50px rgba(243,194,29,0.8)" }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 90, color: "#fff" }}>99%</div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1440, textAlign: "center", ...serif(120) }}>…and you <span style={{ color: FLASH }}>loved</span> it?</div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);

/** C: the brain-chemical angle: "Your brain loved the trailer more than the game." */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: BLUE }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 860, height: 1060, overflow: "hidden" }}>
      <Photo src="g-hands.jpg" pos="50% 40%" filter="contrast(1.05) saturate(0.9)" />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE} 0%, transparent 30%)` }} />
    </div>
    <div style={{ position: "absolute", left: 70, top: 300 }}>
      <div style={{ ...serif(140) }}>Your brain loved</div>
      <div style={{ ...serif(140), marginTop: 14 }}>the <span style={{ color: FLASH }}>trailer</span></div>
      <div style={{ ...serif(140), marginTop: 14 }}>more than the game.</div>
    </div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);

/** D: 90,000,000 views for a game nobody could play. */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="g-room.jpg" pos="55% 50%" filter="brightness(0.55) saturate(0.8)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}ee 0%, ${BLUE}aa 45%, ${BLUE_DEEP}ee 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}>
      <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 170, color: FLASH, letterSpacing: "-0.03em" }}>90,000,000</div>
      <div style={{ ...lab, fontSize: 46, marginTop: 10 }}>VIEWS IN 24 HOURS</div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1020, textAlign: "center", ...serif(150) }}>for a game<br />nobody could <span style={{ color: FLASH }}>play.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1480, textAlign: "center", ...lab, fontSize: 36 }}>WHY THE WAIT FELT SO GOOD</div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);
