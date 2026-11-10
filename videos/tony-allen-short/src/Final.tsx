// Final layer: the rendered 3D film, clean word-by-word captions in the lower third (the owner chose captions on),
// the mixed soundtrack (voice + original score + effects), and a small end title after the last word.
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { CAPTIONS } from "./captions";

for (const w of ["700", "800"]) loadFont({ family: "Inter Tight", url: staticFile(`fonts/inter-tight-latin-${w}-normal.woff2`), weight: w, format: "woff2" });
const SANS = "'Inter Tight', 'Helvetica Neue', Arial, sans-serif";
const END = 1938;

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const ph = CAPTIONS.find((c) => f >= c.from && f < c.to);
  if (!ph) return null;
  const inK = interpolate(f, [ph.from, ph.from + 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 360 }}>
      <div style={{ maxWidth: 940, padding: "14px 30px 18px", borderRadius: 26, background: "rgba(16,12,24,0.58)", textAlign: "center",
        opacity: inK, transform: `translateY(${(1 - inK) * 12}px)` }}>
        {ph.words.map((w, i) => {
          const on = f >= w.at;
          const k = interpolate(f, [w.at, w.at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const current = on && (i === ph.words.length - 1 || f < ph.words[i + 1].at);
          return (
            <span key={i} style={{ fontFamily: SANS, fontWeight: 800, fontSize: 66, letterSpacing: "-0.02em", lineHeight: 1.12,
              color: current ? "#FFD84A" : "#ffffff", opacity: on ? 0.35 + 0.65 * k : 0.35, display: "inline-block",
              textShadow: "0 3px 10px rgba(0,0,0,0.35)", transform: `scale(${current ? 1 + 0.06 * (1 - k) : 1})`,
              marginRight: i < ph.words.length - 1 ? "0.26em" : 0 }}>{w.w}</span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

const EndTitle: React.FC = () => {
  const f = useCurrentFrame();
  if (f < END) return null;
  const k = interpolate(f, [END, END + 14], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 380 }}>
      <div style={{ opacity: k, transform: `translateY(${(1 - k) * 16}px)`, textAlign: "center", color: "#fff", textShadow: "0 4px 18px rgba(40,10,0,0.45)" }}>
        <div style={{ fontFamily: SANS, fontWeight: 800, fontSize: 92, letterSpacing: "-0.03em" }}>Tony Allen</div>
        <div style={{ fontFamily: SANS, fontWeight: 700, fontSize: 44, opacity: 0.9, marginTop: 4 }}>1940 – 2020 · co-creator of Afrobeat</div>
      </div>
    </AbsoluteFill>
  );
};

export const Final: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <OffthreadVideo src={staticFile("film.mp4")} muted style={{ width: "100%", height: "100%" }} />
    <Captions />
    <EndTitle />
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
