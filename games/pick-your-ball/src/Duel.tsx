// Quick Draw preview: tap the screen the moment you see FIRE. Tapping pauses the video on your time,
// and the frozen frame tells you if you beat him. A fake-out ("FIRE-WORKS") catches the twitchy ones.
import React from "react";
import { AbsoluteFill, Audio, Easing, interpolate, Sequence, staticFile, useCurrentFrame } from "remotion";
import { FONT } from "./fonts";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
const FAKE = 110, STEADY = 150, FIRE = 190, HIS = 11, NEXT = 240;
export const DUEL_FRAMES = 290;

const Outlaw: React.FC<{ drawn: number; f: number }> = ({ drawn, f }) => {
  const sway = Math.sin(f / 18) * 2;
  return (
    <g transform={`translate(540 ${1235 + sway}) scale(1.25)`} fill="#14080c">
      <rect x={-34} y={150} width={26} height={170} rx={8} /><rect x={8} y={150} width={26} height={170} rx={8} />
      <path d="M -70 0 L 70 0 L 60 170 L -60 170 Z" />
      <path d="M -95 10 Q 0 -20 95 10 L 75 120 L -75 120 Z" fill="#2a0f16" />
      <circle cy={-40} r={36} />
      <ellipse cy={-62} rx={95} ry={14} /><path d="M -45 -64 Q -40 -120 0 -118 Q 40 -120 45 -64 Z" />
      <rect x={58} y={100} width={22} height={60} rx={6} fill="#3a1a20" />
      <g transform={`rotate(${-75 * drawn} 70 30)`}><rect x={60} y={20} width={24} height={110} rx={10} /><rect x={58} y={118} width={56} height={16} rx={4} transform={`rotate(${90 * drawn} 72 126)`} /></g>
      {drawn > 0.9 ? <circle cx={20} cy={-10} r={60 * Math.max(0, 1 - (f - FIRE - HIS) / 6)} fill="#ffd60a" /> : null}
    </g>
  );
};

export const Duel: React.FC = () => {
  const f = useCurrentFrame();
  const drawn = interpolate(f, [FIRE + HIS - 3, FIRE + HIS], [0, 1], clamp);
  const t = Math.max(0, (f - FIRE) / 30);
  const faster = f >= FIRE && f < FIRE + HIS, dead = f >= FIRE + HIS && f < NEXT;
  const flash = f >= FIRE ? Math.max(0, 1 - (f - FIRE) / 8) : 0;
  const bang = dead ? Math.max(0, 1 - (f - FIRE - HIS) / 12) : 0;
  const sfx: [number, string, number][] = [[0, "whoosh", 0.4], ...[60, 80, 100, 125, 145, 165, 180].map((a): [number, string, number] => [a, "marker", 0.35]),
    [FAKE, "firework", 0.6], [FIRE, "wave-hit", 0.7], [FIRE + HIS, "drop", 0.8], [FIRE + HIS, "glitch-a", 0.5], [NEXT, "riser", 0.4]];
  return (
    <AbsoluteFill style={{ background: "linear-gradient(180deg, #2b0f3a 0%, #a3324a 45%, #ff8a3d 62%, #3a1a14 63%, #1a0b08 100%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <circle cx={540} cy={1180} r={230} fill="#ffb347" opacity={0.85} />
        <rect x={0} y={1210} width={1080} height={710} fill="#2a120c" />
        {[[140, 1210, 120], [880, 1210, 160]].map(([x, y, h], i) => <path key={i} d={`M ${x - 22} ${y} L ${x - 22} ${y - h} Q ${x} ${y - h - 30} ${x + 22} ${y - h} L ${x + 22} ${y} Z M ${x - 22} ${y - h * 0.55} L ${x - 60} ${y - h * 0.55} L ${x - 60} ${y - h * 0.85} L ${x - 44} ${y - h * 0.85} L ${x - 44} ${y - h * 0.7} L ${x - 22} ${y - h * 0.7} Z`} fill="#14080c" />)}
        {f >= FAKE && f < FAKE + 40 ? Array.from({ length: 3 }, (_, k) => {
          const cx = [260, 820, 560][k], cy = [420, 380, 300][k], q = (f - FAKE - k * 6) / 30;
          return q > 0 && q < 1 ? <g key={k} opacity={1 - q}>{Array.from({ length: 16 }, (_, j) => { const a = (j / 16) * Math.PI * 2; return <circle key={j} cx={cx + Math.cos(a) * 160 * q} cy={cy + Math.sin(a) * 160 * q} r={8} fill={["#ffd60a", "#ff4fd8", "#4fd8ff"][k]} />; })}</g> : null;
        }) : null}
        <Outlaw drawn={drawn} f={f} />
      </svg>
      <AbsoluteFill style={{ background: "#fff", opacity: flash * 0.7 }} />
      <AbsoluteFill style={{ background: "#ff1a1a", opacity: bang * 0.5 }} />
      {f < 55 ? (
        <div style={{ position: "absolute", top: 250, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff", opacity: interpolate(f, [45, 55], [1, 0], clamp) }}>
          <div style={{ fontSize: 140, transform: `scale(${pop(f, 0, 14)})`, textShadow: "0 0 40px #ff5a3d" }}>QUICK DRAW</div>
          <div style={{ fontSize: 46, color: "#ffd60a", marginTop: 20, opacity: pop(f, 10) }}>TAP THE SCREEN THE MOMENT<br />YOU SEE <span style={{ color: "#ff2d55" }}>FIRE!</span></div>
          <div style={{ fontSize: 34, marginTop: 20, opacity: pop(f, 18) }}>YOUR TAP FREEZES YOUR TIME</div>
        </div>
      ) : null}
      {f >= 55 && f < FAKE ? <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 110, color: "#fff", opacity: 0.6 + 0.4 * Math.sin(f / 5) }}>READY…</div> : null}
      {f >= FAKE && f < STEADY ? (
        <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#ffd60a" }}>
          <div style={{ fontSize: 130, transform: `scale(${pop(f, FAKE, 6)})` }}>FIRE-WORKS</div>
          <div style={{ fontSize: 40, color: "#fff", marginTop: 10 }}>TAPPED? YOU SHOT TOO EARLY. YOU'RE OUT.</div>
        </div>
      ) : null}
      {f >= STEADY && f < FIRE ? <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 110, color: "#fff" }}>STEADY…</div> : null}
      {f >= FIRE && f < NEXT ? (
        <div style={{ position: "absolute", top: 300, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
          <div style={{ fontSize: 220, color: "#ff2d55", transform: `scale(${pop(f, FIRE, 5)})`, textShadow: "0 0 50px #ff2d55" }}>FIRE!</div>
          <div style={{ fontSize: 120, fontVariantNumeric: "tabular-nums" }}>{t.toFixed(3)}s</div>
          <div style={{ fontSize: 64, marginTop: 10, color: faster ? "#4ade80" : "#ff2d55" }}>{faster ? "YOU'RE FASTER" : dead ? "TOO SLOW. HE GOT YOU." : ""}</div>
          {dead ? <div style={{ fontSize: 36, marginTop: 10, color: "#ffd60a" }}>HE DREW IN {(HIS / 30).toFixed(2)}s</div> : null}
        </div>
      ) : null}
      {f >= NEXT ? (
        <div style={{ position: "absolute", top: 360, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, color: "#fff" }}>
          <div style={{ fontSize: 100, transform: `scale(${pop(f, NEXT, 12)})` }}>ROUND 2</div>
          <div style={{ fontSize: 50, color: "#ffd60a", opacity: pop(f, NEXT + 10) }}>HE DRAWS IN 0.30s</div>
          <div style={{ fontSize: 38, marginTop: 16, opacity: pop(f, NEXT + 20) }}>COMMENT YOUR TIME ↓</div>
        </div>
      ) : null}
      {sfx.map(([at, s, v], i) => <Sequence key={i} from={at} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx2/${s}.wav`)} volume={v} /></Sequence>)}
    </AbsoluteFill>
  );
};
