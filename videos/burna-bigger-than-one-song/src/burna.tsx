// Motion graphics for "Burna Boy is bigger than one song". White lines on blue, one yellow accent.
// Song titles are real Burna Boy releases; no invented numbers are shown.
import { interpolate, useCurrentFrame } from "remotion";
import { EASE_OUT, FLASH, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const T: React.FC<{ x: number; y: number; o?: number; size?: number; color?: string; anchor?: "start" | "middle" | "end"; weight?: number; caps?: boolean; font?: string; children: React.ReactNode }> = ({
  x, y, o = 1, size = 38, color = "#fff", anchor = "middle", weight = 600, caps, font = SANS2, children,
}) => (
  <text x={x} y={y} textAnchor={anchor} fill={color} fontFamily={font} fontSize={size} fontWeight={weight} letterSpacing={caps ? "0.14em" : undefined} opacity={o}>
    {children}
  </text>
);

/** "The blowing up of the song": a chart line that idles, then rockets up off the panel. */
export const ChartRocket: React.FC<{ from: number; boomAt: number }> = ({ from, boomAt }) => {
  const f = useCurrentFrame();
  const X0 = 140, X1 = 940, Y0 = 1580, HGT = 600;
  const tip = interpolate(f, [from + 2, boomAt - 6, boomAt + 10], [0, 0.62, 1], clamp);
  const fn = (u: number) => (u < 0.62 ? 0.06 + 0.05 * Math.sin(u * 30) * u : 0.06 + Math.pow((u - 0.62) / 0.38, 2.4) * 1.0);
  let d = "";
  const N = 120;
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * tip;
    d += `${i ? "L" : "M"}${(X0 + u * (X1 - X0)).toFixed(1)},${(Y0 - fn(u) * HGT).toFixed(1)} `;
  }
  const tx = X0 + tip * (X1 - X0), ty = Y0 - fn(tip) * HGT;
  const boom = p(f, boomAt + 8, 10);
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - HGT - 20} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
      <T x={X0 + 10} y={Y0 - HGT - 40} o={0.8 * p(f, from, 8)} size={30} caps weight={500} anchor="start">PLAYS</T>
      <T x={X1} y={Y0 + 52} o={0.7 * p(f, from, 8)} size={28} caps weight={500} anchor="end">TIME →</T>
      <path d={d} fill="none" stroke={FLASH} strokeWidth={9} strokeLinecap="round" strokeLinejoin="round" style={{ filter: "drop-shadow(0 0 14px rgba(243,194,29,0.8))" }} />
      {tip > 0 ? <circle cx={tx} cy={ty} r={15} fill={FLASH} /> : null}
      <g opacity={boom}>
        <circle cx={tx} cy={ty} r={30 + 60 * boom} fill="none" stroke={FLASH} strokeWidth={4} opacity={1 - boom * 0.6} />
        <T x={tx - 34} y={ty + 16} size={54} color={FLASH} weight={700} anchor="end" font={SERIF2}>“Ye”</T>
      </g>
    </svg>
  );
};

const SONGS = ["Last Last", "On the Low", "Ye", "Anybody", "Gbona", "Kilometre"];

/** His catalog as song cards; on "only song" everything dims except "Ye". */
export const Catalog: React.FC<{ from: number; onlyAt: number }> = ({ from, onlyAt }) => {
  const f = useCurrentFrame();
  const dim = p(f, onlyAt, 12);
  const CW = 420, CH = 150, GX = 40, GY = 36, X0 = (W - (2 * CW + GX)) / 2, Y0 = 1000;
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <T x={W / 2} y={Y0 - 60} o={0.8 * p(f, from, 8)} size={32} caps weight={600}>HIS CATALOG</T>
      {SONGS.map((s, i) => {
        const x = X0 + (i % 2) * (CW + GX), y = Y0 + Math.floor(i / 2) * (CH + GY);
        const k = p(f, from + 3 + i * 3, 12, EASE_OUT);
        const ye = s === "Ye";
        const op = ye ? 1 : 1 - 0.75 * dim;
        return (
          <g key={s} opacity={k * op} transform={`translate(0 ${(1 - k) * 40})`}>
            <rect x={x} y={y} width={CW} height={CH} rx={22} fill={ye && dim > 0 ? FLASH : "rgba(255,255,255,0.12)"} stroke={ye && dim > 0 ? FLASH : "rgba(255,255,255,0.6)"} strokeWidth={3}
              style={ye ? { filter: `drop-shadow(0 0 ${20 * dim}px rgba(243,194,29,0.8))` } : undefined} />
            <path d={`M ${x + 46} ${y + 52} L ${x + 46} ${y + 98} L ${x + 84} ${y + 75} Z`} fill={ye && dim > 0 ? "#0243F1" : "#fff"} />
            <T x={x + 112} y={y + 90} size={44} anchor="start" weight={700} color={ye && dim > 0 ? "#0243F1" : "#fff"}>{s}</T>
          </g>
        );
      })}
    </svg>
  );
};

/** A set list card; "Ye" gets a yellow strike-through and the rest of the show carries on. */
export const SetList: React.FC<{ from: number; strikeAt: number }> = ({ from, strikeAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14, EASE_OUT);
  const s = p(f, strikeAt, 8);
  const songs = ["Last Last", "Anybody", "Ye", "On the Low", "Kilometre", "Gbona"];
  const X = 220, Y = 900, CW = 640, LH = 104;
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g opacity={k} transform={`translate(0 ${(1 - k) * 80}) rotate(${-2 + 2 * k} ${W / 2} 1300)`}>
        <rect x={X} y={Y} width={CW} height={150 + songs.length * LH} rx={10} fill="#fbfaf7" style={{ filter: "drop-shadow(0 50px 70px rgba(0,8,60,0.5))" }} />
        <T x={X + 60} y={Y + 92} size={30} caps weight={700} anchor="start" color="#b0362c">SET LIST · TONIGHT</T>
        {songs.map((t, i) => (
          <g key={t}>
            <T x={X + 60} y={Y + 190 + i * LH} size={30} anchor="start" weight={500} color="#888">{String(i + 1).padStart(2, "0")}</T>
            <T x={X + 130} y={Y + 190 + i * LH} size={56} anchor="start" weight={500} color={t === "Ye" && s > 0 ? "#aaa" : "#111"} font={SERIF2}>{t}</T>
          </g>
        ))}
        <line x1={X + 110} y1={Y + 170 + 2 * LH} x2={X + 110 + 260 * s} y2={Y + 170 + 2 * LH} stroke={FLASH} strokeWidth={16} strokeLinecap="round" opacity={s > 0 ? 1 : 0} />
      </g>
    </svg>
  );
};

/** "His greatness isn't tied to anybody": strings tie a glowing dot to others, then snap away. */
export const Untied: React.FC<{ from: number; snapAt: number }> = ({ from, snapAt }) => {
  const f = useCurrentFrame();
  const CX = W / 2, CY = 1260;
  const snap = interpolate(f, [snapAt, snapAt + 14], [0, 1], { ...clamp, easing: EASE_OUT });
  const glow = 1 + 0.5 * snap + 0.12 * Math.sin((f - from) / 5) * snap;
  const nodes = [[-300, -230], [300, -210], [-320, 200], [310, 220], [0, -330]];
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      {nodes.map(([dx, dy], i) => {
        const on = p(f, from + 4 + i * 3, 10);
        const nx = CX + dx * (1 + 0.18 * snap), ny = CY + dy * (1 + 0.18 * snap);
        const mid = 0.5 - 0.42 * snap; // the string retracts toward the outer dot
        return (
          <g key={i} opacity={on * (1 - 0.6 * snap)}>
            <line x1={nx} y1={ny} x2={nx + (CX - nx) * (1 - snap) * 1} y2={ny + (CY - ny) * (1 - snap)} stroke="#fff" strokeWidth={4} strokeDasharray={snap > 0 ? "14 12" : undefined} opacity={1 - snap} />
            <line x1={nx} y1={ny} x2={nx + (CX - nx) * mid} y2={ny + (CY - ny) * mid} stroke="#fff" strokeWidth={4} opacity={snap > 0 ? 0.6 : 0} />
            <circle cx={nx} cy={ny} r={26} fill="rgba(255,255,255,0.25)" stroke="#fff" strokeWidth={4} />
          </g>
        );
      })}
      <circle cx={CX} cy={CY} r={70 * glow} fill={FLASH} opacity={0.2} />
      <circle cx={CX} cy={CY} r={44} fill={FLASH} style={{ filter: `drop-shadow(0 0 ${18 * glow}px rgba(243,194,29,0.9))` }} opacity={p(f, from, 10)} />
      <T x={CX} y={CY + 130} size={40} color={FLASH} weight={700} o={p(f, from + 8, 10)}>his greatness</T>
    </svg>
  );
};

/** LUCK crossed out; TALENT + CONSISTENCY build up in its place. */
export const NotLuck: React.FC<{ from: number; talentAt: number; consAt: number }> = ({ from, talentAt, consAt }) => {
  const f = useCurrentFrame();
  const strike = p(f, from + 2, 8);
  const luckOut = p(f, talentAt - 4, 10);
  const t = p(f, talentAt, 10, EASE_OUT), c = p(f, consAt, 10, EASE_OUT);
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g opacity={1 - 0.75 * luckOut} transform={`translate(0 ${-140 * luckOut})`}>
        <T x={W / 2} y={1040} size={150} weight={800}>LUCK</T>
        <line x1={W / 2 - 250} y1={990} x2={W / 2 - 250 + 500 * strike} y2={990} stroke={FLASH} strokeWidth={18} strokeLinecap="round" opacity={strike > 0 ? 1 : 0} />
      </g>
      <g opacity={t} transform={`translate(0 ${(1 - t) * 50})`}>
        <T x={W / 2} y={1220} size={120} weight={800} color={FLASH}>TALENT</T>
      </g>
      <T x={W / 2} y={1350} size={90} weight={300} o={c}>+</T>
      <g opacity={c} transform={`translate(0 ${(1 - c) * 50})`}>
        <T x={W / 2} y={1490} size={104} weight={800} color={FLASH}>CONSISTENCY</T>
      </g>
    </svg>
  );
};
