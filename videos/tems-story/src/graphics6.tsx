// Motion graphics for the Tems story, in the kit's language: white on blue, one yellow accent, Inter Tight labels.
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const card: React.CSSProperties = { borderRadius: 26, background: "rgba(255,255,255,0.1)", border: "2px solid rgba(255,255,255,0.3)", boxShadow: "0 40px 80px rgba(0,0,0,0.4)" };

/** "Nobody in that crowd bought a ticket.": a concert ticket slides in, then a stamp: TICKETS SOLD 0. */
export const Ticket: React.FC<{ from: number; stampAt: number }> = ({ from, stampAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 16), s = p(f, stampAt, 10);
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div style={{ position: "absolute", left: 110, top: 900, width: 860, height: 380, borderRadius: 28, background: "#fff", color: "#0b1d6b", opacity: k,
        transform: `translateY(${(1 - k) * 120}px) rotate(${-4 + (1 - k) * 8}deg)`, boxShadow: "0 60px 100px rgba(0,0,0,0.45)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 620, top: 0, bottom: 0, borderLeft: "6px dashed rgba(11,29,107,0.35)" }} />
        <div style={{ position: "absolute", left: 50, top: 46, ...lab, fontSize: 30, opacity: 0.6 }}>LIVE · LAGOS</div>
        <div style={{ position: "absolute", left: 50, top: 100, fontFamily: SERIF2, fontSize: 120, letterSpacing: "-0.04em", lineHeight: 1 }}>Tems</div>
        <div style={{ position: "absolute", left: 50, top: 250, ...lab, fontSize: 30, opacity: 0.6 }}>ADMIT ONE</div>
        <div style={{ position: "absolute", left: 660, top: 120, ...lab, fontSize: 30, opacity: 0.6, width: 180, textAlign: "center" }}>PRICE</div>
        <div style={{ position: "absolute", left: 660, top: 170, fontFamily: SANS2, fontWeight: 900, fontSize: 80, width: 180, textAlign: "center" }}>—</div>
      </div>
      <div style={{ position: "absolute", left: 210, top: 1340, padding: "20px 38px", border: `8px solid ${FLASH}`, borderRadius: 16, color: FLASH, fontFamily: SANS2, fontWeight: 900,
        fontSize: 76, letterSpacing: "0.04em", transform: `rotate(-7deg) scale(${2.2 - 1.2 * s})`, opacity: s, background: "rgba(2,20,90,0.6)", boxShadow: `0 0 40px rgba(243,194,29,${0.5 * s})` }}>
        TICKETS SOLD: 0
      </div>
    </AbsoluteFill>
  );
};

/** A crowd as a grid of dots. They light up yellow one by one (each picked by what they stream), then glow together. */
export const InviteGrid: React.FC<{ from: number; lightAt: number; labelAt: number; label?: string; allOn?: number }> = ({ from, lightAt, labelAt, label = "PICKED BY WHAT THEY STREAM", allOn = 1e9 }) => {
  const f = useCurrentFrame();
  const C = 9, R = 9, X0 = 150, Y0 = 860, G = 97;
  const inK = p(f, from, 14);
  const all = p(f, allOn, 18);
  const dots = [];
  for (let r = 0; r < R; r++) for (let c = 0; c < C; c++) {
    const i = r * C + c;
    const order = (i * 37) % (C * R);                        // a scattered order, not row by row
    const on = Math.max(all, interpolate(f, [lightAt + order * 0.9, lightAt + order * 0.9 + 6], [0, 1], clamp));
    const x = X0 + c * G, y = Y0 + r * G;
    dots.push(
      <g key={i} opacity={inK}>
        <circle cx={x} cy={y - 14} r={14} fill={on > 0.5 ? FLASH : "rgba(255,255,255,0.35)"} />
        <path d={`M ${x - 24} ${y + 26} Q ${x} ${y - 8} ${x + 24} ${y + 26} Z`} fill={on > 0.5 ? FLASH : "rgba(255,255,255,0.35)"} />
        {on > 0 ? <circle cx={x} cy={y} r={36 * on} fill="rgba(243,194,29,0.18)" /> : null}
      </g>,
    );
  }
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>{dots}</svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1880 - 90, textAlign: "center", ...lab, fontSize: 34, color: FLASH, opacity: p(f, labelAt, 10) }}>{label}</div>
    </AbsoluteFill>
  );
};

/** "Almost nobody wanted to hear her.": five studio doors, each closing with an X. */
export const Doors: React.FC<{ from: number; xAt: number }> = ({ from, xAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      {[0, 1, 2, 3, 4].map((i) => {
        const k = p(f, from + i * 5, 14), x = p(f, xAt + i * 7, 8);
        return (
          <div key={i} style={{ position: "absolute", left: 120, top: 860 + i * 190, width: 840, height: 150, ...card, opacity: k * (1 - 0.45 * x),
            transform: `translateX(${(1 - k) * 200}px)`, display: "flex", alignItems: "center", padding: "0 40px", gap: 30 }}>
            <div style={{ width: 70, height: 70, borderRadius: 35, background: "rgba(255,255,255,0.25)" }} />
            <div style={{ ...lab, fontSize: 34, color: "#fff" }}>{["PRODUCER", "STUDIO", "LABEL", "PRODUCER", "A&R"][i]}</div>
            <div style={{ marginLeft: "auto", fontFamily: SANS2, fontWeight: 900, fontSize: 90, color: "#ff6b6b", opacity: x, transform: `scale(${1.6 - 0.6 * x})` }}>✕</div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "Hours of tutorials, learning to produce in her room.": a video player with tabs piling up, and a beat being built. */
export const Tutorials: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14);
  const tabs = Math.min(12, Math.floor(Math.max(0, f - from) / 6));
  const steps = 16, built = Math.floor(Math.max(0, f - from - 30) / 4);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      {Array.from({ length: tabs }, (_, i) => (
        <div key={i} style={{ position: "absolute", left: 140 + i * 14, top: 830 + i * 10, width: 760, height: 430, ...card, background: "rgba(10,30,120,0.8)" }} />
      ))}
      <div style={{ position: "absolute", left: 140 + tabs * 14, top: 830 + tabs * 10, width: 760, height: 430, ...card, background: "#0a1a5e", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 36, top: 30, ...lab, fontSize: 26, color: "rgba(255,255,255,0.8)" }}>HOW TO PRODUCE · PART {tabs + 1}</div>
        <div style={{ position: "absolute", left: 330, top: 150, width: 0, height: 0, borderLeft: "90px solid #fff", borderTop: "55px solid transparent", borderBottom: "55px solid transparent", opacity: 0.9 }} />
        <div style={{ position: "absolute", left: 36, right: 36, bottom: 40, height: 10, borderRadius: 5, background: "rgba(255,255,255,0.2)" }}>
          <div style={{ width: `${((f - from) % 40) / 40 * 100}%`, height: "100%", borderRadius: 5, background: FLASH }} />
        </div>
      </div>
      <div style={{ position: "absolute", left: 140, top: 1420, width: 800 }}>
        <div style={{ ...lab, fontSize: 26, color: "rgba(255,255,255,0.8)", marginBottom: 16 }}>HER FIRST BEAT</div>
        {[0, 1, 2].map((r) => (
          <div key={r} style={{ display: "flex", gap: 8, marginBottom: 10 }}>
            {Array.from({ length: steps }, (_, c) => {
              const lit = (r * steps + c) < built && ((c + r * 3) % (r + 2) === 0 || r === 2 && c % 4 === 0);
              return <div key={c} style={{ width: 42, height: 42, borderRadius: 8, background: lit ? FLASH : "rgba(255,255,255,0.14)", boxShadow: lit ? "0 0 14px rgba(243,194,29,0.7)" : "none" }} />;
            })}
          </div>
        ))}
      </div>
    </AbsoluteFill>
  );
};

/** "She quit her marketing job to release her first single.": a resignation letter, a stamp, then the single's card. */
export const Resign: React.FC<{ from: number; stampAt: number; songAt: number }> = ({ from, stampAt, songAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14), s = p(f, stampAt, 10), song = p(f, songAt, 16);
  return (
    <AbsoluteFill style={{ perspective: 1600 }}>
      <div style={{ position: "absolute", left: 150, top: 760, width: 780, height: 900, borderRadius: 10, background: "#f6f3ec", color: "#222", opacity: k * (1 - 0.6 * song),
        transform: `translateY(${(1 - k) * 100}px) rotate(-3deg) scale(${1 - 0.12 * song})`, boxShadow: "0 60px 100px rgba(0,0,0,0.45)", padding: 60, boxSizing: "border-box" }}>
        <div style={{ ...lab, fontSize: 28, color: "#888" }}>DIGITAL MARKETING</div>
        <div style={{ fontFamily: SERIF2, fontSize: 84, marginTop: 30, letterSpacing: "-0.03em" }}>Resignation</div>
        {Array.from({ length: 9 }, (_, i) => <div key={i} style={{ height: 14, borderRadius: 7, background: "#ddd", marginTop: 30, width: `${[92, 85, 96, 70, 88, 94, 60, 82, 40][i]}%` }} />)}
      </div>
      <div style={{ position: "absolute", left: 300, top: 1160, padding: "16px 34px", border: "8px solid #d43c3c", borderRadius: 14, color: "#d43c3c", fontFamily: SANS2, fontWeight: 900,
        fontSize: 90, transform: `rotate(-12deg) scale(${2 - s})`, opacity: s * (1 - 0.6 * song) }}>QUIT · 2018</div>
      <div style={{ position: "absolute", left: 240, top: 860, width: 600, height: 600, borderRadius: 18, opacity: song, transform: `translateY(${(1 - song) * 80}px) rotate(${(1 - song) * 6}deg)`,
        background: "linear-gradient(160deg, #1d1d1d 0%, #3a2a1a 60%, #6b3f1f 100%)", boxShadow: "0 70px 110px rgba(0,0,0,0.55)", display: "flex", flexDirection: "column", justifyContent: "flex-end", padding: 44, boxSizing: "border-box" }}>
        <div style={{ ...lab, fontSize: 26, color: "rgba(255,255,255,0.7)" }}>FIRST SINGLE · 2018</div>
        <div style={{ fontFamily: SERIF2, fontSize: 110, color: "#fff", letterSpacing: "-0.04em", lineHeight: 1 }}>Mr. <i>Rebel</i></div>
      </div>
    </AbsoluteFill>
  );
};

/** "It didn't blow up.": a plays graph that stays flat. */
export const FlatLine: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 30);
  const pts = Array.from({ length: 40 }, (_, i) => `${150 + i * 20},${1500 - 30 * Math.abs(Math.sin(i * 1.7)) * (i / 40)}`);
  return (
    <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
      <text x={150} y={1060} fill="rgba(255,255,255,0.8)" fontSize={30} {...lab}>PLAYS</text>
      <line x1={150} y1={1100} x2={150} y2={1520} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      <line x1={150} y1={1520} x2={950} y2={1520} stroke="rgba(255,255,255,0.5)" strokeWidth={3} />
      <polyline points={pts.join(" ")} fill="none" stroke="#fff" strokeWidth={6} strokeLinejoin="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - k} />
      <text x={950} y={1580} textAnchor="end" fill="rgba(255,255,255,0.8)" fontSize={30} {...lab} opacity={k}>MONTHS LATER</text>
    </svg>
  );
};

/** The climb: one card per step, each dropping in on its word; the list scrolls up as it grows. */
export const Climb: React.FC<{ steps: { at: number; year: string; title: string; sub: string; gold?: boolean }[] }> = ({ steps }) => {
  const f = useCurrentFrame();
  const shown = steps.filter((s) => f >= s.at).length;
  const scroll = interpolate(f, steps.map((s) => s.at), steps.map((_, i) => Math.max(0, i - 3) * 210), clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 150, top: 760, width: 4, height: 1100, background: "rgba(255,255,255,0.35)" }} />
      {steps.map((s, i) => {
        const k = p(f, s.at, 12);
        if (i >= shown) return null;
        const y = 790 + i * 210 - scroll;
        return (
          <div key={i} style={{ position: "absolute", left: 200, top: y, width: 760, height: 170, ...card, opacity: k, transform: `translateX(${(1 - k) * 120}px)`,
            background: s.gold ? "rgba(243,194,29,0.95)" : "rgba(255,255,255,0.12)", color: s.gold ? "#111" : "#fff", display: "flex", alignItems: "center", padding: "0 36px", gap: 30, boxSizing: "border-box" }}>
            <div style={{ position: "absolute", left: -62, top: 70, width: 30, height: 30, borderRadius: 15, background: s.gold ? FLASH : "#fff", boxShadow: s.gold ? "0 0 20px rgba(243,194,29,0.9)" : "none" }} />
            <div style={{ ...lab, fontSize: 34, opacity: 0.75, width: 110 }}>{s.year}</div>
            <div>
              <div style={{ fontFamily: SERIF2, fontSize: 64, letterSpacing: "-0.03em", lineHeight: 1 }}>{s.title}</div>
              <div style={{ ...lab, fontSize: 24, opacity: 0.75, marginTop: 10 }}>{s.sub}</div>
            </div>
          </div>
        );
      })}
    </AbsoluteFill>
  );
};

/** "until someone counted them": a counter that climbs to 888 million. */
export const Counter: React.FC<{ from: number; dur?: number }> = ({ from, dur = 50 }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, from + dur], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const n = Math.round(888_000_000 * k).toLocaleString("en-US");
  return (
    <AbsoluteFill style={{ opacity: p(f, from - 4, 8) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1080, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 128, color: FLASH, letterSpacing: "-0.03em",
        textShadow: "0 0 40px rgba(243,194,29,0.6)" }}>{n}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1250, textAlign: "center", ...lab, fontSize: 34, color: "#fff" }}>STREAMS OF HER DEBUT EP ON SPOTIFY</div>
    </AbsoluteFill>
  );
};

/** End card for the owner's music page, Brasset the Creator (no logo yet: the name lands, then the call to action). */
export const BrassetCard: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 16), sub = p(f, from + 12, 14), cta = p(f, from + 28, 14);
  return (
    <AbsoluteFill style={{ alignItems: "center" }}>
      <div style={{ position: "absolute", top: 760, width: "100%", textAlign: "center", color: "#fff", opacity: k, transform: `translateY(${(1 - k) * 60}px) scale(${0.9 + 0.1 * k})` }}>
        <div style={{ fontFamily: SERIF2, fontWeight: 500, fontSize: 190, letterSpacing: "-0.045em", lineHeight: 1 }}>Brasset</div>
      </div>
      <div style={{ position: "absolute", top: 990, width: "100%", textAlign: "center", clipPath: `inset(0 ${(1 - sub) * 100}% 0 0)` }}>
        <div style={{ fontFamily: SANS2, fontWeight: 800, fontSize: 46, letterSpacing: "0.42em", color: FLASH, marginLeft: "0.42em" }}>THE CREATOR</div>
      </div>
      <div style={{ position: "absolute", top: 1240, opacity: cta, transform: `translateY(${(1 - cta) * 20}px)`, fontFamily: SANS2, fontSize: 46, color: "rgba(255,255,255,0.9)" }}>Follow for more</div>
    </AbsoluteFill>
  );
};
