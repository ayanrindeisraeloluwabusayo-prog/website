// Motion graphics for "The dress: blue and black, or white and gold?", in the mosquito look: thin serif for big words and
// numbers, small spaced labels, light shapes, white on blue with gold for the key fact. The dress here is our own drawing.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

export const BB = ["#3550a8", "#1a1a22"];
export const WG = ["#eef0f8", "#c9a347"];

/** Our own simple striped dress, coloured with a body colour and a stripe colour. */
export const DressShape: React.FC<{ body: string; stripe: string; size?: number }> = ({ body, stripe, size = 420 }) => (
  <svg viewBox="0 0 200 300" style={{ width: size, height: size * 1.5 }}>
    <defs><clipPath id={`d${body.slice(1)}${stripe.slice(1)}`}><path d="M70 10 L130 10 L140 70 L125 110 L175 290 L25 290 L75 110 L60 70 Z" /></clipPath></defs>
    <g clipPath={`url(#d${body.slice(1)}${stripe.slice(1)})`}>
      <rect x="0" y="0" width="200" height="300" fill={body} />
      {[60, 112, 150, 200, 255].map((y) => <rect key={y} x="0" y={y} width="200" height="16" fill={stripe} />)}
    </g>
    <path d="M70 10 L130 10 L140 70 L125 110 L175 290 L25 290 L75 110 L60 70 Z" fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="2" />
  </svg>
);

/** The drawn dress flipping between the two readings. */
export const Flip: React.FC<{ from: number; fixed?: boolean }> = ({ from, fixed }) => {
  const f = useCurrentFrame();
  const wg = !fixed && Math.floor((f - from) / 18) % 2 === 1;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, display: "flex", justifyContent: "center", opacity: p(f, from, 8) }}>
        <DressShape body={wg ? WG[0] : BB[0]} stripe={wg ? WG[1] : BB[1]} size={420} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...serif(100, wg ? FLASH : "#fff") }}>{fixed ? "really blue & black" : wg ? "white & gold?" : "blue & black?"}</div>
    </AbsoluteFill>
  );
};

/** Survey: 57% blue/black, 30% white/gold, 11% blue/brown. */
export const Split: React.FC<{ from: number; bbAt: number; wgAt: number }> = ({ from, bbAt, wgAt }) => {
  const f = useCurrentFrame();
  const bar = (top: number, label: string, pct: number, colors: string[], at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left: 120, right: 120, top, opacity: p(f, at - 4, 6) }}>
      <div style={{ ...lab, fontSize: 24, color: "#fff", marginBottom: 12 }}>{label}</div>
      <div style={{ display: "flex", alignItems: "center", gap: 24 }}>
        <div style={{ height: 70, width: 760 * (pct / 60) * g, borderRadius: 12, background: `linear-gradient(90deg, ${colors[0]} 0 70%, ${colors[1]} 70% 100%)`, border: "2px solid rgba(255,255,255,0.5)" }} />
        <div style={{ ...serif(80, FLASH), opacity: g }}>{pct}%</div>
      </div>
    </div>;
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {bar(840, "BLUE & BLACK", 57, BB, bbAt)}
      {bar(1050, "WHITE & GOLD", 30, WG, wgAt)}
      {bar(1260, "BLUE & BROWN", 11, ["#3550a8", "#6b4a2b"], wgAt + 12)}
      {note("LAFER-SOUSA, HERMANN & CONWAY · CURRENT BIOLOGY · 2015 · ~1,400 PEOPLE", 1520)}
    </AbsoluteFill>
  );
};

/** Two panels: assume blue shadow -> remove blue -> white & gold; assume warm light -> remove yellow -> blue & black. */
export const Light: React.FC<{ from: number; shadowAt: number; warmAt: number }> = ({ from, shadowAt, warmAt }) => {
  const f = useCurrentFrame();
  const panel = (left: number, light: string, label: string, colors: string[], result: string, at: number) => (
    <div style={{ position: "absolute", left, top: 820, width: 420, textAlign: "center", opacity: p(f, at, 8) }}>
      <div style={{ ...lab, fontSize: 22, color: "#fff", marginBottom: 14 }}>{label}</div>
      <div style={{ position: "relative", height: 470, borderRadius: 24, background: `radial-gradient(circle at 50% 20%, ${light}, rgba(0,0,0,0.25) 75%)`, display: "flex", justifyContent: "center", alignItems: "center" }}>
        <DressShape body={colors[0]} stripe={colors[1]} size={260} />
      </div>
      <div style={{ ...serif(76, colors === WG ? FLASH : "#fff"), marginTop: 20, opacity: p(f, at + 14, 10) }}>{result}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {panel(90, "rgba(90,140,255,0.7)", "BRAIN ASSUMES BLUISH SHADOW", WG, "white & gold", shadowAt)}
      {panel(570, "rgba(255,190,80,0.75)", "BRAIN ASSUMES WARM LIGHT", BB, "blue & black", warmAt)}
    </AbsoluteFill>
  );
};

/** Early risers vs night owls. */
export const Owls: React.FC<{ from: number; larkAt: number; owlAt: number }> = ({ from, larkAt, owlAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, icon: React.ReactNode, label: string, colors: string[], result: string, at: number, gold: boolean) => (
    <div style={{ position: "absolute", left: 120, right: 120, top, display: "flex", alignItems: "center", gap: 36, opacity: p(f, at, 8) }}>
      <svg viewBox="0 0 100 100" style={{ width: 150, height: 150 }}>{icon}</svg>
      <DressShape body={colors[0]} stripe={colors[1]} size={110} />
      <div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.85)" }}>{label}</div>
        <div style={{ ...serif(76, gold ? FLASH : "#fff"), marginTop: 10 }}>{result}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {row(830, <g><circle cx="50" cy="50" r="22" fill={FLASH} />{Array.from({ length: 8 }, (_, i) => <line key={i} x1={50 + Math.cos(i * 0.785) * 30} y1={50 + Math.sin(i * 0.785) * 30} x2={50 + Math.cos(i * 0.785) * 44} y2={50 + Math.sin(i * 0.785) * 44} stroke={FLASH} strokeWidth="6" strokeLinecap="round" />)}</g>, "EARLY RISERS", WG, "more white & gold", larkAt, true)}
      {row(1150, <path d="M62 14 A38 38 0 1 0 86 70 A30 30 0 1 1 62 14 Z" fill="#fff" />, "NIGHT OWLS", BB, "more blue & black", owlAt, false)}
      {note("WALLISCH · JOURNAL OF VISION · 2017 · NYU · 13,417 PEOPLE", 1540)}
    </AbsoluteFill>
  );
};
