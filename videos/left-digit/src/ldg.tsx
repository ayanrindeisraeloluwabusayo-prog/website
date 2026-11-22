// Motion graphics for "Why $99.99 feels cheaper than $100": white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a";

const Tag: React.FC<{ price: string; x: number; y: number; k: number; rot: number; gold?: boolean; scale?: number }> = ({ price, x, y, k, rot, gold, scale = 1 }) => (
  <div style={{ position: "absolute", left: x, top: y, width: 380, height: 220, opacity: k, transformOrigin: "50% 0%",
    transform: `translateY(${(1 - k) * -120}px) rotate(${rot * (1 - k) + Math.sin(k * 6) * 2}deg) scale(${scale})`,
    background: gold ? FLASH : "#fbfaf7", borderRadius: "18px 18px 18px 18px", boxShadow: "0 30px 60px rgba(0,0,0,0.4)", display: "flex", alignItems: "center", justifyContent: "center",
    fontFamily: SANS2, fontWeight: 900, fontSize: 104, color: INK, letterSpacing: "-0.03em" }}>
    <div style={{ position: "absolute", top: 18, left: "50%", width: 26, height: 26, marginLeft: -13, borderRadius: 13, background: "#0b2a8f" }} />
    {price}
  </div>
);

/** Two price tags: $100.00 and $99.99; later a "-1¢" stamp. */
export const Tags: React.FC<{ from: number; at1: number; at2: number; stampAt?: number }> = ({ from, at1, at2, stampAt }) => {
  const f = useCurrentFrame();
  const s = stampAt ? p(f, stampAt, 8) : 0;
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      <Tag price="$100.00" x={350} y={760} k={p(f, at1, 14)} rot={-20} />
      <Tag price="$99.99" x={350} y={1080} k={p(f, at2, 14)} rot={18} gold scale={1 - 0.08 * p(f, at2 + 20, 20)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center", ...lab, fontSize: 30, color: "#fff", opacity: p(f, at2 + 24, 10) }}>FEELS LIKE A BARGAIN</div>
      {stampAt ? <div style={{ position: "absolute", left: 620, top: 1020, padding: "10px 26px", border: "8px solid #ff3b3b", color: "#ff3b3b", borderRadius: 14, fontFamily: SANS2, fontWeight: 900, fontSize: 80,
        opacity: s, transform: `rotate(-12deg) scale(${2 - s})` }}>−1¢</div> : null}
    </AbsoluteFill>
  );
};

/** A plain music-store list (no brand): every song 99 cents, "$1.00" crossed out. */
export const Songs: React.FC<{ from: number; crossAt: number; rowsAt: number }> = ({ from, crossAt, rowsAt }) => {
  const f = useCurrentFrame();
  const c = p(f, crossAt, 10);
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <div style={{ position: "absolute", left: 140, top: 760, width: 800, borderRadius: 28, background: "#fbfaf7", boxShadow: "0 40px 80px rgba(0,0,0,0.45)", padding: "40px 44px", color: INK }}>
        <div style={{ ...lab, fontSize: 24, color: "#b0362c" }}>ONLINE MUSIC STORE · 2003</div>
        <div style={{ position: "relative", display: "inline-block", fontFamily: SANS2, fontWeight: 900, fontSize: 70, marginTop: 12, color: "#999" }}>
          $1.00 <div style={{ position: "absolute", left: -6, right: -6, top: "52%", height: 8, background: "#ff3b3b", transform: `scaleX(${c})`, transformOrigin: "0 50%" }} />
        </div>
        {Array.from({ length: 6 }, (_, i) => {
          const k = p(f, rowsAt + i * 4, 10);
          return (
            <div key={i} style={{ display: "flex", alignItems: "center", gap: 22, marginTop: 18, opacity: k, transform: `translateX(${(1 - k) * 60}px)` }}>
              <div style={{ width: 64, height: 64, borderRadius: 12, background: ["#3b82f6", "#a855f7", "#f472b6", "#22c55e", "#ff8a1f", "#14b8a6"][i] }} />
              <div style={{ flex: 1 }}><div style={{ height: 14, width: `${70 - i * 6}%`, borderRadius: 7, background: "#222" }} /><div style={{ height: 10, width: "40%", marginTop: 10, borderRadius: 5, background: "#bbb" }} /></div>
              <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 40, color: "#0b2a8f" }}>$0.99</div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

/** The left-digit scan: $9.99 vs $10.00, a beam reads left to right and stops on the first digit. */
export const Scan: React.FC<{ from: number; nineAt: number; tenAt: number }> = ({ from, nineAt, tenAt }) => {
  const f = useCurrentFrame();
  const row = (y: number, digits: string, at: number, label: string, gold: boolean) => {
    const k = p(f, at - 10, 10), sweep = interpolate(f, [at - 6, at + 10], [0, 1], clamp);
    return (
      <div style={{ position: "absolute", left: 0, right: 0, top: y, opacity: k, textAlign: "center" }}>
        <div style={{ display: "inline-flex", fontFamily: SANS2, fontWeight: 900, fontSize: 200, letterSpacing: "-0.04em", color: "#fff", position: "relative" }}>
          {digits.split("").map((d, i) => <span key={i} style={{ color: i === 1 && sweep > 0.3 ? (gold ? FLASH : "#fff") : i > 1 && sweep > 0.6 ? "rgba(255,255,255,0.3)" : "#fff",
            transform: `scale(${i === 1 ? 1 + 0.25 * p(f, at + 4, 10) : 1})`, display: "inline-block", textShadow: i === 1 && sweep > 0.3 && gold ? "0 0 40px rgba(243,194,29,0.9)" : "none" }}>{d}</span>)}
          <div style={{ position: "absolute", top: 0, bottom: 0, left: `${sweep * 100}%`, width: 10, background: FLASH, boxShadow: "0 0 30px #F3C21D", opacity: sweep < 1 ? 1 : 0 }} />
        </div>
        <div style={{ ...lab, fontSize: 34, color: gold ? FLASH : "#fff", opacity: p(f, at + 8, 10) }}>{label}</div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      {row(800, "$9.99", nineAt, "FEELS LIKE NINE", true)}
      {row(1220, "$10.00", tenAt, "FEELS LIKE TEN", false)}
    </AbsoluteFill>
  );
};

/** A wall of odd mall prices popping in. */
export const MallTags: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const prices = ["$9.99", "$12.45", "$4.99", "$19.95", "$7.99", "$24.99", "$3.49", "$59.99", "$14.95"];
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      {prices.map((pr, i) => {
        const k = p(f, from + 3 + i * 4, 10), x = 110 + (i % 3) * 300, y = 760 + Math.floor(i / 3) * 280;
        return <div key={i} style={{ position: "absolute", left: x, top: y, width: 260, height: 150, borderRadius: 16, background: i % 4 === 0 ? FLASH : "#fbfaf7", color: INK,
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 64, boxShadow: "0 20px 40px rgba(0,0,0,0.4)",
          opacity: k, transform: `scale(${0.6 + 0.4 * k}) rotate(${((i * 37) % 14) - 7}deg)` }}>{pr}</div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", ...lab, fontSize: 30, color: "#fff", opacity: p(f, from + 40, 10) }}>ALMOST NEVER A ROUND NUMBER</div>
    </AbsoluteFill>
  );
};

/** Three field tests, each ticked: the 9-ending price sold more. */
export const Tests: React.FC<{ at: [number, number, number] }> = ({ at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", ...lab, fontSize: 32, color: "#fff" }}>DID THE PRICE ENDING IN 9 SELL MORE?</div>
      {at.map((a, i) => {
        const k = p(f, a, 12);
        return <div key={i} style={{ position: "absolute", left: 140, width: 800, top: 880 + i * 230, height: 190, borderRadius: 24, background: "rgba(255,255,255,0.1)", border: "3px solid rgba(255,255,255,0.4)",
          display: "flex", alignItems: "center", padding: "0 44px", gap: 30, opacity: k, transform: `translateX(${(1 - k) * 80}px)` }}>
          <div style={{ ...lab, fontSize: 36, color: "#fff", flex: 1 }}>TEST {i + 1}</div>
          <div style={{ width: 120, height: 120, borderRadius: 60, background: FLASH, display: "flex", alignItems: "center", justifyContent: "center", transform: `scale(${p(f, a + 8, 10)})` }}>
            <svg width={70} height={70}><path d="M 10 38 L 28 56 L 62 16" stroke={INK} strokeWidth={10} fill="none" strokeLinecap="round" strokeLinejoin="round" /></svg>
          </div>
          <div style={{ ...lab, fontSize: 32, color: FLASH }}>YES</div>
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 28, color: "rgba(255,255,255,0.8)" }}>ANDERSON & SIMESTER · 2003</div>
    </AbsoluteFill>
  );
};

/** An odometer rolling past 80,000, and the price tag dropping the moment the first digit changes. */
export const Odometer: React.FC<{ from: number; crossAt: number }> = ({ from, crossAt }) => {
  const f = useCurrentFrame();
  const miles = Math.round(interpolate(f, [from, crossAt, crossAt + 30], [79880, 80000, 80030], clamp));
  const drop = p(f, crossAt, 14);
  const digits = String(miles).padStart(6, "0").split("");
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>MILES ON THE CLOCK</div>
      <div style={{ position: "absolute", left: 120, top: 860, width: 840, height: 220, borderRadius: 24, background: "#0b0b12", border: "6px solid #fff", display: "flex", justifyContent: "center", alignItems: "center", gap: 10 }}>
        {digits.map((d, i) => <div key={i} style={{ width: 110, height: 170, borderRadius: 12, background: i === 1 && f >= crossAt ? FLASH : "#1d1d2a", color: i === 1 && f >= crossAt ? INK : "#fff",
          display: "flex", alignItems: "center", justifyContent: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 120 }}>{d}</div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>WHAT BUYERS PAID</div>
      <div style={{ position: "absolute", left: 340, top: 1240, width: 400, height: 380, borderRadius: 20, background: "rgba(255,255,255,0.08)", border: "3px solid rgba(255,255,255,0.4)" }}>
        <div style={{ position: "absolute", left: 90, right: 90, bottom: 0, height: `${85 - 35 * drop}%`, borderRadius: "14px 14px 0 0", background: drop > 0.5 ? "#ff3b3b" : "#fff", boxShadow: drop > 0.5 ? "0 0 30px rgba(255,59,59,0.8)" : "none" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1660, textAlign: "center", ...lab, fontSize: 30, color: "#ff6b6b", opacity: drop }}>A SHARP DROP · LACETERA, POPE & SYDNOR · 2012</div>
    </AbsoluteFill>
  );
};

/** The closing equation: $99.99 = $100. */
export const Equals: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", flexDirection: "column", gap: 10, paddingTop: 300 }}>
      <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 170, color: "#fff", transform: `scale(${p(f, from, 12)})` }}>$99.99</div>
      <div style={{ fontFamily: SERIF2, fontSize: 160, color: FLASH, opacity: p(f, from + 12, 10) }}>=</div>
      <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 170, color: FLASH, transform: `scale(${p(f, from + 24, 12)})`, textShadow: "0 0 40px rgba(243,194,29,0.7)" }}>$100</div>
    </AbsoluteFill>
  );
};
