// Motion graphics for "Why you stay up late on your phone": white on blue, gold for the key fact.
// "Netflix" appears only as plain text in our own type (no logo, no brand colours).
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
const clock = (mins: number) => { const m = ((Math.round(mins) % 1440) + 1440) % 1440; return `${String(Math.floor(m / 60)).padStart(2, "0")}:${String(m % 60).padStart(2, "0")}`; };

/** A phone whose clock runs past midnight while the "video" counter keeps going up: just one more. */
export const OneMore: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, to], [0, 1], clamp);
  const n = 1 + Math.floor(k * 23);
  const bump = 1 + 0.08 * Math.max(0, 1 - ((f - from) % 8) / 4);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 290, top: 760, width: 500, height: 860, borderRadius: 70, border: "14px solid #fff", background: "rgba(5,10,40,0.9)",
        boxShadow: "0 0 90px rgba(120,170,255,0.5), 0 40px 80px rgba(0,0,0,0.6)", opacity: p(f, from, 8), transform: `translateY(${(1 - p(f, from, 12)) * 120}px)` }}>
        <div style={{ textAlign: "center", marginTop: 60, ...lab, fontSize: 30, color: "rgba(255,255,255,0.7)" }}>{clock(23 * 60 + 58 + k * 160)}</div>
        <div style={{ textAlign: "center", marginTop: 150, ...lab, fontSize: 30, color: "#fff" }}>VIDEO</div>
        <div style={{ textAlign: "center", ...big(230, FLASH, "#fff"), transform: `scale(${bump})` }}>{n}</div>
        <div style={{ position: "absolute", left: 60, right: 60, bottom: 90, height: 16, borderRadius: 8, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${((f - from) % 8) / 8 * 100}%`, height: "100%", borderRadius: 8, background: "#fff" }} />
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** "Netflix's biggest rival": other apps crossed out, then SLEEP lands. `final` shows SLEEP straight away. */
export const Rival: React.FC<{ from: number; revealAt: number; final?: boolean }> = ({ from, revealAt, final }) => {
  const f = useCurrentFrame();
  const others = ["OTHER APPS", "TV CHANNELS", "VIDEO GAMES"];
  const r = final ? 1 : p(f, revealAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 36, color: "#fff" }}>NETFLIX'S BIGGEST RIVAL</div>
      {!final && others.map((t, i) => {
        const at = from + 6 + i * 7;
        const strike = p(f, at + 5, 6);
        return <div key={t} style={{ position: "absolute", left: 190, width: 700, top: 880 + i * 150, height: 120, borderRadius: 24, background: "rgba(10,14,50,0.8)", border: "4px solid rgba(255,255,255,0.5)",
          display: "flex", alignItems: "center", justifyContent: "center", ...lab, fontSize: 46, color: "#fff", opacity: p(f, at, 6) * (1 - 0.6 * r) }}>
          {t}
          <div style={{ position: "absolute", left: 40, right: 40, top: 56, height: 8, background: "#ff3b3b", transform: `scaleX(${strike})`, transformOrigin: "left" }} />
        </div>;
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: final ? 960 : 1360, textAlign: "center", ...big(final ? 300 : 260, FLASH, "#fff"), opacity: r, transform: `scale(${1.6 - 0.6 * r})` }}>SLEEP</div>
      {final ? <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: SERIF2, fontSize: 96, color: "#fff", opacity: p(f, from + 8, 10) }}>your sleep, every night</div> : null}
    </AbsoluteFill>
  );
};

/** The quote card: "We're competing with sleep." */
export const Quote: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from + 4, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 840, padding: "70px 60px 60px", borderRadius: 36, background: "rgba(5,10,45,0.85)", border: "4px solid rgba(255,255,255,0.35)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.5)", opacity: k, transform: `perspective(1400px) rotateX(${(1 - k) * 18}deg) translateY(${(1 - k) * 80}px)` }}>
        <div style={{ position: "absolute", left: 40, top: -70, fontFamily: SERIF2, fontSize: 260, color: FLASH, lineHeight: 1 }}>“</div>
        <div style={{ fontFamily: SERIF2, fontSize: 112, color: "#fff", lineHeight: 0.98 }}>We're competing with <span style={{ color: FLASH }}>sleep.</span></div>
        <div style={{ ...lab, fontSize: 28, color: "#fff", marginTop: 40 }}>REED HASTINGS</div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)", marginTop: 10 }}>NETFLIX CEO · INVESTOR INTERVIEW · APRIL 2017</div>
      </div>
    </AbsoluteFill>
  );
};

/** Planned bedtime vs actual bedtime on a night timeline; the gap is the procrastination. */
export const Plan: React.FC<{ from: number; lateAt: number }> = ({ from, lateAt }) => {
  const f = useCurrentFrame();
  const x0 = 120, x1 = 960, t = (m: number) => x0 + ((m - 21 * 60) / (5 * 60)) * (x1 - x0); // 21:00 → 02:00
  const plan = 23 * 60, actual = 23 * 60 + interpolate(f, [lateAt, lateAt + 24], [0, 150], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const marker = (x: number, label: string, color: string, op: number) => (
    <div style={{ position: "absolute", left: x - 150, width: 300, top: 980, textAlign: "center", opacity: op }}>
      <div style={{ width: 8, height: 120, background: color, margin: "0 auto", boxShadow: `0 0 30px ${color}` }} />
      <div style={{ ...lab, fontSize: 30, color, marginTop: 16 }}>{label}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: x0, right: 1080 - x1, top: 1040, height: 6, background: "rgba(255,255,255,0.5)", opacity: p(f, from, 8) }} />
      {[21, 22, 23, 0, 1, 2].map((h, i) => <div key={h} style={{ position: "absolute", left: t(21 * 60 + i * 60) - 60, width: 120, top: 900, textAlign: "center", ...lab, fontSize: 26, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>{String(h).padStart(2, "0")}:00</div>)}
      <div style={{ position: "absolute", left: t(plan), width: t(actual) - t(plan), top: 1020, height: 46, background: "rgba(243,194,29,0.35)" }} />
      {marker(t(plan), "PLANNED", "#fff", p(f, from + 6, 8))}
      {marker(t(actual), clock(actual), FLASH, p(f, lateAt, 6))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", fontFamily: SERIF2, fontSize: 110, color: FLASH, opacity: p(f, lateAt + 20, 10) }}>no reason. just you.</div>
    </AbsoluteFill>
  );
};

/** The 2014 survey: 177 dots, then the chain less self-control → later bedtime → less sleep. */
export const Survey: React.FC<{ from: number; linkAt: number; sleepAt: number }> = ({ from, linkAt, sleepAt }) => {
  const f = useCurrentFrame();
  const shown = Math.round(interpolate(f, [from + 2, from + 30], [0, 177], clamp));
  const chips: [string, number][] = [["LESS SELF-CONTROL", linkAt], ["LATER TO BED", linkAt + 14], ["LESS SLEEP", sleepAt]];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 140, top: 780, width: 800, display: "flex", flexWrap: "wrap", gap: 10, opacity: 1 - 0.65 * p(f, linkAt - 4, 10) }}>
        {Array.from({ length: 177 }, (_, i) => <div key={i} style={{ width: 34, height: 34, borderRadius: 17, background: i < shown ? (i % 4 === 0 ? FLASH : "#fff") : "rgba(255,255,255,0.12)" }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", ...lab, fontSize: 40, color: "#fff", opacity: 1 - p(f, linkAt - 4, 8) }}>{shown} PEOPLE SURVEYED</div>
      {chips.map(([t, at], i) => (
        <div key={t} style={{ position: "absolute", left: 160, right: 160, top: 900 + i * 230, height: 150, borderRadius: 30, background: i === 2 ? FLASH : "rgba(5,10,45,0.92)", border: "5px solid " + (i === 2 ? FLASH : "#fff"),
          display: "flex", alignItems: "center", justifyContent: "center", ...lab, fontSize: 46, color: i === 2 ? "#111" : "#fff", opacity: p(f, at, 8), transform: `translateY(${(1 - p(f, at, 10)) * 60}px)` }}>
          {t}
          {i < 2 ? <div style={{ position: "absolute", bottom: -78, left: "50%", marginLeft: -20, width: 0, height: 0, borderLeft: "20px solid transparent", borderRight: "20px solid transparent", borderTop: `40px solid ${FLASH}`, opacity: p(f, chips[i + 1][1], 6) }} /> : null}
        </div>
      ))}
      {note("KROESE ET AL. · FRONTIERS IN PSYCHOLOGY · 2014", 1640)}
    </AbsoluteFill>
  );
};

/** "Bedtime procrastination", then REVENGE is stamped on top of it. */
export const Revenge: React.FC<{ from: number; stampAt: number }> = ({ from, stampAt }) => {
  const f = useCurrentFrame();
  const s = p(f, stampAt, 7);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", fontFamily: SERIF2, fontSize: 130, color: "#fff", lineHeight: 0.95, opacity: p(f, from, 10) }}>bedtime<br />procrastination</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", opacity: s, transform: `rotate(-6deg) scale(${2.2 - 1.2 * s})` }}>
        <span style={{ display: "inline-block", padding: "10px 40px 20px", border: `12px solid ${FLASH}`, borderRadius: 24, ...big(190, FLASH, "#fff") }}>REVENGE</span>
      </div>
      {note("A LATER INTERNET NAME FOR THE SAME HABIT", 1560)}
    </AbsoluteFill>
  );
};

/** A waking day split into WORK, SCHOOL and EVERYBODY ELSE, with one small gold slice at night: YOURS. */
export const Day: React.FC<{ from: number; yoursAt: number }> = ({ from, yoursAt }) => {
  const f = useCurrentFrame();
  const segs: [string, number, string][] = [["WORK", 330, "rgba(255,255,255,0.9)"], ["SCHOOL", 200, "rgba(255,255,255,0.65)"], ["EVERYBODY ELSE", 220, "rgba(255,255,255,0.4)"]];
  let x = 90;
  const glow = p(f, yoursAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 830, textAlign: "center", ...lab, fontSize: 34, color: "#fff" }}>YOUR DAY</div>
      {segs.map(([t, w, c], i) => {
        const at = from + 2 + i * 6, k = p(f, at, 10);
        const el = <div key={t} style={{ position: "absolute", left: x, top: 920, width: w * k, height: 240, background: c, borderRight: "4px solid #011A8C", overflow: "hidden" }}>
          <div style={{ ...lab, fontSize: 24, color: "#011A8C", padding: "20px 16px", whiteSpace: "nowrap" }}>{t}</div>
        </div>;
        x += w;
        return el;
      })}
      <div style={{ position: "absolute", left: 840, top: 900, width: 150 * glow, height: 280, borderRadius: 14, background: FLASH, boxShadow: `0 0 ${80 * glow}px rgba(243,194,29,0.9)` }} />
      <div style={{ position: "absolute", left: 780, width: 270, top: 1210, textAlign: "center", ...big(80, FLASH, "#fff"), opacity: glow }}>YOURS</div>
      <div style={{ position: "absolute", left: 90, right: 90, top: 1340, display: "flex", justifyContent: "space-between", ...lab, fontSize: 24, color: "rgba(255,255,255,0.7)" }}><span>MORNING</span><span>LATE NIGHT</span></div>
    </AbsoluteFill>
  );
};

/** The 2017 binge-viewing study: as binge-watching gets more frequent, sleep quality falls and tiredness rises (illustration). */
export const Binge: React.FC<{ from: number; worseAt: number; tiredAt: number; tvAt: number }> = ({ from, worseAt, tiredAt, tvAt }) => {
  const f = useCurrentFrame();
  const cols = ["RARELY", "SOMETIMES", "OFTEN"];
  const bar = (h: number, color: string, at: number) => <div style={{ width: 90, height: h * interpolate(f, [at, at + 18], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }), borderRadius: "12px 12px 0 0", background: color }} />;
  const tv = p(f, tvAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 780, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>HOW OFTEN THEY BINGE-WATCHED</div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 850, height: 480, display: "flex", justifyContent: "space-around", alignItems: "flex-end", borderBottom: "5px solid rgba(255,255,255,0.6)", opacity: 1 - 0.7 * tv }}>
        {cols.map((c, i) => <div key={c} style={{ display: "flex", gap: 16, alignItems: "flex-end" }}>{bar(420 - i * 120, "#fff", worseAt + i * 4)}{bar(140 + i * 130, FLASH, tiredAt + i * 4)}</div>)}
      </div>
      <div style={{ position: "absolute", left: 100, right: 100, top: 1350, display: "flex", justifyContent: "space-around", ...lab, fontSize: 26, color: "#fff", opacity: 1 - 0.7 * tv }}>{cols.map((c) => <span key={c}>{c}</span>)}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, display: "flex", justifyContent: "center", gap: 50, ...lab, fontSize: 26, opacity: 1 - 0.7 * tv }}>
        <span style={{ color: "#fff", opacity: p(f, worseAt, 8) }}>■ SLEEP QUALITY</span><span style={{ color: FLASH, opacity: p(f, tiredAt, 8) }}>■ TIREDNESS</span>
      </div>
      <div style={{ position: "absolute", left: 170, right: 170, top: 960, padding: "40px 30px", borderRadius: 30, background: "rgba(5,10,45,0.95)", border: `6px solid ${FLASH}`, textAlign: "center",
        opacity: tv, transform: `scale(${1.3 - 0.3 * tv}) rotate(-3deg)` }}>
        <div style={{ ...lab, fontSize: 40, color: "#fff" }}>ORDINARY TV</div>
        <div style={{ ...big(110, FLASH, "#fff"), marginTop: 16 }}>NO LINK</div>
      </div>
      {note("EXELMANS & VAN DEN BULCK · 2017 · 423 ADULTS AGED 18-25 · ILLUSTRATION", 1520)}
    </AbsoluteFill>
  );
};

/** The mind cooling down slowly: an activity meter that drains from gold to blue while a timer runs. */
export const Cool: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, to], [0, 1], clamp);
  const level = 0.95 - 0.5 * k;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 32, color: "#fff" }}>MIND STILL RUNNING</div>
      <div style={{ position: "absolute", left: 440, top: 870, width: 200, height: 560, borderRadius: 100, border: "10px solid #fff", overflow: "hidden", background: "rgba(5,10,45,0.8)" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${level * 100}%`, background: `linear-gradient(0deg, #4f8bff, ${FLASH})`, boxShadow: "0 0 60px rgba(243,194,29,0.7)" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", fontFamily: SERIF2, fontSize: 84, color: FLASH }}>slow to switch off</div>
      {note("PRE-SLEEP AROUSAL · ILLUSTRATION", 1620)}
    </AbsoluteFill>
  );
};

/** The fix: move your me-time earlier in the evening, then the phone slides out of reach of the bed. */
export const Earlier: React.FC<{ from: number; moveAt: number; reachAt: number }> = ({ from, moveAt, reachAt }) => {
  const f = useCurrentFrame();
  const x0 = 120, x1 = 960, t = (h: number) => x0 + ((h - 18) / 7) * (x1 - x0); // 18:00 → 01:00
  const start = interpolate(f, [moveAt, moveAt + 24], [23.2, 20], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  const r = p(f, reachAt, 20);
  return (
    <AbsoluteFill>
      <div style={{ opacity: 1 - p(f, reachAt - 6, 8) }}>
        <div style={{ position: "absolute", left: x0, right: 1080 - x1, top: 1060, height: 6, background: "rgba(255,255,255,0.5)" }} />
        {[18, 20, 22, 0].map((h) => <div key={h} style={{ position: "absolute", left: t(h === 0 ? 24 : h) - 60, width: 120, top: 1100, textAlign: "center", ...lab, fontSize: 26, color: "rgba(255,255,255,0.8)" }}>{String(h).padStart(2, "0")}:00</div>)}
        <div style={{ position: "absolute", left: t(start), width: t(start + 1.5) - t(start), top: 940, height: 100, borderRadius: 20, background: FLASH, boxShadow: "0 0 50px rgba(243,194,29,0.7)",
          display: "flex", alignItems: "center", justifyContent: "center", ...lab, fontSize: 28, color: "#111", opacity: p(f, from, 8) }}>ME-TIME</div>
        <div style={{ position: "absolute", left: t(23.5) - 4, top: 900, width: 8, height: 180, background: "#fff" }} />
        <div style={{ position: "absolute", left: t(23.5) - 100, width: 200, top: 850, textAlign: "center", ...lab, fontSize: 24, color: "#fff" }}>BED</div>
      </div>
      <div style={{ opacity: p(f, reachAt - 4, 8) }}>
        <div style={{ position: "absolute", left: 110, top: 1060, width: 420, height: 170, borderRadius: 30, background: "#fff" }} />
        <div style={{ position: "absolute", left: 130, top: 1010, width: 140, height: 70, borderRadius: 35, background: "rgba(255,255,255,0.8)" }} />
        <div style={{ position: "absolute", left: 230, width: 200, top: 1250, textAlign: "center", ...lab, fontSize: 28, color: "#fff" }}>BED</div>
        <div style={{ position: "absolute", left: 600 + 260 * r, top: 1010, width: 110, height: 200, borderRadius: 22, border: "8px solid #fff", background: "rgba(5,10,45,0.9)", boxShadow: "0 0 40px rgba(120,170,255,0.6)" }} />
        <div style={{ position: "absolute", left: 560, right: 60, top: 1290, height: 6, background: FLASH, transform: `scaleX(${r})`, transformOrigin: "left" }} />
        <div style={{ position: "absolute", left: 480, right: 40, top: 1320, textAlign: "center", ...lab, fontSize: 30, color: FLASH, opacity: r }}>OUT OF REACH</div>
      </div>
    </AbsoluteFill>
  );
};
