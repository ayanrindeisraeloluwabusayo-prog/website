// Motion graphics for "Some people can't picture anything in their mind", in the mosquito look: thin serif for big words
// and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** A dashed sphere outline that never fills in, while a day counter runs from 1 to 7. */
export const Sphere: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const day = Math.min(7, 1 + Math.floor(interpolate(f, [from + 6, to - 10], [0, 7], clamp)));
  const spin = (f - from) * 1.2;
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 240, top: 800, width: 600, height: 600, opacity: p(f, from, 8) }}>
        <circle cx="200" cy="200" r="160" fill="none" stroke="#fff" strokeWidth="4" strokeDasharray="14 14" transform={`rotate(${spin} 200 200)`} />
        <ellipse cx="200" cy="200" rx="160" ry="50" fill="none" stroke="rgba(255,255,255,0.4)" strokeWidth="3" strokeDasharray="10 12" />
        <text x="200" y="215" textAnchor="middle" fill={FLASH} fontFamily={SANS2} fontWeight={800} fontSize="20" letterSpacing="3">NOTHING</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1440, textAlign: "center", ...serif(120, FLASH) }}>day {day}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1590, textAlign: "center", ...lab, fontSize: 24, color: "#fff" }}>TRYING TO PICTURE A SPHERE</div>
    </AbsoluteFill>
  );
};

/** 100 dots; 2-3 light up gold: "2-3 in 100". */
export const Few: React.FC<{ from: number; litAt: number }> = ({ from, litAt }) => {
  const f = useCurrentFrame();
  const lit = [23, 58, 81];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 190, top: 820, width: 700, display: "flex", flexWrap: "wrap", gap: 22 }}>
        {Array.from({ length: 100 }, (_, i) => {
          const on = lit.indexOf(i) >= 0 && f >= litAt + lit.indexOf(i) * 6;
          return <div key={i} style={{ width: 48, height: 48, borderRadius: 24, background: on ? FLASH : "rgba(255,255,255,0.35)", opacity: p(f, from + (i % 10) * 1.5, 6), transform: `scale(${on ? 1.2 : 1})` }} />;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...serif(120, FLASH), opacity: p(f, litAt, 10) }}>2-3 in 100</div>
      {note("EARLY ESTIMATES", 1700)}
    </AbsoluteFill>
  );
};

/** "picture it" in quote marks: they thought it was only a figure of speech. */
export const Speech: React.FC<{ from: number; labelAt: number }> = ({ from, labelAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 950, textAlign: "center", ...serif(170), opacity: p(f, from, 10), transform: `translateY(${(1 - p(f, from, 12)) * 30}px)` }}>
        <span style={{ color: FLASH }}>“</span>picture it<span style={{ color: FLASH }}>”</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1200, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, labelAt, 10) }}>JUST A FIGURE OF SPEECH?</div>
    </AbsoluteFill>
  );
};

/** A plain browser window with the essay's title typing in (no logos). */
export const Essay: React.FC<{ from: number; typeAt: number }> = ({ from, typeAt }) => {
  const f = useCurrentFrame();
  const title = "Aphantasia: How It Feels To Be Blind In Your Mind";
  const n = Math.floor(interpolate(f, [typeAt, typeAt + 40], [0, title.length], clamp));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 830, width: 840, height: 520, borderRadius: 22, border: "3px solid rgba(255,255,255,0.8)", background: "rgba(255,255,255,0.06)", opacity: p(f, from, 8) }}>
        <div style={{ height: 56, borderBottom: "3px solid rgba(255,255,255,0.35)", display: "flex", alignItems: "center", gap: 14, paddingLeft: 26 }}>
          {[0, 1, 2].map((i) => <div key={i} style={{ width: 18, height: 18, borderRadius: 9, background: "rgba(255,255,255,0.6)" }} />)}
        </div>
        <div style={{ padding: "40px 44px", ...serif(64), lineHeight: 1.12 }}>{title.slice(0, n)}<span style={{ color: FLASH, opacity: Math.floor(f / 8) % 2 }}>|</span></div>
        {[0, 1, 2].map((i) => <div key={i} style={{ marginLeft: 44, marginTop: 18, width: 600 - i * 120, height: 12, borderRadius: 6, background: "rgba(255,255,255,0.25)", opacity: p(f, typeAt + 40 + i * 5, 6) }} />)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(120, FLASH), opacity: p(f, from, 10) }}>2016</div>
      {note("BLAKE ROSS · ESSAY · 23 APRIL 2016", 1580)}
    </AbsoluteFill>
  );
};

/** Skin response while imagining a scary story: most people spike (gold), aphantasia stays flat (white). */
export const Sweat: React.FC<{ from: number; spikeAt: number; flatAt: number; fearAt: number }> = ({ from, spikeAt, flatAt, fearAt }) => {
  const f = useCurrentFrame();
  const line = (pts: [number, number][], at: number) => interpolate(f, [at, at + 30], [0, 1], clamp) + 0 * pts.length;
  const spike: [number, number][] = [[0, 200], [150, 196], [260, 190], [330, 120], [390, 60], [460, 90], [560, 110], [700, 130], [820, 120]];
  const flat: [number, number][] = [[0, 200], [150, 199], [260, 197], [330, 194], [390, 192], [460, 194], [560, 193], [700, 195], [820, 194]];
  const path = (pts: [number, number][]) => pts.map(([x, y], i) => `${i ? "L" : "M"}${x} ${y}`).join(" ");
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 790, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.8)", opacity: p(f, from, 8) }}>SKIN RESPONSE WHILE IMAGINING A SCARY STORY</div>
      <svg viewBox="0 0 840 240" style={{ position: "absolute", left: 120, top: 880, width: 840, height: 240, overflow: "visible" }}>
        <line x1="0" y1="220" x2="830" y2="220" stroke="rgba(255,255,255,0.45)" strokeWidth="3" />
        <path d={path(spike)} fill="none" stroke={FLASH} strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - line(spike, spikeAt)} />
        <path d={path(flat)} fill="none" stroke="#fff" strokeWidth="8" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - line(flat, flatAt)} />
      </svg>
      <div style={{ position: "absolute", left: 120, top: 1170, ...lab, fontSize: 24, color: FLASH, opacity: p(f, spikeAt, 8) }}>MOST PEOPLE</div>
      <div style={{ position: "absolute", left: 600, top: 1170, ...lab, fontSize: 24, color: "#fff", opacity: p(f, flatAt, 8) }}>APHANTASIA</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1300, textAlign: "center", ...serif(120), opacity: p(f, fearAt, 10) }}>no pictures, <span style={{ color: FLASH }}>less fear</span></div>
      {note("WICKEN, KEOGH & PEARSON · PROC. ROYAL SOCIETY B · 2021 · UNSW SYDNEY", 1560)}
    </AbsoluteFill>
  );
};

/** Words and facts light up; images stays a dashed empty box. */
export const Words: React.FC<{ from: number; wordsAt: number; factsAt: number }> = ({ from, wordsAt, factsAt }) => {
  const f = useCurrentFrame();
  const box = (top: number, label: string, at: number, on: boolean) => (
    <div style={{ position: "absolute", left: 200, right: 200, top, height: 150, borderRadius: 20, border: `4px ${on ? "solid" : "dashed"} ${on ? FLASH : "rgba(255,255,255,0.5)"}`,
      background: on ? "rgba(243,194,29,0.14)" : "transparent", opacity: p(f, at, 8), display: "flex", alignItems: "center", justifyContent: "center", ...serif(96, on ? FLASH : "rgba(255,255,255,0.55)") }}>{label}</div>
  );
  return <AbsoluteFill>{box(860, "words", wordsAt, true)}{box(1050, "facts", factsAt, true)}{box(1240, "images", from + 2, false)}</AbsoluteFill>;
};

/** A strip of animation frames drawing in; on "couldn't picture" they empty out to dashed boxes. */
export const Studio: React.FC<{ from: number; emptyAt: number }> = ({ from, emptyAt }) => {
  const f = useCurrentFrame();
  const e = p(f, emptyAt, 12);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 900, display: "flex", gap: 20 }}>
        {[0, 1, 2, 3].map((i) => (
          <div key={i} style={{ flex: 1, height: 260, borderRadius: 14, border: `4px ${e > 0.5 ? "dashed" : "solid"} ${e > 0.5 ? "rgba(255,255,255,0.5)" : "#fff"}`, opacity: p(f, from + i * 4, 8), position: "relative" }}>
            <div style={{ position: "absolute", left: "50%", top: "50%", width: 70, height: 70, marginLeft: -35, marginTop: -35, borderRadius: 35, background: i === 1 ? FLASH : "#fff", opacity: 1 - e, transform: `translateX(${(i - 1.5) * 8}px)` }} />
          </div>
        ))}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, from + 10, 10) }}>CO-FOUNDER OF THE STUDIO BEHIND TOY STORY</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center", ...serif(120, FLASH), opacity: e }}>no pictures</div>
    </AbsoluteFill>
  );
};
