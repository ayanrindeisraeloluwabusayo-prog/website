// Motion graphics for "Why you look better in the mirror than in photos", in the mosquito look: thin serif for big words
// and numbers, small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** A simple face that is not perfectly even (one brow higher, a mark on one cheek, a side parting), so flipping shows. */
const Face: React.FC<{ flip?: boolean; size?: number; stroke?: string; wide?: number }> = ({ flip, size = 300, stroke = "#fff", wide = 1 }) => (
  <svg viewBox="0 0 200 240" style={{ width: size * wide, height: size * 1.2, transform: flip ? "scaleX(-1)" : undefined }}>
    <g transform={`translate(100 0) scale(${wide} 1) translate(-100 0)`}>
      <ellipse cx="100" cy="125" rx="72" ry="95" fill="rgba(255,255,255,0.06)" stroke={stroke} strokeWidth="5" />
      <path d="M40 80 C60 30 120 20 170 70" fill="none" stroke={stroke} strokeWidth="5" />
      <path d="M58 98 Q74 88 90 98" stroke={stroke} strokeWidth="5" fill="none" />
      <path d="M112 92 Q128 80 144 90" stroke={stroke} strokeWidth="5" fill="none" />
      <circle cx="74" cy="112" r="6" fill={stroke} /><circle cx="128" cy="110" r="6" fill={stroke} />
      <path d="M100 118 L94 150 L106 152" fill="none" stroke={stroke} strokeWidth="4" strokeLinejoin="round" />
      <path d="M76 178 Q102 194 128 174" fill="none" stroke={stroke} strokeWidth="5" />
      <circle cx="138" cy="150" r="4" fill={FLASH} />
    </g>
  </svg>
);

/** A phone with a settings switch: "Mirror front camera" turning on. */
export const Phone: React.FC<{ from: number; onAt: number }> = ({ from, onAt }) => {
  const f = useCurrentFrame();
  const k = p(f, onAt, 8);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 290, top: 760, width: 500, height: 840, borderRadius: 60, border: "6px solid #fff", background: "rgba(0,8,40,0.6)", opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: 40, right: 40, top: 120, ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>CAMERA SETTINGS</div>
        <div style={{ position: "absolute", left: 40, right: 40, top: 190, height: 110, borderRadius: 20, background: "rgba(255,255,255,0.1)", display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 26px" }}>
          <span style={{ ...lab, fontSize: 22, color: "#fff", letterSpacing: "0.06em" }}>MIRROR FRONT CAMERA</span>
          <div style={{ width: 96, height: 56, borderRadius: 28, background: k > 0.5 ? FLASH : "rgba(255,255,255,0.3)", position: "relative" }}>
            <div style={{ position: "absolute", top: 4, left: 4 + 40 * k, width: 48, height: 48, borderRadius: 24, background: "#fff" }} />
          </div>
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 380, display: "flex", justifyContent: "center", opacity: p(f, onAt + 6, 10) }}><Face flip={k > 0.5} size={260} /></div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1650, textAlign: "center", ...serif(90, FLASH), opacity: p(f, from + 6, 8) }}>2020</div>
    </AbsoluteFill>
  );
};

/** Two prints of the same face, normal and flipped; then who picked which. */
export const Prints: React.FC<{ from: number; normalAt: number; flipAt: number; sheAt: number; friendsAt: number }> = ({ from, normalAt, flipAt, sheAt, friendsAt }) => {
  const f = useCurrentFrame();
  const card = (left: number, flip: boolean, label: string, at: number, pick: string, pickAt: number) => (
    <div style={{ position: "absolute", left, top: 860, width: 380, textAlign: "center", opacity: p(f, at, 8), transform: `translateY(${(1 - p(f, at, 10)) * 30}px)` }}>
      <div style={{ background: "rgba(255,255,255,0.08)", border: `4px solid ${f >= pickAt ? FLASH : "#fff"}`, borderRadius: 16, padding: "30px 0" }}><Face flip={flip} size={260} stroke={f >= pickAt ? FLASH : "#fff"} /></div>
      <div style={{ ...lab, fontSize: 24, color: "#fff", marginTop: 18 }}>{label}</div>
      <div style={{ ...serif(64, FLASH), marginTop: 18, opacity: p(f, pickAt, 10) }}>{pick}</div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 6) }}>
      {card(110, false, "NORMAL PRINT", normalAt, "friends' pick", friendsAt)}
      {card(590, true, "FLIPPED PRINT", flipAt, "her pick", sheAt)}
      {note("MITA, DERMER & KNIGHT · JPSP · 1977", 1620)}
    </AbsoluteFill>
  );
};

/** A face with a dashed centre line: no face is perfectly even. */
export const Uneven: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, display: "flex", justifyContent: "center", opacity: p(f, from, 8) }}>
        <div style={{ position: "relative" }}>
          <Face size={480} />
          <div style={{ position: "absolute", left: "50%", top: 20, bottom: 20, borderLeft: `4px dashed ${FLASH}`, opacity: p(f, at - 10, 10) }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, at, 10) }}>LEFT ≠ RIGHT</div>
    </AbsoluteFill>
  );
};

/** Camera distance: a phone one foot away vs a camera five feet away; the near face's nose base spreads 30%. */
export const Distance: React.FC<{ from: number; footAt: number }> = ({ from, footAt }) => {
  const f = useCurrentFrame();
  const k = p(f, footAt, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 860, width: 400, textAlign: "center", opacity: p(f, from, 8) }}>
        <Face size={260} wide={1 + 0.14 * k} stroke={FLASH} />
        <div style={{ ...lab, fontSize: 24, color: FLASH, marginTop: 20 }}>PHONE · 1 FOOT</div>
      </div>
      <div style={{ position: "absolute", left: 580, top: 860, width: 400, textAlign: "center", opacity: p(f, from + 6, 8) }}>
        <Face size={260} />
        <div style={{ ...lab, fontSize: 24, color: "#fff", marginTop: 20 }}>CAMERA · 5 FEET</div>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1330, textAlign: "center", ...serif(140, FLASH), opacity: p(f, footAt + 10, 10) }}>+30% wider</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1490, textAlign: "center", ...lab, fontSize: 24, color: "#fff", opacity: p(f, footAt + 16, 10) }}>BASE OF THE NOSE</div>
      {note("WARD, WARD, FRIED & PASKHOVER · JAMA FACIAL PLASTIC SURGERY · 2018", 1600)}
    </AbsoluteFill>
  );
};

/** Three versions of a face; people pick the more attractive one as their own. */
export const Morph: React.FC<{ from: number; pickAt: number }> = ({ from, pickAt }) => {
  const f = useCurrentFrame();
  const labels = ["LESS ATTRACTIVE", "REAL", "MORE ATTRACTIVE"];
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 60, right: 60, top: 900, display: "flex", justifyContent: "space-between" }}>
        {labels.map((l, i) => {
          const picked = i === 2 && f >= pickAt;
          return <div key={l} style={{ textAlign: "center", width: 300, opacity: p(f, from + i * 5, 8) }}>
            <div style={{ border: `4px solid ${picked ? FLASH : "rgba(255,255,255,0.5)"}`, borderRadius: 16, padding: "20px 0" }}><Face size={200} stroke={picked ? FLASH : "#fff"} wide={1 - 0.04 * (1 - i)} /></div>
            <div style={{ ...lab, fontSize: 20, color: picked ? FLASH : "#fff", marginTop: 16 }}>{l}</div>
          </div>;
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", ...serif(110, FLASH), opacity: p(f, pickAt + 6, 10) }}>"that's me"</div>
      {note("EPLEY & WHITCHURCH · PSPB · 2008 · UNIVERSITY OF CHICAGO", 1560)}
    </AbsoluteFill>
  );
};

void interpolate; void clamp;
