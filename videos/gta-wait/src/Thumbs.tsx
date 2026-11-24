// Thumbnail options (round 2) for "Why the wait for GTA 6 felt so good": louder, with a huge "GTA 6" in our own type
// (no Rockstar logo, art or footage), vivid sunset/neon photos, glow and depth, plus our blue and gold.
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

/** A: pink palm sunset, giant GTA 6, "The wait was the best part." on a blue banner. */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="g-palms.jpg" pos="45% 50%" scale={1.05} filter="saturate(1.35) contrast(1.1)" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(20,0,40,0.55) 0%, transparent 35%, transparent 60%, rgba(10,0,30,0.85) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 290, textAlign: "center" }}><Big size={330} /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1010 }}>
      <Banner><div style={{ ...serif(140) }}>The <span style={{ color: FLASH }}>wait</span></div></Banner>
      <div style={{ height: 16 }} />
      <Banner rot={2} bg={FLASH}><div style={{ ...serif(120), color: "#111" }}>was the best part.</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1500, ...lab, fontSize: 38 }}>13 YEARS OF HYPE · HERE'S WHY</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: our 3D man's glass head with the gold dopamine light, "YOUR BRAIN ON GTA 6". */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${BLUE} 0%, ${BLUE_DEEP} 80%)` }}>
    <Photo src="g-brain.jpg" pos="50% 30%" scale={1.35} />
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 42%, transparent 25%, ${BLUE_DEEP}cc 70%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 250, textAlign: "center" }}>
      <Banner rot={-2}><div style={{ ...lab, fontSize: 64 }}>YOUR BRAIN ON</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 1160, textAlign: "center" }}><Big size={340} face={FLASH} depth="#fff" glow="rgba(243,194,29,0.9)" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1520, textAlign: "center", ...serif(96) }}>before it even <span style={{ color: FLASH }}>came out</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: neon rain street, a neon-sign GTA 6 and a loading bar at 99%: "13 YEARS". */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="g-neon.jpg" pos="50% 60%" filter="saturate(1.4) contrast(1.15) brightness(0.85)" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,30,0.7) 0%, transparent 40%, rgba(0,0,30,0.75) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 300, letterSpacing: "-0.03em",
      color: "transparent", WebkitTextStroke: "10px #ff4fd8", textShadow: "0 0 30px #ff4fd8, 0 0 80px #ff4fd8" }}>GTA 6</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 640, textAlign: "center", ...serif(240), color: FLASH, textShadow: "0 0 60px rgba(243,194,29,0.8)" }}>13 years</div>
    <div style={{ position: "absolute", left: 110, right: 150, top: 1180, height: 100, borderRadius: 50, border: "8px solid #4fd8ff", boxShadow: "0 0 40px #4fd8ff", padding: 10 }}>
      <div style={{ width: "99%", height: "100%", borderRadius: 40, background: "#4fd8ff" }} />
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1320, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 80, color: "#fff" }}>LOADING… 99%</div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1470, textAlign: "center", ...serif(110) }}>and you <span style={{ color: FLASH }}>loved</span> it.</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: city sunset, "90,000,000 VIEWS" with a trailer card that says GTA 6, "for a game nobody could play". */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="g-skyline.jpg" pos="55% 50%" scale={1.1} filter="saturate(1.3) contrast(1.1)" />
    <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(0,0,40,0.65) 0%, transparent 40%, rgba(0,0,40,0.85) 100%)" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><Big text="90,000,000" size={175} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center", ...lab, fontSize: 50 }}>VIEWS IN 24 HOURS</div>
    <div style={{ position: "absolute", left: 150, top: 600, width: 780, height: 440, borderRadius: 28, background: "rgba(10,10,30,0.85)", border: "6px solid #fff", boxShadow: "0 40px 80px rgba(0,0,0,0.6)", display: "flex", alignItems: "center", justifyContent: "center", transform: "rotate(-3deg)" }}>
      <Big size={190} />
      <div style={{ position: "absolute", right: 30, bottom: 30, width: 110, height: 110, borderRadius: 55, background: "rgba(255,255,255,0.95)", display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ width: 0, height: 0, borderTop: "22px solid transparent", borderBottom: "22px solid transparent", borderLeft: "36px solid #111", marginLeft: 10 }} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1150, textAlign: "center", ...serif(140) }}>for a game<br />nobody could <span style={{ color: FLASH }}>play.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1580, textAlign: "center", ...lab, fontSize: 36 }}>THE PSYCHOLOGY OF HYPE</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
