// Motion graphics for "Why does the journey back home feel shorter?", in the kit's language: white lines on
// blue that draw themselves, one yellow accent with a soft glow, Inter Tight labels.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const glow = (c: string, r = 12) => ({ filter: `drop-shadow(0 0 ${r}px ${c})` });

/** A pin: a dot with a ring and a label. */
const Pin: React.FC<{ x: number; y: number; label: string; on: number; color?: string; side?: 1 | -1 }> = ({ x, y, label, on, color = "#fff", side = 1 }) => (
  <g opacity={on}>
    <circle cx={x} cy={y} r={30} fill="none" stroke={color} strokeWidth={4} />
    <circle cx={x} cy={y} r={13} fill={color} style={glow(color, 10)} />
    <text x={x + side * 52} y={y + 14} textAnchor={side > 0 ? "start" : "end"} fill={color} fontSize={40} {...lab}>{label}</text>
  </g>
);

/** "Same road. Same distance.": a road from HOME to THERE draws itself; a traveller goes out slowly and comes back fast. */
export const RoadMap: React.FC<{ from: number; sameAt: number; distAt: number }> = ({ from, sameAt, distAt }) => {
  const f = useCurrentFrame();
  const d = "M 300 1660 C 120 1420, 900 1350, 640 1120 S 260 860, 780 760";
  const draw = p(f, from + 4, 30);
  const go = interpolate(f, [from + 18, sameAt + 24], [0, 1], clamp);
  const back = interpolate(f, [distAt + 4, distAt + 22], [0, 1], clamp);
  const t = back > 0 ? 1 - back : go;
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <path id="road" d={d} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth={46} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      <path d={d} fill="none" stroke="#fff" strokeWidth={4} strokeDasharray="0.025 0.02" pathLength={1} opacity={draw} />
      <path d={d} fill="none" stroke={back > 0 ? FLASH : "#fff"} strokeWidth={8} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - t}
        style={back > 0 ? glow("rgba(243,194,29,0.9)") : undefined} />
      <Pin x={300} y={1660} label="HOME" on={p(f, from, 10)} />
      <Pin x={780} y={760} label="THERE" on={p(f, from + 20, 10)} side={-1} />
      <text x={W / 2} y={1800} textAnchor="middle" fill="#fff" fontSize={38} {...lab} opacity={p(f, distAt, 10)}>SAME DISTANCE</text>
    </svg>
  );
};

/** "A different road. Same length.": the first road, then a second, different road of the same length; then a stamp. */
export const TwoRoads: React.FC<{ from: number; secondAt: number; lengthAt: number; stampAt: number }> = ({ from, secondAt, lengthAt, stampAt }) => {
  const f = useCurrentFrame();
  const a = "M 260 1640 C 140 1420, 860 1360, 640 1120 S 260 880, 800 780";
  const b = "M 260 1640 C 700 1600, 980 1380, 860 1160 S 700 900, 800 780";
  const stamp = p(f, stampAt, 10);
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <path d={a} fill="none" stroke="#fff" strokeWidth={6} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p(f, from, 26)} opacity={0.55} />
        <path d={b} fill="none" stroke={FLASH} strokeWidth={9} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - p(f, secondAt, 30)} style={glow("rgba(243,194,29,0.85)")} />
        <text x={150} y={1220} fill="rgba(255,255,255,0.7)" fontSize={30} {...lab} opacity={p(f, from + 10, 10)}>THE WAY THERE</text>
        <text x={930} y={1470} textAnchor="end" fill={FLASH} fontSize={30} {...lab} opacity={p(f, secondAt + 12, 10)}>A NEW WAY HOME</text>
        <Pin x={260} y={1640} label="HOME" on={p(f, from, 10)} />
        <Pin x={800} y={780} label="THERE" on={p(f, from + 12, 10)} side={-1} />
        <g opacity={p(f, lengthAt, 10)}>
          <rect x={300} y={1745} width={480} height={70} rx={35} fill="rgba(255,255,255,0.14)" stroke="rgba(255,255,255,0.5)" strokeWidth={2} />
          <text x={540} y={1793} textAnchor="middle" fill="#fff" fontSize={34} {...lab}>SAME LENGTH</text>
        </g>
      </svg>
      <div style={{ position: "absolute", left: 140, top: 1040, padding: "18px 34px", border: `7px solid ${FLASH}`, borderRadius: 14, color: FLASH, fontFamily: SANS2,
        fontWeight: 900, fontSize: 84, letterSpacing: "0.04em", transform: `rotate(-8deg) scale(${2.2 - 1.2 * stamp})`, opacity: stamp, background: "rgba(2,20,90,0.55)",
        boxShadow: `0 0 40px rgba(243,194,29,${0.45 * stamp})` }}>STILL SHORTER</div>
    </AbsoluteFill>
  );
};

/** Expected vs actual, over the glass head. Way out: EXPECTED fills to "1 HOUR", ACTUAL runs past it.
 *  Way back: EXPECTED is set long, ACTUAL stops short, and the gap glows: that gap is what feels fast. */
export const TimeBars: React.FC<{ from: number; expAt: number; actAt: number; backAt: number; backExpAt: number; backActAt: number; gapAt: number; until?: number }> = ({ from, expAt, actAt, backAt, backExpAt, backActAt, gapAt, until = 1e9 }) => {
  const f = useCurrentFrame();
  if (f < from || f >= until) return null;
  const back = f >= backAt;
  const inK = p(f, back ? backAt : from, 12);
  const X = 150, Wd = 780;
  const exp = back ? 0.6 + 0.32 * p(f, backExpAt, 26) : 0.6 * p(f, expAt, 22);
  const act = back ? 0.62 * p(f, backActAt, 40) : 0.86 * p(f, actAt, 34);
  const over = !back && act > 0.6;
  const gap = back ? p(f, gapAt, 14) : 0;
  const bar = (y: number, label: string, k: number, color: string, note: string, noteOn: number) => (
    <div style={{ position: "absolute", left: X, top: y, width: Wd }}>
      <div style={{ ...lab, fontSize: 28, color: "rgba(255,255,255,0.85)", marginBottom: 12 }}>{label}</div>
      <div style={{ position: "relative", height: 46, borderRadius: 23, background: "rgba(255,255,255,0.14)", border: "2px solid rgba(255,255,255,0.35)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${k * 100}%`, borderRadius: 23, background: color, boxShadow: color === FLASH ? "0 0 26px rgba(243,194,29,0.8)" : "none" }} />
        <div style={{ position: "absolute", right: 0, top: -46, ...lab, fontSize: 28, color: color === "#fff" ? "#fff" : color, opacity: noteOn }}>{note}</div>
      </div>
    </div>
  );
  return (
    <AbsoluteFill style={{ opacity: inK }}>
      <div style={{ position: "absolute", left: 90, top: 1330, width: 900, height: 430, borderRadius: 34, background: "rgba(3,22,110,0.62)", border: "2px solid rgba(255,255,255,0.28)",
        boxShadow: "0 50px 90px rgba(0,0,0,0.45)", backdropFilter: "blur(6px)" }} />
      <div style={{ position: "absolute", left: 150, top: 1372, ...lab, fontSize: 30, color: back ? FLASH : "#fff" }}>{back ? "THE WAY BACK" : "THE WAY OUT"}</div>
      {bar(1460, "EXPECTED", exp, "#fff", back ? "LONG TRIP" : "1 HOUR", back ? p(f, backExpAt + 10, 10) : p(f, expAt + 8, 10))}
      {bar(1590, "ACTUAL", act, over ? "#ff6b6b" : back ? FLASH : "#fff", back ? "" : "LONGER", over ? 1 : 0)}
      {back ? (
        <div style={{ position: "absolute", left: X + Wd * 0.62, top: 1590 + 41, width: Wd * 0.3 * gap, height: 46, borderRadius: 23, border: `3px dashed ${FLASH}`, boxSizing: "border-box",
          boxShadow: `0 0 30px rgba(243,194,29,${0.6 * gap})`, opacity: gap }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 58, textAlign: "center", ...lab, fontSize: 30, color: FLASH, whiteSpace: "nowrap" }}>FEELS FAST</div>
        </div>
      ) : null}
    </AbsoluteFill>
  );
};

/** The twist: during the trip both legs feel the same; looking back afterwards, the way home shrinks. */
export const Hindsight: React.FC<{ from: number; sameAt: number; afterAt: number }> = ({ from, sameAt, afterAt }) => {
  const f = useCurrentFrame();
  const after = p(f, afterAt, 26);
  const X = 160, Wd = 760;
  const row = (y: number, label: string, k: number, color: string) => (
    <div style={{ position: "absolute", left: X, top: y, width: Wd }}>
      <div style={{ ...lab, fontSize: 32, color: "#fff", marginBottom: 14 }}>{label}</div>
      <div style={{ position: "relative", height: 64, borderRadius: 32, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }}>
        <div style={{ position: "absolute", left: 0, top: 0, bottom: 0, width: `${k * 100}%`, borderRadius: 32, background: color, boxShadow: color === FLASH ? "0 0 30px rgba(243,194,29,0.8)" : "none" }} />
      </div>
    </div>
  );
  const grow = p(f, from + 6, 26);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center", ...lab, fontSize: 36, color: after > 0.5 ? FLASH : "#fff" }}>
        {after > 0.5 ? "LOOKING BACK" : "DURING THE TRIP"}
      </div>
      {row(1040, "THE WAY THERE", 0.82 * grow, "#fff")}
      {row(1220, "THE WAY BACK", (0.82 - 0.3 * after) * grow, after > 0 ? FLASH : "#fff")}
      <div style={{ position: "absolute", left: X, top: 1400, width: Wd, textAlign: "center", ...lab, fontSize: 32, color: "rgba(255,255,255,0.85)", opacity: p(f, sameAt, 10) * (1 - after) }}>= ABOUT THE SAME</div>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0, opacity: after }}>
        <path d="M 760 1460 A 130 130 0 1 1 900 1330" fill="none" stroke={FLASH} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - after} style={glow("rgba(243,194,29,0.8)")} />
        <path d="M 900 1330 l -8 -34 m 8 34 l -34 -6" stroke={FLASH} strokeWidth={7} strokeLinecap="round" fill="none" />
      </svg>
    </AbsoluteFill>
  );
};
