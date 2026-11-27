// Motion graphics for "The McGurk effect: your eyes change what you hear", in the mosquito look: thin serif for big words
// and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** Lips that open and close (drawn, not a real face). */
const Lips: React.FC<{ open: number; size?: number }> = ({ open, size = 300 }) => (
  <svg viewBox="0 0 200 120" style={{ width: size, height: size * 0.6 }}>
    <path d={`M20 60 Q100 ${20 - 10 * open} 180 60 Q100 ${70 + 10 * open} 20 60 Z`} fill="#f0a3a3" stroke="#fff" strokeWidth="4" />
    <path d={`M20 60 Q100 ${60 + 40 * open} 180 60 Q100 ${100 + 10 * open} 20 60 Z`} fill="#e07b7b" stroke="#fff" strokeWidth="4" />
    <ellipse cx="100" cy={62 + 12 * open} rx={60 * open} ry={20 * open} fill="#2a0a1a" />
  </svg>
);
/** A little sound wave. */
const Wave: React.FC<{ f: number; color?: string; width?: number }> = ({ f, color = "#fff", width = 300 }) => {
  let d = "";
  for (let x = 0; x <= 200; x += 4) d += `${x ? "L" : "M"}${x} ${50 + Math.sin(x * 0.12 + f * 0.5) * 30 * Math.sin((x / 200) * Math.PI)} `;
  return <svg viewBox="0 0 200 100" style={{ width, height: width / 2 }}><path d={d} fill="none" stroke={color} strokeWidth="5" strokeLinecap="round" /></svg>;
};

/** Eyes see GA + ears hear BA -> brain makes DA. */
export const Fuse: React.FC<{ from: number; baAt: number; daAt: number }> = ({ from, baAt, daAt }) => {
  const f = useCurrentFrame();
  const open = 0.5 + 0.5 * Math.sin((f - from) * 0.35);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, top: 840, width: 400, textAlign: "center", opacity: p(f, from, 8) }}>
        <Lips open={open} size={330} />
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginTop: 20 }}>EYES SEE</div>
        <div style={{ ...serif(110), marginTop: 10 }}>"ga"</div>
      </div>
      <div style={{ position: "absolute", left: 580, top: 860, width: 400, textAlign: "center", opacity: p(f, baAt, 8) }}>
        <Wave f={f} width={330} />
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginTop: 40 }}>EARS HEAR</div>
        <div style={{ ...serif(110), marginTop: 10 }}>"ba"</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", opacity: p(f, daAt, 10), transform: `scale(${0.7 + 0.3 * p(f, daAt, 12)})` }}>
        <div style={{ ...lab, fontSize: 24, color: FLASH }}>BRAIN MAKES</div>
        <div style={{ ...serif(170, FLASH), marginTop: 10 }}>"da"</div>
      </div>
    </AbsoluteFill>
  );
};

/** Yanny or Laurel: one wave, two answers. */
export const Yanny: React.FC<{ from: number; laurelAt: number; yannyAt: number }> = ({ from, laurelAt, yannyAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", opacity: p(f, from, 8) }}><Wave f={f} width={760} /></div>
      <div style={{ position: "absolute", left: 120, width: 400, top: 1260, textAlign: "center", ...serif(120), opacity: p(f, laurelAt, 10) }}>"Laurel"</div>
      <div style={{ position: "absolute", left: 560, width: 400, top: 1260, textAlign: "center", ...serif(120, FLASH), opacity: p(f, yannyAt, 10) }}>"Yanny"</div>
      {note("MAY 2018 · ONE 4-SECOND CLIP", 1460)}
    </AbsoluteFill>
  );
};

/** Eye and ear arrows meeting in a brain: a best guess. */
export const Mix: React.FC<{ from: number; seeAt: number; guessAt: number }> = ({ from, seeAt, guessAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 600 420" style={{ position: "absolute", left: 90, top: 820, width: 900, height: 630, opacity: p(f, from, 8) }}>
        <ellipse cx="300" cy="220" rx="120" ry="95" fill="rgba(243,194,29,0.12)" stroke={FLASH} strokeWidth="5" opacity={0.3 + 0.7 * p(f, guessAt, 10)} />
        <g opacity={p(f, from, 8)}><path d="M40 90 Q80 50 120 90 Q80 130 40 90 Z" fill="none" stroke="#fff" strokeWidth="5" /><circle cx="80" cy="90" r="13" fill="#fff" />
          <line x1="130" y1="100" x2="190" y2="170" stroke="#fff" strokeWidth="5" strokeDasharray="10 8" /></g>
        <g opacity={p(f, seeAt, 8)}><path d="M520 60 C580 60 590 150 540 170 C520 180 530 200 510 200" fill="none" stroke="#fff" strokeWidth="5" />
          <line x1="490" y1="160" x2="415" y2="200" stroke="#fff" strokeWidth="5" strokeDasharray="10 8" /></g>
        <text x="300" y="232" textAnchor="middle" fill={FLASH} fontFamily={SANS2} fontWeight={800} fontSize="22" letterSpacing="3" opacity={p(f, guessAt, 10)}>BEST GUESS</text>
        <text x="80" y="160" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="18" letterSpacing="3">SEE</text>
        <text x="545" y="230" textAnchor="middle" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="18" letterSpacing="3" opacity={p(f, seeAt, 8)}>HEAR</text>
      </svg>
    </AbsoluteFill>
  );
};

/** Eyes closed: "ba". Eyes open: "da". */
export const Blink: React.FC<{ closedAt: number; openAt: number }> = ({ closedAt, openAt }) => {
  const f = useCurrentFrame();
  const shut = f >= closedAt && f < openAt;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 300 160" style={{ position: "absolute", left: 240, top: 860, width: 600, height: 320, opacity: p(f, closedAt - 8, 8) }}>
        {shut ? <path d="M30 80 Q150 130 270 80" fill="none" stroke="#fff" strokeWidth="7" strokeLinecap="round" />
          : <g><path d="M30 80 Q150 0 270 80 Q150 160 30 80 Z" fill="none" stroke="#fff" strokeWidth="6" /><circle cx="150" cy="80" r="34" fill={FLASH} /></g>}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1260, textAlign: "center", ...serif(190, shut ? "#fff" : FLASH) }}>{shut ? '"ba"' : '"da"'}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", ...lab, fontSize: 26, color: "#fff" }}>{shut ? "EYES CLOSED" : "EYES OPEN"}</div>
    </AbsoluteFill>
  );
};

/** People spread from 0% to 100% of the time hearing the made-up sound. */
export const Range: React.FC<{ from: number; allAt: number; neverAt: number; yearAt: number }> = ({ from, allAt, neverAt, yearAt }) => {
  const f = useCurrentFrame();
  const dots = Array.from({ length: 40 }, (_, i) => ({ x: ((i * 37) % 101) / 100, y: ((i * 53) % 7) }));
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>HOW OFTEN EACH PERSON HEARD "DA"</div>
      <div style={{ position: "absolute", left: 140, right: 140, top: 1100, height: 6, background: "rgba(255,255,255,0.5)" }} />
      {dots.map((d, i) => <div key={i} style={{ position: "absolute", left: 140 + d.x * 800 - 14, top: 1040 - d.y * 34, width: 28, height: 28, borderRadius: 14, background: d.x > 0.9 && f >= allAt ? FLASH : d.x < 0.1 && f >= neverAt ? "#fff" : "rgba(255,255,255,0.45)", opacity: p(f, from + (i % 10) * 2, 6) }} />)}
      <div style={{ position: "absolute", left: 100, top: 1130, ...serif(70), opacity: p(f, neverAt, 8) }}>0%</div>
      <div style={{ position: "absolute", right: 100, top: 1130, ...serif(70, FLASH), opacity: p(f, allAt, 8) }}>100%</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", ...serif(100), opacity: p(f, yearAt, 10) }}>a year later: <span style={{ color: FLASH }}>same</span></div>
      {note("BASU MALLICK ET AL. · 2015 · BAYLOR COLLEGE OF MEDICINE", 1520)}
    </AbsoluteFill>
  );
};

void interpolate; void clamp;
