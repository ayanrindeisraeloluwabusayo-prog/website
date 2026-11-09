// Effects test on the owner's 1-minute Burna Boy footage, with five custom pro effects (vertigo, stage-world,
// paper-cutout, ascii-me, credits-roll; plan in effects-plan.json, code in the effects skill's fx_pro.py).
// The effects pass is rendered first; this layer adds clean captions on every spoken word and subtle
// sound effects on the big visual moments, as the owner's guide asks (OWNER-PLAYBOOK.md).
import { AbsoluteFill, Audio, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { SANS2 } from "./type";
import { CAPTIONS } from "./captions";

export const FRAMES = 1813;

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.35 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume} />
  </Sequence>
);

/** One caption phrase: white bold words on a soft dark pill, each word popping in as it is spoken. */
const Captions: React.FC = () => {
  const f = useCurrentFrame();
  if (f >= 1662) return null; // the end credits carry the last line
  const ph = CAPTIONS.find((c) => f >= c.from && f < c.to);
  if (!ph) return null;
  const inK = interpolate(f, [ph.from, ph.from + 4], [0, 1], { extrapolateRight: "clamp" });
  return (
    <AbsoluteFill style={{ justifyContent: "flex-end", alignItems: "center", paddingBottom: 330 }}>
      <div
        style={{
          maxWidth: 920,
          padding: "16px 30px 20px",
          borderRadius: 26,
          background: "rgba(10,10,14,0.62)",
          backdropFilter: "blur(6px)",
          boxShadow: "0 12px 30px rgba(0,0,0,0.35)",
          textAlign: "center",
          opacity: inK,
          transform: `translateY(${(1 - inK) * 12}px)`,
        }}
      >
        {ph.words.map((w, i) => {
          const on = f >= w.at;
          const k = interpolate(f, [w.at, w.at + 4], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
          const current = on && (i === ph.words.length - 1 || f < ph.words[i + 1].at);
          return (
            <span
              key={i}
              style={{
                fontFamily: SANS2,
                fontWeight: 800,
                fontSize: 64,
                letterSpacing: "-0.02em",
                lineHeight: 1.12,
                color: current ? "#FFD84A" : "#ffffff",
                opacity: on ? 0.35 + 0.65 * k : 0.35,
                display: "inline-block",
                transform: `scale(${current ? 1 + 0.06 * (1 - k) : 1})`,
                marginRight: i < ph.words.length - 1 ? "0.26em" : 0,
              }}
            >
              {w.w}
            </span>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => (
  <AbsoluteFill style={{ background: "#000" }}>
    {/* the effects render, with the speaker's own voice */}
    <OffthreadVideo src={staticFile("burna_effects.mp4")} style={{ width: "100%", height: "100%" }} />
    <Captions />

    {/* subtle sound effects, only on the five effects' big moments */}
    <Sfx at={107} src="riser" volume={0.28} />         {/* vertigo: the room starts stretching */}
    <Sfx at={467} src="wave-hit" volume={0.3} />       {/* stage world: the room becomes a crowd */}
    <Sfx at={528} src="whoosh" volume={0.22} />        {/* switch to the stadium */}
    <Sfx at={564} src="whoosh" volume={0.22} />        {/* switch to the arena */}
    <Sfx at={597} src="whoosh" volume={0.22} />        {/* switch to the crowd singing */}
    <Sfx at={672} src="firework" volume={0.28} />      {/* heat for days: embers */}
    <Sfx at={897} src="stamp" volume={0.32} />         {/* paper cut-out: the sticker slaps on */}
    <Sfx at={958} src="strike" volume={0.42} />        {/* the strings snap on "anybody" */}
    <Sfx at={1248} src="glitch-a" volume={0.28} />     {/* ascii-me: dissolves into letters */}
    <Sfx at={1269} src="spark" volume={0.3} />         {/* TALENT lights up */}
    <Sfx at={1655} src="whoosh-film" volume={0.25} />  {/* end credits: the shot shrinks */}
    <Sfx at={1744} src="chime" volume={0.28} />        {/* "due." */}
  </AbsoluteFill>
);
