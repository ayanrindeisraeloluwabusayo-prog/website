// Motion graphics for the bystander effect video: white on blue, gold for the key fact, red for the emergency.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const RED = "#ff5a4f";
const INK = "#16161a";

const Person: React.FC<{ x: number; y: number; s?: number; color: string; o?: number }> = ({ x, y, s = 1, color, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-22} r={13} fill={color} />
    <path d="M -20 30 C -20 2, 20 2, 20 30 Z" fill={color} />
  </g>
);

/** The 1964 claim, as a newsprint card: 38 people watched, nobody called the police. */
export const Claim38: React.FC<{ from: number; countAt: number; nobodyAt: number }> = ({ from, countAt, nobodyAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14), c = p(f, countAt, 10), n = p(f, nobodyAt, 12);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 860, width: 860, height: 700, background: "#f1ece0", borderRadius: 6, opacity: k,
        transform: `translateY(${(1 - k) * 60}px) rotate(${-2 + 0.5 * k}deg)`, boxShadow: "0 50px 100px rgba(0,0,0,0.5)", color: INK, boxSizing: "border-box", padding: "44px 56px" }}>
        <div style={{ ...lab, fontSize: 24, borderBottom: `3px solid ${INK}`, paddingBottom: 16, display: "flex", justifyContent: "space-between" }}><span>AS REPORTED</span><span>MARCH 1964</span></div>
        <div style={{ display: "flex", alignItems: "baseline", gap: 30, marginTop: 20 }}>
          <div style={{ fontFamily: SERIF2, fontSize: 330, lineHeight: 1, letterSpacing: "-0.04em", transform: `scale(${0.7 + 0.3 * c})`, transformOrigin: "left bottom", opacity: c }}>38</div>
          <div style={{ fontFamily: SERIF2, fontSize: 74, lineHeight: 1.05, opacity: c }}>people<br />watched</div>
        </div>
        <div style={{ fontFamily: SERIF2, fontStyle: "italic", fontSize: 66, lineHeight: 1.1, marginTop: 26, opacity: n, transform: `translateY(${(1 - n) * 20}px)` }}>and nobody called the police.</div>
        <div style={{ position: "absolute", left: 56, right: 56, bottom: 38, ...lab, fontSize: 22, opacity: 0.6 }}>THE NEW YORK TIMES · THE CLAIM THAT STARTED IT</div>
      </div>
    </AbsoluteFill>
  );
};

/** Students alone in separate rooms, joined only by an intercom; then one voice is in trouble. */
export const Rooms: React.FC<{ from: number; seizureAt: number }> = ({ from, seizureAt }) => {
  const f = useCurrentFrame();
  const sz = f >= seizureAt ? 1 : 0;
  const pulse = sz * (0.6 + 0.4 * Math.sin((f - seizureAt) / 2.2));
  const rooms = [0, 1, 2, 3, 4, 5].map((i) => ({ x: i % 2 ? 640 : 110, y: 900 + Math.floor(i / 2) * 250, left: !(i % 2) }));
  const BW = 330, BH = 200, CX = W / 2;
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <line x1={CX} x2={CX} y1={930} y2={1570} stroke="rgba(255,255,255,0.5)" strokeWidth={5} strokeDasharray="4 12" strokeLinecap="round" opacity={p(f, from + 10, 14)} />
        {rooms.map((r, i) => {
          const k = p(f, from + i * 4, 12);
          const victim = i === 3;
          const col = victim && sz ? RED : "#fff";
          const wy = r.y + BH / 2;
          return (
            <g key={i} opacity={k} transform={`translate(0 ${(1 - k) * 30})`}>
              <rect x={r.x} y={r.y} width={BW} height={BH} rx={18} fill={victim && sz ? `rgba(255,90,79,${0.18 + 0.2 * pulse})` : "rgba(255,255,255,0.07)"} stroke={col} strokeWidth={5} />
              <Person x={r.x + BW / 2} y={wy + 8} s={1.9} color={col} />
              <line x1={r.left ? r.x + BW : r.x} x2={CX} y1={wy} y2={wy} stroke={victim && sz ? RED : "rgba(255,255,255,0.5)"} strokeWidth={victim && sz ? 6 : 4} strokeDasharray="4 12" strokeLinecap="round" />
              {victim && sz ? [0, 1, 2].map((j) => {
                const t = ((f - seizureAt + j * 8) % 24) / 24;
                return <circle key={j} cx={r.x + BW / 2} cy={wy} r={40 + t * 150} fill="none" stroke={RED} strokeWidth={4} opacity={(1 - t) * 0.8} />;
              }) : null}
            </g>
          );
        })}
        <text x={CX} y={1680} textAnchor="middle" fill={sz ? RED : "#fff"} fontSize={30} {...lab}>{sz ? "ONE VOICE IS IN TROUBLE" : "ALONE IN A ROOM · LINKED BY INTERCOM"}</text>
      </svg>
    </AbsoluteFill>
  );
};

/** 85 % helped when alone with the voice; 31 % when four others could hear it too. */
export const HelpBars: React.FC<{ from: number; aloneAt: number; groupAt0: number; groupAt: number }> = ({ from, aloneAt, groupAt0, groupAt }) => {
  const f = useCurrentFrame();
  const row = (y: number, title: string, people: number, pct: number, at0: number, at: number, gold: boolean) => {
    const k = p(f, at0, 12);
    const g = interpolate(f, [at, at + 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    const col = gold ? FLASH : "#fff";
    return (
      <div style={{ position: "absolute", left: 110, width: 860, top: y, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ ...lab, fontSize: 30, color: col }}>{title}</div>
        <svg width={860} height={90} style={{ display: "block", marginTop: 6 }}>
          {Array.from({ length: people }, (_, i) => <Person key={i} x={30 + i * 62} y={50} s={1.15} color={i === 0 ? col : "rgba(255,255,255,0.55)"} />)}
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 8 }}>
          <div style={{ flex: 1, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <div style={{ width: `${pct * g}%`, height: "100%", borderRadius: 32, background: col, boxShadow: gold ? "0 0 30px rgba(243,194,29,0.8)" : "none" }} />
          </div>
          <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 96, letterSpacing: "-0.04em", color: col, width: 220, textAlign: "right" }}>{Math.round(pct * g)}%</div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {row(880, "THOUGHT THEY WERE THE ONLY ONE", 1, 85, from, aloneAt, true)}
      {row(1240, "THOUGHT FOUR OTHERS HEARD IT TOO", 5, 31, groupAt0, groupAt, false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1610, textAlign: "center", ...lab, fontSize: 28, color: "rgba(255,255,255,0.8)" }}>RUSHED TO GET HELP</div>
    </AbsoluteFill>
  );
};

/** "There were never 38 silent witnesses. Only a handful saw anything clearly." */
export const Crack38: React.FC<{ from: number; strikeAt: number; handfulAt: number }> = ({ from, strikeAt, handfulAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 10), st = p(f, strikeAt, 10), h = p(f, handfulAt, 14);
  const shake = f >= strikeAt && f < strikeAt + 10 ? Math.sin(f * 2.6) * 10 : 0;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", opacity: k * (1 - 0.55 * h), transform: `translateX(${shake}px) scale(${1 - 0.18 * h})` }}>
        <div style={{ position: "relative", display: "inline-block", fontFamily: SERIF2, fontSize: 420, lineHeight: 1, color: "#fff", letterSpacing: "-0.04em" }}>
          38
          <div style={{ position: "absolute", left: "-8%", top: "50%", height: 22, width: `${116 * st}%`, background: RED, borderRadius: 11, transform: "rotate(-9deg)", boxShadow: "0 0 30px rgba(255,90,79,0.8)" }} />
        </div>
        <div style={{ ...lab, fontSize: 30, color: "#fff", marginTop: -6 }}>SILENT WITNESSES</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", opacity: h, transform: `translateY(${(1 - h) * 40}px)` }}>
        <svg width={560} height={110} style={{ display: "inline-block" }}>
          {[0, 1, 2, 3, 4, 5].map((i) => <Person key={i} x={50 + i * 92} y={58} s={1.7} color={FLASH} o={p(f, handfulAt + i * 3, 8)} />)}
        </svg>
        <div style={{ fontFamily: SERIF2, fontStyle: "italic", fontSize: 92, color: FLASH, marginTop: 6 }}>only a handful</div>
        <div style={{ ...lab, fontSize: 28, color: "rgba(255,255,255,0.85)", marginTop: 10 }}>SAW ANYTHING CLEARLY</div>
      </div>
    </AbsoluteFill>
  );
};

/** The newspaper's own words, 2016. */
export const Quote16: React.FC<{ from: number; hlAt: number }> = ({ from, hlAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14), hl = p(f, hlAt, 18);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, top: 880, width: 860, background: "#f1ece0", borderRadius: 6, opacity: k, transform: `translateY(${(1 - k) * 60}px) rotate(${1.5 - 0.5 * k}deg)`,
        boxShadow: "0 50px 100px rgba(0,0,0,0.5)", color: INK, boxSizing: "border-box", padding: "44px 56px 50px" }}>
        <div style={{ ...lab, fontSize: 24, borderBottom: `3px solid ${INK}`, paddingBottom: 16, display: "flex", justifyContent: "space-between" }}><span>THE NEW YORK TIMES</span><span>2016</span></div>
        <div style={{ fontFamily: SERIF2, fontSize: 68, lineHeight: 1.16, marginTop: 30 }}>
          The 1964 article “<span style={{ backgroundImage: `linear-gradient(${FLASH}, ${FLASH})`, backgroundRepeat: "no-repeat", backgroundSize: `${hl * 100}% 86%`, backgroundPosition: "0 60%" }}>grossly exaggerated</span> the number of witnesses and what they had perceived.”
        </div>
      </div>
    </AbsoluteFill>
  );
};
