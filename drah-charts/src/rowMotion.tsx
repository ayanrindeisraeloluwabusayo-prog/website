// Motion for the song part of a list row (cover, title, artist, streams). The rank number never moves.
// Seven styles to choose from; set design.rowMotion. Strongest motion on the playing row, finished rows
// stay calm (Emil Kowalski: motion has a purpose, decoration stays quiet, nothing distracts from the video).
import { Easing, interpolate } from "remotion";
import { EASE_OUT } from "./ui";

// "vinyl-cascade" (the chosen default) combines vinyl and cascade.
export const ROW_MOTIONS = ["none", "breathe", "beat", "vinyl", "flip", "shine", "cascade", "float", "vinyl-cascade"] as const;
export const hasCascade = (m: RowMotion) => m === "cascade" || m === "vinyl-cascade";
export type RowMotion = (typeof ROW_MOTIONS)[number];

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1); // a small, single overshoot for the playful styles
const BEAT = (60 / 112) * 30; // frames per beat, for the beat-driven style

export type MotionInput = {
  motion: RowMotion;
  frame: number;
  since: number; // frames since this song's clip started coming in (negative before)
  active: boolean;
  filled: boolean;
  playLength: number; // frames the song is on screen
  sinceEnd: number; // frames since this song stopped playing (negative while playing)
  rank: number;
  cover: number;
};

export type MotionOut = {
  cover: React.CSSProperties;
  text: React.CSSProperties;
  vinyl?: { out: number; turn: number }; // 0..1 how far the record is out, degrees turned
  shine?: number; // sweep position 0..1 (undefined: none)
  progress?: number; // 0..1 progress line under the row
};

export const rowMotion = (m: MotionInput): MotionOut => {
  const reveal = interpolate(m.since, [0, 12], [0, 1], { ...clamp, easing: EASE_OUT });
  switch (m.motion) {
    case "breathe": {
      // A slow inhale and exhale (2.2 s) while playing.
      const b = m.active ? 0.5 - 0.5 * Math.cos((m.since / 66) * Math.PI * 2) : 0;
      return {
        cover: { scale: String(1 + 0.06 * b), boxShadow: `rgba(0,0,0,${0.25 + 0.35 * b}) 0px ${4 + 8 * b}px ${10 + 16 * b}px` },
        text: {},
      };
    }
    case "beat": {
      const pop = interpolate(m.since, [0, 14], [0.8, 1], { ...clamp, easing: OVERSHOOT });
      const press = m.active && m.since > 14 ? interpolate(m.since % BEAT, [0, 2, 10], [0.93, 0.93, 1], { ...clamp, easing: EASE_OUT }) : 1;
      return { cover: { scale: String(pop * press) }, text: {} };
    }
    case "vinyl": {
      const out = m.active ? interpolate(m.since, [8, 24], [0, 1], { ...clamp, easing: EASE_OUT }) : interpolate(m.sinceEnd, [0, 14], [1, 0], { ...clamp, easing: EASE_OUT });
      const turn = m.since * 7; // about 33 rpm feel
      // The text column narrows to make room (rather than sliding), so titles re-wrap instead of clipping.
      return { cover: {}, text: { marginLeft: out * m.cover * 0.4 }, vinyl: { out: m.filled ? out : 0, turn } };
    }
    case "flip": {
      const flip = interpolate(m.since, [0, 16], [90, 0], { ...clamp, easing: EASE_OUT });
      const sway = m.active && m.since > 16 ? Math.sin(((m.since - 16) / 50) * Math.PI) * 12 : 0;
      return { cover: { transform: `perspective(400px) rotateY(${flip + sway}deg)` }, text: {} };
    }
    case "shine": {
      // One sweep when the row fills, then one every 2 s while playing.
      const first = m.since >= 0 && m.since < 24 ? m.since / 24 : undefined;
      const loop = m.active && m.since >= 24 ? ((m.since - 24) % 60) / 24 : undefined;
      const shine = first ?? (loop !== undefined && loop <= 1 ? loop : undefined);
      return { cover: {}, text: {}, shine };
    }
    case "cascade": {
      const progress = m.active ? interpolate(m.since, [18, m.playLength], [0, 1], clamp) : m.filled ? 1 : 0;
      return { cover: {}, text: {}, progress: m.active ? progress : undefined };
    }
    case "vinyl-cascade": {
      const v = rowMotion({ ...m, motion: "vinyl" });
      const c = rowMotion({ ...m, motion: "cascade" });
      return { ...v, progress: c.progress };
    }
    case "float": {
      // Every filled row floats a few pixels, in a slow wave down the list; the playing row floats most.
      const phase = m.frame / 40 + m.rank * 0.7;
      const amp = m.active ? 6 : 2.5;
      return {
        cover: { translate: `0px ${Math.sin(phase) * amp * reveal}px`, boxShadow: m.active ? "rgba(0,0,0,0.45) 0px 10px 22px" : undefined },
        text: { translate: `0px ${-Math.sin(phase) * amp * 0.4 * reveal}px` },
      };
    }
    default:
      return { cover: {}, text: {} };
  }
};

// Stream counts: "412.6M" counts up from 0 in the cascade style. Anything that isn't a number shows as written.
export const countUp = (streams: string, p: number) => {
  const m = streams.match(/^([\d.,]+)(.*)$/);
  if (!m) return streams;
  const n = parseFloat(m[1].replace(/,/g, ""));
  if (!isFinite(n)) return streams;
  const dec = (m[1].split(".")[1] ?? "").length;
  return (n * p).toFixed(dec) + m[2];
};
