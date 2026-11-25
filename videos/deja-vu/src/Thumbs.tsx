// Thumbnail options for "Why you get déjà vu". Our type, blue and gold, no brand logos. Safe area: text inside
// y 240-1620, right 140 px clear (TikTok / Shorts / Reels buttons), headline and key image in the centre 1080x1440.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BLUE, BLUE_DEEP, FLASH, Grain } from "./kit";
import { SANS2, SERIF2 } from "./type";

const serif = (size: number): React.CSSProperties => ({ fontFamily: SERIF2, fontWeight: 500, fontSize: size, letterSpacing: "-0.045em", lineHeight: 0.9, color: "#fff" });
const lab: React.CSSProperties = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em", color: "#fff" };
const Photo: React.FC<{ src: string; pos?: string; filter?: string; scale?: number }> = ({ src, pos = "50% 50%", filter = "", scale = 1 }) => (
  <Img src={staticFile(`media/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter, transform: `scale(${scale})` }} />
);
/** Big extruded word in our own type: white face, gold-to-blue depth, glow. */
const Big: React.FC<{ text: string; size: number; face?: string; depth?: string; glow?: string }> = ({ text, size, face = "#fff", depth = FLASH, glow = "rgba(243,194,29,0.8)" }) => {
  const steps = Array.from({ length: 14 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < 7 ? depth : BLUE_DEEP}`).join(", ");
  return <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.04em", color: face, textShadow: `${steps}, 0 0 80px ${glow}, 0 30px 60px rgba(0,0,0,0.6)` }}>{text}</div>;
};
const Banner: React.FC<{ children: React.ReactNode; rot?: number; bg?: string }> = ({ children, rot = -3, bg = BLUE }) => (
  <div style={{ display: "inline-block", background: bg, padding: "18px 34px 26px", transform: `rotate(${rot}deg)`, boxShadow: "0 20px 50px rgba(0,0,0,0.5)" }}>{children}</div>
);

/** One room drawn from above: walls with a door gap, and three objects at fixed spots. Same spots, different objects. */
const Room: React.FC<{ x: number; y: number; s: number; kind: "a" | "b"; dim?: boolean }> = ({ x, y, s, kind, dim }) => {
  const st = { fill: "none", stroke: dim ? "rgba(255,255,255,0.55)" : "#fff", strokeWidth: 7, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 100})`} style={{ filter: "drop-shadow(0 0 10px rgba(255,255,255,0.35))" }}>
      <path d="M 38 0 H 0 V 100 H 100 V 0 H 62" {...st} strokeWidth={3} />
      {kind === "a" ? (
        <>
          <rect x={10} y={66} width={44} height={22} rx={5} {...st} strokeWidth={2.4} />{/* sofa */}
          <circle cx={78} cy={22} r={9} {...st} strokeWidth={2.4} />{/* lamp */}
          <rect x={64} y={60} width={24} height={24} {...st} strokeWidth={2.4} />{/* table */}
        </>
      ) : (
        <>
          <path d="M 10 70 L 32 88 L 54 70 Z" {...st} strokeWidth={2.4} />{/* bench */}
          <rect x={69} y={13} width={18} height={18} transform="rotate(45 78 22)" {...st} strokeWidth={2.4} />{/* plant pot */}
          <circle cx={76} cy={72} r={12} {...st} strokeWidth={2.4} />{/* round table */}
        </>
      )}
    </g>
  );
};

/** A (graphic): two rooms seen from above, different things in the same places, gold lines joining the matches. */
export const ThumbA: React.FC = () => {
  const L = { x: 100, y: 770, s: 360 }, R = { x: 560, y: 770, s: 360 };
  const pts = [[32, 77], [78, 22], [76, 72]].map(([px, py]) => [[L.x + (px * L.s) / 100, L.y + (py * L.s) / 100], [R.x + (px * R.s) / 100, R.y + (py * R.s) / 100]]);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(ellipse 85% 60% at 50% 55%, #1f5cff 0%, ${BLUE} 45%, ${BLUE_DEEP} 100%)` }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center", ...serif(130) }}>why you get</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="DÉJÀ VU" size={230} face={FLASH} depth="#fff" /></div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Room {...L} kind="a" dim />
        <Room {...R} kind="b" />
        {pts.map(([[x1, y1], [x2, y2]], i) => (
          <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 120 - i * 30} ${x2} ${y2}`} fill="none" stroke={FLASH} strokeWidth={6} strokeDasharray="14 14" strokeLinecap="round" style={{ filter: `drop-shadow(0 0 12px ${FLASH})` }} />
        ))}
        {pts.flat().map(([cx, cy], i) => <circle key={i} cx={cx} cy={cy} r={11} fill={FLASH} />)}
      </svg>
      <div style={{ position: "absolute", left: 60, right: 140, top: 1240, ...lab, fontSize: 34, display: "flex", justifyContent: "space-between", paddingLeft: 70, paddingRight: 40 }}>
        <span style={{ opacity: 0.6 }}>FORGOTTEN</span><span>NEW</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...serif(112) }}>your brain found<br />a <span style={{ color: FLASH }}>match.</span></div>
      <Grain amount={0.12} />
    </AbsoluteFill>
  );
};

/** B: a doubled, ghosted street crossing. "A GLITCH?" crossed out in red; "a memory you can't find." */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="p-6766757.jpg" pos="45% 55%" scale={1.05} filter="saturate(1.1) contrast(1.08) brightness(0.85)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}99 30%, transparent 48%, transparent 60%, ${BLUE_DEEP}f2 92%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}>
      <div style={{ position: "relative", display: "inline-block" }}>
        <Big text="A GLITCH?" size={148} />
        <div style={{ position: "absolute", left: -24, right: -24, top: 54, height: 20, background: "#ff3b3b", transform: "rotate(-6deg)", boxShadow: "0 0 30px #ff3b3b" }} />
      </div>
    </div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 450, textAlign: "center" }}><Big text="DÉJÀ VU" size={190} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1250 }}>
      <Banner><div style={{ ...serif(118) }}>a <span style={{ color: FLASH }}>memory</span><br />you can't find.</div></Banner>
    </div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** C: rooms opening into rooms. "YOU'VE BEEN HERE BEFORE." with "...or have you?" */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="p-3117027.jpg" pos="40% 60%" scale={1.08} filter="brightness(0.8) contrast(1.2)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE_DEEP}99 30%, ${BLUE}22 50%, ${BLUE}22 62%, ${BLUE_DEEP}ee 90%)` }} />
    <div style={{ position: "absolute", left: 0, right: 0, top: 270, textAlign: "center" }}><Big text="YOU'VE BEEN" size={124} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 400, textAlign: "center" }}><Big text="HERE" size={230} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 610, textAlign: "center" }}><Big text="BEFORE." size={160} /></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1340, textAlign: "center", ...serif(124) }}>…or <span style={{ color: FLASH }}>have you?</span></div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1520, textAlign: "center", ...lab, fontSize: 38 }}>THE SCIENCE OF DÉJÀ VU</div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);

/** D: the twist. A long corridor; "YOU KNOW WHAT HAPPENS NEXT." then "you don't." */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="p-1629556.jpg" pos="50% 55%" scale={1.05} filter="brightness(0.7) saturate(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f5 0%, ${BLUE_DEEP}aa 34%, transparent 52%, transparent 60%, ${BLUE_DEEP}f2 92%)` }} />
    <div style={{ position: "absolute", left: 40, right: 40, top: 270, textAlign: "center", ...lab, fontSize: 44 }}>IN DÉJÀ VU IT FEELS LIKE</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 350, textAlign: "center" }}><Big text="YOU KNOW" size={150} /></div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 510, textAlign: "center" }}><Big text="WHAT'S NEXT" size={124} face={FLASH} depth="#fff" /></div>
    <div style={{ position: "absolute", left: 60, right: 140, top: 1300, textAlign: "center" }}>
      <Banner rot={2}><div style={{ ...serif(150) }}>you <span style={{ color: FLASH }}>don't.</span></div></Banner>
    </div>
    <Grain amount={0.12} />
  </AbsoluteFill>
);
