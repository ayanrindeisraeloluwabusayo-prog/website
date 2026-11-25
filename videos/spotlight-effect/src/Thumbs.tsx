// Thumbnail options for "Why you think everybody noticed your mistake (the spotlight effect)". Our type, blue and gold, no brand logos.
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


/** A: a lone figure in a spotlight on a dark stage, "EVERYONE SAW IT." crossed out, "nobody did." */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="s-9443301.jpg" pos="52% 50%" scale={1.5} filter="brightness(1.2) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}cc 0%, transparent 35%, transparent 62%, ${BLUE_DEEP}ee 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <Big text="EVERYONE" size={180} />
        <div style={{ position: "absolute", left: -20, right: -20, top: 70, height: 22, background: "#ff3b3b", transform: "rotate(-6deg)", boxShadow: "0 0 30px #ff3b3b" }} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 470, textAlign: "center" }}><Big text="SAW IT" size={200} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1260 }}>
      <Banner><div style={{ ...serif(130) }}>almost <span style={{ color: FLASH }}>nobody</span> did.</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1560, ...lab, fontSize: 38 }}>THE SPOTLIGHT EFFECT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: an embarrassed face-palm, two big numbers: "YOU THINK 50%" vs "REALLY <25%". */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="s-4378209.jpg" pos="45% 40%" scale={1.05} filter="saturate(1.15) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}88 38%, transparent 55%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 60, right: 140, top: 270, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
      <div style={{ textAlign: "center" }}><div style={{ ...lab, fontSize: 42 }}>YOU THINK</div><Big text="50%" size={175} /></div>
      <div style={{ textAlign: "center" }}><div style={{ ...lab, fontSize: 42, color: FLASH }}>REALLY</div><Big text="<25%" size={175} face={FLASH} depth="#fff" /></div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 560, textAlign: "center", ...serif(96) }}>of the room <span style={{ color: FLASH }}>noticed</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1430, textAlign: "center", ...serif(120) }}>Nobody's looking<br />at <span style={{ color: FLASH }}>you.</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: graphic: a spotlight cone on a tiny figure, "THE SPOTLIGHT EFFECT", with faces in the dark looking at their own phones. */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 70%, ${BLUE} 0%, ${BLUE_DEEP} 60%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", ...serif(140) }}>the</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 380, textAlign: "center" }}><Big text="SPOTLIGHT" size={168} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 570, textAlign: "center" }}><Big text="EFFECT" size={190} /></div>
    <div style={{ position: "absolute", left: 270, top: 820, width: 540, height: 760, background: "linear-gradient(180deg, rgba(255,240,180,0.0) 0%, rgba(255,240,180,0.55) 100%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", filter: "blur(4px)" }} />
    <div style={{ position: "absolute", left: 270, top: 1510, width: 540, height: 110, borderRadius: "50%", background: "rgba(255,240,180,0.6)", filter: "blur(10px)" }} />
    <div style={{ position: "absolute", left: 500, top: 1330, width: 80, height: 80, borderRadius: 40, background: "#111" }} />
    <div style={{ position: "absolute", left: 480, top: 1410, width: 120, height: 160, borderRadius: "50px 50px 10px 10px", background: "#111" }} />
    <div style={{ position: "absolute", left: 0, right: 140, top: 1640, textAlign: "center", ...lab, fontSize: 36 }}>WHY YOU THINK EVERYONE NOTICED</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: a party crowd in the dark, "NOBODY NOTICED." huge, "they're too busy worrying about themselves". */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="s-1850119.jpg" pos="50% 50%" scale={1.05} filter="saturate(1.2) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, transparent 40%, transparent 55%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><Big text="NOBODY" size={205} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 500, textAlign: "center" }}><Big text="NOTICED." size={200} /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1240, textAlign: "center", ...serif(110) }}>they're too busy<br />worrying about <span style={{ color: FLASH }}>themselves</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1580, textAlign: "center", ...lab, fontSize: 38 }}>THE SPOTLIGHT EFFECT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
