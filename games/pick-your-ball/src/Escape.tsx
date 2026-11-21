// Escape the Room preview: the camera tours a room; four digits are hidden in it. Pause to search, then the code.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
// camera keyframes: [frame, x, y, zoom]
const CAM: [number, number, number, number][] = [[50, 540, 960, 1], [80, 540, 960, 1], [100, 812, 905, 3.2], [140, 812, 905, 3.2], [160, 250, 460, 3], [200, 250, 460, 3], [220, 540, 430, 2.6], [260, 540, 430, 2.6], [280, 230, 1010, 2.3], [320, 230, 1010, 2.3], [340, 560, 1640, 2.1], [380, 560, 1640, 2.1], [400, 540, 960, 1]];
const ASK = 405, REVEAL = 495;
export const ESCAPE_FRAMES = 600;
const CODE = [7, 3, 9, 1];
const cam = (f: number) => {
  let i = CAM.findIndex((k) => k[0] > f); if (i <= 0) i = i === 0 ? 1 : CAM.length - 1;
  const a = CAM[i - 1], b = CAM[i], k = Easing.inOut(Easing.cubic)(Math.max(0, Math.min(1, (f - a[0]) / (b[0] - a[0]))));
  return [a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k, a[3] + (b[3] - a[3]) * k];
};

const Room: React.FC<{ open: number }> = ({ open }) => (
  <g>
    <rect width={1080} height={1300} fill="url(#wall)" />
    <rect y={1300} width={1080} height={620} fill="#4a2f1d" />
    {Array.from({ length: 9 }, (_, i) => <line key={i} x1={0} x2={1080} y1={1300 + i * 70} y2={1300 + i * 70} stroke="#3a2314" strokeWidth={4} />)}
    {/* clock: hour hand on 7, minute hand on 12 */}
    <g transform="translate(250 460)">
      <circle r={95} fill="#f3ead7" stroke="#2a1a10" strokeWidth={12} />
      {Array.from({ length: 12 }, (_, i) => { return <rect key={i} x={-3} y={-82} width={6} height={14} fill="#2a1a10" transform={`rotate(${i * 30})`} />; })}
      <rect x={-5} y={-55} width={10} height={55} rx={4} fill="#2a1a10" transform="rotate(210)" />
      <rect x={-3} y={-78} width={6} height={78} rx={3} fill="#2a1a10" />
      <circle r={8} fill="#b8862b" />
    </g>
    {/* painting: a faint 3 hidden in the clouds */}
    <g transform="translate(410 330)">
      <rect width={260} height={190} fill="#c9a86a" stroke="#7a5320" strokeWidth={14} />
      <rect x={10} y={10} width={240} height={170} fill="#8fb8de" />
      <path d="M 10 180 L 80 90 L 130 140 L 190 70 L 250 180 Z" fill="#4c6b4f" />
      <ellipse cx={70} cy={45} rx={34} ry={14} fill="#eef5fb" /><ellipse cx={185} cy={40} rx={40} ry={15} fill="#eef5fb" />
      <text x={190} y={52} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#cfdcea" textAnchor="middle">3</text>
    </g>
    {/* bookshelf: red book with a 9 on its spine */}
    <g transform="translate(80 720)">
      <rect width={300} height={580} fill="#5b3a22" stroke="#2e1a0d" strokeWidth={10} />
      {[0, 1, 2].map((s) => <rect key={s} x={0} y={180 + s * 190} width={300} height={14} fill="#2e1a0d" />)}
      {[0, 1, 2].map((s) => Array.from({ length: 8 }, (_, i) => {
        const red = s === 1 && i === 4, h = 120 + ((i * 37 + s * 11) % 45);
        return <g key={s + "-" + i}><rect x={14 + i * 34} y={180 + s * 190 - h} width={30} height={h} fill={red ? "#b3261e" : ["#2f4858", "#86744f", "#33658a", "#55a630", "#6d597a", "#e0a458", "#3d405b", "#81b29a"][(i + s) % 8]} />
          {red ? <text x={29 + i * 34} y={180 + s * 190 - h / 2 + 10} fontFamily={FONT} fontWeight={800} fontSize={26} fill="#f6d36b" textAnchor="middle">9</text> : null}</g>;
      }))}
    </g>
    {/* door with keypad and a note */}
    <g transform="translate(690 640)">
      <rect width={250} height={660} fill="#2b1a10" />
      <g transform={`translate(0 0) scale(${1 - 0.85 * open} 1)`}><rect width={250} height={660} fill="#6b4226" stroke="#3a2314" strokeWidth={8} />
        <rect x={30} y={40} width={190} height={250} fill="none" stroke="#3a2314" strokeWidth={6} /><rect x={30} y={340} width={190} height={280} fill="none" stroke="#3a2314" strokeWidth={6} />
        <rect x={90} y={230} width={80} height={60} fill="#f5f0e1" transform="rotate(-4 130 260)" />
        <text x={130} y={252} fontFamily={FONT} fontWeight={700} fontSize={8.5} fill="#333" textAnchor="middle" transform="rotate(-4 130 260)">CODE ORDER:</text>
        <text x={130} y={266} fontFamily={FONT} fontWeight={700} fontSize={7.5} fill="#333" textAnchor="middle" transform="rotate(-4 130 260)">CLOCK · PAINTING</text>
        <text x={130} y={278} fontFamily={FONT} fontWeight={700} fontSize={7.5} fill="#333" textAnchor="middle" transform="rotate(-4 130 260)">BOOKS · RUG</text>
        <rect x={200} y={330} width={36} height={60} rx={6} fill="#1a1a1a" /><circle cx={218} cy={345} r={4} fill="#ff3b3b" />
      </g>
      {open > 0 ? <rect width={250} height={660} fill="#fff6d6" opacity={open * 0.9} /> : null}
    </g>
    {/* rug with a 1 in one diamond */}
    <g transform="translate(560 1640)">
      <ellipse rx={360} ry={150} fill="#7a1f2b" stroke="#d9a441" strokeWidth={10} />
      {Array.from({ length: 7 }, (_, i) => <path key={i} transform={`translate(${(i - 3) * 90} 0)`} d="M 0 -50 L 32 0 L 0 50 L -32 0 Z" fill="none" stroke="#d9a441" strokeWidth={5} />)}
      <text x={180} y={12} fontFamily={FONT} fontWeight={800} fontSize={30} fill="#d9a441" textAnchor="middle">1</text>
    </g>
  </g>
);

export const Escape: React.FC = () => {
  const f = useCurrentFrame();
  const [cx, cy, z] = cam(Math.min(f, 400));
  const open = interpolate(f, [REVEAL + 70, REVEAL + 90], [0, 1], clamp);
  const timer = Math.max(0, 15 - Math.floor((f - 80) / 21));
  const typed = Math.max(0, Math.min(4, Math.floor((f - REVEAL) / 14)));
  const sfx: [number, string, number][] = [[0, "whoosh", 0.4], ...CAM.slice(1).map(([a]): [number, string, number] => [a - 20, "whoosh-film", 0.2]),
    ...Array.from({ length: 15 }, (_, i): [number, string, number] => [80 + i * 21, "marker", 0.18]), [ASK, "riser", 0.35],
    ...[0, 1, 2, 3].map((i): [number, string, number] => [REVEAL + 14 * (i + 1), "pop", 0.4]), [REVEAL + 70, "chime", 0.6]];
  const cd = 3 - Math.floor((f - ASK - 10) / 27);
  return (
    <AbsoluteFill style={{ background: "#0d0805", overflow: "hidden" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <defs><linearGradient id="wall" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stopColor="#3d3a4f" /><stop offset="1" stopColor="#5c4b3f" /></linearGradient>
          <radialGradient id="vig"><stop offset="0.55" stopColor="#000" stopOpacity={0} /><stop offset="1" stopColor="#000" stopOpacity={0.75} /></radialGradient></defs>
        <g transform={`translate(${540 - cx * z} ${960 - cy * z}) scale(${z})`}><Room open={open} /></g>
        <rect width={1080} height={1920} fill="url(#vig)" />
      </svg>
      {f < 55 ? (
        <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff", opacity: interpolate(f, [45, 55], [1, 0], clamp), textShadow: "0 4px 30px #000" }}>
          <div style={{ fontSize: 130, lineHeight: 0.95, transform: `scale(${pop(f, 0, 14)})` }}>ESCAPE<br />THE ROOM</div>
          <div style={{ fontSize: 46, color: "#ffd60a", marginTop: 24, opacity: pop(f, 10) }}>FIND THE 4-DIGIT CODE</div>
          <div style={{ fontSize: 36, marginTop: 12, opacity: pop(f, 18) }}>PAUSE ANYTIME TO SEARCH</div>
        </div>
      ) : null}
      {f >= 80 && f < ASK ? (
        <div style={{ position: "absolute", top: 210, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: timer <= 5 ? "#ff3b3b" : "#fff", textShadow: "0 4px 20px #000" }}>
          <div style={{ fontSize: 30, letterSpacing: "0.25em", color: "#ffd60a" }}>TIME LEFT</div>
          <div style={{ fontSize: 120, fontVariantNumeric: "tabular-nums" }}>0:{String(timer).padStart(2, "0")}</div>
        </div>
      ) : null}
      {f >= ASK ? (
        <AbsoluteFill style={{ background: `rgba(10,6,4,${0.75 * pop(f, ASK, 10)})`, alignItems: "center", paddingTop: 330, fontFamily: FONT, fontWeight: 800, color: "#fff", textAlign: "center" }}>
          <div style={{ fontSize: 96, transform: `scale(${pop(f, ASK, 12)})` }}>{f < REVEAL ? "WHAT'S THE CODE?" : f < REVEAL + 70 ? "THE CODE IS…" : "YOU ESCAPED!"}</div>
          <div style={{ display: "flex", gap: 24, marginTop: 50 }}>
            {CODE.map((d, i) => <div key={i} style={{ width: 150, height: 190, borderRadius: 20, background: "#1d1712", border: `6px solid ${i < typed ? "#4ade80" : "#ffd60a"}`, fontSize: 130, lineHeight: "180px", color: "#4ade80" }}>{i < typed ? d : ""}</div>)}
          </div>
          {f < REVEAL && cd >= 1 && cd <= 3 ? <div style={{ fontSize: 44, color: "#ffd60a", marginTop: 50 }}>PAUSE & COMMENT YOUR CODE · {cd}</div> : null}
          {f >= REVEAL ? <div style={{ fontSize: 34, marginTop: 50, color: "#d6c6a8", opacity: pop(f, REVEAL + 60) }}>CLOCK 7 · CLOUDS 3 · RED BOOK 9 · RUG 1</div> : null}
          {f >= REVEAL + 90 ? <div style={{ fontSize: 40, marginTop: 30, color: "#ffd60a", opacity: pop(f, REVEAL + 90) }}>ROOM 2: THE CODE HAS 6 DIGITS</div> : null}
        </AbsoluteFill>
      ) : null}
      {sfx.map(([at, s, v], i) => <Sequence key={i} from={at} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx2/${s}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
