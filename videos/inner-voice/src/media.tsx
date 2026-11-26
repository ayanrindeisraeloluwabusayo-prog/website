// Real imagery for the chills video: full-screen shots, floating photo cards, the blue tint, and
// scrims so white words stay readable on pictures.
import { AbsoluteFill, Img, interpolate, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { EASE_OUT, H, p, W } from "./kit";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const m = (name: string) => staticFile(`media/${name}`);

/** SVG filters used by CSS `filter: url(#…)`: two blue duotones (dark → light). */
export const Filters: React.FC = () => (
  <svg width={0} height={0} style={{ position: "absolute" }}>
    {/* "blue": navy shadows, electric-blue highlights (white backgrounds become the brand blue) */}
    <filter id="duo-blue" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0.004 0.16" />
        <feFuncG type="table" tableValues="0.016 0.36" />
        <feFuncB type="table" tableValues="0.10 1" />
      </feComponentTransfer>
    </filter>
    {/* "ink": black stays deep navy, white turns pale ice blue */}
    <filter id="duo-ink" colorInterpolationFilters="sRGB">
      <feColorMatrix type="matrix" values="0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0.3 0.59 0.11 0 0  0 0 0 1 0" />
      <feComponentTransfer>
        <feFuncR type="table" tableValues="0.004 0.78" />
        <feFuncG type="table" tableValues="0.02 0.86" />
        <feFuncB type="table" tableValues="0.16 1" />
      </feComponentTransfer>
    </filter>
  </svg>
);

type ShotProps = {
  src: string;
  from: number;
  to: number;
  video?: boolean;
  /** where the picture is anchored when cropped to the tall frame */
  pos?: string;
  /** scale at the start and end of the shot (slow push-in by default) */
  zoom?: [number, number];
  duo?: "blue" | "ink";
  /** extra CSS filter, e.g. "brightness(0.8) contrast(1.1)" */
  grade?: string;
  rate?: number;
  /** push the picture down (px) and fill the gap with `fill` */
  shiftY?: number;
  fill?: string;
};

/** A full-screen picture or clip that is always moving slowly. */
export const Shot: React.FC<ShotProps> = ({ src, from, to, video, pos = "50% 50%", zoom = [1.03, 1.12], duo, grade = "", rate = 1, shiftY = 0, fill = "#000" }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const s = interpolate(f, [from, to], zoom, clamp);
  const style: React.CSSProperties = {
    width: "100%",
    height: "100%",
    objectFit: "cover",
    objectPosition: pos,
    filter: `${duo ? `url(#duo-${duo})` : ""} ${grade}`.trim() || undefined,
  };
  return (
    <AbsoluteFill style={{ overflow: "hidden", background: fill }}>
      <AbsoluteFill style={{ scale: String(s), transformOrigin: pos, translate: `0 ${shiftY}px` }}>
        {video ? (
          <Sequence from={from} layout="none">
            <OffthreadVideo src={m(src)} muted playbackRate={rate} style={style} />
          </Sequence>
        ) : (
          <Img src={m(src)} style={style} />
        )}
      </AbsoluteFill>
      {shiftY > 0 ? <AbsoluteFill style={{ background: `linear-gradient(180deg, ${fill} 0px, ${fill} ${shiftY + 40}px, transparent ${shiftY + 260}px)` }} /> : null}
    </AbsoluteFill>
  );
};

/** A photo "card" floating on the stage: pops in with a small 3D tilt that settles, long soft shadow. */
export const Card: React.FC<{
  src: string;
  from: number;
  to: number;
  width?: number;
  ratio: number; // width / height of the picture
  y?: number; // centre of the card
  tilt?: number; // resting rotation in degrees
  grade?: string;
  duo?: "blue" | "ink";
}> = ({ src, from, to, width = 900, ratio, y = H * 0.6, tilt = -2, grade = "", duo }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  const k = p(f, from, 14, EASE_OUT);
  const drift = interpolate(f, [from, to], [0, 1], clamp);
  const h = width / ratio;
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div
        style={{
          position: "absolute",
          left: (W - width) / 2,
          top: y - h / 2,
          width,
          height: h,
          opacity: k,
          transform: `translateY(${(1 - k) * 60 - drift * 20}px) scale(${0.86 + 0.14 * k + drift * 0.04}) rotateX(${(1 - k) * 14}deg) rotateZ(${tilt + (1 - k) * -3}deg)`,
          boxShadow: "0 60px 90px rgba(0,0,0,0.55), 0 12px 24px rgba(0,0,0,0.35)",
          borderRadius: 6,
          overflow: "hidden",
        }}
      >
        <Img src={m(src)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: `${duo ? `url(#duo-${duo})` : ""} ${grade}`.trim() || undefined }} />
      </div>
    </AbsoluteFill>
  );
};

/** Darkens one edge of the frame so white words read on any picture. */
export const Scrim: React.FC<{ side?: "top" | "bottom" | "all"; strength?: number }> = ({ side = "top", strength = 0.6 }) => {
  const bg =
    side === "all"
      ? `radial-gradient(ellipse 90% 70% at 50% 50%, rgba(0,0,0,${strength * 0.3}) 0%, rgba(0,0,0,${strength}) 100%)`
      : `linear-gradient(${side === "top" ? "180deg" : "0deg"}, rgba(0,0,0,${strength}) 0%, rgba(0,0,0,${strength * 0.5}) 30%, rgba(0,0,0,0) 58%)`;
  return <AbsoluteFill style={{ background: bg, pointerEvents: "none" }} />;
};

/** Gentle dark edges, like a lens. */
export const Vignette: React.FC<{ amount?: number }> = ({ amount = 0.55 }) => (
  <AbsoluteFill style={{ background: `radial-gradient(ellipse 75% 65% at 50% 50%, rgba(0,0,0,0) 55%, rgba(0,0,0,${amount}) 100%)`, pointerEvents: "none" }} />
);

/** A deep-blue stage behind floating cards. */
export const Stage: React.FC = () => (
  <AbsoluteFill style={{ background: "radial-gradient(ellipse 80% 55% at 50% 60%, #0b2fa8 0%, #041463 55%, #010627 100%)" }} />
);
