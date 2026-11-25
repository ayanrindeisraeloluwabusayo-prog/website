// Motion graphics for "Why you think everybody noticed your mistake" (the spotlight effect): white on blue, gold for the key fact.
// The singer on the T-shirt is never named or shown: the shirt carries a plain drawn face.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE_DEEP, FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const big = (size: number, face = "#fff", depth = FLASH): React.CSSProperties => ({ fontFamily: SANS2, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.04em", color: face,
  textShadow: `${Array.from({ length: 12 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < 6 ? depth : BLUE_DEEP}`).join(", ")}, 0 0 70px rgba(243,194,29,0.6)` });
const note = (text: string, top = 1640) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>
);

/** Every eye in the room turning to you: rows of eye-pairs whose pupils swing to the centre. */
export const AllEyes: React.FC<{ from: number; turnAt: number }> = ({ from, turnAt }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [turnAt, turnAt + 8], [0, 1], clamp);
  const pairs = Array.from({ length: 20 }, (_, i) => ({ x: 130 + (i % 4) * 220, y: 800 + Math.floor(i / 4) * 160 }));
  return (
    <AbsoluteFill>
      {pairs.map(({ x, y }, i) => {
        const dx = (540 - x) / 400, dy = (1150 - y) / 500;
        const lx = interpolate(t, [0, 1], [Math.sin(i * 2.1), dx]), ly = interpolate(t, [0, 1], [Math.cos(i * 1.3) * 0.6, dy]);
        return <div key={i} style={{ position: "absolute", left: x - 60, top: y, display: "flex", gap: 14, opacity: p(f, from + i, 6) }}>
          {[0, 1].map((k) => <div key={k} style={{ width: 52, height: 30, borderRadius: "50%", background: "#fff", position: "relative", overflow: "hidden", boxShadow: t > 0.5 ? "0 0 20px rgba(243,194,29,0.7)" : "none" }}>
            <div style={{ position: "absolute", left: 16 + 12 * lx, top: 5 + 6 * ly, width: 20, height: 20, borderRadius: 10, background: BLUE_DEEP }} />
          </div>)}
        </div>;
      })}
      <div style={{ position: "absolute", left: 490, top: 1125, width: 100, height: 100, borderRadius: 50, background: FLASH, boxShadow: "0 0 60px rgba(243,194,29,0.9)", opacity: t }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 36, color: FLASH, opacity: t }}>YOU</div>
    </AbsoluteFill>
  );
};

/** A T-shirt with a plain drawn face on it, stamped EMBARRASSING. `proud` swaps in a gold star and PROUD. */
export const Shirt: React.FC<{ from: number; stampAt: number; proud?: boolean }> = ({ from, stampAt, proud }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12), s = p(f, stampAt, 7);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 560" style={{ position: "absolute", left: 240, top: 800, width: 600, height: 560, opacity: k, transform: `translateY(${(1 - k) * 80}px)` }}>
        <path d="M200 30 Q300 90 400 30 L560 110 L500 230 L450 200 L450 540 L150 540 L150 200 L100 230 L40 110 Z" fill={proud ? "#fff" : "#f2f2f2"} stroke={BLUE_DEEP} strokeWidth="10" strokeLinejoin="round" />
        {proud ? (
          <path d="M300 230 L330 310 L415 312 L348 362 L372 445 L300 395 L228 445 L252 362 L185 312 L270 310 Z" fill={FLASH} />
        ) : (
          <g>
            <circle cx="300" cy="330" r="95" fill="#ffd9a8" stroke={BLUE_DEEP} strokeWidth="6" />
            <path d="M205 300 Q300 180 395 300 Q380 240 300 225 Q220 240 205 300 Z" fill="#8a4b20" />
            <circle cx="268" cy="325" r="9" fill={BLUE_DEEP} /><circle cx="332" cy="325" r="9" fill={BLUE_DEEP} />
            <path d="M262 370 Q300 400 338 370" stroke={BLUE_DEEP} strokeWidth="7" fill="none" strokeLinecap="round" />
            <text x="300" y="480" textAnchor="middle" fontFamily="Inter, sans-serif" fontWeight="900" fontSize="44" fill="#ff4fa3">♥ ♪ ♥</text>
          </g>
        )}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", opacity: s, transform: `rotate(-6deg) scale(${2 - s})` }}>
        <span style={{ display: "inline-block", padding: "8px 32px 14px", border: `10px solid ${proud ? FLASH : "#ff3b3b"}`, borderRadius: 22, ...big(proud ? 120 : 96, proud ? FLASH : "#ff3b3b", "#fff") }}>{proud ? "PROUD" : "EMBARRASSING"}</span>
      </div>
    </AbsoluteFill>
  );
};

/** A room of 40 people as dots; `pct` of them light up gold, with a big counter. */
export const Room: React.FC<{ from: number; at: number; pct: number; label: string; prefix?: string }> = ({ from, at, pct, label, prefix = "" }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [at, at + 24], [0, pct], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const lit = Math.round(40 * k);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", ...lab, fontSize: 34, color: "#fff", opacity: p(f, from, 8) }}>{label}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 850, textAlign: "center", ...big(230, FLASH, "#fff") }}>{prefix && f >= at + 24 ? `${prefix}25%` : `${Math.round(k * 100)}%`}</div>
      <div style={{ position: "absolute", left: 170, width: 740, top: 1120, display: "flex", flexWrap: "wrap", gap: 22, opacity: p(f, from, 10) }}>
        {Array.from({ length: 40 }, (_, i) => <div key={i} style={{ width: 70, height: 70, borderRadius: 35, background: i < lit ? FLASH : "rgba(255,255,255,0.2)", boxShadow: i < lit ? "0 0 24px rgba(243,194,29,0.8)" : "none" }} />)}
      </div>
      {note("GILOVICH, MEDVEC & SAVITSKY · 2000 · ILLUSTRATION", 1620)}
    </AbsoluteFill>
  );
};

/** Expected vs real: two bars, the first twice the second, then "2×". */
export const Twice: React.FC<{ from: number; twiceAt: number }> = ({ from, twiceAt }) => {
  const f = useCurrentFrame();
  const bar = (left: number, h: number, label: string, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 18], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left, top: 820, width: 320, textAlign: "center" }}>
      <div style={{ position: "relative", height: 620 }}><div style={{ position: "absolute", left: 70, right: 70, bottom: 0, height: h * g, borderRadius: "16px 16px 0 0", background: gold ? FLASH : "#fff", boxShadow: gold ? "0 0 40px rgba(243,194,29,0.7)" : "none" }} /></div>
      <div style={{ ...lab, fontSize: 32, color: gold ? FLASH : "#fff", marginTop: 18 }}>{label}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      {bar(150, 600, "EXPECTED", true, from + 2)}
      {bar(610, 300, "REAL", false, from + 10)}
      <div style={{ position: "absolute", left: 600, width: 340, top: 900, textAlign: "center", ...big(190, FLASH, "#fff"), opacity: p(f, twiceAt, 8), transform: `scale(${1.6 - 0.6 * p(f, twiceAt, 8)})` }}>2×</div>
    </AbsoluteFill>
  );
};

/** THE SPOTLIGHT EFFECT as a title, lit by a cone from above. */
export const Named: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 240, top: 600, width: 600, height: 900, background: "linear-gradient(180deg, rgba(255,240,180,0) 0%, rgba(255,240,180,0.35) 100%)", clipPath: "polygon(42% 0, 58% 0, 100% 100%, 0 100%)", opacity: k }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1060, textAlign: "center", fontFamily: SERIF2, fontSize: 120, color: "#fff", opacity: k }}>the</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1190, textAlign: "center", ...big(170, FLASH, "#fff"), opacity: k, transform: `scale(${1.2 - 0.2 * k})` }}>SPOTLIGHT</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...big(170, "#fff"), opacity: p(f, from + 6, 12) }}>EFFECT</div>
    </AbsoluteFill>
  );
};

/** "Every detail of your own mistake": a magnifying glass sweeping over a big MISTAKE. */
export const Detail: React.FC<{ from: number; mistakeAt: number }> = ({ from, mistakeAt }) => {
  const f = useCurrentFrame();
  const x = interpolate(f, [from, mistakeAt + 30], [180, 640], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", ...big(190, "#fff"), opacity: p(f, mistakeAt - 4, 8) }}>MISTAKE</div>
      <div style={{ position: "absolute", left: x, top: 980, width: 300, height: 300, borderRadius: 150, border: `18px solid ${FLASH}`, background: "rgba(255,255,255,0.12)", boxShadow: "0 0 50px rgba(243,194,29,0.6)", opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: 240, top: 250, width: 40, height: 170, borderRadius: 20, background: FLASH, transform: "rotate(-45deg)", transformOrigin: "top" }} />
      </div>
    </AbsoluteFill>
  );
};

/** The proud-shirt rerun: shirt with a star, then "SAME RESULT". */
export const Same: React.FC<{ from: number; proudAt: number; sameAt: number }> = ({ from, proudAt, sameAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - p(f, sameAt - 4, 8) }}><Shirt from={from} stampAt={proudAt} proud /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", ...big(170, FLASH, "#fff"), opacity: p(f, sameAt, 8), transform: `scale(${1.5 - 0.5 * p(f, sameAt, 8)})` }}>SAME</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", ...big(130, "#fff"), opacity: p(f, sameAt + 4, 10) }}>RESULT</div>
    </AbsoluteFill>
  );
};

/** "Most people didn't see it." */
export const Most: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", ...big(150, "#fff"), opacity: p(f, from, 8) }}>MOST PEOPLE</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", ...big(150, FLASH, "#fff"), opacity: p(f, from + 8, 8), transform: `scale(${1.4 - 0.4 * p(f, from + 8, 8)})` }}>DIDN'T SEE IT</div>
    </AbsoluteFill>
  );
};
