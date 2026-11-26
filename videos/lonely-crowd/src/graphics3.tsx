// New motion graphics for the remade chills video, in the same visual language as the rest of the kit:
// white lines on blue that draw themselves, one yellow accent with a soft glow, Inter Tight labels.
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;

/** "That one song": a playlist of songs scrolls past, then one row lights up yellow and lifts out. */
export const Playlist: React.FC<{ from: number; pickAt: number }> = ({ from, pickAt }) => {
  const f = useCurrentFrame();
  const songs = ["track 01", "track 02", "track 03", "track 04", "track 05", "track 06", "track 07", "track 08", "track 09"];
  const lens = [0.62, 0.48, 0.7, 0.55, 0.66, 0.44, 0.58, 0.68, 0.5];
  const inK = p(f, from, 14);
  const scroll = interpolate(f, [from, pickAt], [260, 0], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const pick = p(f, pickAt, 12);
  const PICK = 4;
  return (
    <AbsoluteFill style={{ opacity: inK }}>
      {songs.map((s, i) => {
        const y = 880 + i * 112 - scroll;
        const me = i === PICK;
        const dim = me ? 1 : 1 - 0.65 * pick;
        const lift = me ? pick : 0;
        return (
          <div key={s} style={{ position: "absolute", left: 120 - lift * 20, top: y - lift * 6, width: 840 + lift * 40, height: 88, borderRadius: 18,
            background: me ? `rgba(243,194,29,${0.12 + 0.88 * pick})` : "rgba(255,255,255,0.10)", border: `2px solid rgba(255,255,255,${0.25 * dim})`,
            boxShadow: me ? `0 ${20 * pick}px ${50 * pick}px rgba(0,0,0,0.35), 0 0 ${40 * pick}px rgba(243,194,29,0.55)` : "none", opacity: dim,
            transform: `scale(${1 + 0.05 * lift})`, display: "flex", alignItems: "center", gap: 26, padding: "0 30px" }}>
            <svg width={40} height={40} viewBox="0 0 40 40"><path d="M12 8 L32 20 L12 32 Z" fill={me && pick > 0.5 ? "#111" : "#fff"} /></svg>
            <div style={{ height: 14, width: `${lens[i] * 70}%`, borderRadius: 7, background: me && pick > 0.5 ? "#111" : "rgba(255,255,255,0.85)" }} />
            <div style={{ marginLeft: "auto", fontFamily: SANS2, fontSize: 28, color: me && pick > 0.5 ? "#111" : "rgba(255,255,255,0.7)", letterSpacing: "0.04em" }}>{me && pick > 0.5 ? "♥" : `${3 + (i % 3)}:${10 + i * 5}`}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "for food, for love, for winning": three photo cards drop onto the stage one by one, each on its word,
 *  with a small yellow label, and the earlier ones step back. */
export const RewardCards: React.FC<{ at: [number, number, number]; srcs: [string, string, string]; labels: [string, string, string] }> = ({ at, srcs, labels }) => {
  const f = useCurrentFrame();
  const slots = [{ x: 90, y: 760, r: -6 }, { x: 330, y: 1000, r: 4 }, { x: 160, y: 1250, r: -3 }];
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      {srcs.map((src, i) => {
        const k = p(f, at[i], 12);
        if (f < at[i]) return null;
        const later = at.filter((a, j) => j > i && f >= a).length;
        const s = slots[i];
        return (
          <div key={src} style={{ position: "absolute", left: s.x, top: s.y, width: 660, height: 440, opacity: k,
            transform: `translateY(${(1 - k) * -120}px) rotateX(${(1 - k) * 20}deg) rotateZ(${s.r + (1 - k) * 8}deg) scale(${(0.9 + 0.1 * k) * (1 - 0.04 * later)})`,
            filter: later ? `brightness(${1 - 0.25 * later})` : undefined,
            boxShadow: "0 50px 80px rgba(0,0,0,0.5), 0 10px 20px rgba(0,0,0,0.3)", borderRadius: 8, overflow: "hidden", background: "#000" }}>
            <Img src={staticFile(`media/${srcs[i]}`)} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 22, bottom: 20, background: FLASH, color: "#111", fontFamily: SANS2, fontWeight: 800, fontSize: 34,
              letterSpacing: "0.12em", padding: "8px 18px", borderRadius: 6 }}>{labels[i]}</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "more connections between the part that hears and the parts that feel": on the line head, a "hears" spot
 *  and a "feels" spot light up, and bundles of fibres draw themselves between them (the yellow ones thicker). */
export const Connections: React.FC<{ hearsAt: number; linesAt: number; feelsAt: number }> = ({ hearsAt, linesAt, feelsAt }) => {
  const f = useCurrentFrame();
  const A = { x: 500, y: 1215 }, Bp = { x: 735, y: 1110 };
  const spot = (x: number, y: number, at: number, label: string, lx: number, ly: number, anchor: "start" | "end") => {
    const on = p(f, at, 10);
    const pulse = 1 + 0.3 * Math.max(0, Math.sin((f - at) / 5)) * (f > at ? 1 : 0);
    return (
      <g opacity={on}>
        <circle cx={x} cy={y} r={46 * pulse} fill="rgba(243,194,29,0.18)" />
        <circle cx={x} cy={y} r={17} fill={FLASH} style={{ filter: "drop-shadow(0 0 12px rgba(243,194,29,0.9))" }} />
        <polyline points={`${x},${y} ${lx + (anchor === "start" ? -40 : 40)},${ly} ${lx},${ly}`} fill="none" stroke="#fff" strokeWidth={2} opacity={0.85} />
        <text x={lx} y={ly - 16} textAnchor={anchor} fill="#fff" fontFamily={SANS2} fontSize={44} fontWeight={700} letterSpacing="0.06em">{label}</text>
      </g>
    );
  };
  const n = 9;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: n }, (_, i) => {
        const bend = (i - (n - 1) / 2) * 26;
        const mx = (A.x + Bp.x) / 2 - bend * 0.5, my = (A.y + Bp.y) / 2 - 60 + bend;
        const d = `M${A.x},${A.y} Q${mx},${my} ${Bp.x},${Bp.y}`;
        const k = p(f, linesAt + i * 2, 22);
        const gold = i % 3 === 1;
        return <path key={i} d={d} fill="none" stroke={gold ? FLASH : "#fff"} strokeWidth={gold ? 5 : 2.5} strokeLinecap="round" opacity={gold ? 0.95 : 0.7}
          pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} style={gold ? { filter: "drop-shadow(0 0 8px rgba(243,194,29,0.8))" } : undefined} />;
      })}
      {spot(A.x, A.y, hearsAt, "HEARS", 130, 1440, "start")}
      {spot(Bp.x, Bp.y, feelsAt, "FEELS", 960, 900, "end")}
    </svg>
  );
};

/** End card: the channel's logo lands on the blue stage, the name wipes in, then the call to action. */
export const EndCard: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 16);
  const name = p(f, from + 12, 16);
  const cta = p(f, from + 30, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center", perspective: 1600 }}>
      <div style={{ position: "absolute", top: 520, width: 520, height: 520, borderRadius: 40, overflow: "hidden", opacity: k,
        transform: `translateY(${(1 - k) * 80}px) rotateX(${(1 - k) * 18}deg) scale(${0.85 + 0.15 * k})`,
        boxShadow: "0 70px 110px rgba(0,0,0,0.55), 0 14px 30px rgba(0,0,0,0.35)" }}>
        <Img src={staticFile("media/logo.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", transform: "scale(1.18)" }} />
      </div>
      <div style={{ position: "absolute", top: 1110, width: "100%", textAlign: "center", color: "#fff",
        clipPath: `inset(0 ${(1 - name) * 100}% 0 0)` }}>
        <div style={{ fontFamily: SERIF2, fontWeight: 500, fontSize: 120, letterSpacing: "-0.035em", lineHeight: 1 }}>Human <i>Nature</i></div>
        <div style={{ fontFamily: SANS2, fontWeight: 800, fontSize: 38, letterSpacing: "0.42em", color: FLASH, marginTop: 22, marginLeft: "0.42em" }}>EXPLAINED</div>
      </div>
      <div style={{ position: "absolute", top: 1420, opacity: cta, transform: `translateY(${(1 - cta) * 20}px)`, fontFamily: SANS2, fontSize: 46,
        color: "rgba(255,255,255,0.9)" }}>Follow for more</div>
    </AbsoluteFill>
  );
};
