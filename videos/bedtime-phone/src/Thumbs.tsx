// Thumbnail options for "Why you stay up late on your phone even when you are tired". Our type, blue and gold, no brand logos.
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

const RED = "#ff3b3b";
/** A: a face lit only by the phone in a dark room; a huge glowing "3:07 AM", "just ONE more video." */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="b-2013929.jpg" pos="65% 50%" scale={1.6} filter="brightness(1.35) contrast(1.1) saturate(1.2)" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,5,40,0.75) 0%, transparent 38%, transparent 58%, rgba(0,5,40,0.9) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><Big text="3:07 AM" size={250} face="#fff" depth="#6fa8ff" glow="rgba(80,150,255,0.9)" /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1150 }}>
      <Banner><div style={{ ...serif(130) }}>just <span style={{ color: FLASH }}>one</span> more</div></Banner>
      <div style={{ height: 14 }} />
      <Banner rot={2} bg={FLASH}><div style={{ ...serif(130), color: "#111" }}>video…</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1560, ...lab, fontSize: 38 }}>WHY YOU CAN'T PUT IT DOWN</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: dark window at night, a huge gold "REVENGE", "bedtime procrastination". */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="b-2600578.jpg" pos="40% 50%" scale={1.1} filter="saturate(1.3) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}dd 0%, transparent 40%, transparent 55%, ${BLUE_DEEP}ee 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}>
      <Banner rot={-2}><div style={{ ...lab, fontSize: 60 }}>IT HAS A NAME:</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 420, textAlign: "center" }}><Big text="REVENGE" size={200} face={FLASH} depth="#fff" glow="rgba(243,194,29,0.9)" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1180, textAlign: "center", ...serif(140) }}>bedtime<br /><span style={{ color: FLASH }}>procrastination</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1560, textAlign: "center", ...lab, fontSize: 40 }}>AND YOU DO IT EVERY NIGHT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: two battery meters: PHONE 100% (green, glowing) vs YOU 2% (red). */
const Battery: React.FC<{ label: string; pct: number; color: string }> = ({ label, pct, color }) => (
  <div style={{ display: "flex", alignItems: "center", gap: 36 }}>
    <div style={{ ...lab, fontSize: 64, width: 270, textAlign: "right" }}>{label}</div>
    <div style={{ position: "relative", width: 420, height: 190, borderRadius: 34, border: "12px solid #fff", padding: 14, boxShadow: `0 0 60px ${color}88` }}>
      <div style={{ width: `${Math.max(pct, 6)}%`, height: "100%", borderRadius: 18, background: color, boxShadow: `0 0 40px ${color}` }} />
      <div style={{ position: "absolute", right: -40, top: 55, width: 24, height: 56, borderRadius: 8, background: "#fff" }} />
    </div>
  </div>
);
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${BLUE} 0%, ${BLUE_DEEP} 85%)` }}>
    <Photo src="b-2594600.jpg" pos="45% 40%" scale={1.15} filter="brightness(0.6) saturate(0.6)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}ee 0%, ${BLUE_DEEP}88 45%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 40, right: 140, top: 290, display: "flex", flexDirection: "column", gap: 60, alignItems: "center" }}>
      <Battery label="PHONE" pct={100} color="#3df27a" />
      <Battery label="YOU" pct={2} color={RED} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1060, textAlign: "center", ...serif(150) }}>so why are you<br />still <span style={{ color: FLASH }}>awake?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1520, textAlign: "center", ...lab, fontSize: 40 }}>THE PSYCHOLOGY OF LATE NIGHTS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: "NETFLIX'S BIGGEST RIVAL?" in plain text, then a giant "YOUR SLEEP" over the phone-lit face. */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="b-2594600.jpg" pos="40% 45%" scale={1.05} filter="saturate(1.2) contrast(1.1)" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,30,0.85) 0%, transparent 35%, transparent 55%, rgba(0,0,30,0.92) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 140, top: 250, textAlign: "center", ...serif(150) }}>Netflix's<br />biggest <span style={{ color: FLASH }}>rival?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1090, textAlign: "center" }}><Big text="YOUR" size={230} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1300, textAlign: "center" }}><Big text="SLEEP." size={270} /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1590, textAlign: "center", ...lab, fontSize: 38 }}>THEY SAID IT OUT LOUD</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
