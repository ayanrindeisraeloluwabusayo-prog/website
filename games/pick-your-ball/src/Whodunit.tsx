// Whodunit preview: someone ate the cake. Four suspects, four alibis, one lie you can spot. Pause, accuse, reveal.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
const SCENE = 50, LINE = 120, STEP = 48, ASK = LINE + 4 * STEP + 10, REVEAL = ASK + 90;
export const WHO_FRAMES = REVEAL + 170;
const X = [165, 405, 645, 885], FLOOR = 1450;
type Who = { name: string; line: string; skin: string; body: string; legs: string; shoe: string; hat?: string };
const CAST: Who[] = [
  { name: "THE CHEF", line: "I was baking bread all morning.", skin: "#8d5524", body: "#f5f5f5", legs: "#3a3a3a", shoe: "#222", hat: "chef" },
  { name: "THE GARDENER", line: "I was working outside in the rain all morning.", skin: "#c68642", body: "#3f7d3a", legs: "#3f7d3a", shoe: "#ffd60a", hat: "none" },
  { name: "THE BUTLER", line: "I was polishing silver in the dining room.", skin: "#5c3a1e", body: "#1c1c22", legs: "#1c1c22", shoe: "#111", hat: "none" },
  { name: "THE KID", line: "I was asleep in my room. Honest.", skin: "#a0522d", body: "#5b8def", legs: "#5b8def", shoe: "#eee", hat: "cap" },
];

const Person: React.FC<{ w: Who; i: number }> = ({ w, i }) => (
  <g>
    <rect x={-34} y={-150} width={28} height={150} rx={8} fill={w.legs} /><rect x={6} y={-150} width={28} height={150} rx={8} fill={w.legs} />
    {i === 1 ? <><rect x={-40} y={-60} width={38} height={62} rx={8} fill={w.shoe} /><rect x={2} y={-60} width={38} height={62} rx={8} fill={w.shoe} /><path d="M -32 -50 L -28 -10" stroke="#fff" strokeWidth={5} opacity={0.8} /><path d="M 10 -50 L 14 -10" stroke="#fff" strokeWidth={5} opacity={0.8} /></>
      : <><ellipse cx={-22} cy={-4} rx={26} ry={12} fill={w.shoe} /><ellipse cx={22} cy={-4} rx={26} ry={12} fill={w.shoe} /></>}
    <path d="M -60 -150 L 60 -150 L 52 -330 Q 0 -350 -52 -330 Z" fill={w.body} stroke="rgba(0,0,0,0.2)" strokeWidth={3} />
    {i === 0 ? <path d="M -30 -320 L 30 -320 L 36 -160 L -36 -160 Z" fill="#e8e8e8" /> : null}
    {i === 1 ? <><rect x={-40} y={-330} width={14} height={60} fill="#2f5e2b" /><rect x={26} y={-330} width={14} height={60} fill="#2f5e2b" /></> : null}
    {i === 2 ? <path d="M -18 -330 L 0 -318 L 18 -330 L 18 -306 L 0 -318 L -18 -306 Z" fill="#b3261e" /> : null}
    <rect x={-80} y={-325} width={26} height={140} rx={12} fill={w.body} transform="rotate(8 -67 -325)" /><rect x={54} y={-325} width={26} height={140} rx={12} fill={w.body} transform="rotate(-8 67 -325)" />
    <circle cx={-84} cy={-180} r={16} fill={w.skin} /><circle cx={84} cy={-180} r={16} fill={w.skin} />
    <circle cy={-400} r={62} fill={w.skin} />
    <circle cx={-20} cy={-405} r={7} fill="#111" /><circle cx={20} cy={-405} r={7} fill="#111" />
    <path d={i === 3 ? "M -14 -372 Q 0 -360 14 -372" : "M -16 -372 Q 0 -364 16 -372"} stroke="#111" strokeWidth={5} fill="none" strokeLinecap="round" />
    {w.hat === "chef" ? <path d="M -50 -450 Q -70 -520 -20 -515 Q 0 -555 25 -515 Q 72 -520 50 -450 Z" fill="#fff" stroke="#ddd" strokeWidth={3} /> : null}
    {w.hat === "cap" ? <><path d="M -60 -425 Q 0 -500 60 -425 Z" fill="#ff3b3b" /><rect x={30} y={-432} width={60} height={12} rx={6} fill="#ff3b3b" /></> : null}
    {i === 1 || i === 2 ? <path d="M -60 -420 Q 0 -485 60 -420 Q 40 -450 0 -455 Q -40 -450 -60 -420 Z" fill="#1a1a1a" /> : null}
  </g>
);

export const Whodunit: React.FC = () => {
  const f = useCurrentFrame();
  const speaker = f >= LINE && f < LINE + 4 * STEP ? Math.floor((f - LINE) / STEP) : -1;
  const zoom = f >= REVEAL ? interpolate(f, [REVEAL + 10, REVEAL + 40], [1, 2.1], { ...clamp, easing: Easing.inOut(Easing.cubic) }) : 1;
  const k = (zoom - 1) / 1.1;
  const sfx: [number, string, number][] = [[0, "whoosh", 0.4], [SCENE, "shiver", 0.35], ...[0, 1, 2, 3].map((i): [number, string, number] => [LINE + i * STEP, "pop", 0.35]), [ASK, "riser", 0.35], [ASK + 30, "marker", 0.5], [ASK + 60, "marker", 0.5], [REVEAL, "subdrop", 0.6], [REVEAL + 40, "spark", 0.5], [REVEAL + 100, "chime", 0.5]];
  const cd = 3 - Math.floor((f - ASK) / 30);
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2a2438 0%, #3d3350 55%, #2b2118 55%, #1c140e 100%)", overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform={`translate(${540 - (540 + (X[1] - 540) * k) * zoom} ${960 - (960 + 290 * k) * zoom}) scale(${zoom})`}>
          <g>
            <rect x={700} y={420} width={300} height={360} fill="#1b2a3d" stroke="#6b5640" strokeWidth={16} />
            <line x1={850} x2={850} y1={420} y2={780} stroke="#6b5640" strokeWidth={10} /><line x1={700} x2={1000} y1={600} y2={600} stroke="#6b5640" strokeWidth={10} />
            {Array.from({ length: 30 }, (_, i) => { const x = 710 + ((i * 47) % 285), y = 430 + ((i * 89 + f * 22) % 340); return <line key={i} x1={x} y1={y} x2={x - 6} y2={y + 26} stroke="#9fc3ff" strokeWidth={3} opacity={0.7} />; })}
            <rect x={90} y={760} width={420} height={30} rx={6} fill="#6b4a33" />
            <ellipse cx={300} cy={752} rx={110} ry={20} fill="#f2f2f2" stroke="#ccc" strokeWidth={4} />
            {[[-40, -4], [10, 2], [52, -6], [-70, 4], [30, 8]].map(([dx, dy], i) => <circle key={i} cx={300 + dx} cy={748 + dy} r={5} fill="#c48a5a" />)}
            {CAST.map((w, i) => {
              const s = speaker === i ? 1.12 : 1, dim = speaker >= 0 && speaker !== i ? 0.45 : 1;
              return <g key={i} transform={`translate(${X[i]} ${FLOOR}) scale(${0.95 * s * pop(f, LINE - 30 + i * 4, 10)})`} opacity={dim}><Person w={w} i={i} /></g>;
            })}
            {f >= REVEAL + 40 ? <><ellipse cx={X[1]} cy={FLOOR - 30} rx={70} ry={50} fill="none" stroke="#ff2d55" strokeWidth={6} opacity={pop(f, REVEAL + 40)} />
              {f >= REVEAL + 100 ? <circle cx={X[1]} cy={FLOOR - 410} r={82} fill="none" stroke="#ff2d55" strokeWidth={6} opacity={pop(f, REVEAL + 100)} /> : null}</> : null}
          </g>
        </g>
      </svg>
      {f < SCENE ? (
        <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff", opacity: interpolate(f, [40, 50], [1, 0], clamp) }}>
          <div style={{ fontSize: 140, transform: `scale(${pop(f, 0, 14)})`, textShadow: "0 0 40px #a855f7" }}>WHODUNIT?</div>
          <div style={{ fontSize: 50, color: "#ffd60a", marginTop: 20, opacity: pop(f, 10) }}>SOMEONE ATE THE BIRTHDAY CAKE</div>
        </div>
      ) : null}
      {f >= SCENE && f < LINE ? <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 56, color: "#fff", opacity: pop(f, SCENE) }}>IT RAINED ALL MORNING.<br /><span style={{ color: "#ffd60a" }}>THE CAKE IS GONE.</span></div> : null}
      {speaker >= 0 ? (
        <div style={{ position: "absolute", top: 220, left: 70, right: 70, fontFamily: FONT, fontWeight: 800, color: "#111", background: "#fff", borderRadius: 30, padding: "30px 40px", textAlign: "center", transform: `scale(${pop(f, LINE + speaker * STEP, 8)})` }}>
          <div style={{ fontSize: 34, color: "#a855f7", letterSpacing: "0.15em" }}>{CAST[speaker].name}</div>
          <div style={{ fontSize: 54, marginTop: 8 }}>"{CAST[speaker].line}"</div>
        </div>
      ) : null}
      {f >= ASK && f < REVEAL ? (
        <>
          <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
            <div style={{ fontSize: 96, transform: `scale(${pop(f, ASK, 12)})` }}>WHO DID IT?</div>
            <div style={{ fontSize: 40, color: "#ffd60a" }}>ONE OF THEM IS LYING. PAUSE & ACCUSE</div>
            {cd >= 1 && cd <= 3 ? <div style={{ fontSize: 150, color: "#ff2d55" }}>{cd}</div> : null}
          </div>
          {X.map((x, i) => <div key={i} style={{ position: "absolute", left: x - 50, top: FLOOR + 40, width: 100, textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 80, color: "#fff", opacity: pop(f, ASK + i * 4) }}>{i + 1}</div>)}
        </>
      ) : null}
      {f >= REVEAL ? (
        <div style={{ position: "absolute", top: 200, left: 60, right: 60, textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff", textShadow: "0 4px 20px #000" }}>
          <div style={{ fontSize: 100, color: "#ff2d55", transform: `scale(${pop(f, REVEAL, 12)})` }}>THE GARDENER!</div>
          {f >= REVEAL + 40 ? <div style={{ fontSize: 40, marginTop: 16, opacity: pop(f, REVEAL + 40) }}>"OUTSIDE IN THE RAIN ALL MORNING"…<br />BUT HIS BOOTS ARE <span style={{ color: "#ffd60a" }}>SPOTLESS</span></div> : null}
          {f >= REVEAL + 100 ? <div style={{ fontSize: 46, marginTop: 16, opacity: pop(f, REVEAL + 100) }}>AND HIS HAIR IS <span style={{ color: "#ffd60a" }}>BONE DRY</span>.</div> : null}
          {f >= REVEAL + 130 ? <div style={{ fontSize: 38, marginTop: 24, color: "#c4b5fd", opacity: pop(f, REVEAL + 130) }}>DID YOU GET IT? CASE 2 IS HARDER ↓</div> : null}
        </div>
      ) : null}
      {sfx.map(([at, s, v], i) => <Sequence key={i} from={at} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx2/${s}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
