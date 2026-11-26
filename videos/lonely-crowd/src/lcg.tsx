// Motion graphics for "Why you can feel lonely around people", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const RED = "#ff5a5a";
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
const Person: React.FC<{ on: boolean; size?: number; dim?: boolean }> = ({ on, size = 110, dim }) => (
  <svg viewBox="0 0 60 90" style={{ width: size, height: size * 1.5 }}><circle cx="30" cy="18" r="15" fill={on ? FLASH : dim ? "rgba(255,255,255,0.3)" : "#fff"} /><path d="M4 88 C4 45 56 45 56 88 Z" fill={on ? FLASH : dim ? "rgba(255,255,255,0.3)" : "#fff"} /></svg>
);

/** Ten adults; five light up: "about half feel lonely". */
export const Half: React.FC<{ from: number; litAt: number }> = ({ from, litAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, right: 150, top: 860, display: "flex", flexWrap: "wrap", gap: 34, justifyContent: "center" }}>
        {Array.from({ length: 10 }, (_, i) => <div key={i} style={{ opacity: p(f, from + i * 2, 6) }}><Person on={i < 5 && f >= litAt + i * 3} dim size={112} /></div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(140, FLASH), opacity: p(f, litAt, 10) }}>about half</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, litAt + 8, 10) }}>OF US ADULTS SAY THEY FEEL LONELY</div>
      {note("US SURGEON GENERAL ADVISORY · 2023", 1560)}
    </AbsoluteFill>
  );
};

/** Fifteen cigarettes appear one by one: "15 a day". */
export const Smoke: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, right: 120, top: 880, height: 300, display: "flex", justifyContent: "space-between", alignItems: "flex-end", opacity: p(f, from, 6) }}>
        {Array.from({ length: 15 }, (_, i) => {
          const k = p(f, at + i * 2, 5);
          return <div key={i} style={{ width: 22, height: 260, opacity: k, transform: `translateY(${(1 - k) * 30}px)` }}>
            <div style={{ height: 36, borderRadius: "6px 6px 0 0", background: FLASH }} /><div style={{ height: 224, background: "#fff", borderRadius: "0 0 4px 4px" }} />
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1260, textAlign: "center", ...serif(170, FLASH), opacity: p(f, at + 20, 10) }}>15 a day</div>
      {note("THE RISK OF DYING EARLY FROM TOO LITTLE CONNECTION", 1470)}
    </AbsoluteFill>
  );
};

/** A crowd of dots around one dim person; "how many" gets crossed out. */
export const Many: React.FC<{ from: number; manyAt: number }> = ({ from, manyAt }) => {
  const f = useCurrentFrame();
  const s = p(f, manyAt + 14, 10);
  const dots = Array.from({ length: 34 }, (_, i) => ({ a: i * 2.399, r: 150 + ((i * 47) % 230) }));
  return (
    <AbsoluteFill>
      {dots.map((d, i) => (
        <div key={i} style={{ position: "absolute", left: 540 + Math.cos(d.a) * d.r - 14, top: 1040 + Math.sin(d.a) * d.r * 0.7 - 14, width: 28, height: 28, borderRadius: 14, background: "#fff", opacity: 0.75 * p(f, from + (i % 12) * 1.5, 6) }} />
      ))}
      <div style={{ position: "absolute", left: 485, top: 960, opacity: p(f, from, 8) }}><Person on={false} dim size={110} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", opacity: p(f, manyAt, 10) }}>
        <span style={{ position: "relative", display: "inline-block", ...serif(140), opacity: 1 - 0.4 * s }}>how many
          <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 6, background: RED, transform: `scaleX(${s})`, transformOrigin: "left" }} /></span>
      </div>
    </AbsoluteFill>
  );
};

/** The 1983 diary: rows of logged conversations, then "10+ min" and "2 weeks". */
export const Log: React.FC<{ from: number; tenAt: number; twoAt: number }> = ({ from, tenAt, twoAt }) => {
  const f = useCurrentFrame();
  const rows = ["MON · 14 MIN", "MON · 32 MIN", "TUE · 11 MIN", "WED · 25 MIN", "THU · 18 MIN"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 170, top: 820, width: 740, height: 430, borderRadius: 18, border: "3px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.06)", opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: 40, top: 28, ...lab, fontSize: 22, color: FLASH }}>CONVERSATION LOG</div>
        {rows.map((r, i) => (
          <div key={i} style={{ position: "absolute", left: 40, right: 40, top: 90 + i * 64, height: 50, borderBottom: "2px solid rgba(255,255,255,0.3)", opacity: p(f, from + 10 + i * 8, 6), display: "flex", alignItems: "center" }}>
            <span style={{ ...lab, fontSize: 22, color: "#fff" }}>{r}</span>
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 120, width: 420, top: 1320, textAlign: "center", whiteSpace: "nowrap", ...serif(110), opacity: p(f, tenAt, 10) }}>10+ min</div>
      <div style={{ position: "absolute", left: 540, width: 420, top: 1320, textAlign: "center", whiteSpace: "nowrap", ...serif(110, FLASH), opacity: p(f, twoAt, 10) }}>2 weeks</div>
      {note("WHEELER, REIS & NEZLEK · 1983 · 96 STUDENTS", 1500)}
    </AbsoluteFill>
  );
};

/** What protected them most: how meaningful (tall, gold) beat how many (short). */
export const Meaning: React.FC<{ from: number; meanAt: number; manyAt: number }> = ({ from, meanAt, manyAt }) => {
  const f = useCurrentFrame();
  const bar = (left: number, h: number, label: string, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left, top: 880, width: 340, textAlign: "center", opacity: p(f, at - 4, 6) }}>
      <div style={{ position: "relative", height: 500 }}><div style={{ position: "absolute", left: 110, right: 110, bottom: 0, height: h * g, borderRadius: "12px 12px 0 0", background: gold ? FLASH : "#fff" }} /></div>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginTop: 16 }}>{label}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>WHAT PROTECTED THEM MOST</div>
      {bar(150, 470, "HOW MEANINGFUL", true, meanAt)}
      {bar(590, 200, "HOW MANY", false, manyAt)}
      {note("ILLUSTRATION · WHEELER, REIS & NEZLEK · 1983", 1540)}
    </AbsoluteFill>
  );
};

/** Two bars, the connection you have and the one you need; the space between is the gap (and it can widen). */
export const Gap: React.FC<{ from: number; haveAt: number; needAt: number; widenAt?: number }> = ({ from, haveAt, needAt, widenAt }) => {
  const f = useCurrentFrame();
  const w = widenAt === undefined ? 0 : p(f, widenAt, 18);
  const have = 440 - 200 * w, need = 820;
  const gk = p(f, needAt + 6, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 130, top: 900, opacity: p(f, haveAt, 8) }}>
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginBottom: 12 }}>THE CONNECTION YOU HAVE</div>
        <div style={{ width: have * p(f, haveAt, 14), height: 60, borderRadius: 10, background: "#fff" }} />
      </div>
      <div style={{ position: "absolute", left: 130, top: 1080, opacity: p(f, needAt, 8) }}>
        <div style={{ ...lab, fontSize: 24, color: FLASH, marginBottom: 12 }}>THE CONNECTION YOU NEED</div>
        <div style={{ width: need * p(f, needAt, 14), height: 60, borderRadius: 10, background: FLASH }} />
      </div>
      <div style={{ position: "absolute", left: 130 + have, width: need - have, top: 1210, opacity: gk }}>
        <div style={{ height: 30, borderLeft: `4px solid ${RED}`, borderRight: `4px solid ${RED}`, borderBottom: `4px solid ${RED}` }} />
      </div>
      <div style={{ position: "absolute", left: 130 + have, width: need - have, top: 1290, display: "flex", justifyContent: "center", whiteSpace: "nowrap", ...serif(130, RED), opacity: gk }}>{w > 0.5 ? "wider" : "the gap"}</div>
      <div style={{ opacity: p(f, from, 1) }} />
    </AbsoluteFill>
  );
};

/** Two timers: lonely brains spot a social threat in ~116 ms, others in ~252 ms. */
export const Fast: React.FC<{ from: number; twiceAt: number; tenthAt: number }> = ({ from, twiceAt, tenthAt }) => {
  const f = useCurrentFrame();
  const run = (ms: number) => Math.round(Math.min(ms, interpolate(f, [twiceAt - 6, twiceAt + 30], [0, 252], clamp)));
  const col = (left: number, ms: number, label: string, gold: boolean) => (
    <div style={{ position: "absolute", left, top: 900, width: 400, textAlign: "center" }}>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginBottom: 20 }}>{label}</div>
      <div style={serif(150, gold ? FLASH : "#fff")}>{run(ms)}<span style={{ fontSize: 60 }}> ms</span></div>
      <div style={{ margin: "30px auto 0", width: 300, height: 14, borderRadius: 7, background: "rgba(255,255,255,0.2)" }}>
        <div style={{ width: (300 * run(ms)) / 252, height: 14, borderRadius: 7, background: gold ? FLASH : "#fff" }} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)" }}>TIME TO SPOT A SOCIAL THREAT</div>
      {col(90, 116, "LONELY", true)}
      {col(590, 252, "NOT LONELY", false)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(130, FLASH), opacity: p(f, twiceAt + 26, 10) }}>about 2× faster</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, tenthAt, 10) }}>ABOUT A TENTH OF A SECOND</div>
      {note("S. CACIOPPO ET AL. · COGNITIVE NEUROSCIENCE · 2016 · EEG", 1560)}
    </AbsoluteFill>
  );
};

/** Two people drifting apart: pulling away. */
export const Pull: React.FC<{ from: number; awayAt: number }> = ({ from, awayAt }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [awayAt, awayAt + 30], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 8) }}>
      <div style={{ position: "absolute", left: 340 - 220 * k, top: 900 }}><Person on size={150} /></div>
      <div style={{ position: "absolute", left: 590 + 220 * k, top: 900 }}><Person on={false} size={150} /></div>
      <div style={{ position: "absolute", left: 420 - 220 * k, right: 420 - 220 * k, top: 1280, height: 4, borderRadius: 2, background: "rgba(255,255,255,0.5)", opacity: k }} />
      <div style={{ position: "absolute", left: 340 - 220 * k + 40, top: 1150, ...lab, fontSize: 24, color: FLASH, opacity: k }}>YOU</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, awayAt + 10, 10) }}>FROM THE PEOPLE WHO COULD HELP</div>
    </AbsoluteFill>
  );
};
