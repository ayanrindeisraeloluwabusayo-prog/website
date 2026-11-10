// Final layer: the rendered 3D film, plain captions (1-2 white bold words with a dark outline, low-centre, as the
// owner's playbook asks) and the mixed soundtrack. No end card: the film stops on the payoff.
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, staticFile, useCurrentFrame } from "remotion";
import { loadFont } from "@remotion/fonts";
import { CAPTIONS } from "./captions";

loadFont({ family: "Inter Tight", url: staticFile("fonts/inter-tight-latin-800-normal.woff2"), weight: "800", format: "woff2" });

const Captions: React.FC = () => {
  const f = useCurrentFrame();
  const c = CAPTIONS.find((x) => f >= x.from && f < x.to);
  if (!c) return null;
  const k = interpolate(f, [c.from, c.from + 3], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-start", alignItems: "center", paddingTop: 1265 }}>
      <div style={{ fontFamily: "'Inter Tight', Arial, sans-serif", fontWeight: 800, fontSize: 74, letterSpacing: "-0.01em", color: "#fff",
        WebkitTextStroke: "11px #17121c", paintOrder: "stroke fill", textShadow: "0 5px 0 rgba(23,18,28,0.55)",
        transform: `scale(${0.9 + 0.1 * k})`, opacity: 0.4 + 0.6 * k, whiteSpace: "nowrap" }}>{c.t}</div>
    </AbsoluteFill>
  );
};

export const Final: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    <OffthreadVideo src={staticFile("film.mp4")} muted style={{ width: "100%", height: "100%" }} />
    <Captions />
    <Audio src={staticFile("audio/mix.wav")} />
  </AbsoluteFill>
);
