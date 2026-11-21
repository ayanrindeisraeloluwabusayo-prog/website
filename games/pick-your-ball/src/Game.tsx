// "Pick Your Ball" preview: title + colour lineup, countdown, then a physics battle in a shrinking ring.
import React, { useMemo } from "react";
import { AbsoluteFill, Audio, interpolate, Sequence, staticFile, useCurrentFrame, Easing } from "remotion";
import { CX, CY, COLORS, LIVES, R, simulate, SPIKE_W } from "./sim";
import { FONT } from "./fonts";

export const INTRO = 60, COUNT = 30, START = INTRO + COUNT, BATTLE = 360, END = START + BATTLE, FRAMES = END + 60;
const SEED = 35;
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const pop = (f: number, at: number, d = 10) => interpolate(f, [at, at + d], [0, 1], { ...clamp, easing: Easing.out(Easing.back(1.8)) });
const sim = simulate(START, BATTLE, SEED);

const Ball: React.FC<{ x: number; y: number; c: string; hp?: number; flash?: number; s?: number }> = ({ x, y, c, hp, flash = 0, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle r={R + 10} fill={c} opacity={0.18} />
    <circle r={R} fill={c} stroke={c === "#26262e" ? "#fff" : "rgba(0,0,0,0.35)"} strokeWidth={c === "#26262e" ? 4 : 3} />
    <circle r={R} fill="#fff" opacity={flash} />
    <ellipse cx={-10} cy={-13} rx={12} ry={8} fill="#fff" opacity={0.45} />
    {hp !== undefined ? <text y={12} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill={c === "#f5f5f5" || c === "#ffd60a" || c === "#a3e635" ? "#111" : "#fff"}>{hp}</text> : null}
  </g>
);

const Arena: React.FC<{ f: number }> = ({ f }) => {
  const k = Math.max(0, Math.min(BATTLE - 1, f - START));
  const fr = f < START ? sim.frames[0] : sim.frames[k];
  const spin = f < START ? 0 : fr.spin;
  const lastOut = sim.events.filter((e) => e.kind === "out" && e.f <= f).at(-1);
  const shake = lastOut ? Math.max(0, 1 - (f - lastOut.f) / 10) * 10 : 0;
  const sx = Math.sin(f * 2.3) * shake, sy = Math.cos(f * 1.7) * shake;
  const teeth = (o: number) => Array.from({ length: 9 }, (_, i) => {
    const a = spin + o + (i / 8) * SPIKE_W, a1 = a - 0.025, a2 = a + 0.025;
    const P = (ang: number, rr: number) => `${CX + Math.cos(ang) * rr},${CY + Math.sin(ang) * rr}`;
    return <polygon key={i} points={`${P(a1, fr.ring)} ${P(a2, fr.ring)} ${P(a, fr.ring - 26)}`} fill="#ff2d55" />;
  });
  const arc = (o: number) => {
    const a = spin + o, b = a + SPIKE_W;
    return <path d={`M ${CX + Math.cos(a) * fr.ring} ${CY + Math.sin(a) * fr.ring} A ${fr.ring} ${fr.ring} 0 0 1 ${CX + Math.cos(b) * fr.ring} ${CY + Math.sin(b) * fr.ring}`} stroke="#ff2d55" strokeWidth={14} fill="none" style={{ filter: "drop-shadow(0 0 12px #ff2d55)" }} />;
  };
  return (
    <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, transform: `translate(${sx}px, ${sy}px)` }}>
      <circle cx={CX} cy={CY} r={fr.ring} fill="rgba(255,255,255,0.03)" stroke="#fff" strokeWidth={8} style={{ filter: "drop-shadow(0 0 18px rgba(140,170,255,0.9))" }} />
      {[0, Math.PI].map((o) => <g key={o}>{arc(o)}{teeth(o)}</g>)}
      {fr.balls.map((b, i) => {
        if (!b.alive) return null;
        const trail = [3, 6, 9].map((d) => sim.frames[Math.max(0, k - d)]?.balls[i]).filter(Boolean);
        const flash = Math.max(0, 1 - (k - b.hit) / 6);
        return (
          <g key={i}>
            {f >= START ? trail.map((t, j) => <circle key={j} cx={t!.x} cy={t!.y} r={R * (0.8 - j * 0.2)} fill={COLORS[i][1]} opacity={0.18 - j * 0.05} />) : null}
            <Ball x={b.x} y={b.y} c={COLORS[i][1]} hp={b.hp} flash={flash} s={f < START ? pop(f, INTRO + i, 8) : 1} />
          </g>
        );
      })}
      {sim.events.filter((e) => e.kind === "out" && f >= e.f && f < e.f + 24).map((e, n) => {
        const t = (f - e.f) / 24;
        return (
          <g key={n} opacity={1 - t}>
            <circle cx={e.x} cy={e.y} r={R + 90 * t} fill="none" stroke="#fff" strokeWidth={6 * (1 - t)} />
            {Array.from({ length: 12 }, (_, j) => { const a = (j / 12) * Math.PI * 2; return <circle key={j} cx={e.x + Math.cos(a) * 140 * t} cy={e.y + Math.sin(a) * 140 * t} r={10 * (1 - t)} fill={COLORS[e.i][1]} />; })}
          </g>
        );
      })}
      {sim.events.filter((e) => e.kind === "hit" && f >= e.f && f < e.f + 18).map((e, n) => (
        <text key={n} x={e.x} y={e.y - 50 - (f - e.f) * 2} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={40} fill="#ff2d55" opacity={1 - (f - e.f) / 18}>-1</text>
      ))}
    </svg>
  );
};

const Intro: React.FC<{ f: number }> = ({ f }) => {
  const o = interpolate(f, [INTRO - 8, INTRO], [1, 0], clamp);
  return (
    <AbsoluteFill style={{ opacity: o, background: "radial-gradient(circle at 50% 40%, #1b2a7a 0%, #070a1f 70%)" }}>
      <div style={{ position: "absolute", top: 260, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 130, lineHeight: 0.95, color: "#fff", transform: `scale(${pop(f, 0, 14)})`, textShadow: "0 0 40px rgba(120,150,255,0.8)" }}>PICK<br />YOUR BALL</div>
      <div style={{ position: "absolute", top: 560, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "#ffd60a", opacity: pop(f, 10) }}>COMMENT YOUR COLOUR BEFORE IT STARTS ↓</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {COLORS.map(([name, c], i) => {
          const x = 180 + (i % 4) * 240, y = 820 + Math.floor(i / 4) * 230, s = pop(f, 14 + i * 2, 10);
          return (
            <g key={i}>
              <Ball x={x} y={y} c={c} s={s * 1.5} />
              <text x={x} y={y + 95} textAnchor="middle" fontFamily={FONT} fontWeight={800} fontSize={34} fill="#fff" opacity={s}>{name}</text>
            </g>
          );
        })}
      </svg>
    </AbsoluteFill>
  );
};

const Hud: React.FC<{ f: number }> = ({ f }) => {
  const outs = sim.events.filter((e) => e.kind === "out" && e.f <= f);
  const left = COLORS.length - outs.length;
  const last = outs.at(-1);
  const bump = last ? 1 + 0.35 * Math.max(0, 1 - (f - last.f) / 10) : 1;
  return (
    <>
      <div style={{ position: "absolute", top: 230, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 110, color: "#fff", transform: `scale(${bump})` }}>{left} <span style={{ fontSize: 60, color: "#9fb2ff" }}>LEFT</span></div>
      <div style={{ position: "absolute", top: 380, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 700, fontSize: 32, letterSpacing: "0.2em", color: "#ff2d55" }}>DON'T TOUCH THE RED · {LIVES} LIVES EACH</div>
      <div style={{ position: "absolute", top: 1560, left: 0, right: 0, display: "flex", flexDirection: "column", alignItems: "center", gap: 10 }}>
        {outs.slice(-4).map((e) => (
          <div key={e.f + "-" + e.i} style={{ display: "flex", alignItems: "center", gap: 16, fontFamily: FONT, fontWeight: 800, fontSize: 38, color: "#fff", opacity: pop(f, e.f, 8) }}>
            <div style={{ width: 34, height: 34, borderRadius: 17, background: COLORS[e.i][1], border: "3px solid #fff" }} /> {COLORS[e.i][0]} <span style={{ color: "#ff2d55" }}>IS OUT</span>
          </div>
        ))}
      </div>
    </>
  );
};

export const Game: React.FC = () => {
  const f = useCurrentFrame();
  const sfx = useMemo(() => {
    const list: [number, string, number][] = [[0, "whoosh", 0.4], [14, "pop", 0.25], [INTRO, "marker", 0.5], [INTRO + 10, "marker", 0.5], [INTRO + 20, "marker", 0.5], [START, "chime", 0.5]];
    let lastB = -10;
    for (const e of sim.events) {
      if (e.kind === "out") list.push([e.f, "glitch-a", 0.55], [e.f, "subdrop", 0.5]);
      else if (e.kind === "hit") list.push([e.f, "spark", 0.45]);
      else if (e.f - lastB >= 5) { list.push([e.f, "pop", 0.12]); lastB = e.f; }
    }
    list.push([END, "riser", 0.4]);
    return list;
  }, []);
  const n = Math.ceil(Math.max(0, f - INTRO) / 10);
  const left = COLORS.length - sim.events.filter((e) => e.kind === "out").length;
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #141c4d 0%, #05060f 75%)" }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: 0.12 }}>
        {Array.from({ length: 28 }, (_, i) => <line key={i} x1={0} x2={1080} y1={i * 72} y2={i * 72} stroke="#8aa0ff" strokeWidth={1} />)}
        {Array.from({ length: 16 }, (_, i) => <line key={i} y1={0} y2={1920} x1={i * 72} x2={i * 72} stroke="#8aa0ff" strokeWidth={1} />)}
      </svg>
      {f >= INTRO - 8 ? <Arena f={Math.min(f, END - 1)} /> : null}
      {f >= START ? <Hud f={f} /> : null}
      {f >= INTRO && f < START ? (
        <div style={{ position: "absolute", top: 860, width: "100%", textAlign: "center", fontFamily: FONT, fontWeight: 800, fontSize: 300, color: "#fff", transform: `scale(${1.4 - 0.4 * pop(f, INTRO + (n - 1) * 10, 8)})`, textShadow: "0 0 50px rgba(120,150,255,0.9)" }}>{4 - n}</div>
      ) : null}
      {f < INTRO ? <Intro f={f} /> : null}
      {f >= END ? (
        <AbsoluteFill style={{ background: `rgba(5,6,15,${0.75 * pop(f, END, 10)})`, alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 30 }}>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 120, color: "#fff", transform: `scale(${pop(f, END, 12)})` }}>{left} LEFT…</div>
          <div style={{ fontFamily: FONT, fontWeight: 800, fontSize: 64, color: "#ffd60a", opacity: pop(f, END + 10) }}>WHO WINS?</div>
          <div style={{ fontFamily: FONT, fontWeight: 700, fontSize: 40, color: "#fff", opacity: pop(f, END + 20) }}>COMMENT YOUR COLOUR ↓</div>
        </AbsoluteFill>
      ) : null}
      {sfx.map(([at, s, v], i) => (
        <Sequence key={i} from={at} durationInFrames={60} layout="none"><Audio src={staticFile(`sfx2/${s}.wav`)} volume={v} /></Sequence>
      ))}
    </AbsoluteFill>
  );
};
