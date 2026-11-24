// Thumbnail options for "Why mosquitoes bite you": the blue serif explainer look (electric blue, gold, Newsreader serif,
// Inter Tight labels, grain), made to read at a glance on a phone feed. One composition per option.
import React from "react";
import { AbsoluteFill, Img, staticFile } from "remotion";
import { BLUE, BLUE_DEEP, FLASH, Grain } from "./kit";
import { SANS2, SERIF2 } from "./type";

const RED = "#ff3b3b";
const serif = (size: number): React.CSSProperties => ({ fontFamily: SERIF2, fontWeight: 500, fontSize: size, letterSpacing: "-0.045em", lineHeight: 0.84, color: "#fff" });
const lab: React.CSSProperties = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em", color: "#fff" };
const Photo: React.FC<{ src: string; pos?: string; filter?: string; scale?: number }> = ({ src, pos = "50% 50%", filter = "", scale = 1 }) => (
  <Img src={staticFile(`media/${src}`)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", objectPosition: pos, filter, transform: `scale(${scale})` }} />
);
const Person: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle cy={-60} r={42} fill={color} /><path d="M -70 90 C -70 -10, 70 -10, 70 90 Z" fill={color} /></g>
);

/** A: the blood-fed mosquito on skin, huge serif "you?" */
export const ThumbA: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <Photo src="m-bloodfed.jpg" pos="45% 50%" scale={1.05} filter="contrast(1.12) saturate(1.1)" />
    <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE_DEEP}f2 0%, ${BLUE}cc 34%, transparent 58%, transparent 70%, #000c 92%)` }} />
    <div style={{ position: "absolute", left: 70, top: 300, ...lab, fontSize: 46 }}>WHY DOES IT ALWAYS BITE</div>
    <div style={{ position: "absolute", left: 50, top: 380, ...serif(330), color: FLASH, textShadow: "0 10px 40px rgba(0,0,0,0.5)" }}>you?</div>
    <div style={{ position: "absolute", left: 0, right: 140, top: 1540, textAlign: "center", ...lab, fontSize: 40 }}>…AND NOT YOUR FRIEND</div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);

/** B: two people, one target. 5 bites vs 0. */
export const ThumbB: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 55%, ${BLUE} 0%, ${BLUE_DEEP} 80%)` }}>
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
      {[260, 190, 120].map((r, i) => <circle key={i} cx={330} cy={1120} r={r} fill="none" stroke={FLASH} strokeWidth={10 - i * 2} opacity={0.35 + i * 0.25} />)}
      <Person x={330} y={1150} s={1.6} color="#fff" />
      <Person x={760} y={1150} s={1.6} color="rgba(255,255,255,0.45)" />
      {[[-40, 1110], [30, 1170], [-10, 1230], [55, 1080], [-60, 1200]].map(([dx, y], i) => <circle key={i} cx={330 + dx} cy={y} r={14} fill={RED} stroke="#fff" strokeWidth={4} />)}
    </svg>
    <div style={{ position: "absolute", left: 210, top: 1420, ...serif(200), color: FLASH }}>5</div>
    <div style={{ position: "absolute", left: 690, top: 1420, ...serif(200), color: "rgba(255,255,255,0.6)" }}>0</div>
    <div style={{ position: "absolute", left: 230, top: 1620, ...lab, fontSize: 30, color: FLASH }}>BITES</div>
    <div style={{ position: "absolute", left: 700, top: 1620, ...lab, fontSize: 30, color: "rgba(255,255,255,0.6)" }}>BITES</div>
    <div style={{ position: "absolute", left: 0, right: 0, top: 260, textAlign: "center" }}>
      <div style={{ ...lab, fontSize: 44 }}>SAME NIGHT. SAME CHAIR.</div>
      <div style={{ ...serif(190), marginTop: 30 }}>It picks <span style={{ color: FLASH }}>you.</span></div>
    </div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);

/** C: the myth-buster: "It's not your blood." */
export const ThumbC: React.FC = () => (
  <AbsoluteFill style={{ background: BLUE }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 820, height: 1100, overflow: "hidden" }}>
      <Photo src="m-striped.jpg" pos="40% 50%" filter="contrast(1.1)" />
      <AbsoluteFill style={{ background: `linear-gradient(180deg, ${BLUE} 0%, transparent 25%)` }} />
    </div>
    <div style={{ position: "absolute", left: 70, top: 230 }}>
      <div style={{ ...serif(170) }}>It's not your</div>
      <div style={{ position: "relative", display: "inline-block", ...serif(250), marginTop: 10 }}>
        blood.
        <div style={{ position: "absolute", left: -10, right: -20, top: "52%", height: 22, background: RED, transform: "rotate(-4deg)", borderRadius: 11 }} />
      </div>
      <div style={{ ...lab, fontSize: 54, color: FLASH, marginTop: 40, transform: "rotate(-3deg)" }}>IT'S YOUR SKIN →</div>
    </div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);

/** D: the study proof: "Mosquito MAGNETS" with a highlighted paper line and a photo inset. */
export const ThumbD: React.FC = () => (
  <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 40%, ${BLUE} 0%, ${BLUE_DEEP} 85%)` }}>
    <div style={{ position: "absolute", left: 0, right: 0, top: 210, textAlign: "center" }}>
      <div style={{ ...lab, fontSize: 42 }}>SCIENCE FOUND OUT WHY SOME PEOPLE ARE</div>
      <div style={{ ...serif(210), marginTop: 30 }}>mosquito</div>
      <div style={{ ...serif(260), color: FLASH, marginTop: 10 }}>magnets</div>
    </div>
    <div style={{ position: "absolute", left: 130, top: 1000, width: 820, height: 640, background: "#fbfaf7", transform: "rotate(-3deg)", boxShadow: "0 40px 80px rgba(0,0,0,0.45)", padding: "50px 54px" }}>
      <div style={{ fontFamily: SANS2, fontWeight: 800, fontSize: 24, letterSpacing: "0.18em", color: "#b0362c" }}>CELL · 2022</div>
      <div style={{ position: "relative", marginTop: 20, fontFamily: SERIF2, fontSize: 54, lineHeight: 1.08, color: "#1a1a1a" }}>
        <div style={{ position: "absolute", left: -8, top: 4, width: "104%", height: 126, background: FLASH, opacity: 0.85 }} />
        <span style={{ position: "relative" }}>Differential mosquito attraction to humans…</span>
      </div>
      {Array.from({ length: 6 }, (_, i) => <div key={i} style={{ height: 12, width: `${90 - (i % 3) * 12}%`, background: "#ddd", borderRadius: 6, marginTop: 22 }} />)}
    </div>
    <div style={{ position: "absolute", right: 70, top: 1330, width: 380, height: 380, borderRadius: 190, overflow: "hidden", border: `12px solid ${FLASH}`, boxShadow: "0 30px 60px rgba(0,0,0,0.5)" }}>
      <Photo src="m-bloodfed.jpg" pos="45% 50%" scale={1.4} />
    </div>
    <Grain amount={0.14} />
  </AbsoluteFill>
);
