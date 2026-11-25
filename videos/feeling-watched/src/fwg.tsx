// Motion graphics for "Why you feel like someone is watching you": white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { BLUE_DEEP, FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const RED = "#ff3b3b";
const big = (size: number, face = "#fff", _depth?: string): React.CSSProperties => ({ fontFamily: SERIF2, fontWeight: 400, fontSize: Math.round(size * 0.8), lineHeight: 0.95, letterSpacing: "-0.01em", color: face });
const note = (text: string, top = 1640) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>
);
const Stamp: React.FC<{ at: number; text: string; top: number; color?: string; size?: number; rot?: number }> = ({ at, text, top, color = FLASH, size = 120, rot = -7 }) => {
  const f = useCurrentFrame();
  const s = p(f, at, 7);
  return <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", opacity: s, transform: `rotate(${rot}deg) scale(${2 - s})` }}>
    <span style={{ display: "inline-block", padding: "8px 36px 16px", border: `4px solid ${color}`, borderRadius: 22, ...big(size, color, "#fff") }}>{text}</span>
  </div>;
};

/** One drawn eye: white almond, blue iris, pupil offset by (lx, ly) in -1..1, optional blur. */
export const Eye: React.FC<{ size: number; lx?: number; ly?: number; blur?: number; glow?: number }> = ({ size, lx = 0, ly = 0, blur = 0, glow = 0 }) => (
  <div style={{ width: size, height: size * 0.56, borderRadius: "50%", background: "#fff", position: "relative", overflow: "hidden", border: `${size * 0.035}px solid ${glow ? FLASH : "#fff"}`,
    boxShadow: glow ? `0 0 ${size * 0.5 * glow}px rgba(243,194,29,0.8)` : "none", filter: blur ? `blur(${blur}px)` : undefined }}>
    <div style={{ position: "absolute", left: size * (0.3 + 0.22 * lx), top: size * (0.07 + 0.08 * ly), width: size * 0.4, height: size * 0.4, borderRadius: "50%", background: BLUE_DEEP }}>
      <div style={{ position: "absolute", left: size * 0.1, top: size * 0.1, width: size * 0.2, height: size * 0.2, borderRadius: "50%", background: "#000" }} />
    </div>
  </div>
);
const Pair: React.FC<{ size: number; lx?: number; ly?: number; blur?: number; glow?: number }> = (pr) => (
  <div style={{ display: "flex", gap: pr.size * 0.4, justifyContent: "center" }}><Eye {...pr} /><Eye {...pr} /></div>
);

/** You turn around: a pair of eyes in the dark behind you... then NOBODY. */
export const Turn: React.FC<{ from: number; nobodyAt: number }> = ({ from, nobodyAt }) => {
  const f = useCurrentFrame();
  const gone = p(f, nobodyAt - 3, 6);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, opacity: p(f, from + 4, 12) * (1 - gone) }}><Pair size={230} lx={0} ly={0.3} /></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 930, height: 140, opacity: gone * 0.4, display: "flex", justifyContent: "center", gap: 90 }}>
        <div style={{ width: 230, height: 128, borderRadius: "50%", border: "4px dashed #fff" }} /><div style={{ width: 230, height: 128, borderRadius: "50%", border: "4px dashed #fff" }} />
      </div>
      <Stamp at={nobodyAt} text="nobody" top={1200} />
    </AbsoluteFill>
  );
};

/** The 2013 test: a face whose eyes are blurred so you can't tell where they look. */
export const Blur: React.FC<{ from: number; blurAt: number }> = ({ from, blurAt }) => {
  const f = useCurrentFrame();
  const b = interpolate(f, [blurAt, blurAt + 20], [0, 18], clamp);
  const lx = Math.sin(f / 7) * 0.8;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 240, top: 760, width: 600, height: 780, borderRadius: "48% 48% 46% 46%", background: "rgba(255,255,255,0.12)", border: "6px solid rgba(255,255,255,0.7)", opacity: p(f, from, 10) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, opacity: p(f, from + 4, 10) }}><Pair size={170} lx={lx} blur={b} /></div>
      <div style={{ position: "absolute", left: 450, top: 1330, width: 180, height: 8, borderRadius: 4, background: "rgba(255,255,255,0.7)", opacity: p(f, from + 4, 10) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1580, textAlign: "center", ...lab, fontSize: 34, color: FLASH, opacity: p(f, blurAt + 10, 10) }}>WHERE IS IT LOOKING?</div>
    </AbsoluteFill>
  );
};

/** They didn't guess 50/50: a split bar that tips all the way to "AT ME". */
export const Lean: React.FC<{ from: number; leanAt: number; meAt: number }> = ({ from, leanAt, meAt }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [leanAt, leanAt + 30], [0.5, 0.86], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...big(170, "#fff"), opacity: 1 - p(f, leanAt, 10) }}>50 / 50?</div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1060, height: 150, borderRadius: 75, overflow: "hidden", background: "rgba(255,255,255,0.25)", display: "flex", opacity: p(f, from, 10) }}>
        <div style={{ width: `${k * 100}%`, background: FLASH, boxShadow: "0 0 40px rgba(243,194,29,0.7)" }} />
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1240, display: "flex", justifyContent: "space-between", ...lab, fontSize: 34 }}>
        <span style={{ color: FLASH }}>AT ME</span><span style={{ color: "#fff" }}>AWAY</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1360, textAlign: "center", fontFamily: SERIF2, fontSize: 120, color: FLASH, opacity: p(f, meAt, 10) }}>“it's looking at me”</div>
      {note("MARESCHAL, CALDER & CLIFFORD · CURRENT BIOLOGY · 2013 · ILLUSTRATION", 1560 + 120)}
    </AbsoluteFill>
  );
};

/** The finding as a label: an expectation that gaze is directed toward us. */
export const Prior: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from + 4, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, opacity: k }}><Pair size={150} lx={0} ly={0.2} glow={1} /></div>
      <div style={{ position: "absolute", left: 110, right: 110, top: 1060, padding: "50px 50px", borderRadius: 32, background: "rgba(5,10,45,0.85)", border: "4px solid rgba(255,255,255,0.35)",
        opacity: k, transform: `translateY(${(1 - k) * 60}px)` }}>
        <div style={{ ...lab, fontSize: 26, color: FLASH }}>THE BRAIN'S DEFAULT</div>
        <div style={{ fontFamily: SERIF2, fontSize: 96, color: "#fff", lineHeight: 1, marginTop: 16 }}>gaze is directed <span style={{ color: FLASH }}>toward us</span></div>
      </div>
    </AbsoluteFill>
  );
};

/** The gap: a "?" in the dark that the brain fills with WATCHED. */
export const Gap: React.FC<{ from: number; fillAt: number }> = ({ from, fillAt }) => {
  const f = useCurrentFrame();
  const fill = p(f, fillAt, 8);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 190, right: 190, top: 900, height: 420, borderRadius: 30, border: "8px dashed rgba(255,255,255,0.7)", background: `rgba(243,194,29,${0.9 * fill})`, opacity: p(f, from, 8),
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...big(260, "#fff"), opacity: 1 - p(f, fillAt, 3), position: "absolute" }}>?</div>
        <div style={{ ...big(112, "#111", "#fff"), textShadow: "none", opacity: fill, transform: `scale(${1.3 - 0.3 * fill})` }}>watched</div>
      </div>
    </AbsoluteFill>
  );
};

/** Not broken (crossed), but careful (ticked). */
export const Careful: React.FC<{ brokenAt: number; carefulAt: number }> = ({ brokenAt, carefulAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, text: string, at: number, good: boolean) => (
    <div style={{ position: "absolute", left: 140, right: 140, top, height: 190, borderRadius: 30, background: good ? FLASH : "rgba(5,10,45,0.9)", border: `5px solid ${good ? FLASH : "#fff"}`,
      display: "flex", alignItems: "center", gap: 40, padding: "0 50px", opacity: p(f, at, 8), transform: `translateX(${(1 - p(f, at, 12)) * 120}px)` }}>
      <div style={{ ...big(110, good ? "#111" : RED, "#fff"), textShadow: "none" }}>{good ? "✓" : "✗"}</div>
      <div style={{ ...lab, fontSize: 40, color: good ? "#111" : "#fff", textDecoration: good ? "none" : "line-through", textDecorationColor: RED }}>{text}</div>
    </div>
  );
  return <AbsoluteFill>{row(900, "BROKEN", brokenAt, false)}{row(1160, "CAREFUL", carefulAt, true)}</AbsoluteFill>;
};

/** The researcher's explanation (paraphrased, so no quote marks). */
export const Clifford: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from + 4, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 110, right: 110, top: 880, padding: "60px 56px", borderRadius: 34, background: "rgba(5,10,45,0.88)", border: "4px solid rgba(255,255,255,0.35)",
        boxShadow: "0 40px 90px rgba(0,0,0,0.5)", opacity: k, transform: `perspective(1400px) rotateX(${(1 - k) * 18}deg) translateY(${(1 - k) * 80}px)` }}>
        <div style={{ fontFamily: SERIF2, fontSize: 100, color: "#fff", lineHeight: 1 }}>A direct stare can signal a <span style={{ color: FLASH }}>threat.</span></div>
        <div style={{ ...lab, fontSize: 28, color: "#fff", marginTop: 36 }}>COLIN CLIFFORD</div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)", marginTop: 10 }}>PSYCHOLOGIST · UNIVERSITY OF SYDNEY · 2013</div>
      </div>
    </AbsoluteFill>
  );
};

/** The trade-off: missing a real stare (danger) vs turning around for nothing (one second). */
export const Cost: React.FC<{ missAt: number; turnAt: number }> = ({ missAt, turnAt }) => {
  const f = useCurrentFrame();
  const card = (top: number, title: string, value: string, color: string, at: number) => (
    <div style={{ position: "absolute", left: 130, right: 130, top, padding: "36px 40px", borderRadius: 30, background: "rgba(5,10,45,0.9)", border: `6px solid ${color}`, opacity: p(f, at, 8), transform: `scale(${1.15 - 0.15 * p(f, at, 10)})` }}>
      <div style={{ ...lab, fontSize: 34, color: "#fff" }}>{title}</div>
      <div style={{ ...big(120, color, "#fff"), marginTop: 14 }}>{value}</div>
    </div>
  );
  return <AbsoluteFill>{card(860, "MISS A REAL STARE", "danger", RED, missAt)}{card(1200, "TURN FOR NOTHING", "1 second", FLASH, turnAt)}</AbsoluteFill>;
};

/** FEELING ≠ PROOF. */
export const Proof: React.FC<{ from: number; notAt: number }> = ({ from, notAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 860, textAlign: "center", ...big(170, "#fff"), opacity: p(f, from, 10) }}>feeling</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1040, textAlign: "center", ...big(170, FLASH, "#fff"), opacity: p(f, notAt, 8), transform: `scale(${1.5 - 0.5 * p(f, notAt, 8)})` }}>≠</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1220, textAlign: "center", ...big(170, "#fff"), opacity: p(f, notAt + 6, 10) }}>proof</div>
    </AbsoluteFill>
  );
};

/** SAFE > SORRY: a balance tipping to SAFE. */
export const Safe: React.FC<{ from: number; tipAt: number }> = ({ from, tipAt }) => {
  const f = useCurrentFrame();
  const t = interpolate(f, [tipAt, tipAt + 20], [0, -12], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 535, top: 1100, width: 10, height: 330, background: "#fff", opacity: p(f, from, 8) }} />
      <div style={{ position: "absolute", left: 140, right: 140, top: 1080, height: 12, background: "#fff", transform: `rotate(${t}deg)`, opacity: p(f, from, 8) }}>
        <div style={{ position: "absolute", left: -20, top: -200, width: 300, textAlign: "center", ...big(110, FLASH, "#fff") }}>safe</div>
        <div style={{ position: "absolute", right: -20, top: -150, width: 300, textAlign: "center", ...big(80, "#fff") }}>sorry</div>
      </div>
    </AbsoluteFill>
  );
};
