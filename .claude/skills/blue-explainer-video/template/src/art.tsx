// Original artwork for the style test, drawn in code: a stipple head that dissolves like sand, a
// line-art head with a fuzzy brain, a song's loudness curve, rising "dopamine" lights, and a study page.
import { useMemo } from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE, FLASH, H, p, rand, SANS, SERIF, W } from "./kit";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** Inside a head seen in profile (facing right), in a 700 x 820 box: a traced outline. */
const PROFILE: [number, number][] = [
  [250, 820], [240, 640], [150, 520], [110, 380], [130, 240], [200, 130], [310, 70], [430, 80], [520, 140],
  [565, 230], [575, 300], [585, 340], [572, 372], [628, 452], [582, 474], [588, 502], [576, 522], [592, 548],
  [566, 572], [574, 612], [532, 652], [470, 662], [440, 700], [450, 820],
];
const inHead = (x: number, y: number) => {
  let inside = false;
  for (let i = 0, j = PROFILE.length - 1; i < PROFILE.length; j = i++) {
    const [xi, yi] = PROFILE[i];
    const [xj, yj] = PROFILE[j];
    if (yi > y !== yj > y && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) inside = !inside;
  }
  return inside;
};

/** A head made of grain that blows away like sand at its back edge (the reference's dissolve look). */
export const StippleHead: React.FC<{ from: number; scale?: number; y?: number }> = ({ from, scale = 1.25, y = 520 }) => {
  const f = useCurrentFrame() - from;
  const dots = useMemo(() => {
    const r = rand(42);
    const out: { x: number; y: number; s: number; a: number; d: number; v: number }[] = [];
    while (out.length < 3200) {
      const x = r() * 700;
      const yy = r() * 820;
      if (!inHead(x, yy)) continue;
      out.push({ x, y: yy, s: 1.4 + r() * 2.6, a: 0.45 + r() * 0.55, d: r(), v: 0.6 + r() * 1.4 });
    }
    return out;
  }, []);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${(W - 700 * scale) / 2} ${y}) scale(${scale})`}>
        {dots.map((d, i) => {
          const gone = interpolate(f, [24 + d.x * 0.12 + d.d * 30, 70 + d.x * 0.12 + d.d * 40], [0, 1], clamp) * (d.x < 330 ? 1 : 0);
          const dx = gone * 320 * d.v;
          const dy = -gone * 90 * d.v;
          return <circle key={i} cx={d.x - dx} cy={d.y + dy} r={d.s * (1 - gone * 0.5)} fill="#efe6d6" opacity={d.a * (1 - gone)} />;
        })}
      </g>
    </svg>
  );
};

/** A head outline in thin white lines, with a fuzzy stippled brain dome (diagram style on blue). */
export const LineHead: React.FC<{ x?: number; y?: number; scale?: number; draw?: number; brain?: number }> = ({ x = 140, y = 640, scale = 1.15, draw = 1, brain = 1 }) => {
  const dome = useMemo(() => {
    const r = rand(7);
    const out: { x: number; y: number; s: number }[] = [];
    while (out.length < 900) {
      const a = r() * Math.PI;
      const rr = Math.sqrt(r());
      const px = 380 + Math.cos(a) * 170 * rr;
      const py = 400 - Math.sin(a) * 120 * rr;
      out.push({ x: px + (r() - 0.5) * 6, y: py + (r() - 0.5) * 6, s: 1.2 + r() * 2 });
    }
    return out;
  }, []);
  const outline = "M 230 900 L 230 610 C 230 470 260 300 380 300 C 520 300 600 400 600 520 L 650 610 L 600 630 L 600 720 C 600 770 560 790 520 790 L 470 790 L 470 900";
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <g transform={`translate(${x} ${y}) scale(${scale})`}>
        <path d={outline} fill="none" stroke="#ffffff" strokeWidth={4} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        <line x1={210} y1={400} x2={550} y2={400} stroke="#fff" strokeWidth={4} opacity={draw} />
        {dome.map((d, i) => (
          <circle key={i} cx={d.x} cy={d.y} r={d.s} fill="#f4f1ea" opacity={brain * (0.5 + ((i * 37) % 50) / 100)} />
        ))}
        <circle cx={540} cy={520} r={9} fill="#fff" opacity={draw} />
      </g>
    </svg>
  );
};

/** A song's loudness rising to its peak, drawn as a mirrored line (the "build-up"). */
export const BuildCurve: React.FC<{ from: number; dur: number; color?: string; y?: number; height?: number; stroke?: number; zoom?: number }> = ({
  from,
  dur,
  color = BLUE,
  y = 1240,
  height = 360,
  stroke = 5,
  zoom = 1,
}) => {
  const f = useCurrentFrame();
  const draw = p(f, from, dur);
  const pts = useMemo(() => {
    const top: string[] = [];
    const bottom: string[] = [];
    const N = 220;
    for (let i = 0; i <= N; i++) {
      const u = i / N;
      const env = 0.12 + 0.88 * Math.pow(Math.min(1, u / 0.82), 3) * (u > 0.82 ? Math.max(0.15, 1 - (u - 0.82) * 4) : 1);
      const wob = 0.65 + 0.35 * Math.abs(Math.sin(u * 140) * Math.cos(u * 37));
      const a = (env * wob * height) / 2;
      const x = 60 + u * (W - 120);
      top.push(`${x.toFixed(1)},${(y - a).toFixed(1)}`);
      bottom.push(`${x.toFixed(1)},${(y + a).toFixed(1)}`);
    }
    return { top: "M" + top.join(" L"), bottom: "M" + bottom.join(" L") };
  }, [y, height]);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0, scale: String(zoom), transformOrigin: `${60 + 0.82 * (W - 120)}px ${y}px` }}>
      {[pts.top, pts.bottom].map((d, i) => (
        <path key={i} d={d} fill="none" stroke={color} strokeWidth={stroke} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      ))}
      <line x1={60} y1={y} x2={60 + draw * (W - 120)} y2={y} stroke={color} strokeWidth={1.5} opacity={0.5} />
    </svg>
  );
};

/** Soft glowing lights rising (dopamine, as a picture). */
export const Rising: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame() - from;
  const lights = useMemo(() => {
    const r = rand(99);
    return Array.from({ length: 70 }, () => ({ x: r() * W, y: 700 + r() * 1300, s: 4 + r() * 16, v: 2 + r() * 6, ph: r() * 6, a: 0.3 + r() * 0.7 }));
  }, []);
  return (
    <AbsoluteFill>
      {lights.map((l, i) => {
        const yy = l.y - f * l.v;
        const xx = l.x + Math.sin(f / 18 + l.ph) * 20;
        const on = p(f, i * 0.6, 12);
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: xx,
              top: yy,
              width: l.s,
              height: l.s,
              borderRadius: "50%",
              background: "#dfe9ff",
              boxShadow: `0 0 ${l.s * 2.5}px ${l.s}px rgba(120,170,255,0.55)`,
              opacity: l.a * on,
            }}
          />
        );
      })}
    </AbsoluteFill>
  );
};

/** The study, as a printed page card with a yellow highlighter wipe over its title. */
export const StudyPage: React.FC<{ from: number; highlightAt: number; journal?: string; title?: string; authors?: string }> = ({
  from,
  highlightAt,
  journal = "NATURE NEUROSCIENCE · 2011",
  title = "Anatomically distinct dopamine release during anticipation and experience of peak emotion to music",
  authors = "Salimpoor, Benovoy, Larcher, Dagher & Zatorre · McGill University",
}) => {
  const f = useCurrentFrame();
  const inP = p(f, from, 12);
  const hl = p(f, highlightAt, 22);
  const lines = useMemo(() => {
    const r = rand(5);
    return Array.from({ length: 16 }, () => 0.55 + r() * 0.45);
  }, []);
  return (
    <div
      style={{
        position: "absolute",
        left: 150,
        top: 830,
        width: 780,
        height: 940,
        background: "#fbfaf7",
        boxShadow: "0 30px 70px rgba(0,0,0,0.25), 0 2px 6px rgba(0,0,0,0.15)",
        transform: `rotate(${-3 + 1.2 * interpolate(f, [from, from + 150], [0, 1], clamp)}deg) translateY(${(1 - inP) * 120}px) scale(${0.92 + 0.08 * inP})`,
        opacity: inP,
        padding: "64px 60px",
        fontFamily: SERIF,
        color: "#1a1a1a",
      }}
    >
      <div style={{ fontFamily: SANS, fontSize: 20, letterSpacing: "0.18em", color: "#b0362c", fontWeight: 700 }}>{journal}</div>
      <div style={{ position: "relative", marginTop: 26, fontSize: 52, lineHeight: 1.08, letterSpacing: "-0.01em" }}>
        <div style={{ position: "absolute", left: -8, top: 6, height: 176, width: `${hl * 104}%`, background: FLASH, opacity: 0.85, zIndex: 0 }} />
        <span style={{ position: "relative" }}>{title}</span>
      </div>
      <div style={{ marginTop: 24, fontFamily: SANS, fontSize: 22, color: "#444" }}>{authors}</div>
      <div style={{ marginTop: 34 }}>
        {lines.map((w, i) => (
          <div key={i} style={{ height: 12, width: `${w * 100}%`, background: "#d8d6d0", borderRadius: 3, marginBottom: 14 }} />
        ))}
      </div>
    </div>
  );
};

/** Two regions on the line head, each with a blueprint leader and a label. */
export const Regions: React.FC<{ a: number; b: number }> = ({ a, b }) => {
  const f = useCurrentFrame();
  const spot = (x: number, y: number, at: number, label: string, side: 1 | -1, ly: number) => {
    const on = p(f, at, 10);
    const pulse = 1 + 0.25 * Math.max(0, Math.sin((f - at) / 5)) * (f > at ? 1 : 0);
    const lx = side > 0 ? 960 : 120;
    return (
      <g opacity={on}>
        <circle cx={x} cy={y} r={44 * pulse} fill="rgba(255,255,255,0.18)" />
        <circle cx={x} cy={y} r={16} fill="#fff" />
        <polyline points={`${x},${y} ${x + side * 60},${ly} ${lx},${ly}`} fill="none" stroke="#fff" strokeWidth={2} opacity={0.8} />
        <text x={lx} y={ly - 16} textAnchor={side > 0 ? "end" : "start"} fill="#fff" fontFamily={SANS} fontSize={34} fontWeight={500}>
          {label}
        </text>
      </g>
    );
  };
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {spot(560, 1110, a, "caudate · the build-up", 1, 880)}
      {spot(650, 1250, b, "nucleus accumbens · the peak", -1, 1400)}
    </svg>
  );
};
