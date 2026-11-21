// Shell Game preview: follow the gold ball under three cups. Swaps get faster; pause and guess; reveal.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
const ease = Easing.inOut(Easing.cubic);
const SLOT = [270, 540, 810], Y = 1180;
const SWAPS: [number, number][] = [[1, 2], [0, 1], [0, 2], [1, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2], [0, 2], [0, 1], [1, 2]];
const DUR = [18, 17, 15, 14, 12, 11, 10, 9, 8, 7, 7, 6];
const T0 = 95;
// cup -> slot over time
const plan = (() => {
  let slots = [0, 1, 2]; let t = T0; const steps: { a: number; b: number; t: number; d: number; before: number[] }[] = [];
  SWAPS.forEach(([sa, sb], i) => {
    const before = slots.slice(); steps.push({ a: before.indexOf(sa), b: before.indexOf(sb), t, d: DUR[i], before });
    slots = before.map((s) => (s === sa ? sb : s === sb ? sa : s)); t += DUR[i] + 2;
  });
  return { steps, end: t, final: slots };
})();
export const SHELL_FRAMES = plan.end + 150;
const BALL_CUP = 1;
const ASK = plan.end + 8, REVEAL = ASK + 90;

const cupPos = (f: number, c: number) => {
  let slots = [0, 1, 2];
  for (const s of plan.steps) {
    if (f < s.t) break;
    const k = ease(Math.min(1, (f - s.t) / s.d));
    const from = s.before[c];
    if (c === s.a || c === s.b) {
      const to = c === s.a ? s.before[s.b] : s.before[s.a];
      const x = SLOT[from] + (SLOT[to] - SLOT[from]) * k;
      const lift = Math.sin(k * Math.PI) * (c === s.a ? -90 : 60);
      if (k < 1) return { x, y: Y + lift, z: c === s.a ? 0 : 1 };
    }
    slots = s.before.map((sl) => (sl === s.before[s.a] ? s.before[s.b] : sl === s.before[s.b] ? s.before[s.a] : sl));
  }
  return { x: SLOT[slots[c]], y: Y, z: 1 };
};

const Cup: React.FC<{ x: number; y: number; lift: number; glow?: boolean }> = ({ x, y, lift, glow }) => (
  <g transform={`translate(${x} ${y - lift})`}>
    <path d="M -110 0 L -78 -230 Q 0 -250 78 -230 L 110 0 Q 0 22 -110 0 Z" fill="url(#cup)" stroke={glow ? "#ffd60a" : "#5a1020"} strokeWidth={glow ? 8 : 4} />
    <path d="M -110 0 Q 0 22 110 0 Q 0 38 -110 0 Z" fill="#3a0a14" />
    <path d="M -70 -215 Q -60 -120 -88 -20" stroke="#fff" strokeWidth={10} opacity={0.25} fill="none" strokeLinecap="round" />
    {[-150, -95].map((yy) => <path key={yy} d={`M ${-95 + (yy + 230) * 0.1} ${yy} Q 0 ${yy + 16} ${95 - (yy + 230) * 0.1} ${yy}`} stroke="#ffd60a" strokeWidth={6} fill="none" opacity={0.8} />)}
  </g>
);

export const Shell: React.FC = () => {
  const f = useCurrentFrame();
  const drop = interpolate(f, [55, 75], [320, 0], { ...clamp, easing: Easing.bounce });
  const lift = f >= REVEAL ? interpolate(f, [REVEAL, REVEAL + 14], [0, 260], { ...clamp, easing: Easing.out(Easing.cubic) }) : f < 75 ? drop : 0;
  const round = plan.steps.findIndex((s) => f < s.t + s.d);
  const speed = round < 0 ? 12 : round + 1;
  const ballCup = cupPos(f, BALL_CUP);
  const sfx: [number, string, number][] = [[0, "whoosh", 0.4], [70, "drop", 0.5], ...plan.steps.map((s): [number, string, number] => [s.t, "whoosh-film", 0.25]), [ASK, "riser", 0.35], [ASK + 30, "marker", 0.5], [ASK + 60, "marker", 0.5], [REVEAL - 2, "marker", 0.5], [REVEAL + 4, "chime", 0.6]];
  const cd = 3 - Math.floor((f - ASK - 6) / 30);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #3b0d18 0%, #12030a 75%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs>
          <linearGradient id="cup" x1="0" x2="1"><stop offset="0" stopColor="#8f1d33" /><stop offset="0.45" stopColor="#d23a55" /><stop offset="1" stopColor="#6d1426" /></linearGradient>
          <radialGradient id="ball"><stop offset="0" stopColor="#fff6c2" /><stop offset="0.5" stopColor="#ffd60a" /><stop offset="1" stopColor="#b07d00" /></radialGradient>
        </defs>
        <ellipse cx={540} cy={1230} rx={520} ry={170} fill="#0d4d2f" stroke="#ffd60a" strokeWidth={4} opacity={0.95} />
        <ellipse cx={540} cy={1230} rx={480} ry={140} fill="none" stroke="#ffffff" strokeOpacity={0.08} strokeWidth={2} />
        {[0, 1, 2].map((c) => { const p = c === BALL_CUP ? ballCup : cupPos(f, c); return <ellipse key={c} cx={p.x} cy={Y + 16} rx={120} ry={22} fill="#000" opacity={0.35} />; })}
        {(f < 75 || f >= REVEAL) ? <circle cx={f >= REVEAL ? ballCup.x : SLOT[1]} cy={Y - 40} r={40} fill="url(#ball)" style={{ filter: "drop-shadow(0 0 25px #ffd60a)" }} /> : null}
        {[0, 1, 2].map((c) => cupPos(f, c)).map((p, c) => ({ p, c })).sort((a, b) => a.p.z - b.p.z).map(({ p, c }) => (
          <Cup key={c} x={p.x} y={p.y} lift={lift} glow={f >= REVEAL && c === BALL_CUP} />
        ))}
      </svg>
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 120, lineHeight: 0.95, color: "#fff", transform: `scale(${pop(f, 0, 14)})`, opacity: interpolate(f, [T0 - 10, T0], [1, 0], clamp), textShadow: "0 0 40px rgba(255,80,110,0.8)" }}>SHELL GAME<div style={{ fontSize: 56, color: "#ffd60a", marginTop: 20 }}>FOLLOW THE GOLD BALL</div></div>
      {f >= T0 && f < ASK ? (
        <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
          <div style={{ fontSize: 40, letterSpacing: "0.2em", color: "#ff6b88" }}>SPEED</div>
          <div style={{ fontSize: 150, lineHeight: 1 }}>{"▮".repeat(Math.min(12, speed))}<span style={{ opacity: 0.2 }}>{"▮".repeat(12 - Math.min(12, speed))}</span></div>
          <div style={{ fontSize: 44, marginTop: 30, color: "#ffd60a" }}>DON'T BLINK</div>
        </div>
      ) : null}
      {f >= ASK && f < REVEAL ? (
        <>
          <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 100, color: "#fff", transform: `scale(${pop(f, ASK, 12)})` }}>WHICH CUP?</div>
          <div style={{ position: "absolute", top: 440, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "#ffd60a" }}>TAP TO PAUSE · LOCK IN YOUR ANSWER</div>
          {SLOT.map((x, i) => <div key={i} style={{ position: "absolute", left: x - 60, top: 1420, width: 120, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 90, color: "#fff", opacity: pop(f, ASK + 6 + i * 4) }}>{i + 1}</div>)}
          {cd >= 1 && cd <= 3 ? <div style={{ position: "absolute", top: 640, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 200, color: "#ff2d55", transform: `scale(${1.3 - 0.3 * pop(f, ASK + 6 + (3 - cd) * 30, 8)})` }}>{cd}</div> : null}
        </>
      ) : null}
      {f >= REVEAL ? (
        <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
          <div style={{ fontSize: 110, transform: `scale(${pop(f, REVEAL + 6, 12)})` }}>CUP {SLOT.indexOf(ballCup.x) + 1}!</div>
          <div style={{ fontSize: 48, color: "#ffd60a", opacity: pop(f, REVEAL + 20) }}>GOT IT? NEXT ROUND: 5 CUPS</div>
        </div>
      ) : null}
      {sfx.map(([at, s, v], i) => <Sequence key={i} from={at} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx2/${s}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
