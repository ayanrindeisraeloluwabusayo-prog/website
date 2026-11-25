// Motion graphics for "Why you can't remember being a baby", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** Ages 0-6 as boxes; the first memory usually lands at 3 or 4, everything before is empty. */
export const Age: React.FC<{ from: number; firstAt: number; fadeAll?: boolean }> = ({ from, firstAt, fadeAll }) => {
  const f = useCurrentFrame();
  const lit = p(f, firstAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 960, display: "flex", gap: 14 }}>
        {[0, 1, 2, 3, 4, 5, 6].map((y) => {
          const early = y < 3, first = y === 3 || y === 4;
          const fade = fadeAll && early ? 1 - 0.8 * p(f, from + 8 + y * 6, 14) : 1;
          return <div key={y} style={{ flex: 1, opacity: p(f, from + y * 2, 6) }}>
            <div style={{ height: 200, borderRadius: 14, border: `3px ${early ? "dashed" : "solid"} ${first && lit ? FLASH : "rgba(255,255,255,0.7)"}`,
              background: first ? `rgba(243,194,29,${0.3 * lit})` : early ? "transparent" : "rgba(255,255,255,0.12)", opacity: fade }} />
            <div style={{ ...serif(56, first && lit ? FLASH : "#fff"), textAlign: "center", marginTop: 14 }}>{y}</div>
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 110, top: 1270, ...lab, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>AGE</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", ...serif(100, FLASH), opacity: fadeAll ? 0 : lit }}>first memory</div>
    </AbsoluteFill>
  );
};

/** Ten people; four light up: "4 in 10 · from age 2 or younger". */
export const FourTen: React.FC<{ from: number; litAt: number }> = ({ from, litAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, right: 150, top: 880, display: "flex", flexWrap: "wrap", gap: 30, justifyContent: "center" }}>
        {Array.from({ length: 10 }, (_, i) => {
          const on = i < 4 && f >= litAt + i * 3;
          return <svg key={i} viewBox="0 0 60 90" style={{ width: 120, height: 180, opacity: p(f, from + i * 2, 6) }}>
            <circle cx="30" cy="18" r="15" fill={on ? FLASH : "rgba(255,255,255,0.35)"} /><path d="M4 88 C4 45 56 45 56 88 Z" fill={on ? FLASH : "rgba(255,255,255,0.35)"} />
          </svg>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1320, textAlign: "center", ...serif(150, FLASH), opacity: p(f, litAt, 10) }}>4 in 10</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center", ...lab, fontSize: 26, color: "#fff", opacity: p(f, litAt + 8, 10) }}>"MY FIRST MEMORY IS FROM AGE 2 OR YOUNGER"</div>
      {note("AKHTAR ET AL. · PSYCHOLOGICAL SCIENCE · 2018 · 6,641 PEOPLE", 1580)}
    </AbsoluteFill>
  );
};

/** A mother and a 3-year-old talking: two speech bubbles. */
export const Talk: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const bubble = (left: number, top: number, w: number, at: number, gold: boolean) => (
    <div style={{ position: "absolute", left, top, width: w, height: 150, borderRadius: 40, border: `4px solid ${gold ? FLASH : "#fff"}`, opacity: p(f, at, 8), transform: `scale(${0.8 + 0.2 * p(f, at, 10)})`,
      display: "flex", alignItems: "center", justifyContent: "center", gap: 18 }}>
      {[0, 1, 2].map((i) => <div key={i} style={{ width: 22, height: 22, borderRadius: 11, background: gold ? FLASH : "#fff", opacity: 0.5 + 0.5 * Math.abs(Math.sin((f - at) / 5 + i)) }} />)}
    </div>
  );
  return (
    <AbsoluteFill>
      {bubble(140, 900, 480, from + 4, false)}
      {bubble(460, 1100, 360, from + 16, true)}
      <div style={{ position: "absolute", left: 140, top: 1080, ...lab, fontSize: 24, color: "#fff", opacity: p(f, from + 4, 8) }}>MUM</div>
      <div style={{ position: "absolute", left: 460, top: 1280, ...lab, fontSize: 24, color: FLASH, opacity: p(f, from + 16, 8) }}>AGE 3</div>
      {note("BAUER & LARKINA · EMORY UNIVERSITY · 2014", 1500)}
    </AbsoluteFill>
  );
};

/** At ages 5-7 they still remembered over 60%; after about 7 the line drops. */
export const Recall: React.FC<{ from: number; sixtyAt: number; dropAt: number }> = ({ from, sixtyAt, dropAt }) => {
  const f = useCurrentFrame();
  const draw = interpolate(f, [from + 4, sixtyAt + 10], [0, 0.55], clamp) + interpolate(f, [dropAt, dropAt + 24], [0, 0.45], clamp);
  const pts = "60,40 300,160 520,190 700,420 900,600";
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 960 700" style={{ position: "absolute", left: 60, top: 820, width: 960, height: 700 }}>
        <line x1="60" y1="640" x2="920" y2="640" stroke="rgba(255,255,255,0.5)" strokeWidth="4" />
        <polyline points={pts} fill="none" stroke={FLASH} strokeWidth="10" strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray="1" strokeDashoffset={1 - draw} />
        {[["3", 60], ["5", 300], ["7", 520], ["9", 900]].map(([t, x]) => <text key={t} x={x} y="690" textAnchor="middle" fill="#fff" fontFamily={SERIF2} fontSize="44">{t}</text>)}
      </svg>
      <div style={{ position: "absolute", left: 330, top: 870, ...serif(120, FLASH), opacity: p(f, sixtyAt, 10) }}>60%+</div>
      <div style={{ position: "absolute", left: 600, top: 1180, ...lab, fontSize: 26, color: "#fff", opacity: p(f, dropAt + 10, 10) }}>FADING FROM ~7</div>
      <div style={{ position: "absolute", left: 120, top: 1560, ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>AGE WHEN ASKED · ILLUSTRATION</div>
    </AbsoluteFill>
  );
};

/** A baby's head outline looking at pictures; the hippocampus inside glows as it stores them. */
export const Scan: React.FC<{ from: number; picsAt: number; hippoAt: number }> = ({ from, picsAt, hippoAt }) => {
  const f = useCurrentFrame();
  const g = p(f, hippoAt, 12);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 90, top: 800, width: 620, height: 620, opacity: p(f, from, 8) }}>
        <path d="M80 300 C20 280 16 160 60 110 C90 30 190 14 250 34 C330 50 384 120 370 190 C360 250 300 274 240 266 L220 310 L180 310 L176 266 C140 270 110 262 80 300 Z" fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth="6" />
        <path d="M150 210 C165 235 205 240 226 220 C236 210 232 196 220 196" fill="none" stroke={FLASH} strokeWidth="14" strokeLinecap="round" opacity={0.25 + 0.75 * g} />
        <circle cx="190" cy="218" r={46 * g} fill={FLASH} opacity={0.18 * g} />
        <text x="190" y="290" textAnchor="middle" fill={FLASH} fontFamily={SANS2} fontWeight={800} fontSize="15" letterSpacing="2" opacity={g}>HIPPOCAMPUS</text>
      </svg>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ position: "absolute", left: 760, top: 860 + i * 190, width: 200, height: 150, borderRadius: 16, border: "4px solid #fff", background: "rgba(255,255,255,0.1)", opacity: p(f, picsAt + i * 5, 8),
          transform: `translateX(${(1 - p(f, picsAt + i * 5, 10)) * 60}px)` }}>
          <div style={{ position: "absolute", left: 30, top: 40, width: 60, height: 60, borderRadius: i === 1 ? 0 : 30, background: i === 2 ? FLASH : "#fff", transform: i === 1 ? "rotate(45deg)" : undefined }} />
        </div>
      ))}
      <div style={{ position: "absolute", left: 90, top: 1450, ...serif(90, FLASH), opacity: g }}>storing</div>
      {note("YATES, TURK-BROWNE ET AL. · SCIENCE · 2025 · BABIES 4-25 MONTHS", 1600)}
    </AbsoluteFill>
  );
};
