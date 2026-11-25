// Thumbnail options for "Why you feel like someone is watching you". Our type, blue and gold, no brand logos.
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


/** Glowing eyes drawn in our gold, for the graphic option. */
const Eyes: React.FC<{ size: number; look?: number }> = ({ size, look = 0 }) => (
  <div style={{ display: "flex", gap: size * 0.35, justifyContent: "center" }}>
    {[0, 1].map((i) => (
      <div key={i} style={{ width: size, height: size * 0.55, borderRadius: "50%", background: "#fff", boxShadow: `0 0 ${size * 0.5}px rgba(243,194,29,0.8)`, position: "relative", overflow: "hidden", border: `${size * 0.04}px solid ${FLASH}` }}>
        <div style={{ position: "absolute", left: size * (0.3 + look), top: size * 0.07, width: size * 0.4, height: size * 0.4, borderRadius: "50%", background: BLUE_DEEP }}>
          <div style={{ position: "absolute", left: size * 0.1, top: size * 0.1, width: size * 0.2, height: size * 0.2, borderRadius: "50%", background: "#000" }} />
        </div>
      </div>
    ))}
  </div>
);

/** A: a woman walking alone down a dark street, "SOMEONE'S WATCHING" huge, "...or are they?" */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="f-5630886.jpg" pos="50% 60%" scale={1.05} filter="brightness(1.15) contrast(1.15) saturate(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}ee 0%, transparent 42%, transparent 60%, ${BLUE_DEEP}f0 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="SOMEONE'S" size={160} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="WATCHING" size={170} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1270 }}>
      <Banner><div style={{ ...serif(130) }}>…or are <span style={{ color: FLASH }}>they?</span></div></Banner>
    </div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1560, ...lab, fontSize: 38 }}>WHY YOUR BRAIN SAYS YES</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: an intense stare, tight on the eyes, "YOUR BRAIN INVENTS THIS STARE". */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="f-1590771.jpg" pos="50% 38%" scale={1.6} filter="contrast(1.2) brightness(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}55 30%, transparent 45%, transparent 58%, ${BLUE_DEEP}f2 92%)`, mixBlendMode: "normal" }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}>
      <Banner rot={-2}><div style={{ ...lab, fontSize: 60 }}>YOUR BRAIN INVENTS</div></Banner>
    </div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1220, textAlign: "center" }}><Big text="THIS STARE" size={170} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1450, textAlign: "center", ...serif(100) }}>even when <span style={{ color: FLASH }}>nobody's there</span></div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: graphic: two huge glowing eyes on our blue, "WHY YOU FEEL WATCHED". */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 45%, ${BLUE} 0%, ${BLUE_DEEP} 75%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", ...serif(150) }}>Why you feel</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 440, textAlign: "center" }}><Big text="WATCHED" size={200} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 900 }}><Eyes size={300} look={0.05} /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1300, textAlign: "center", ...serif(110) }}>it's not a <span style={{ color: FLASH }}>sixth sense</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1520, textAlign: "center", ...lab, fontSize: 38 }}>THE SCIENCE OF THE STARE</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: a hooded figure in a foggy night street, "NOBODY'S THERE." and "so why does your neck go cold?" */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="f-2586855.jpg" pos="30% 50%" scale={1.15} filter="brightness(1.25) contrast(1.15) saturate(1.2)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f0 0%, transparent 38%, transparent 58%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center" }}><Big text="NOBODY'S" size={185} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center" }}><Big text="THERE." size={240} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1230, textAlign: "center", ...serif(120) }}>so why does your<br />neck go <span style={{ color: FLASH }}>cold?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1580, textAlign: "center", ...lab, fontSize: 38 }}>THE FEELING OF BEING WATCHED</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
