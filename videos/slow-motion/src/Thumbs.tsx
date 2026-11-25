// Thumbnail options for "Why time slows down in an accident". Our type, blue and gold, no brand logos.
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



/** Motion streaks behind a word, like a slow-motion trail. */
const Trail: React.FC<{ text: string; size: number; top: number; face?: string }> = ({ text, size, top, face = FLASH }) => (
  <>
    {[4, 3, 2, 1, 0].map((i) => (
      <div key={i} style={{ position: "absolute", left: -i * 34, right: i * 34, top, textAlign: "center", opacity: i ? 0.12 + 0.08 * (4 - i) : 1, filter: i ? `blur(${i}px)` : undefined }}>
        <Big text={text} size={size} face={i ? "#fff" : face} depth={i ? BLUE_DEEP : "#fff"} glow={i ? "rgba(0,0,0,0)" : "rgba(243,194,29,0.8)"} />
      </div>
    ))}
  </>
);

/** A: a man falling over a city, "TIME SLOWED DOWN…" and "or did it?" */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="s-2036456.jpg" pos="40% 50%" scale={1.05} filter="saturate(1.15) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, transparent 38%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="TIME" size={230} /></div>
    <Trail text="SLOWED DOWN" size={128} top={480} />
    <div style={{ position: "absolute", left: 60, right: 140, top: 1280 }}><Banner><div style={{ ...serif(130) }}>…or did <span style={{ color: FLASH }}>it?</span></div></Banner></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1560, ...lab, fontSize: 38 }}>WHY ACCIDENTS FEEL LIKE SLOW-MO</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** B: crash-test cars, "1 SECOND" = "felt like 10". */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="s-1620591.jpg" pos="45% 50%" scale={1.05} filter="saturate(1.2) contrast(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}66 36%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}><Big text="1 SECOND" size={210} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center", ...serif(130) }}>felt like <span style={{ color: FLASH }}>ten.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1420, textAlign: "center", ...serif(110) }}>here's what <span style={{ color: FLASH }}>really</span> happened</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: graphic: a big clock with a frozen second hand and motion rings, "SLOW-MO" trailing, "why accidents feel like this". */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 58%, ${BLUE} 0%, ${BLUE_DEEP} 70%, #000814 100%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 280, textAlign: "center", ...serif(105) }}>why time <span style={{ color: FLASH }}>slows down</span></div>
    <Trail text="SLOW-MO" size={185} top={430} />
    <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 190, top: 780, width: 700, height: 700 }}>
      {[0, 1, 2].map((i) => <circle key={i} cx="200" cy="200" r={150 + i * 22} fill="none" stroke={i ? "rgba(255,255,255,0.25)" : "#fff"} strokeWidth={i ? 3 : 10} />)}
      {Array.from({ length: 12 }, (_, i) => { const a = (i / 12) * Math.PI * 2; return <line key={i} x1={200 + Math.sin(a) * 125} y1={200 - Math.cos(a) * 125} x2={200 + Math.sin(a) * 140} y2={200 - Math.cos(a) * 140} stroke="#fff" strokeWidth="6" strokeLinecap="round" />; })}
      {[0, 1, 2, 3].map((i) => <line key={i} x1="200" y1="200" x2={200 + Math.sin(0.9 - i * 0.07) * 120} y2={200 - Math.cos(0.9 - i * 0.07) * 120} stroke={FLASH} strokeWidth="8" strokeLinecap="round" opacity={1 - i * 0.25} />)}
      <line x1="200" y1="200" x2="200" y2="120" stroke="#fff" strokeWidth="10" strokeLinecap="round" />
      <circle cx="200" cy="200" r="12" fill={FLASH} />
    </svg>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1560, textAlign: "center", ...lab, fontSize: 38 }}>IN AN ACCIDENT</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: a frozen splash, "SLOW MOTION?" and "it's your memory." */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="s-6509617.jpg" pos="50% 55%" scale={1.2} filter="saturate(1.2) contrast(1.05)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, transparent 40%, transparent 58%, ${BLUE_DEEP}f2 100%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><Big text="SLOW" size={240} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 480, textAlign: "center" }}><Big text="MOTION?" size={200} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 40, right: 140, top: 1300, textAlign: "center", ...serif(130) }}>it's your <span style={{ color: FLASH }}>memory.</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1560, textAlign: "center", ...lab, fontSize: 38 }}>WHY ACCIDENTS FEEL SLOW</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
