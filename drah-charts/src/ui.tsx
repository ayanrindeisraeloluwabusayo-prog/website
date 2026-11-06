// Visual language: inspired by a music-streaming app's dark UI (design-inspo/library/spotify.md):
// near-black surfaces, silver text, one functional accent, pill shapes, heavy shadows,
// skeleton shimmer while content "loads". No brand name, logo or proprietary font.
import { createContext, useContext } from "react";
import { Easing, interpolate, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";

for (const w of ["400", "500", "700", "800"]) {
  loadFont({ family: "Figtree", url: staticFile(`fonts/figtree-latin-${w}-normal.woff2`), weight: w, format: "woff2" });
}

export const C = {
  bg: "#121212",
  s1: "#181818",
  s2: "#1f1f1f",
  card: "#252525",
  active: "#2a2a2a",
  text: "#ffffff",
  muted: "#b3b3b3",
  dim: "#7c7c7c",
  skeleton: "#2a2a2a",
  shine: "#5a5a5a",
  note: "#8f8f8f", // small print: 5.9:1 on the background (Impeccable floor is 4.5:1)
};
export const FONT = "Figtree";

// Width of a piece of text in pixels, so long titles and names can be fitted instead of cut off.
let measureCtx: CanvasRenderingContext2D | null | undefined;
export const textWidth = (text: string, size: number, weight = 700) => {
  if (measureCtx === undefined) measureCtx = typeof document === "undefined" ? null : document.createElement("canvas").getContext("2d");
  if (!measureCtx) return text.length * size * 0.6;
  measureCtx.font = `${weight} ${size}px ${FONT}, sans-serif`;
  return measureCtx.measureText(text).width;
};
export const W = 1080;
export const H = 1920;
export const SIDE = 60;

export const AccentCtx = createContext("#1ed760");
export const useAccent = () => useContext(AccentCtx);

// Motion (Emil Kowalski): strong ease-out for entrances, drawer curve for things that move on screen.
export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
export const EASE_DRAWER = Easing.bezier(0.32, 0.72, 0, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const p01 = (frame: number, start: number, dur: number, easing = EASE_OUT) =>
  interpolate(frame, [start, start + dur], [0, 1], { ...clamp, easing });
export const rise = (frame: number, start: number, dist = 10, dur = 12) => ({
  opacity: p01(frame, start, dur),
  translate: `0px ${(1 - p01(frame, start, dur)) * dist}px`,
});

// One sweep of light crossing a skeleton row every SWEEP frames, left to right.
const SWEEP = 36;
const BAND = 260;
export const sweepX = (frame: number, width: number) => ((frame % SWEEP) / SWEEP) * (width + BAND * 2) - BAND;

// A skeleton bar. `x` is its left edge inside the row, so every bar shares the same sweep.
export const Bar: React.FC<{ x: number; w: number; h: number; r?: number; shimmer: boolean; rowWidth: number; style?: React.CSSProperties }> = ({
  x,
  w,
  h,
  r = 6,
  shimmer,
  rowWidth,
  style,
}) => {
  const frame = useCurrentFrame();
  const c = sweepX(frame, rowWidth) - x;
  const background = shimmer
    ? `linear-gradient(90deg, ${C.skeleton} ${c - BAND}px, ${C.shine} ${c}px, ${C.skeleton} ${c + BAND}px)`
    : C.skeleton;
  return <div style={{ width: w, height: h, borderRadius: r, background, flex: "none", ...style }} />;
};

export const Equalizer: React.FC<{ size: number }> = ({ size }) => {
  const frame = useCurrentFrame();
  const accent = useAccent();
  const t = (frame / 30) * Math.PI * 2 * 0.9;
  return (
    <div style={{ display: "flex", alignItems: "flex-end", gap: size * 0.14, width: size, height: size, flex: "none" }}>
      {[0, 1.4, 2.3, 0.8].map((ph, i) => (
        <div key={i} style={{ flex: 1, backgroundColor: accent, borderRadius: 2, height: `${28 + 72 * Math.abs(Math.sin(t + ph))}%` }} />
      ))}
    </div>
  );
};

export const SearchIcon: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg viewBox="0 0 24 24" width={size} height={size} style={{ flex: "none" }}>
    <circle cx="10.5" cy="10.5" r="6.5" stroke={color} strokeWidth={2.6} fill="none" />
    <path d="M15.5 15.5L21 21" stroke={color} strokeWidth={2.6} strokeLinecap="round" />
  </svg>
);
