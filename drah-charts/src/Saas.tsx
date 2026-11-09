// The SaaS motion design layer (design.saas). It wraps the finished chart "app" without changing it:
//   1. Opening: a big headline on a deep stage, then the app rises in on a 3D tilt that settles flat.
//   2. A cursor operates the app: clicks the search bar (typing starts), clicks search (the bar docks).
//   3. The camera pushes in until the app fills the frame, nudges toward each song as it pops, and
//      pulls back after #1 so the app floats on the stage again.
//   4. End card: the logo lands, the name wipes in, the cursor clicks the call to action.
// Depth comes from layers that move at different rates: a glow and a dot grid behind (slow), the app
// card with a long soft shadow (middle), the cursor and end card in front (fast).
import {
  Audio,
  Easing,
  Img,
  interpolate,
  Sequence,
  staticFile,
  useCurrentFrame,
} from "remotion";
import type { Brand, Timeline } from "./schema";
import { useLayout } from "./layout";
import { BEATS } from "./timeline";
import { C, EASE_DRAWER, EASE_OUT, FONT, p01, useAccent } from "./ui";

const IN_OUT = Easing.bezier(0.77, 0, 0.175, 1);
const EASE_IN = Easing.bezier(0.55, 0, 1, 0.45);
const OVERSHOOT = Easing.bezier(0.34, 1.56, 0.64, 1);
const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
const GOLD = "#c9a26b";

// ---------- camera ----------

/** How the app card sits on the stage at this frame: scale, tilt, corner radius, fade. */
const cardPose = (f: number, tl: Timeline) => {
  const rise = p01(f, tl.introEnd - 26, 32, EASE_OUT); // rises in at the end of the opening
  const push = p01(f, tl.dockStart, tl.dockEnd - tl.dockStart + 8, EASE_DRAWER); // fills the frame as the bar docks
  const pull = p01(f, tl.outroStart + 24, 30, IN_OUT); // floats again after #1
  const away = p01(f, tl.endStart, 18, EASE_IN); // steps back for the end card
  const base = lerp(0.78, 0.86, rise);
  const scale = lerp(lerp(base, 1, push), 0.84, pull) * (1 - 0.12 * away);
  return {
    scale,
    rotateX: 18 * (1 - rise) + 5 * pull,
    y: 300 * (1 - rise) - 60 * away,
    radius: 48 * (1 - push) + 48 * pull,
    opacity: Math.min(rise * 1.4, 1) * (1 - away),
    blur: 14 * away,
    // 0 while the app fills the frame, 1 while it floats: drives the shadow and the stage behind
    float: Math.max(1 - push, pull),
  };
};

/** A gentle push toward the song that just popped, then back (about 3 % for 2 s). */
const songNudge = (
  f: number,
  tl: Timeline,
  L: ReturnType<typeof useLayout>["list"],
) => {
  const seg = tl.segments.find((s) => f >= s.start && f < s.start + s.length);
  if (!seg) return { amount: 0, ox: 0, oy: 0 };
  const amount =
    p01(f, seg.start, 14) * (1 - p01(f, seg.start + 60, 24, IN_OUT));
  const per = Math.ceil(10 / L.cols);
  const i = seg.rank - 1;
  const col = Math.floor(i / per);
  const row = i % per;
  return {
    amount,
    ox: L.x + col * (L.colW + L.colGap) + L.colW / 2,
    oy: L.y + row * L.rowH + L.rowH / 2,
  };
};

// ---------- stage ----------

const StageBackground: React.FC<{ float: number; scale: number }> = ({
  float,
  scale,
}) => {
  const accent = useAccent();
  const { width, height } = useLayout();
  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        backgroundColor: "#0a0a0a",
        overflow: "hidden",
      }}
    >
      {/* far layer: a dot grid that drifts at a third of the card's camera move (parallax) */}
      <div
        style={{
          position: "absolute",
          inset: -200,
          backgroundImage:
            "radial-gradient(rgba(255,255,255,0.09) 1.6px, transparent 1.8px)",
          backgroundSize: "44px 44px",
          scale: String(1 + (scale - 1) * 0.35),
          opacity: 0.35 + 0.65 * float,
        }}
      />
      {/* middle layer: the accent glow the app floats over */}
      <div
        style={{
          position: "absolute",
          left: width * 0.5 - width * 0.8,
          top: height * 0.5 - height * 0.56,
          width: width * 1.6,
          height: height * 1.12,
          borderRadius: "50%",
          background: `radial-gradient(closest-side, ${accent}55, ${accent}1c 55%, transparent 100%)`,
          opacity: 0.5 + 0.5 * float,
        }}
      />
      {/* edge vignette for depth */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background:
            "radial-gradient(ellipse 75% 65% at 50% 50%, transparent 55%, rgba(0,0,0,0.55) 100%)",
        }}
      />
    </div>
  );
};

// ---------- opening headline ----------

const Hook: React.FC<{ brand: Brand; tl: Timeline }> = ({ brand, tl }) => {
  const f = useCurrentFrame();
  const accent = useAccent();
  const { width, height } = useLayout();
  if (f >= tl.introEnd + 4) return null;
  const t1 = p01(f, 0, 16); // already partly on screen at frame 0: the frame social apps use as the thumbnail
  const t2 = p01(f, 8, 16);
  const out = p01(f, tl.introEnd - 30, 16, EASE_IN);
  return (
    <div
      style={{
        position: "absolute",
        left: 0,
        top: 0,
        width,
        height: height * 0.62,
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: FONT,
        opacity: 1 - out,
        scale: String(1 + 0.08 * out),
        filter: out > 0 ? `blur(${10 * out}px)` : undefined,
      }}
    >
      <div
        style={{
          fontSize: width * 0.26,
          fontWeight: 800,
          letterSpacing: "-0.05em",
          lineHeight: 0.95,
          color: C.text,
          opacity: 0.55 + 0.45 * t1,
          translate: `0px ${(1 - t1) * 40}px`,
        }}
      >
        {brand.hookTitle}
      </div>
      <div
        style={{
          marginTop: 24,
          fontSize: width * 0.058,
          fontWeight: 700,
          color: accent,
          letterSpacing: "-0.01em",
          opacity: t2,
          translate: `0px ${(1 - t2) * 24}px`,
        }}
      >
        {brand.hookLine}
      </div>
    </div>
  );
};

// ---------- cursor ----------

const Arrow: React.FC<{ size: number }> = ({ size }) => (
  <svg
    viewBox="0 0 24 24"
    width={size}
    height={size}
    style={{ filter: "drop-shadow(0px 6px 10px rgba(0,0,0,0.55))" }}
  >
    <path
      d="M4 2.5 L4 19.5 L8.6 15.4 L11.6 21.8 L14.6 20.4 L11.6 14.2 L17.8 14.2 Z"
      fill="#ffffff"
      stroke="#111111"
      strokeWidth={1.4}
      strokeLinejoin="round"
    />
  </svg>
);

type Key = { f: number; x: number; y: number };
/** Position along eased key points; clicks press the cursor and leave a ripple. */
const Cursor: React.FC<{
  keys: Key[];
  clicks: number[];
  size: number;
  from: number;
  to: number;
}> = ({ keys, clicks, size, from, to }) => {
  const f = useCurrentFrame();
  const accent = useAccent();
  if (f < from || f > to) return null;
  let x = keys[0].x;
  let y = keys[0].y;
  for (let i = 1; i < keys.length; i++) {
    const a = keys[i - 1];
    const b = keys[i];
    if (f >= a.f) {
      const t = interpolate(f, [a.f, b.f], [0, 1], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
        easing: EASE_DRAWER,
      });
      x = lerp(a.x, b.x, t);
      y = lerp(a.y, b.y, t);
    }
  }
  const press = Math.max(
    0,
    ...clicks.map((c) =>
      interpolate(f, [c - 3, c, c + 7], [0, 1, 0], {
        extrapolateLeft: "clamp",
        extrapolateRight: "clamp",
      }),
    ),
  );
  return (
    <>
      {clicks.map((c) => {
        const r = p01(f, c, 16);
        return r > 0 && r < 1 ? (
          <div
            key={c}
            style={{
              position: "absolute",
              left: x - size * (0.3 + 0.9 * r) + size * 0.17,
              top: y - size * (0.3 + 0.9 * r) + size * 0.1,
              width: size * (0.6 + 1.8 * r),
              height: size * (0.6 + 1.8 * r),
              borderRadius: "50%",
              border: `3px solid ${accent}`,
              opacity: 1 - r,
            }}
          />
        ) : null;
      })}
      <div
        style={{
          position: "absolute",
          left: x,
          top: y,
          scale: String(1 - 0.16 * press),
          transformOrigin: "17% 10%",
        }}
      >
        <Arrow size={size} />
      </div>
    </>
  );
};

// ---------- end card ----------

const EndCard: React.FC<{ brand: Brand; tl: Timeline }> = ({ brand, tl }) => {
  const f = useCurrentFrame() - tl.endStart;
  const accent = useAccent();
  const { width, height } = useLayout();
  if (f < 0) return null;
  const logo = p01(f, 2, 18, OVERSHOOT);
  const ring = p01(f, 10, 24);
  const word = p01(f, 18, 18, IN_OUT);
  const handle = p01(f, 30, 14);
  const cta = p01(f, 40, 14, OVERSHOOT);
  const CLICK = 86;
  const done = f >= CLICK;
  const logoH = height * 0.3;
  const logoY = height * 0.2;
  const ctaY = height * 0.72;
  return (
    <div style={{ position: "absolute", inset: 0, fontFamily: FONT }}>
      <div
        style={{
          position: "absolute",
          left: width / 2 - logoH * 0.55,
          top: logoY + logoH / 2 - logoH * 0.55,
          width: logoH * 1.1,
          height: logoH * 1.1,
          borderRadius: "50%",
          border: `4px solid ${GOLD}`,
          opacity: ring > 0 && ring < 1 ? 0.8 * (1 - ring) : 0,
          scale: String(0.6 + 0.7 * ring),
        }}
      />
      <Img
        src={staticFile(brand.logo)}
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          margin: "0 auto",
          top: logoY,
          height: logoH,
          opacity: Math.min(1, logo * 1.5),
          scale: String(lerp(0.7, 1, logo)),
        }}
      />
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: logoY + logoH + height * 0.035,
          textAlign: "center",
          fontSize: width * 0.115,
          fontWeight: 800,
          letterSpacing: "-0.04em",
          color: C.text,
          clipPath: `inset(0 ${(1 - word) * 50}% 0 ${(1 - word) * 50}%)`,
        }}
      >
        {brand.name}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: logoY + logoH + height * 0.11,
          textAlign: "center",
          fontSize: width * 0.042,
          color: C.muted,
          opacity: handle,
          translate: `0px ${(1 - handle) * 16}px`,
        }}
      >
        {brand.handle}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: ctaY,
          display: "flex",
          justifyContent: "center",
        }}
      >
        <div
          style={{
            padding: `${width * 0.024}px ${width * 0.07}px`,
            borderRadius: 999,
            backgroundColor: done ? "#ffffff" : accent,
            color: "#000000",
            fontSize: width * 0.05,
            fontWeight: 800,
            opacity: Math.min(1, cta * 1.5),
            scale: String(
              lerp(0.85, 1, cta) *
                (1 -
                  0.06 *
                    interpolate(f, [CLICK - 3, CLICK, CLICK + 7], [0, 1, 0], {
                      extrapolateLeft: "clamp",
                      extrapolateRight: "clamp",
                    })),
            ),
            boxShadow: "0px 18px 40px rgba(0,0,0,0.5)",
          }}
        >
          {done ? brand.ctaDone : brand.cta}
        </div>
      </div>
      <Sequence from={tl.endStart} layout="none">
        <Cursor
          size={width * 0.075}
          from={54}
          to={BEATS.endCard}
          clicks={[CLICK]}
          keys={[
            { f: 54, x: width * 1.05, y: height * 0.95 },
            { f: 80, x: width * 0.53, y: ctaY + width * 0.045 },
            { f: BEATS.endCard, x: width * 0.56, y: ctaY + width * 0.06 },
          ]}
        />
      </Sequence>
    </div>
  );
};

// ---------- sound ----------

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({
  at,
  src,
  volume,
}) => (
  <Sequence
    from={Math.max(0, Math.round(at))}
    durationInFrames={60}
    layout="none"
  >
    <Audio src={staticFile(src)} volume={volume} />
  </Sequence>
);

// ---------- the stage ----------

export const SaasStage: React.FC<{
  tl: Timeline;
  brand: Brand;
  sounds: boolean;
  children: React.ReactNode;
}> = ({ tl, brand, sounds, children }) => {
  const f = useCurrentFrame();
  const Lay = useLayout();
  const { width, height } = Lay;
  const S = Lay.search;
  const pose = cardPose(f, tl);
  const nudge = songNudge(f, tl, Lay.list);
  const barY = S.startY + (S.font * 1.2 + 52) / 2; // middle of the search bar before it docks
  const cursorSize = width * 0.07;
  return (
    <div style={{ position: "absolute", inset: 0, overflow: "hidden" }}>
      <StageBackground float={pose.float} scale={pose.scale} />
      <Hook brand={brand} tl={tl} />
      {/* the app card: perspective tilt, long soft shadow, corner radius while it floats */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          perspective: 2400,
          perspectiveOrigin: "50% 40%",
        }}
      >
        <div
          style={{
            position: "absolute",
            inset: 0,
            transform: `translateY(${pose.y}px) rotateX(${pose.rotateX}deg) scale(${pose.scale})`,
            transformOrigin: "50% 50%",
            opacity: pose.opacity,
            filter: pose.blur > 0.1 ? `blur(${pose.blur}px)` : undefined,
          }}
        >
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: pose.radius,
              overflow: "hidden",
              boxShadow: `0px ${70 * pose.float}px ${140 * pose.float}px rgba(0,0,0,${0.7 * pose.float}), 0 0 0 ${2 * pose.float}px rgba(255,255,255,0.13)`,
              backgroundColor: C.bg,
            }}
          >
            {/* the camera nudge toward the playing song happens inside the card */}
            <div
              style={{
                position: "absolute",
                inset: 0,
                scale: String(1 + 0.03 * nudge.amount),
                transformOrigin: `${nudge.ox}px ${nudge.oy}px`,
              }}
            >
              {children}
              <Cursor
                size={cursorSize}
                from={tl.introEnd - 8}
                to={tl.dockEnd + 24}
                clicks={[tl.typeStart - 4, tl.dockStart - 2]}
                keys={[
                  { f: tl.introEnd - 8, x: width * 0.95, y: height * 0.78 },
                  {
                    f: tl.typeStart - 6,
                    x: S.startX + S.w * 0.58,
                    y: barY - cursorSize * 0.1,
                  },
                  {
                    f: tl.typeStart + 20,
                    x: S.startX + S.w * 0.66,
                    y: barY + cursorSize * 1.1,
                  },
                  {
                    f: tl.dockStart - 16,
                    x: S.startX + S.w * 0.66,
                    y: barY + cursorSize * 1.1,
                  },
                  {
                    f: tl.dockStart - 4,
                    x: S.startX + 36 + S.icon * 0.45,
                    y: barY - cursorSize * 0.15,
                  },
                  { f: tl.dockEnd + 24, x: width * 0.9, y: height * 0.95 },
                ]}
              />
            </div>
          </div>
        </div>
      </div>
      <EndCard brand={brand} tl={tl} />
      {sounds ? (
        <>
          <Sfx at={tl.introEnd - 26} src="sfx/whoosh-short.mp3" volume={0.45} />
          <Sfx at={tl.typeStart - 4} src="sfx/click.mp3" volume={0.6} />
          <Sfx at={tl.dockStart - 2} src="sfx/click.mp3" volume={0.6} />
          <Sfx at={tl.outroStart + 24} src="sfx/whoosh.mp3" volume={0.4} />
          <Sfx at={tl.endStart + 2} src="sfx/impact-bass-1.mp3" volume={0.7} />
          <Sfx at={tl.endStart + 86} src="sfx/click.mp3" volume={0.6} />
          <Sfx at={tl.endStart + 88} src="sfx/chime.mp3" volume={0.5} />
        </>
      ) : null}
    </div>
  );
};
