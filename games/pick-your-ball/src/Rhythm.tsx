// Rhythm Strike preview: notes race down a neon highway to the beat; tap your desk as each one hits the line.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BPM, CHART, SONG_BEATS } from "./chart";
import { FONT } from "./fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
const SONG = 60, BEAT = (60 / BPM) * 30, APPROACH = 40, TOP = 520, HIT = 1500;
const END = SONG + Math.round(SONG_BEATS * BEAT);
export const RHYTHM_FRAMES = END + 75;
const LANE = ["#22d3ee", "#f472b6", "#ffd60a"];
const at = (b: number) => SONG + b * BEAT;
const lx = (lane: number, p: number) => 540 + (lane - 1) * (70 + 200 * p);

export const Rhythm: React.FC = () => {
  const f = useCurrentFrame();
  const beat = (f - SONG) / BEAT;
  const pulse = f >= SONG + 4 * BEAT && f < END ? Math.max(0, 1 - (beat % 1) * 3) : 0;
  const done = CHART.filter(([b]) => at(b) <= f).length;
  const hits = CHART.filter(([b]) => f >= at(b) && f < at(b) + 10);
  const P = (p: number) => Math.pow(p, 1.7);
  return (
    <AbsoluteFill style={{ background: `radial-gradient(circle at 50% 35%, rgba(120,60,255,${0.35 + 0.3 * pulse}) 0%, #07020f 70%)` }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d={`M ${540 - 130} ${TOP} L ${540 + 130} ${TOP} L ${540 + 470} ${HIT + 120} L ${540 - 470} ${HIT + 120} Z`} fill="rgba(255,255,255,0.04)" stroke="rgba(170,140,255,0.6)" strokeWidth={4} />
        {[0.5, 1.5].map((k) => <line key={k} x1={540 + (k - 1) * 70} y1={TOP} x2={540 + (k - 1) * 330} y2={HIT + 120} stroke="rgba(170,140,255,0.3)" strokeWidth={3} />)}
        {Array.from({ length: 8 }, (_, i) => { const p = ((i / 8 + (f / BEAT) / 8) % 1); const y = TOP + (HIT + 120 - TOP) * P(p); return <line key={i} x1={540 - 130 - 340 * P(p)} x2={540 + 130 + 340 * P(p)} y1={y} y2={y} stroke="rgba(170,140,255,0.15)" strokeWidth={2} />; })}
        {[0, 1, 2].map((l) => {
          const lit = hits.some(([, ln]) => ln === l);
          return <g key={l}>
            <circle cx={lx(l, 1)} cy={HIT} r={70} fill="none" stroke={LANE[l]} strokeWidth={lit ? 14 : 6} opacity={lit ? 1 : 0.6} style={{ filter: `drop-shadow(0 0 ${lit ? 30 : 10}px ${LANE[l]})` }} />
            {lit ? <circle cx={lx(l, 1)} cy={HIT} r={70} fill={LANE[l]} opacity={0.35} /> : null}
          </g>;
        })}
        {CHART.map(([b, l], i) => {
          const p = 1 - (at(b) - f) / APPROACH;
          if (p < 0 || p > 1.02) return null;
          const q = P(Math.min(1, p)), x = lx(l, q), y = TOP + (HIT - TOP) * q, r = 18 + 52 * q;
          return <g key={i}>
            <circle cx={x} cy={y} r={r * 1.6} fill={LANE[l]} opacity={0.18} />
            <circle cx={x} cy={y} r={r} fill={LANE[l]} stroke="#fff" strokeWidth={4 * q + 1} />
            <circle cx={x - r * 0.3} cy={y - r * 0.3} r={r * 0.25} fill="#fff" opacity={0.6} />
          </g>;
        })}
        {CHART.map(([b, l], i) => {
          const d = f - at(b); if (d < 0 || d > 16) return null; const t = d / 16;
          return <g key={i} opacity={1 - t}>{Array.from({ length: 10 }, (_, j) => { const a = (j / 10) * Math.PI * 2; return <circle key={j} cx={lx(l, 1) + Math.cos(a) * 130 * t} cy={HIT + Math.sin(a) * 130 * t} r={9 * (1 - t)} fill={LANE[l]} />; })}</g>;
        })}
      </svg>
      {hits.length ? <div style={{ position: "absolute", top: HIT + 130, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "#fff", textShadow: "0 0 30px #a855f7", transform: `scale(${pop(f, at(hits[0][0]), 6)})` }}>PERFECT</div> : null}
      {f < SONG ? (
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
          <div style={{ fontSize: 130, lineHeight: 0.95, transform: `scale(${pop(f, 0, 14)})`, textShadow: "0 0 40px #a855f7" }}>RHYTHM<br />STRIKE</div>
          <div style={{ fontSize: 44, color: "#ffd60a", marginTop: 24, opacity: pop(f, 12) }}>TAP YOUR DESK THE MOMENT<br />EACH NOTE HITS ITS RING</div>
        </div>
      ) : null}
      {f >= SONG && f < SONG + 4 * BEAT ? <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 260, color: "#fff", transform: `scale(${1.3 - 0.3 * pop(f, SONG + Math.floor(beat) * BEAT, 6)})` }}>{Math.floor(beat) + 1}</div> : null}
      {f >= SONG && f < END ? (
        <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
          <div style={{ fontSize: 34, letterSpacing: "0.25em", color: "#c4b5fd" }}>RHYTHM STRIKE · LEVEL 1</div>
          <div style={{ fontSize: 90, transform: `scale(${1 + 0.06 * pulse})` }}>{done}<span style={{ color: "#8b7fc7", fontSize: 60 }}> / {CHART.length} NOTES</span></div>
          <div style={{ fontSize: 32, color: "#ffd60a" }}>TAP YOUR DESK ON EVERY HIT</div>
        </div>
      ) : null}
      {f >= END ? (
        <AbsoluteFill style={{ background: `rgba(7,2,15,${0.8 * pop(f, END, 10)})`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 24, fontFamily: FONT, fontWeight: 800, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 110, transform: `scale(${pop(f, END, 12)})` }}>{CHART.length} NOTES</div>
          <div style={{ fontSize: 56, color: "#ffd60a", opacity: pop(f, END + 10) }}>HOW MANY DID YOU HIT?</div>
          <div style={{ fontSize: 40, opacity: pop(f, END + 20) }}>LEVEL 2: DOUBLE SPEED · COMMENT YOUR SCORE ↓</div>
        </AbsoluteFill>
      ) : null}
      <Sequence from={0} durationInFrames={40} layout="none"><Audio src={staticFile("sfx2/whoosh.wav")} volume={0.4} /></Sequence>
      <Sequence from={SONG} layout="none"><Audio src={staticFile("rhythm.wav")} volume={0.9} /></Sequence>
    </AbsoluteFill>
  );
};
