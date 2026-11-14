// Motion graphics for "Why do you remember song lyrics?": white on blue, one yellow accent, Inter Tight labels.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;

/** "A tune is a track": a melody line with slots; words drop into their places; then RHYTHM and RHYME tags. */
export const MelodyTrack: React.FC<{ from: number; dropAt: number; rhythmAt: number; rhymeAt: number }> = ({ from, dropAt, rhythmAt, rhymeAt }) => {
  const f = useCurrentFrame();
  const N = 7, X0 = 130, X1 = 950;
  const xs = Array.from({ length: N }, (_, i) => X0 + (i * (X1 - X0)) / (N - 1));
  const ys = xs.map((_, i) => 1250 - 150 * Math.sin(i * 1.1) - 40 * Math.cos(i * 2.3));
  const d = "M " + xs.map((x, i) => `${x} ${ys[i]}`).join(" L ");
  const draw = p(f, from, 26);
  const words = ["you", "know", "every", "word", "of", "this", "song"];
  const rhythm = p(f, rhythmAt, 12), rhyme = p(f, rhymeAt, 12);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {[0, 1, 2, 3, 4].map((i) => <line key={i} x1={80} x2={1000} y1={1040 + i * 70} y2={1040 + i * 70} stroke="rgba(255,255,255,0.18)" strokeWidth={2} opacity={draw} />)}
        <path d={d} fill="none" stroke="#fff" strokeWidth={5} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
        {xs.map((x, i) => {
          const k = p(f, dropAt + i * 4, 10);
          return (
            <g key={i}>
              <circle cx={x} cy={ys[i]} r={22} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth={3} strokeDasharray="5 5" opacity={draw} />
              <circle cx={x} cy={ys[i]} r={18 * k} fill={FLASH} style={{ filter: "drop-shadow(0 0 10px rgba(243,194,29,0.9))" }} />
              <text x={x} y={ys[i] - 44 - (1 - k) * 60} textAnchor="middle" fill="#fff" fontFamily={SERIF2} fontSize={44} opacity={k}>{words[i]}</text>
            </g>
          );
        })}
        {xs.slice(0, -1).map((x, i) => (
          <rect key={i} x={x + 20} y={1500} width={(xs[1] - xs[0]) * (0.4 + 0.5 * ((i * 3) % 4) / 3)} height={26} rx={13} fill="rgba(255,255,255,0.85)" opacity={rhythm} />
        ))}
        <text x={X0} y={1580} fill="#fff" fontSize={32} {...lab} opacity={rhythm}>RHYTHM · HOW LONG</text>
        <circle cx={xs[N - 1]} cy={ys[N - 1]} r={48 + 10 * Math.sin(f / 5)} fill="none" stroke={FLASH} strokeWidth={5} opacity={rhyme} />
        <text x={X1} y={1660} textAnchor="end" fill={FLASH} fontSize={32} {...lab} opacity={rhyme}>RHYME · HOW IT ENDS</text>
      </svg>
    </AbsoluteFill>
  );
};

/** The 1994 result: heard once, sung = no better than spoken; same tune repeated, sung wins. */
export const SungSpoken: React.FC<{ from: number; repeatAt: number; winAt: number }> = ({ from, repeatAt, winAt }) => {
  const f = useCurrentFrame();
  const rep = f >= repeatAt;
  const g = p(f, rep ? repeatAt : from, 22);
  const win = p(f, winAt, 20);
  const spoken = 0.55 * g, sung = rep ? (0.45 + 0.4 * win) * g : 0.45 * g;
  const bar = (y: number, label: string, k: number, gold: boolean) => (
    <div style={{ position: "absolute", left: 150, top: y, width: 780 }}>
      <div style={{ ...lab, fontSize: 32, color: gold ? FLASH : "#fff", marginBottom: 14 }}>{label}</div>
      <div style={{ height: 66, borderRadius: 33, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }}>
        <div style={{ width: `${k * 100}%`, height: "100%", borderRadius: 33, background: gold ? FLASH : "#fff", boxShadow: gold ? "0 0 30px rgba(243,194,29,0.8)" : "none" }} />
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", ...lab, fontSize: 34, color: rep ? FLASH : "#fff" }}>{rep ? "SAME TUNE, AGAIN AND AGAIN" : "HEARD ONCE"}</div>
      {bar(1060, "SPOKEN", spoken, false)}
      {bar(1240, "SUNG", sung, rep && win > 0.5)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...lab, fontSize: 30, color: "rgba(255,255,255,0.8)" }}>WORDS REMEMBERED</div>
    </AbsoluteFill>
  );
};

/** "You heard it a hundred times. What you read yesterday? Once.": two play counters. */
export const Plays: React.FC<{ from: number; countAt: number; onceAt: number }> = ({ from, countAt, onceAt }) => {
  const f = useCurrentFrame();
  const n = Math.round(1 + 99 * interpolate(f, [countAt, countAt + 28], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) }));
  const card = (y: number, title: string, value: string, gold: boolean, k: number) => (
    <div style={{ position: "absolute", left: 120, top: y, width: 840, height: 260, borderRadius: 30, opacity: k, transform: `translateY(${(1 - k) * 60}px)`,
      background: gold ? "rgba(243,194,29,0.95)" : "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)", color: gold ? "#111" : "#fff",
      display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 50px", boxSizing: "border-box", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" }}>
      <div style={{ ...lab, fontSize: 34, width: 420, lineHeight: 1.3 }}>{title}</div>
      <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: 150, letterSpacing: "-0.04em" }}>{value}</div>
    </div>
  );
  return (
    <AbsoluteFill>
      {card(900, "THAT SONG · PLAYS", `×${n}`, true, p(f, from, 14))}
      {card(1220, "YESTERDAY'S READING", "×1", false, p(f, onceAt, 14))}
    </AbsoluteFill>
  );
};
