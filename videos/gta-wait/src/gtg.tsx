// Motion graphics for "Why the wait for GTA 6 felt so good": white on blue, gold for the key fact. "GTA 6" only as text
// in our own type (no Rockstar logo or art).
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE_DEEP, FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a";
const big = (size: number, face = "#fff", depth = FLASH): React.CSSProperties => ({ fontFamily: SANS2, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.04em", color: face,
  textShadow: `${Array.from({ length: 12 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < 6 ? depth : BLUE_DEEP}`).join(", ")}, 0 0 70px rgba(243,194,29,0.6)` });

/** 2013 → 2026: thirteen years of waiting, under a big GTA 6. */
export const Years: React.FC<{ from: number; doneAt: number }> = ({ from, doneAt }) => {
  const f = useCurrentFrame();
  const y = Math.round(interpolate(f, [from + 6, doneAt], [2013, 2026], clamp));
  const k = interpolate(f, [from + 6, doneAt], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...big(230), transform: `scale(${0.7 + 0.3 * p(f, from, 12)})`, opacity: p(f, from, 10) }}>GTA 6</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", fontFamily: SERIF2, fontSize: 200, color: FLASH, lineHeight: 1 }}>{y}</div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1340, height: 30, borderRadius: 15, background: "rgba(255,255,255,0.15)" }}>
        <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 15, background: FLASH, boxShadow: "0 0 30px rgba(243,194,29,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1410, textAlign: "center", ...lab, fontSize: 34, color: "#fff", opacity: p(f, doneAt, 10) }}>13 YEARS OF WAITING</div>
    </AbsoluteFill>
  );
};

/** Trailer, leak, rumour: cards stacking up like a feed. */
export const Feed: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const f = useCurrentFrame();
  const cards: [string, string][] = [["TRAILER", FLASH], ["LEAK", "#ff4fd8"], ["RUMOUR", "#4fd8ff"]];
  return (
    <AbsoluteFill>
      {cards.map(([t, c], i) => {
        const k = p(f, at[i], 12);
        return <div key={t} style={{ position: "absolute", left: 140 + i * 40, top: 820 + i * 250, width: 760, height: 210, borderRadius: 26, background: "rgba(10,14,50,0.85)", border: `5px solid ${c}`,
          boxShadow: `0 0 40px ${c}66, 0 30px 60px rgba(0,0,0,0.5)`, display: "flex", alignItems: "center", gap: 30, padding: "0 40px", opacity: k, transform: `translateX(${(1 - k) * 200}px) rotate(${(i - 1) * 2}deg)` }}>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: c, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <div style={{ width: 0, height: 0, borderTop: "24px solid transparent", borderBottom: "24px solid transparent", borderLeft: `40px solid ${INK}`, marginLeft: 10 }} />
          </div>
          <div><div style={{ ...lab, fontSize: 54, color: "#fff" }}>{t}</div><div style={{ ...lab, fontSize: 26, color: c, marginTop: 8 }}>GTA 6</div></div>
        </div>;
      })}
    </AbsoluteFill>
  );
};

/** The trailer's views racing to 90,000,000 in 24 hours, then a WORLD RECORD stamp. */
export const Views: React.FC<{ from: number; recordAt: number }> = ({ from, recordAt }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from + 4, recordAt - 6], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const n = Math.round(90_000_000 * k).toLocaleString("en-US");
  const h = Math.round(24 * k);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", ...lab, fontSize: 34, color: "#fff" }}>VIEWS · FIRST GTA 6 TRAILER</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", ...big(150, FLASH, "#fff") }}>{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1100, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 80, color: "#fff" }}>{String(h).padStart(2, "0")}:00 HOURS</div>
      <div style={{ position: "absolute", left: 250, top: 1300, padding: "16px 40px", border: `10px solid ${FLASH}`, borderRadius: 20, color: FLASH, ...lab, fontSize: 64,
        opacity: p(f, recordAt, 8), transform: `rotate(-8deg) scale(${2 - p(f, recordAt, 8)})` }}>WORLD RECORD</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>MOST VIEWED GAME REVEAL IN 24 HOURS · DEC 2023</div>
    </AbsoluteFill>
  );
};

/** Schultz's monkeys: at first dopamine spikes at the juice; after a while it spikes at the light instead. */
export const Monkey: React.FC<{ from: number; laterAt: number; signalAt: number }> = ({ from, laterAt, signalAt }) => {
  const f = useCurrentFrame();
  const row = (y: number, label: string, spikeAtLight: boolean, at: number) => {
    const k = p(f, at, 12);
    const draw = interpolate(f, [at + 4, at + 40], [0, 1], clamp);
    const spikeX = spikeAtLight ? 300 : 700;
    const pts = Array.from({ length: 80 }, (_, i) => { const x = 140 + i * 10; const s = Math.exp(-Math.pow((x - spikeX) / 28, 2)); return `${x},${y + 200 - s * 170}`; }).slice(0, Math.max(2, Math.round(draw * 80))).join(" ");
    return (
      <g opacity={k}>
        <text x={140} y={y} fontFamily={SANS2} fontWeight={800} fontSize={30} letterSpacing="0.14em" fill="#fff">{label}</text>
        <circle cx={300} cy={y + 250} r={34} fill={spikeAtLight && f >= signalAt ? FLASH : "rgba(255,255,255,0.85)"} />
        <text x={300} y={y + 320} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={24} fill="#fff">LIGHT</text>
        <path d={`M 680 ${y + 225} L 720 ${y + 225} L 712 ${y + 285} L 688 ${y + 285} Z`} fill={!spikeAtLight ? FLASH : "rgba(255,255,255,0.85)"} />
        <text x={700} y={y + 320} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={24} fill="#fff">JUICE</text>
        <polyline points={pts} fill="none" stroke={FLASH} strokeWidth={7} strokeLinejoin="round" />
        <line x1={140} x2={940} y1={y + 200} y2={y + 200} stroke="rgba(255,255,255,0.3)" strokeWidth={2} />
      </g>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        {row(780, "AT FIRST: DOPAMINE FIRES AT THE JUICE", false, from)}
        {row(1200, "AFTER A WHILE: IT FIRES AT THE LIGHT", true, laterAt)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>SCHULTZ ET AL. · SCIENCE · 1997</div>
    </AbsoluteFill>
  );
};

/** Two bars: the waiting (tall, gold) vs the getting (short). */
export const WaitGet: React.FC<{ waitAt: number; getAt: number }> = ({ waitAt, getAt }) => {
  const f = useCurrentFrame();
  const bar = (x: number, label: string, h: number, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    return <div style={{ position: "absolute", left: x, top: 820, width: 340, textAlign: "center", opacity: p(f, at - 4, 8) }}>
      <div style={{ position: "relative", margin: "0 auto", width: 180, height: 620 }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: h * g, borderRadius: "16px 16px 0 0", background: gold ? FLASH : "#fff", boxShadow: gold ? "0 0 40px rgba(243,194,29,0.7)" : "none" }} />
      </div>
      <div style={{ ...lab, fontSize: 34, color: gold ? FLASH : "#fff", marginTop: 20 }}>{label}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>WHERE THE DOPAMINE WENT</div>
      {bar(130, "THE WAITING", 600, true, waitAt)}
      {bar(610, "THE GETTING", 220, false, getAt)}
    </AbsoluteFill>
  );
};

/** The holiday study: before the trip vacationers are happier; after it, no different. */
export const Holiday: React.FC<{ beforeAt: number; afterAt: number; sameAt: number }> = ({ beforeAt, afterAt, sameAt }) => {
  const f = useCurrentFrame();
  const pair = (x: number, title: string, a: number, b: number, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    return <div style={{ position: "absolute", left: x, top: 800, width: 400, opacity: p(f, at - 4, 8) }}>
      <div style={{ ...lab, fontSize: 32, color: "#fff", textAlign: "center" }}>{title}</div>
      <div style={{ display: "flex", justifyContent: "center", alignItems: "flex-end", gap: 30, height: 560, marginTop: 20 }}>
        <div style={{ width: 120, height: a * g, borderRadius: "14px 14px 0 0", background: FLASH }} />
        <div style={{ width: 120, height: b * g, borderRadius: "14px 14px 0 0", background: "#fff" }} />
      </div>
    </div>;
  };
  return (
    <AbsoluteFill>
      {pair(90, "BEFORE THE TRIP", 520, 380, beforeAt)}
      {pair(590, "AFTER THE TRIP", 385, 380, afterAt)}
      <div style={{ position: "absolute", left: 140, right: 140, top: 1390, height: 4, background: "rgba(255,255,255,0.5)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", gap: 50, ...lab, fontSize: 26 }}>
        <span style={{ color: FLASH }}>■ HOLIDAY-MAKERS</span><span style={{ color: "#fff" }}>■ STAYED HOME</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", fontFamily: SERIF2, fontSize: 90, color: FLASH, opacity: p(f, sameAt, 10) }}>no happier after</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>NAWIJN ET AL. · 2010 · 1,530 DUTCH ADULTS · ILLUSTRATION</div>
    </AbsoluteFill>
  );
};
