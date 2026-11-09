// The video panel (right side, sized for 9:16): plays the active song's clip, shimmers before playback starts,
// and settles on the #1 artwork at the end. Clips of any other shape sit whole over a blurred copy of themselves.
import { AbsoluteFill, Easing, Img, interpolate, Loop, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import type { Song, Timeline } from "./schema";
import { useLayout } from "./layout";
import { TRANSITION } from "./timeline";
import { Bar, C, EASE_OUT, p01 } from "./ui";

// The hand-off (Emil Kowalski, "masking imperfect crossfades"): a plain dissolve shows two pictures at once,
// so the outgoing clip blurs, settles back and fades while the incoming one comes into focus from slightly
// closer. The two read as one movement. Sound crossfades with the picture.
const EASE_IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
const BLUR = 14;

// The video itself, looped when the playable part is shorter than the song's slot.
const Footage: React.FC<{ src: string; startFrom: number; source: number; length: number; muted?: boolean; volume?: () => number; fit: "cover" | "contain" }> = ({
  src,
  startFrom,
  source,
  length,
  muted,
  volume,
  fit,
}) => {
  const video = <OffthreadVideo src={src} startFrom={startFrom} muted={muted} volume={volume} style={{ width: "100%", height: "100%", objectFit: fit }} />;
  return source < length ? <Loop durationInFrames={source}>{video}</Loop> : video;
};

// `length` is the slot (coming in + fully visible); the clip plays one TRANSITION longer while it hands off.
const Clip: React.FC<{ song: Song; length: number; source: number; volume: number }> = ({ song, length, source, volume }) => {
  const frame = useCurrentFrame();
  const total = length + TRANSITION;
  const inP = p01(frame, 0, TRANSITION, EASE_OUT);
  const outP = p01(frame, length, TRANSITION, EASE_IN_OUT);
  const opacity = inP * (1 - outP);
  const blur = BLUR * (1 - inP) + BLUR * outP;
  const scale = interpolate(inP, [0, 1], [1.06, 1]) * interpolate(outP, [0, 1], [1, 0.96]);
  const src = staticFile(song.video);
  const startFrom = Math.round(song.clipStart * 30);
  return (
    <AbsoluteFill style={{ opacity, scale: String(scale), filter: blur > 0.05 ? `blur(${blur}px)` : undefined }}>
      <AbsoluteFill style={{ filter: "blur(36px) brightness(0.55)", scale: "1.25" }}>
        <Footage src={src} startFrom={startFrom} source={source} length={total} muted fit="cover" />
      </AbsoluteFill>
      <AbsoluteFill>
        <Footage src={src} startFrom={startFrom} source={source} length={total} volume={() => volume * opacity} fit="contain" />
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

export const VideoPanel: React.FC<{ songs: Song[]; tl: Timeline; volume: number }> = ({ songs, tl, volume }) => {
  const frame = useCurrentFrame();
  const P = useLayout().panel;
  const appear = p01(frame, tl.listStart, 16);
  const winner = songs.find((s) => s.rank === 1)!;

  return (
    <div
      style={{
        position: "absolute",
        left: P.x,
        top: P.y,
        width: P.w,
        height: P.h,
        borderRadius: P.r,
        overflow: "hidden",
        backgroundColor: C.s1,
        boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
        opacity: appear,
        scale: String(interpolate(appear, [0, 1], [0.97, 1])),
      }}
    >
      {frame < tl.playStart ? <Bar x={0} w={P.w} h={P.h} r={0} shimmer rowWidth={P.w} style={{ position: "absolute", inset: 0 }} /> : null}
      {tl.segments.map((seg) => (
        <Sequence key={seg.rank} from={seg.start} durationInFrames={seg.length + TRANSITION} premountFor={30}>
          <Clip song={songs.find((s) => s.rank === seg.rank)!} length={seg.length} source={seg.source} volume={volume} />
        </Sequence>
      ))}
      {frame >= tl.outroStart ? (
        <AbsoluteFill style={{ opacity: p01(frame, tl.outroStart, 12) }}>
          <Img src={staticFile(winner.cover)} style={{ position: "absolute", inset: 0, width: "100%", height: "100%", objectFit: "cover", filter: "blur(30px) brightness(0.5)", scale: "1.2" }} />
          <AbsoluteFill style={{ justifyContent: "center", alignItems: "center" }}>
            <Img src={staticFile(winner.cover)} style={{ width: P.w * 0.72, height: P.w * 0.72, borderRadius: 12, boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px" }} />
          </AbsoluteFill>
        </AbsoluteFill>
      ) : null}
    </div>
  );
};
