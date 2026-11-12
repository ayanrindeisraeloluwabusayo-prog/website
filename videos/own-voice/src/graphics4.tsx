// Motion graphics for "Why do you hate your own voice?", in the same language as the rest of the kit:
// white lines on blue that draw themselves, one yellow accent with a soft glow, Inter Tight labels.
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2 } from "./type";

const label = { fontFamily: SANS2, fontWeight: 700, letterSpacing: "0.12em" } as const;

/** A voice note: the play button is pressed at `playAt`, the bars start to move and fill.
 *  At `higherAt` the bars turn quick and jittery (a higher voice); at `thinnerAt` they get thin. */
export const VoiceNote: React.FC<{ from: number; playAt: number; higherAt?: number; thinnerAt?: number; y?: number }> = ({ from, playAt, higherAt = 1e9, thinnerAt = 1e9, y = 1050 }) => {
  const f = useCurrentFrame();
  const inK = p(f, from, 14);
  const press = f >= playAt - 3 && f < playAt + 5 ? 0.9 : 1;
  const playing = f >= playAt;
  const hi = p(f, higherAt, 10), thin = p(f, thinnerAt, 10);
  const N = 34;
  const prog = playing ? Math.min(1, (f - playAt) / 170) : 0;
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div style={{ position: "absolute", left: 90, top: y, width: 900, height: 250, borderRadius: 56, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)",
        boxShadow: "0 60px 90px rgba(0,0,0,0.4)", opacity: inK, transform: `translateY(${(1 - inK) * 80}px) rotateX(${(1 - inK) * 16}deg)`, display: "flex", alignItems: "center", padding: "0 44px", gap: 36 }}>
        <div style={{ width: 130, height: 130, borderRadius: 65, background: playing ? FLASH : "#fff", transform: `scale(${press})`, flexShrink: 0, display: "flex", alignItems: "center", justifyContent: "center",
          boxShadow: playing ? "0 0 50px rgba(243,194,29,0.7)" : "none" }}>
          {playing ? (
            <svg width={50} height={54}><rect x={4} y={2} width={15} height={50} rx={4} fill="#111" /><rect x={31} y={2} width={15} height={50} rx={4} fill="#111" /></svg>
          ) : (
            <svg width={54} height={58}><path d="M8 4 L50 29 L8 54 Z" fill="#0243F1" /></svg>
          )}
        </div>
        <div style={{ flex: 1, height: 170, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          {Array.from({ length: N }, (_, i) => {
            const base = 0.25 + 0.75 * Math.abs(Math.sin(i * 1.7) * Math.cos(i * 0.6));
            const speed = 0.25 + 0.5 * hi;
            const live = playing ? 0.55 + 0.45 * Math.sin(f * speed + i * (0.9 + 1.6 * hi)) : 1;
            const h = 170 * base * live * (1 - 0.25 * hi);
            const done = i / N < prog;
            return <div key={i} style={{ width: 11 - 6 * thin, height: Math.max(8, h), borderRadius: 6, background: done ? FLASH : "rgba(255,255,255,0.9)", transform: `translateY(${-28 * hi * (i % 2 ? 1 : 0.5)}px)` }} />;
          })}
        </div>
      </div>
    </AbsoluteFill>
  );
};

/** The two ways your voice reaches your ear, on the line head: through the air (white, dashed, outside the
 *  head) from `airAt`, and through the bone (yellow, inside the head) from `boneAt`. */
export const TwoPaths: React.FC<{ airAt: number; boneAt?: number; deep?: number }> = ({ airAt, boneAt = 1e9, deep = 1e9 }) => {
  const f = useCurrentFrame();
  const M = { x: 835, y: 1433 }, E = { x: 560, y: 1330 };
  const air = p(f, airAt, 30), bone = p(f, boneAt, 26), dp = p(f, deep, 14);
  const airD = `M${M.x},${M.y} C 1080,1520 1060,1080 ${E.x + 26},${E.y - 10}`;
  const boneD = `M${M.x - 6},${M.y} C 760,1500 640,1470 ${E.x + 6},${E.y + 10}`;
  const tag = (x: number, y: number, t: string, k: number, color: string, anchor: "start" | "end" = "start") => (
    <text x={x} y={y} opacity={k} fill={color} textAnchor={anchor} fontFamily={SANS2} fontSize={46} fontWeight={800} letterSpacing="0.1em">{t}</text>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {/* the ear */}
      <path d={`M${E.x + 10},${E.y + 44} c -40,-6 -58,-70 -22,-96 c 34,-22 70,6 58,42 c -6,18 -26,20 -22,40`} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" opacity={p(f, airAt - 10, 10)} />
      {/* ripples leaving the mouth */}
      {[0, 1, 2].map((i) => {
        const t = ((f - airAt + i * 12) % 36) / 36;
        return f >= airAt ? <path key={i} d={`M${M.x + 30 + t * 90},${M.y - 40 - t * 40} q ${24 + t * 20},${40 + t * 40} 0,${80 + t * 80}`} fill="none" stroke="#fff" strokeWidth={3} opacity={(1 - t) * 0.8} strokeLinecap="round" /> : null;
      })}
      <path d={airD} fill="none" stroke="#fff" strokeWidth={5} strokeLinecap="round" strokeDasharray="0.02 0.018" pathLength={1} opacity={air > 0 ? 0.95 : 0}
        style={{ clipPath: `inset(0 0 0 0)` }} strokeDashoffset={-f * 0.004} mask="url(#airmask)" />
      <mask id="airmask"><path d={airD} fill="none" stroke="#fff" strokeWidth={14} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - air} /></mask>
      {tag(960, 1150, "AIR", p(f, airAt + 14, 10), "#fff", "end")}
      <path d={boneD} fill="none" stroke={FLASH} strokeWidth={9 + 7 * dp} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - bone}
        style={{ filter: `drop-shadow(0 0 ${12 + 14 * dp}px rgba(243,194,29,0.9))` }} />
      {tag(150, 1760, "BONE", p(f, boneAt + 10, 10), FLASH)}
      <text x={340} y={1758} opacity={dp} fill="#fff" fontFamily={SANS2} fontSize={34} fontWeight={600} letterSpacing="0.08em">+ DEEP NOTES</text>
      <circle cx={E.x + 16} cy={E.y - 6} r={10 + 8 * Math.max(air === 1 ? 1 : 0, bone === 1 ? 1 : 0) * (0.5 + 0.5 * Math.sin(f / 4))} fill={bone === 1 ? FLASH : "#fff"} opacity={air === 1 || bone === 1 ? 1 : 0} />
    </svg>
  );
};

/** What your voice is made of: deep notes on the left (yellow), high notes on the right (white).
 *  Inside your head the deep bars stand tall. At `dropAt` (the recording) they fall away. */
export const EqBars: React.FC<{ from: number; dropAt?: number; titleA?: string; titleB?: string }> = ({ from, dropAt = 1e9, titleA = "INSIDE YOUR HEAD", titleB = "ON A RECORDING" }) => {
  const f = useCurrentFrame();
  const N = 12, X0 = 150, X1 = 930, Y0 = 1560, HGT = 520;
  const drop = p(f, dropAt, 16);
  const bw = (X1 - X0) / N;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <text x={X0} y={980} fill="#fff" opacity={0.85 * p(f, from, 10)} fontFamily={SANS2} fontSize={34} fontWeight={700} letterSpacing="0.14em">{drop > 0.5 ? titleB : titleA}</text>
      {Array.from({ length: N }, (_, i) => {
        const deepBar = i < 4;
        const grow = p(f, from + 4 + i * 2, 14);
        const shape = deepBar ? 0.78 + 0.2 * Math.cos(i * 0.9) : 0.3 + 0.4 * Math.abs(Math.sin(i * 1.3 + 1));
        const wob = 1 + 0.07 * Math.sin(f / 4 + i * 1.3);
        const k = deepBar ? 1 - 0.86 * drop : 1;
        const h = HGT * shape * wob * grow * k;
        return <rect key={i} x={X0 + i * bw + 8} y={Y0 - h} width={bw - 16} height={h} rx={8} fill={deepBar ? FLASH : "#fff"} opacity={deepBar ? 1 : 0.9}
          style={deepBar ? { filter: `drop-shadow(0 0 ${14 * (1 - drop)}px rgba(243,194,29,0.8))` } : undefined} />;
      })}
      <line x1={X0} y1={Y0 + 6} x2={X1} y2={Y0 + 6} stroke="#fff" strokeWidth={3} opacity={0.7} />
      <text x={X0} y={Y0 + 60} fill={FLASH} fontFamily={SANS2} fontSize={30} fontWeight={800} letterSpacing="0.14em">DEEP NOTES</text>
      <text x={X1} y={Y0 + 60} fill="#fff" textAnchor="end" fontFamily={SANS2} fontSize={30} fontWeight={700} letterSpacing="0.14em" opacity={0.85}>HIGH NOTES</text>
    </svg>
  );
};

/** Rings pulsing out from one point, like a voice hitting you. */
export const Ripples: React.FC<{ from: number; cx?: number; cy?: number }> = ({ from, cx = 540, cy = 1250 }) => {
  const f = useCurrentFrame();
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      {[0, 1, 2, 3, 4].map((i) => {
        const t = (((f - from) / 50 + i / 5) % 1 + 1) % 1;
        return <circle key={i} cx={cx} cy={cy} r={40 + t * 460} fill="none" stroke={i % 2 ? FLASH : "#fff"} strokeWidth={5 - 3 * t} opacity={(1 - t) * 0.9 * p(f, from, 10)} />;
      })}
      <circle cx={cx} cy={cy} r={26} fill={FLASH} style={{ filter: "drop-shadow(0 0 18px rgba(243,194,29,0.9))" }} opacity={p(f, from, 8)} />
    </svg>
  );
};

/** Two bars: how other people rated a voice, and how its owner rated it without knowing it was theirs.
 *  No numbers, because the point is only which one is higher. */
export const RatingBars: React.FC<{ othersAt: number; ownAt: number }> = ({ othersAt, ownAt }) => {
  const f = useCurrentFrame();
  const Y0 = 1560;
  const a = p(f, othersAt, 22), b = p(f, ownAt, 26);
  const bar = (x: number, h: number, k: number, color: string, l1: string, l2: string) => (
    <g>
      <rect x={x} y={Y0 - h * k} width={250} height={h * k} rx={14} fill={color} style={color === FLASH ? { filter: "drop-shadow(0 0 22px rgba(243,194,29,0.8))" } : undefined} opacity={color === FLASH ? 1 : 0.9} />
      <text x={x + 125} y={Y0 + 62} textAnchor="middle" fill={color} {...label} fontSize={30} opacity={k}>{l1}</text>
      <text x={x + 125} y={Y0 + 104} textAnchor="middle" fill="#fff" fontFamily={SANS2} fontSize={26} opacity={0.75 * k}>{l2}</text>
    </g>
  );
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <text x={150} y={990} fill="#fff" opacity={0.85} {...label} fontSize={32}>HOW ATTRACTIVE IS THIS VOICE?</text>
      <line x1={150} y1={Y0 + 6} x2={930} y2={Y0 + 6} stroke="#fff" strokeWidth={3} opacity={0.7} />
      {bar(215, 270, a, "#fff", "STRANGERS", "rating the voice")}
      {bar(615, 440, b, FLASH, "THE OWNER", "not knowing it's theirs")}
    </svg>
  );
};
