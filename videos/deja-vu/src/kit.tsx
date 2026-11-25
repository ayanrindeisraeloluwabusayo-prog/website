// The "blue serif explainer" kit: fonts, surfaces (blue field, paper), grain, the word-by-word phrase,
// and the transitions. Values come from the frame-by-frame study (video-styles/blue-serif-explainer.md).
import { loadFont } from "@remotion/fonts";
import { AbsoluteFill, Easing, interpolate, staticFile, useCurrentFrame } from "remotion";

loadFont({ family: "Inter", url: staticFile("fonts/inter-latin-400-normal.woff2"), weight: "400", format: "woff2" });
loadFont({ family: "Inter", url: staticFile("fonts/inter-latin-500-normal.woff2"), weight: "500", format: "woff2" });
loadFont({ family: "Inter", url: staticFile("fonts/inter-latin-700-normal.woff2"), weight: "700", format: "woff2" });
loadFont({ family: "Instrument Serif", url: staticFile("fonts/instrument-serif-latin-400-normal.woff2"), weight: "400", format: "woff2" });

export const W = 1080;
export const H = 1920;
export const BLUE = "#0243F1";
export const BLUE_DEEP = "#011A8C";
export const PAPER = "#ECEBEF";
export const FLASH = "#F3C21D";
export const SANS = "Inter, Helvetica, Arial, sans-serif";
export const SERIF = "'Instrument Serif', 'Times New Roman', serif";
export const SMALL = 50; // ~4.6 % of the width, like the reference
export const BIG = 190; // ~3.8x the small size

export const EASE_OUT = Easing.bezier(0.23, 1, 0.32, 1);
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
export const p = (f: number, start: number, dur: number, easing = EASE_OUT) => interpolate(f, [start, start + dur], [0, 1], { ...clamp, easing });

/** Deterministic random numbers, so every render is identical. */
export const rand = (seed: number) => {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
};

// ---------- surfaces ----------

/** Fine film grain that changes every frame (the reference's noise sits around 5-8 on 0-255). */
export const Grain: React.FC<{ amount?: number }> = ({ amount = 0.16 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "overlay", opacity: amount, pointerEvents: "none" }}>
      <filter id={`grain-${f % 6}`}>
        <feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves={2} seed={f % 6} stitchTiles="stitch" />
        <feColorMatrix type="saturate" values="0" />
      </filter>
      <rect width={W} height={H} filter={`url(#grain-${f % 6})`} />
    </svg>
  );
};

/** Electric blue with a deeper edge, optionally with a crumpled-paper texture on top. */
export const BlueField: React.FC<{ crumple?: boolean; glow?: number }> = ({ crumple = false, glow = 0.5 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 80% 60% at 50% ${40 + glow * 10}%, #1f5cff 0%, ${BLUE} 45%, ${BLUE_DEEP} 100%)` }}>
    {crumple ? (
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "soft-light", opacity: 0.55 }}>
        <filter id="crumple">
          <feTurbulence type="fractalNoise" baseFrequency="0.012 0.018" numOctaves={4} seed={11} />
          <feDiffuseLighting lightingColor="#ffffff" surfaceScale={6}>
            <feDistantLight azimuth={225} elevation={42} />
          </feDiffuseLighting>
        </filter>
        <rect width={W} height={H} filter="url(#crumple)" />
      </svg>
    ) : null}
  </AbsoluteFill>
);

/** Off-white paper with fibre mottling and two soft creases. */
export const Paper: React.FC = () => (
  <AbsoluteFill style={{ backgroundColor: PAPER }}>
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, mixBlendMode: "multiply", opacity: 0.35 }}>
      <filter id="paper">
        <feTurbulence type="fractalNoise" baseFrequency="0.006 0.02" numOctaves={4} seed={3} />
        <feColorMatrix type="matrix" values="0 0 0 0 0.85  0 0 0 0 0.85  0 0 0 0 0.88  0 0 0 0.9 0" />
      </filter>
      <rect width={W} height={H} filter="url(#paper)" />
    </svg>
    <div style={{ position: "absolute", left: -100, top: 1180, width: W + 200, height: 2, transform: "rotate(-8deg)", background: "linear-gradient(90deg, transparent, rgba(0,0,0,0.07), rgba(255,255,255,0.5), transparent)" }} />
    <div style={{ position: "absolute", left: 640, top: -100, width: 2, height: H + 200, transform: "rotate(4deg)", background: "linear-gradient(180deg, transparent, rgba(0,0,0,0.05), rgba(255,255,255,0.4), transparent)" }} />
  </AbsoluteFill>
);

/** A slow push-in so the frame is never frozen. */
export const Drift: React.FC<{ from: number; to: number; amount?: number; children: React.ReactNode }> = ({ from, to, amount = 0.06, children }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [from, to], [0, 1], clamp);
  return <AbsoluteFill style={{ scale: String(1 + amount * t) }}>{children}</AbsoluteFill>;
};

// ---------- the word-by-word phrase ----------

export type Word = { w: string; at: number; big?: boolean };
export type Line = { words: Word[]; align?: "flex-start" | "center" | "flex-end"; indent?: number };

/** Words keep their final places and fade in from blurred as they are "spoken" (3-4 frames).
 *  Small sans lines tuck tight against the big serif line, like the reference lockups. */
export const Phrase: React.FC<{ lines: Line[]; top: number; color?: string; width?: number; until?: number }> = ({ lines, top, color = "#fff", width = 860, until = 1e9 }) => {
  const f = useCurrentFrame();
  if (f >= until) return null;
  return (
    <div style={{ position: "absolute", left: (W - width) / 2, top, width, display: "flex", flexDirection: "column", color }}>
      {lines.map((line, li) => {
        const big = line.words.some((w) => w.big);
        return (
          <div
            key={li}
            style={{
              display: "flex",
              justifyContent: line.align ?? "center",
              paddingLeft: line.indent ?? 0,
              gap: big ? BIG * 0.2 : SMALL * 0.28,
              fontFamily: big ? SERIF : SANS,
              fontSize: big ? BIG : SMALL,
              fontWeight: big ? 400 : 400,
              letterSpacing: big ? "-0.035em" : "-0.01em",
              lineHeight: big ? 0.86 : 1.05,
              marginTop: li > 0 && !big ? -SMALL * 0.05 : big && li > 0 ? -BIG * 0.08 : 0,
              textShadow: color === "#fff" ? "0 2px 24px rgba(0,0,0,0.35)" : undefined,
            }}
          >
            {line.words.map((w, wi) => {
              const t = p(f, w.at, 4);
              return (
                <span key={wi} style={{ display: "inline-block", opacity: t, filter: t < 1 ? `blur(${(1 - t) * 10}px)` : undefined, translate: `0px ${(1 - t) * 6}px` }}>
                  {w.w}
                </span>
              );
            })}
          </div>
        );
      })}
    </div>
  );
};

/** Helper: words of one line spaced by `gap` frames. */
export const words = (text: string, at: number, gap = 7, big = false): Word[] => text.split(" ").map((w, i) => ({ w, at: at + i * gap, big }));

// ---------- transitions (4-10 frames, like the reference) ----------

/** Film burn / light leak: warm pink-orange-blue light washes to white, a film-edge strip slides past. */
export const FilmBurn: React.FC<{ at: number; dur?: number }> = ({ at, dur = 10 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= dur) return null;
  const t = f / (dur - 1);
  const wash = Math.sin(Math.PI * t);
  return (
    <AbsoluteFill style={{ pointerEvents: "none" }}>
      <AbsoluteFill
        style={{
          mixBlendMode: "screen",
          opacity: Math.min(1, wash * 1.6),
          background: `radial-gradient(circle at ${20 + 70 * t}% ${60 - 20 * t}%, #ff6fa0 0%, transparent 45%), radial-gradient(circle at ${90 - 50 * t}% ${30 + 30 * t}%, #ffb070 0%, transparent 50%), radial-gradient(circle at 30% 85%, #6fb7ff 0%, transparent 45%)`,
        }}
      />
      <AbsoluteFill style={{ backgroundColor: "#fff8f2", opacity: Math.max(0, wash * 1.3 - 0.35) }} />
      <div
        style={{
          position: "absolute",
          right: 40,
          top: -400 + 2600 * t,
          writingMode: "vertical-rl",
          fontFamily: SANS,
          fontWeight: 700,
          fontSize: 54,
          letterSpacing: "0.5em",
          color: "rgba(255,120,80,0.75)",
          opacity: wash,
        }}
      >
        LENGTH 24 · ROLL 7 · LENGTH
      </div>
    </AbsoluteFill>
  );
};

/** Negative image for 2 frames, then solid yellow for 2 frames. */
export const InvertFlash: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= 4) return null;
  if (f < 2) return <AbsoluteFill style={{ backdropFilter: "invert(1) hue-rotate(180deg) contrast(1.2)" }} />;
  return <AbsoluteFill style={{ backgroundColor: FLASH }} />;
};

/** Pixel glitch (datamosh-like): blocks of the picture smear, shift and smudge for a few frames. */
export const PixelGlitch: React.FC<{ at: number; dur?: number }> = ({ at, dur = 8 }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= dur) return null;
  const r = rand(1000 + f * 17);
  const tiles: React.ReactNode[] = [];
  const size = [120, 90, 160, 60][f % 4];
  for (let y = 0; y < H; y += size) {
    for (let x = 0; x < W; x += size) {
      if (r() > 0.42) continue;
      const kind = r();
      tiles.push(
        <div
          key={`${x}-${y}`}
          style={{
            position: "absolute",
            left: x + (r() - 0.5) * 80,
            top: y,
            width: size * (1 + Math.floor(r() * 3)),
            height: size,
            backdropFilter: `blur(${10 + r() * 20}px) saturate(1.6)`,
            backgroundColor: kind > 0.85 ? "rgba(2,67,241,0.55)" : kind > 0.75 ? "rgba(236,235,239,0.4)" : "transparent",
          }}
        />,
      );
    }
  }
  return <AbsoluteFill style={{ pointerEvents: "none" }}>{tiles}</AbsoluteFill>;
};
