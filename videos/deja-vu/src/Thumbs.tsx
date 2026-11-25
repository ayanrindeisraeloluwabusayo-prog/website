// Thumbnail options for "Déjà vu". Our type, blue and gold, no brand logos.
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


/** Stacked echo copies of a word, fading back like a repeated memory. */
const Echo: React.FC<{ text: string; size: number; top: number; copies?: number; face?: string }> = ({ text, size, top, copies = 4, face = FLASH }) => (
  <>
    {Array.from({ length: copies }, (_, i) => copies - 1 - i).map((i) => (
      <div key={i} style={{ position: "absolute", left: 0, right: 0, top: top - i * size * 0.22, textAlign: "center", opacity: i === 0 ? 1 : 0.5 / (i + 0.3), filter: i ? `blur(${i * 1.5}px)` : undefined }}>
        <Big text={text} size={size} face={i === 0 ? face : "#fff"} depth={i === 0 ? "#fff" : BLUE_DEEP} glow={i === 0 ? "rgba(243,194,29,0.8)" : "rgba(0,0,0,0)"} />
      </div>
    ))}
  </>
);

/** A: a dark corridor, "DÉJÀ VU" echoing upward, "you've never been here." */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="d-867226.jpg" pos="50% 50%" scale={1.05} filter="brightness(1.1) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}ee 0%, ${BLUE_DEEP}55 45%, ${BLUE_DEEP}f2 100%)` }} />
    <Echo text="DÉJÀ VU" size={220} top={520} />
    <div style={{ position: "absolute", left: 60, right: 140, top: 1240 }}>
      <Banner><div style={{ ...serif(120) }}>you've <span style={{ color: FLASH }}>never</span> been here.</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1560, ...lab, fontSize: 38 }}>SO WHY DOES IT FEEL FAMILIAR?</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: the same black cat twice (the second a ghost), "SEEN THIS BEFORE?" */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: BLUE_DEEP }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 700, height: 640, overflow: "hidden" }}>
      <Img src={staticFile("media/d-2690236.jpg")} style={{ position: "absolute", left: -380, top: 0, height: 640, filter: "contrast(1.1) saturate(1.1)" }} />
      <Img src={staticFile("media/d-2690236.jpg")} style={{ position: "absolute", left: -40, top: 0, height: 640, opacity: 0.45, filter: "grayscale(0.3)", mixBlendMode: "screen" }} />
    </div>
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP} 0%, ${BLUE_DEEP} 35%, transparent 37%, transparent 68%, ${BLUE_DEEP} 70%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><Big text="SEEN THIS" size={200} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 460, textAlign: "center" }}><Big text="BEFORE?" size={200} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1400, textAlign: "center", ...serif(120) }}>it's not a <span style={{ color: FLASH }}>glitch.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1580, textAlign: "center", ...lab, fontSize: 38 }}>THE SCIENCE OF DÉJÀ VU</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: graphic: frames inside frames going back forever, a giant "DÉJÀ VU" in the middle, "your brain's fact-checker". */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 50%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    {Array.from({ length: 9 }, (_, i) => {
      const s = Math.pow(0.8, i);
      return <div key={i} style={{ position: "absolute", left: 540 - 470 * s, top: 960 - 880 * s, width: 940 * s, height: 1760 * s, border: `${Math.max(3, 10 * s)}px solid ${i % 2 ? FLASH : "#fff"}`, borderRadius: 40 * s, opacity: 0.9 - i * 0.08,
        transform: `rotate(${i * 3}deg)`, boxShadow: i % 2 ? "0 0 30px rgba(243,194,29,0.5)" : "none" }} />;
    })}
    <div style={{ position: "absolute", left: 0, right: 0, top: 300, textAlign: "center", ...serif(120) }}>I've lived this</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 430, textAlign: "center", ...serif(120) }}>moment <span style={{ color: FLASH }}>before…</span></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center" }}><Big text="DÉJÀ VU" size={215} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1300, textAlign: "center" }}><Banner rot={-2}><div style={{ ...lab, fontSize: 52 }}>EXPLAINED</div></Banner></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: the frame-in-frame photo, "I'VE LIVED THIS BEFORE" and "…no, you haven't." */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="d-7266131.jpg" pos="45% 50%" scale={1.05} filter="saturate(1.15) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, transparent 38%, transparent 58%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="I'VE LIVED" size={190} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="THIS BEFORE" size={150} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1300, textAlign: "center", ...serif(130) }}>…no, you <span style={{ color: FLASH }}>haven't.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1560, textAlign: "center", ...lab, fontSize: 38 }}>WHAT DÉJÀ VU REALLY IS</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
