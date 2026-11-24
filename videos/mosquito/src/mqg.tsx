// Motion graphics for "Why mosquitoes bite you": white on blue, gold = the magnet, red = bites.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a", RED = "#ff3b3b";

const Person: React.FC<{ x: number; y: number; s: number; color: string }> = ({ x, y, s, color }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}><circle cy={-60} r={42} fill={color} /><path d="M -70 90 C -70 -10, 70 -10, 70 90 Z" fill={color} /></g>
);
/** A small cartoon mosquito, facing right. */
const Bug: React.FC<{ x: number; y: number; s?: number; o?: number; flap: number }> = ({ x, y, s = 1, o = 1, flap }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <ellipse cx={-6} cy={0} rx={18} ry={7} fill="#111" stroke="#fff" strokeWidth={2} />
    <circle cx={14} cy={-2} r={7} fill="#111" stroke="#fff" strokeWidth={2} /><line x1={20} y1={-1} x2={38} y2={4} stroke="#fff" strokeWidth={2.5} />
    <ellipse cx={-6} cy={-16} rx={14} ry={6} fill="rgba(220,232,255,0.75)" transform={`rotate(${-20 + 25 * Math.sin(flap)} -6 -8)`} />
    {[-14, -4, 6].map((lx, i) => <line key={i} x1={lx} y1={5} x2={lx - 8} y2={22} stroke="#fff" strokeWidth={2} />)}
  </g>
);

/** You vs your friend: bites appear on you, none on them. */
export const Bites: React.FC<{ from: number; youAt: number; themAt: number }> = ({ from, youAt, themAt }) => {
  const f = useCurrentFrame();
  const dots = [[-40, 1090], [30, 1150], [-10, 1210], [55, 1060], [-60, 1180]];
  const n = Math.min(5, Math.max(0, Math.floor((f - youAt) / 4) + 1));
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Person x={330} y={1130} s={1.6} color="#fff" /><Person x={760} y={1130} s={1.6} color="rgba(255,255,255,0.55)" />
        {dots.slice(0, n).map(([dx, y], i) => <circle key={i} cx={330 + dx} cy={y} r={15} fill={RED} stroke="#fff" strokeWidth={4} />)}
      </svg>
      <div style={{ position: "absolute", left: 230, top: 1400, fontFamily: SERIF2, fontSize: 200, color: FLASH, lineHeight: 1 }}>{n}</div>
      <div style={{ position: "absolute", left: 700, top: 1400, fontFamily: SERIF2, fontSize: 200, color: "rgba(255,255,255,0.6)", lineHeight: 1, opacity: p(f, themAt, 8) }}>0</div>
      <div style={{ position: "absolute", left: 250, top: 1620, ...lab, fontSize: 28, color: FLASH }}>YOU</div>
      <div style={{ position: "absolute", left: 680, top: 1620, ...lab, fontSize: 28, color: "rgba(255,255,255,0.7)" }}>YOUR FRIEND</div>
    </AbsoluteFill>
  );
};

/** The jar on stage: the lid pops and a handful of mosquitoes fly out over the crowd. */
export const Jar: React.FC<{ openAt: number; flyAt: number }> = ({ openAt, flyAt }) => {
  const f = useCurrentFrame();
  const lid = p(f, openAt, 10);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <rect x={380} y={1120} width={320} height={340} rx={40} fill="rgba(255,255,255,0.12)" stroke="#fff" strokeWidth={8} />
        <g transform={`translate(${540 + 160 * lid} ${1100 - 220 * lid}) rotate(${50 * lid})`}><rect x={-180} y={-30} width={360} height={50} rx={14} fill={FLASH} /></g>
        {Array.from({ length: 8 }, (_, i) => {
          const t = Math.max(0, (f - flyAt - i * 3) / 60);
          if (t <= 0) return <Bug key={i} x={480 + (i % 4) * 40} y={1300 + Math.floor(i / 4) * 60} s={1.2} flap={f * 2 + i} />;
          const a = (i / 8) * Math.PI - Math.PI;
          return <Bug key={i} x={540 + Math.cos(a) * 420 * Math.min(1, t) + Math.sin(f / 5 + i) * 20} y={1250 + Math.sin(a) * 480 * Math.min(1, t)} s={1.4} flap={f * 2 + i} />;
        })}
        {Array.from({ length: 12 }, (_, i) => <circle key={i} cx={90 + i * 82} cy={1700 + (i % 2) * 20} r={36} fill="rgba(255,255,255,0.35)" />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, flyAt + 20, 10) }}>TED · 2009 · FEWER THAN TEN, NO DISEASE</div>
    </AbsoluteFill>
  );
};

/** Breath: CO₂ puffs drift from a face; a mosquito follows the trail in. */
export const Breath: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const t = f - from;
  const k = interpolate(t, [20, 140], [0, 1], { ...clamp, easing: (x) => x * x * (3 - 2 * x) });
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <g transform="translate(250 1150) scale(2.2)"><circle cy={-60} r={42} fill="#fff" /><path d="M -70 90 C -70 -10, 70 -10, 70 90 Z" fill="#fff" /></g>
        {Array.from({ length: 12 }, (_, i) => {
          const q = ((t / 40 + i / 12) % 1);
          return <g key={i} opacity={(1 - q) * 0.8}><circle cx={350 + q * 620} cy={1010 - Math.sin(q * 6 + i) * 30 - q * 40} r={18 + q * 40} fill="rgba(255,255,255,0.25)" />
            <text x={350 + q * 620} y={1022 - Math.sin(q * 6 + i) * 30 - q * 40} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={20 + q * 14} fill="#fff">CO₂</text></g>;
        })}
        <g transform="scale(-1 1) translate(-1080 0)"><Bug x={1080 - (980 - 560 * k)} y={1000 + Math.sin(t / 4) * 25} s={2.4} flap={t * 2} /></g>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...lab, fontSize: 32, color: FLASH, opacity: p(f, from + 40, 10) }}>IT FOLLOWS YOUR BREATH</div>
    </AbsoluteFill>
  );
};

/** The Gambia study: pregnant women drew twice as many mosquitoes; two reasons as chips. */
export const Gambia: React.FC<{ barsAt: number; airAt: number; warmAt: number }> = ({ barsAt, airAt, warmAt }) => {
  const f = useCurrentFrame();
  const g = interpolate(f, [barsAt, barsAt + 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const col = (x: number, label: string, h: number, gold: boolean, mult: string) => (
    <div style={{ position: "absolute", left: x, top: 740, width: 380, textAlign: "center" }}>
      <div style={{ fontFamily: SERIF2, fontSize: 130, color: gold ? FLASH : "#fff", lineHeight: 1, opacity: g }}>{mult}</div>
      <div style={{ position: "relative", margin: "20px auto 0", width: 170, height: 440 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * g, borderRadius: "16px 16px 0 0", background: gold ? FLASH : "#fff" }} />
      </div>
      <div style={{ ...lab, fontSize: 26, color: gold ? FLASH : "#fff", marginTop: 16 }}>{label}</div>
    </div>
  );
  const chip = (text: string, at: number) => <div style={{ padding: "18px 30px", borderRadius: 40, background: "#fbfaf7", color: INK, ...lab, fontSize: 30, opacity: p(f, at, 10), transform: `scale(${0.7 + 0.3 * p(f, at, 10)})` }}>{text}</div>;
  return (
    <AbsoluteFill>
      {col(130, "PREGNANT WOMEN", 420, true, "2×")}
      {col(570, "OTHER WOMEN", 210, false, "1×")}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1470, display: "flex", justifyContent: "center", gap: 24 }}>{chip("≈ ⅕ MORE AIR OUT", airAt)}{chip("WARMER BELLY", warmAt)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.75)" }}>LINDSAY ET AL. · THE LANCET · 2000</div>
    </AbsoluteFill>
  );
};

/** Myth: "sweet blood" crossed out, "skin" in gold. */
export const Myth: React.FC<{ strikeAt: number; skinAt: number }> = ({ strikeAt, skinAt }) => {
  const f = useCurrentFrame();
  const s = p(f, strikeAt, 10), k = p(f, skinAt, 12);
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", paddingTop: 200 }}>
      <div style={{ position: "relative", fontFamily: SERIF2, fontSize: 190, color: "#fff", opacity: 1 - 0.5 * s, lineHeight: 1 }}>
        sweet blood
        <div style={{ position: "absolute", left: -10, right: -10, top: "50%", height: 20, borderRadius: 10, background: RED, transform: `scaleX(${s}) rotate(-3deg)`, transformOrigin: "0 50%" }} />
      </div>
      <div style={{ fontFamily: SERIF2, fontSize: 260, color: FLASH, lineHeight: 1, marginTop: 40, transform: `scale(${0.6 + 0.4 * k})`, opacity: k, textShadow: "0 0 40px rgba(243,194,29,0.6)" }}>skin.</div>
    </AbsoluteFill>
  );
};

/** The stocking tournament: four worn stockings, head to head; mosquitoes keep flocking to the same one. */
export const Tournament: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const t = f - from;
  const cards = [[150, 820], [580, 820], [150, 1220], [580, 1220]];
  const winner = 2;
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      {cards.map(([x, y], i) => {
        const k = p(f, from + i * 5, 10), win = i === winner;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 350, height: 330, borderRadius: 24, background: win ? "rgba(243,194,29,0.18)" : "rgba(255,255,255,0.08)",
          border: `5px solid ${win && t > 60 ? FLASH : "rgba(255,255,255,0.45)"}`, opacity: k, transform: `scale(${0.8 + 0.2 * k})` }}>
          <div style={{ position: "absolute", left: 110, top: 40, width: 130, height: 220, borderRadius: "60px 60px 30px 30px", background: "repeating-linear-gradient(0deg, rgba(255,255,255,0.75) 0 6px, rgba(255,255,255,0.45) 6px 12px)" }} />
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 18, textAlign: "center", ...lab, fontSize: 22, color: win ? FLASH : "#fff" }}>VOLUNTEER {["A", "B", "C", "D"][i]}</div>
        </div>;
      })}
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {Array.from({ length: 12 }, (_, i) => {
          const q = ((t / 50 + i / 12) % 1), tx = 325 + (i % 5 === 0 ? 430 : 0), ty = 1385;
          const sx = 540 + Math.cos(i) * 500, sy = 600 + (i % 3) * 30;
          return <Bug key={i} x={sx + (tx - sx) * q + Math.sin(t / 4 + i) * 12} y={sy + (ty - sy) * q} s={1.2} o={t > 15 ? 1 - q * 0.3 : 0} flap={t * 2 + i} />;
        })}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 28, color: "#fff" }}>HEAD TO HEAD · OVER AND OVER · FOR YEARS</div>
    </AbsoluteFill>
  );
};

/** Skin acids: a strip of "magnet" skin with many gold acid molecules vs ordinary skin with few. */
export const Acids: React.FC<{ from: number; magnetAt: number }> = ({ from, magnetAt }) => {
  const f = useCurrentFrame();
  const hex = (x: number, y: number, k: number, key: number) => (
    <g key={key} transform={`translate(${x} ${y}) scale(${0.5 + 0.5 * k})`} opacity={k}>
      <polygon points="0,-28 24,-14 24,14 0,28 -24,14 -24,-14" fill="none" stroke={FLASH} strokeWidth={5} />
      <text y={8} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={16} fill={FLASH}>COOH</text>
    </g>
  );
  const strip = (y: number, n: number, label: string, gold: boolean) => (
    <g>
      <rect x={110} y={y} width={860} height={200} rx={30} fill={gold ? "rgba(243,194,29,0.12)" : "rgba(255,255,255,0.08)"} stroke={gold ? FLASH : "rgba(255,255,255,0.45)"} strokeWidth={4} />
      {Array.from({ length: n }, (_, i) => hex(170 + ((i * 97) % 760), y + 50 + ((i * 53) % 110), p(f, from + 6 + i * 2, 8), i))}
      <text x={540} y={y + 250} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={28} letterSpacing="0.14em" fill={gold ? FLASH : "#fff"}>{label}</text>
    </g>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>CERTAIN NATURAL ACIDS ON THE SKIN</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {strip(860, 16, "THE FAVOURITES", true)}
        {strip(1200, 4, "EVERYONE ELSE", false)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", fontFamily: SERIF2, fontSize: 90, color: FLASH, opacity: p(f, magnetAt, 10), transform: `scale(${0.7 + 0.3 * p(f, magnetAt, 10)})` }}>still magnets, year after year</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1690, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>DE OBALDIA, VOSSHALL ET AL. · CELL · 2022</div>
    </AbsoluteFill>
  );
};

/** What you can do: repellent and a net, each ticked. */
export const Defence: React.FC<{ sprayAt: number; netAt: number }> = ({ sprayAt, netAt }) => {
  const f = useCurrentFrame();
  const card = (x: number, at: number, label: string, icon: React.ReactNode) => (
    <div style={{ position: "absolute", left: x, top: 850, width: 380, height: 520, borderRadius: 30, background: "rgba(255,255,255,0.1)", border: "4px solid rgba(255,255,255,0.45)", opacity: p(f, at, 12), transform: `translateY(${(1 - p(f, at, 12)) * 60}px)` }}>
      <svg width={380} height={380} style={{ display: "block" }}>{icon}</svg>
      <div style={{ ...lab, fontSize: 32, color: "#fff", textAlign: "center" }}>{label}</div>
      <div style={{ position: "absolute", right: 24, top: 24, width: 80, height: 80, borderRadius: 40, background: FLASH, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(f, at + 8, 10)})` }}>
        <svg width={46} height={46}><path d="M 6 24 L 18 36 L 40 10" stroke={INK} strokeWidth={8} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      {card(110, sprayAt, "REPELLENT", <g><rect x={140} y={130} width={100} height={200} rx={20} fill="#fff" /><rect x={160} y={95} width={60} height={40} rx={8} fill="#fff" />
        {Array.from({ length: 8 }, (_, i) => <circle key={i} cx={250 + (i % 3) * 25} cy={90 + (i % 4) * 14} r={5} fill="#fff" opacity={0.6} />)}</g>)}
      {card(590, netAt, "BED NET", <g>{Array.from({ length: 9 }, (_, i) => <line key={i} x1={60 + i * 32} y1={80} x2={60 + i * 32} y2={320} stroke="#fff" strokeWidth={2} opacity={0.7} />)}
        {Array.from({ length: 9 }, (_, i) => <line key={i} x1={60} y1={80 + i * 30} x2={316} y2={80 + i * 30} stroke="#fff" strokeWidth={2} opacity={0.7} />)}
        <path d="M 60 80 Q 188 20 316 80" stroke="#fff" strokeWidth={6} fill="none" /></g>)}
    </AbsoluteFill>
  );
};
