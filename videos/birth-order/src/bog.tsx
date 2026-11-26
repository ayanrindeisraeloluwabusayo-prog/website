// Motion graphics for "Does being the oldest, middle or youngest child shape you?", in the mosquito look: thin serif for big
// words and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const RED = "#ff5a5a";
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;
const Person: React.FC<{ color: string; size: number }> = ({ color, size }) => (
  <svg viewBox="0 0 60 90" style={{ width: size, height: size * 1.5 }}><circle cx="30" cy="18" r="15" fill={color} /><path d="M4 88 C4 45 56 45 56 88 Z" fill={color} /></svg>
);

/** Three siblings; each lights up in turn with the stereotype under it. */
export const Roles: React.FC<{ from: number; midAt: number; youngAt: number }> = ({ from, midAt, youngAt }) => {
  const f = useCurrentFrame();
  const active = f >= youngAt ? 2 : f >= midAt ? 1 : 0;
  const kids = [{ s: 190, t: "OLDEST", d: "BOSSY · RESPONSIBLE" }, { s: 160, t: "MIDDLE", d: "PEACEMAKER · UNNOTICED" }, { s: 130, t: "YOUNGEST", d: "SPOILED · FUNNY · REBEL" }];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 80, right: 80, top: 980, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
        {kids.map((k, i) => (
          <div key={i} style={{ opacity: p(f, from + i * 3, 6), transform: `translateY(${(1 - p(f, from + i * 3, 10)) * 30}px)`, textAlign: "center" }}>
            <Person color={active === i ? FLASH : "rgba(255,255,255,0.4)"} size={k.s} />
            <div style={{ ...lab, fontSize: 24, color: active === i ? FLASH : "#fff", marginTop: 14 }}>{k.t}</div>
          </div>
        ))}
      </div>
      <div key={active} style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, [from, midAt, youngAt][active] + 4, 8) }}>{kids[active].d}</div>
    </AbsoluteFill>
  );
};

/** A counter running up to ~100 years; Adler's name lands under it. */
export const Years: React.FC<{ from: number; adlerAt: number }> = ({ from, adlerAt }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [from + 4, from + 40], [0, 100], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", ...serif(260, FLASH), opacity: p(f, from, 8) }}>~{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", ...lab, fontSize: 30, color: "#fff", opacity: p(f, from + 8, 8) }}>YEARS OF ARGUING</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...serif(100), opacity: p(f, adlerAt, 10) }}>Alfred Adler</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1450, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.75)", opacity: p(f, adlerAt + 8, 10) }}>SAID BIRTH ORDER SHAPES US</div>
    </AbsoluteFill>
  );
};

/** 20,000+ adults counting up; three country labels. */
export const Count: React.FC<{ from: number; numAt: number }> = ({ from, numAt }) => {
  const f = useCurrentFrame();
  const n = Math.round(interpolate(f, [numAt - 6, numAt + 30], [0, 20000], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) }));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, textAlign: "center", ...serif(220, FLASH), opacity: p(f, numAt - 6, 8) }}>{n.toLocaleString("en-US")}+</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1170, textAlign: "center", ...lab, fontSize: 30, color: "#fff", opacity: p(f, from, 8) }}>ADULTS</div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1300, display: "flex", justifyContent: "space-between" }}>
        {["GERMANY", "THE US", "BRITAIN"].map((c, i) => <div key={c} style={{ ...lab, fontSize: 26, color: "#fff", padding: "14px 22px", border: "3px solid rgba(255,255,255,0.7)", borderRadius: 40, opacity: p(f, numAt + 20 + i * 8, 8) }}>{c}</div>)}
      </div>
      {note("ROHRER, EGLOFF & SCHMUKLE · PNAS · 2015", 1500)}
    </AbsoluteFill>
  );
};

/** Five traits; for each, oldest, middle and youngest dots land on the same spot. */
export const Traits: React.FC<{ from: number; at: number[] }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const rows = ["OUTGOING OR SHY", "CALM OR ANXIOUS", "KIND", "ORGANISED", "IMAGINATIVE"];
  return (
    <AbsoluteFill>
      {rows.map((r, i) => {
        const k = p(f, at[i] ?? from + i * 6, 10);
        return (
          <div key={r} style={{ position: "absolute", left: 120, right: 120, top: 820 + i * 140, opacity: p(f, (at[i] ?? from + i * 6) - 4, 6) }}>
            <div style={{ ...lab, fontSize: 22, color: "#fff", marginBottom: 14 }}>{r}</div>
            <div style={{ position: "relative", height: 10, borderRadius: 5, background: "rgba(255,255,255,0.25)" }}>
              {[-180, 0, 180].map((dx, j) => <div key={j} style={{ position: "absolute", left: 420 + dx * (1 - k) - 18, top: -13, width: 36, height: 36, borderRadius: 18, background: j === 0 ? FLASH : "#fff", opacity: j === 0 ? 1 : 0.8 }} />)}
            </div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from + 4, 8) }}>● OLDEST &nbsp; ● MIDDLE &nbsp; ● YOUNGEST</div>
    </AbsoluteFill>
  );
};

/** Intelligence: firstborns very slightly higher. Two nearly equal bars. */
export const Tiny: React.FC<{ from: number; firstAt: number; selfAt: number }> = ({ from, firstAt, selfAt }) => {
  const f = useCurrentFrame();
  const bar = (left: number, h: number, label: string, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left, top: 860, width: 340, textAlign: "center", opacity: p(f, at - 4, 6) }}>
      <div style={{ position: "relative", height: 480 }}><div style={{ position: "absolute", left: 110, right: 110, bottom: 0, height: h * g, borderRadius: "12px 12px 0 0", background: gold ? FLASH : "#fff" }} /></div>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginTop: 16 }}>{label}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>INTELLIGENCE SCORES</div>
      {bar(150, 440, "FIRSTBORNS", true, firstAt)}
      {bar(590, 420, "LATER-BORNS", false, firstAt + 4)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", ...serif(120, FLASH), opacity: p(f, firstAt + 24, 10) }}>a tiny gap</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1580, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, selfAt, 10) }}>AND FELT A LITTLE MORE INTELLECTUAL</div>
    </AbsoluteFill>
  );
};

/** Three siblings of different heights with their ages: we compare different ages. */
export const Ages: React.FC<{ from: number; agesAt: number }> = ({ from, agesAt }) => {
  const f = useCurrentFrame();
  const kids = [{ s: 200, a: "AGE 12" }, { s: 160, a: "AGE 9" }, { s: 120, a: "AGE 6" }];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 100, right: 100, top: 1300, display: "flex", justifyContent: "space-around", alignItems: "flex-end" }}>
        {kids.map((k, i) => (
          <div key={i} style={{ textAlign: "center", opacity: p(f, from + i * 3, 6) }}>
            <Person color={i === 0 ? FLASH : "#fff"} size={k.s} />
            <div style={{ ...lab, fontSize: 26, color: i === 0 ? FLASH : "#fff", marginTop: 14, opacity: p(f, agesAt + i * 4, 8) }}>{k.a}</div>
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** "birth order" crossed out, "age" in gold. */
export const AgeNot: React.FC<{ from: number; ageAt: number; notAt: number }> = ({ from, ageAt, notAt }) => {
  const f = useCurrentFrame();
  const s = p(f, notAt + 6, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 900, textAlign: "center", ...serif(240, FLASH), opacity: p(f, ageAt, 10), transform: `scale(${0.7 + 0.3 * p(f, ageAt, 10)})` }}>age</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", opacity: p(f, from + 2, 8) }}>
        <span style={{ position: "relative", display: "inline-block", ...serif(150), opacity: 1 - 0.5 * s }}>birth order
          <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 6, background: RED, transform: `scaleX(${s})`, transformOrigin: "left" }} /></span>
      </div>
    </AbsoluteFill>
  );
};
