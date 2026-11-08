// More motion graphics (first made for the procrastination video): a clock that gets crossed out, a mood line that dips and
// bounces, a timeline that passes the task to future you, three heads, and a task that splits up.
// Same visual language as the template: white lines on blue that draw themselves, one yellow accent.
import { interpolate, useCurrentFrame } from "remotion";
import { EASE_OUT, FLASH, p, W } from "./kit";
import { LineHead } from "./art";
import { SANS2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const label = (x: number, y: number, text: string, o: number, opts: Partial<{ size: number; color: string; anchor: "start" | "middle" | "end"; weight: number; caps: boolean }> = {}) => (
  <text
    x={x}
    y={y}
    textAnchor={opts.anchor ?? "middle"}
    fill={opts.color ?? "#fff"}
    fontFamily={SANS2}
    fontSize={opts.size ?? 38}
    fontWeight={opts.weight ?? 600}
    letterSpacing={opts.caps ? "0.14em" : undefined}
    opacity={o}
  >
    {text}
  </text>
);

/** A clock that draws itself with spinning hands, then a yellow strike crosses it out. */
export const ClockCross: React.FC<{ from: number; crossAt: number; cx?: number; cy?: number; r?: number }> = ({ from, crossAt, cx = 540, cy = 1260, r = 250 }) => {
  const f = useCurrentFrame();
  const draw = p(f, from, 18);
  const spin = (f - from) * 9;
  const strike = p(f, crossAt, 8);
  const dim = 1 - 0.45 * strike;
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <g opacity={dim}>
        <circle cx={cx} cy={cy} r={r} fill="none" stroke="#fff" strokeWidth={7} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} transform={`rotate(-90 ${cx} ${cy})`} />
        {Array.from({ length: 12 }, (_, i) => {
          const a = (i / 12) * Math.PI * 2;
          const o = p(f, from + 6 + i, 6);
          return <line key={i} x1={cx + Math.cos(a) * (r - 34)} y1={cy + Math.sin(a) * (r - 34)} x2={cx + Math.cos(a) * (r - 12)} y2={cy + Math.sin(a) * (r - 12)} stroke="#fff" strokeWidth={i % 3 === 0 ? 7 : 4} strokeLinecap="round" opacity={o} />;
        })}
        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.55} stroke="#fff" strokeWidth={9} strokeLinecap="round" transform={`rotate(${spin / 12} ${cx} ${cy})`} opacity={draw} />
        <line x1={cx} y1={cy} x2={cx} y2={cy - r * 0.78} stroke="#fff" strokeWidth={6} strokeLinecap="round" transform={`rotate(${spin} ${cx} ${cy})`} opacity={draw} />
        <circle cx={cx} cy={cy} r={12} fill="#fff" opacity={draw} />
        {label(cx, cy + r + 80, "TIME", 0.8 * p(f, from + 14, 8), { size: 34, caps: true, weight: 500 })}
      </g>
      <line
        x1={cx - r * 1.05}
        y1={cy + r * 1.05}
        x2={cx - r * 1.05 + r * 2.1 * strike}
        y2={cy + r * 1.05 - r * 2.1 * strike}
        stroke={FLASH}
        strokeWidth={16}
        strokeLinecap="round"
        style={{ filter: "drop-shadow(0 0 12px rgba(243,194,29,0.8))" }}
        opacity={strike > 0 ? 1 : 0}
      />
    </svg>
  );
};

/** Your mood over time: steady, dips when the task shows up, then jumps up when you escape. */
export const MoodGraph: React.FC<{ keys: [number, number, number, number, number, number]; taskAt: number; reliefAt: number }> = ({ keys, taskAt, reliefAt }) => {
  const f = useCurrentFrame();
  const X0 = 140, X1 = 940, Y0 = 1560, HGT = 520;
  const mood = (u: number) => {
    const s = (a: number, b: number, t: number) => a + (b - a) * (t * t * (3 - 2 * t));
    if (u < 0.3) return 0.6;
    if (u < 0.45) return s(0.6, 0.18, (u - 0.3) / 0.15);
    if (u < 0.62) return 0.18;
    if (u < 0.78) return s(0.18, 0.92, (u - 0.62) / 0.16);
    return 0.92;
  };
  // the tip of the line moves fast through calm parts and lands the dip and the jump on their words
  const tip = interpolate(f, keys, [0, 0.3, 0.45, 0.62, 0.8, 1], clamp);
  const N = 140;
  let d = "";
  for (let i = 0; i <= N; i++) {
    const u = (i / N) * tip;
    d += `${i ? "L" : "M"}${(X0 + u * (X1 - X0)).toFixed(1)},${(Y0 - mood(u) * HGT).toFixed(1)} `;
  }
  const tx = X0 + tip * (X1 - X0), ty = Y0 - mood(tip) * HGT;
  const taskOn = p(f, taskAt, 8), reliefOn = p(f, reliefAt, 8);
  const ux = (u: number) => X0 + u * (X1 - X0);
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <line x1={X0} y1={Y0} x2={X1} y2={Y0} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
      <line x1={X0} y1={Y0} x2={X0} y2={Y0 - HGT - 30} stroke="rgba(255,255,255,0.45)" strokeWidth={2} />
      {label(X0 + 10, Y0 - HGT - 50, "YOUR MOOD", 0.8 * p(f, keys[0], 8), { size: 30, caps: true, weight: 500, anchor: "start" })}
      {label(X1, Y0 + 52, "TIME →", 0.7 * p(f, keys[0], 8), { size: 28, caps: true, weight: 500, anchor: "end" })}
      {/* the task arrives */}
      <g opacity={taskOn}>
        <line x1={ux(0.3)} y1={Y0} x2={ux(0.3)} y2={Y0 - HGT + 40} stroke="#fff" strokeWidth={2} strokeDasharray="10 10" />
        <rect x={ux(0.3) - 95} y={Y0 - HGT - 10 - 20 * (1 - taskOn)} width={190} height={66} rx={14} fill="#fff" />
        {label(ux(0.3), Y0 - HGT + 34 - 20 * (1 - taskOn), "the task", 1, { size: 32, color: "#0243F1", weight: 700 })}
      </g>
      <path d={d} fill="none" stroke="#fff" strokeWidth={7} strokeLinejoin="round" strokeLinecap="round" />
      {tip > 0 && tip < 1 ? <circle cx={tx} cy={ty} r={13} fill="#fff" /> : null}
      {/* the dip */}
      {label(ux(0.53), Y0 - 0.18 * HGT + 64, "dread", p(f, taskAt + 10, 8) * 0.9, { size: 34, weight: 500 })}
      {/* the jump */}
      <g opacity={reliefOn}>
        <circle cx={ux(0.8)} cy={Y0 - 0.92 * HGT} r={18} fill={FLASH} style={{ filter: "drop-shadow(0 0 12px rgba(243,194,29,0.8))" }} />
        {label(ux(0.8) - 30, Y0 - 0.92 * HGT - 34, "relief", 1, { size: 42, color: FLASH, weight: 700, anchor: "end" })}
      </g>
    </svg>
  );
};

/** A small head-and-shoulders icon. */
const Person: React.FC<{ x: number; y: number; s?: number; color?: string; opacity?: number }> = ({ x, y, s = 1, color = "#fff", opacity = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={opacity}>
    <circle cx={0} cy={-58} r={30} fill="none" stroke={color} strokeWidth={6} />
    <path d="M -52 30 C -52 -14 -28 -20 0 -20 C 28 -20 52 -14 52 30" fill="none" stroke={color} strokeWidth={6} strokeLinecap="round" />
  </g>
);

/** NOW → FUTURE YOU: the task card slides along the timeline and lands on future you. */
export const Timeline: React.FC<{ from: number; slideAt: number }> = ({ from, slideAt }) => {
  const f = useCurrentFrame();
  const X0 = 150, X1 = 930, Y = 1330;
  const draw = p(f, from, 16);
  const slide = interpolate(f, [slideAt, slideAt + 26], [0, 1], { ...clamp, easing: EASE_OUT });
  const land = p(f, slideAt + 22, 8);
  const cardX = X0 + (X1 - X0) * slide;
  const ages = 1 - 0.35 * land;
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      <line x1={X0} y1={Y} x2={X0 + (X1 - X0) * draw} y2={Y} stroke="#fff" strokeWidth={6} strokeLinecap="round" />
      <path d={`M ${X1 - 24} ${Y - 18} L ${X1 + 4} ${Y} L ${X1 - 24} ${Y + 18}`} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" opacity={p(f, from + 14, 6)} />
      <Person x={X0} y={Y - 70} opacity={p(f, from + 4, 8)} />
      <Person x={X1 - 10} y={Y - 70} opacity={p(f, from + 10, 8) * ages + 0.0} color={land > 0 ? FLASH : "#fff"} />
      {label(X0, Y + 70, "NOW", p(f, from + 6, 8), { size: 32, caps: true, weight: 600 })}
      {label(X1 - 10, Y + 70, "FUTURE YOU", p(f, from + 12, 8), { size: 32, caps: true, weight: 600, color: land > 0.5 ? FLASH : "#fff" })}
      {/* the task card */}
      <g transform={`translate(${cardX} ${Y - 250 + 12 * Math.sin((f - from) / 6)}) rotate(${-4 + 8 * slide})`} opacity={p(f, from + 8, 8)}>
        <rect x={-110} y={-44} width={220} height={88} rx={16} fill="#fff" style={{ filter: "drop-shadow(0 18px 24px rgba(0,8,60,0.45))" }} />
        <rect x={-80} y={-14} width={28} height={28} rx={6} fill="none" stroke="#0243F1" strokeWidth={5} />
        {label(22, 12, "the task", 1, { size: 32, color: "#0243F1", weight: 700 })}
      </g>
      {/* landing pulse */}
      <circle cx={X1 - 10} cy={Y - 128} r={60 + 80 * land} fill="none" stroke={FLASH} strokeWidth={4} opacity={(1 - land) * (land > 0 ? 1 : 0)} />
    </svg>
  );
};

/** you · future you · someone else: future you's brain lights up like someone else's, not like yours. */
export const ThreeHeads: React.FC<{ from: number; morphAt: number }> = ({ from, morphAt }) => {
  const f = useCurrentFrame();
  const m = p(f, morphAt, 22);
  const heads = [
    { x: -40, name: "you", col: "#ffffff" },
    { x: 290, name: "future you", col: m > 0 ? `rgb(${255},${Math.round(255 - (255 - 194) * m)},${Math.round(255 - (255 - 29) * m)})` : "#ffffff" },
    { x: 620, name: "someone else", col: FLASH },
  ];
  return (
    <>
      {heads.map((h, i) => (
        <div key={i} style={{ position: "absolute", inset: 0, opacity: p(f, from + i * 5, 10) }}>
          <LineHead x={h.x} y={940} scale={0.62} draw={p(f, from + i * 5, 16)} brain={0} />
        </div>
      ))}
      <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
        {heads.map((h, i) => {
          const cx = h.x + 380 * 0.62, cy = 940 + 400 * 0.62;
          const on = p(f, from + 14 + i * 5, 8);
          const pulse = 1 + 0.2 * Math.max(0, Math.sin((f - from) / 5));
          return (
            <g key={i} opacity={on}>
              <circle cx={cx} cy={cy - 30} r={46 * pulse} fill={h.col} opacity={0.25} />
              <circle cx={cx} cy={cy - 30} r={20} fill={h.col} style={{ filter: `drop-shadow(0 0 10px ${h.col})` }} />
              {label(cx + 10, 1560, h.name, 1, { size: 36, color: i === 0 ? "#fff" : h.col, weight: 600 })}
            </g>
          );
        })}
        {/* future you ≈ someone else */}
        <g opacity={p(f, morphAt + 18, 8)}>
          {label(290 + 380 * 0.62 + 165, 940 + 400 * 0.62 - 12, "≈", 1, { size: 90, color: FLASH, weight: 400 })}
          {label(-40 + 380 * 0.62 + 165, 940 + 400 * 0.62 - 12, "≠", 1, { size: 90, color: "#fff", weight: 400 })}
        </g>
      </svg>
    </>
  );
};

/** One big task block splits into small steps; the first one gets ticked. */
export const BlockSplit: React.FC<{ from: number; splitAt: number; tickAt: number }> = ({ from, splitAt, tickAt }) => {
  const f = useCurrentFrame();
  const inP = p(f, from, 12);
  const sp = p(f, splitAt, 16);
  const tick = p(f, tickAt, 8);
  const N = 5, BW = 760, BH = 230, CX = 540, CY = 1280, GAP = 26;
  const small = (BW - GAP * (N - 1)) / N;
  return (
    <svg width={W} height={1920} style={{ position: "absolute", inset: 0 }}>
      {Array.from({ length: N }, (_, i) => {
        const whole = { x: CX - BW / 2 + (i * BW) / N, w: BW / N };
        const part = { x: CX - BW / 2 + i * (small + GAP), w: small };
        const x = whole.x + (part.x - whole.x) * sp;
        const w = whole.w + (part.w - whole.w) * sp;
        const h = BH - (BH - small) * sp;
        const y = CY - h / 2 + (1 - inP) * 60;
        const first = i === 0;
        return (
          <g key={i} opacity={inP}>
            <rect x={x} y={y} width={w + (sp < 0.02 ? 1 : 0)} height={h} rx={sp > 0.02 ? 16 : 0} fill={first && tick > 0 ? FLASH : "rgba(255,255,255,0.14)"} stroke="#fff" strokeWidth={sp > 0.02 ? 4 : 0} />
            {first && tick > 0 ? <path d={`M ${x + w * 0.27} ${y + h * 0.52} L ${x + w * 0.45} ${y + h * 0.7} L ${x + w * 0.76} ${y + h * 0.32}`} fill="none" stroke="#0243F1" strokeWidth={10} strokeLinecap="round" strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - tick} /> : null}
          </g>
        );
      })}
      <rect x={CX - BW / 2} y={CY - BH / 2 + (1 - inP) * 60} width={BW} height={BH} rx={22} fill="none" stroke="#fff" strokeWidth={5} opacity={inP * (1 - sp)} />
      {label(CX, CY + 14 + (1 - inP) * 60, "THE WHOLE TASK", inP * (1 - sp * 2), { size: 40, caps: true, weight: 700 })}
      {label(CX - BW / 2 + small / 2, CY + small / 2 + 70, "2 minutes", tick, { size: 36, color: FLASH, weight: 700 })}
    </svg>
  );
};
