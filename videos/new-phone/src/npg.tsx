// Motion graphics for "Why the new phone stops feeling exciting": white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a";

/** An excitement meter on a phone outline: full on day 1, nearly empty by week 3. */
export const Meter: React.FC<{ from: number; fullAt: number; dropAt: number }> = ({ from, fullAt, dropAt }) => {
  const f = useCurrentFrame();
  const fill = interpolate(f, [from, fullAt, dropAt, dropAt + 30], [0.2, 1, 1, 0.15], clamp);
  const late = f >= dropAt;
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <div style={{ position: "absolute", left: 340, top: 720, width: 400, height: 800, borderRadius: 60, border: "14px solid #fff", background: "rgba(255,255,255,0.06)", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${fill * 100}%`, background: late ? "rgba(255,255,255,0.35)" : FLASH, boxShadow: late ? "none" : "0 0 60px rgba(243,194,29,0.8)" }} />
        <div style={{ position: "absolute", top: 24, left: "50%", width: 90, height: 18, marginLeft: -45, borderRadius: 9, background: "#fff" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 34, color: late ? "#fff" : FLASH }}>EXCITEMENT · {late ? "WEEK 3" : "DAY 1"}</div>
    </AbsoluteFill>
  );
};

/** The adaptation curve: a jump of joy that slides back to normal. */
export const Curve: React.FC<{ from: number; saw?: boolean }> = ({ from, saw }) => {
  const f = useCurrentFrame();
  const N = 140;
  const val = (t: number) => {
    if (!saw) return t < 0.15 ? 0.25 : 0.25 + 0.7 * Math.exp(-(t - 0.15) * 6);
    const seg = [0.1, 0.45, 0.75];
    let v = 0.25;
    seg.forEach((s0) => { if (t >= s0) v = 0.25 + 0.6 * Math.exp(-(t - s0) * 9); });
    return v;
  };
  const draw = interpolate(f, [from + 4, from + 70], [0, 1], clamp);
  const pts = Array.from({ length: Math.max(2, Math.round(draw * N)) }, (_, i) => { const t = i / N; return `${140 + t * 800},${1450 - val(t) * 600}`; }).join(" ");
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 10) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 760, textAlign: "center", ...lab, fontSize: 32, color: "#fff" }}>{saw ? "WITH BREAKS" : "HOW GOOD IT FEELS"}</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={140} x2={940} y1={1450} y2={1450} stroke="rgba(255,255,255,0.4)" strokeWidth={3} />
        <line x1={140} x2={940} y1={1300} y2={1300} stroke="rgba(255,255,255,0.25)" strokeWidth={2} strokeDasharray="10 12" />
        <polyline points={pts} fill="none" stroke={FLASH} strokeWidth={8} strokeLinejoin="round" />
        {saw ? [0.45, 0.75].map((s, i) => <text key={i} x={140 + s * 800} y={1500} textAnchor="middle" fontFamily={SANS2} fontWeight={800} fontSize={26} fill="#fff" opacity={draw > s ? 1 : 0}>BREAK</text>) : null}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1540, textAlign: "center", ...lab, fontSize: 30, color: FLASH, opacity: p(f, from + 60, 10) }}>{saw ? "EACH BREAK BRINGS IT BACK" : "YOU GET USED TO IT"}</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1620, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.6)" }}>ILLUSTRATION</div>
    </AbsoluteFill>
  );
};

/** Lottery winners vs ordinary people: happiness about the same; everyday pleasure lower for winners. */
export const Lottery: React.FC<{ sameAt: number; lessAt: number; jokeAt: number; compAt: number }> = ({ sameAt, lessAt, jokeAt, compAt }) => {
  const f = useCurrentFrame();
  const col = (x: number, title: string, gold: boolean, k: number) => (
    <div style={{ position: "absolute", left: x, top: 760, width: 380, textAlign: "center", opacity: k }}>
      <div style={{ ...lab, fontSize: 28, color: gold ? FLASH : "#fff" }}>{title}</div>
    </div>
  );
  const bar = (x: number, h: number, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    return <div style={{ position: "absolute", left: x, bottom: 1920 - 1420, width: 150, height: h * g, borderRadius: "14px 14px 0 0", background: gold ? FLASH : "#fff" }} />;
  };
  return (
    <AbsoluteFill>
      {col(110, "LOTTERY WINNERS", true, p(f, sameAt - 20, 10))}
      {col(590, "ORDINARY PEOPLE", false, p(f, sameAt - 20, 10))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", fontFamily: SANS2, fontWeight: 900, fontSize: 80, color: "#fff", opacity: p(f, sameAt, 10) }}>HAPPIER? <span style={{ color: FLASH }}>NO</span></div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1010, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, lessAt, 10) }}>PLEASURE FROM EVERYDAY THINGS</div>
      {f >= lessAt ? <>{bar(225, 200, true, lessAt)}{bar(705, 330, false, lessAt)}</> : null}
      <div style={{ position: "absolute", left: 140, right: 140, top: 1460, height: 4, background: "rgba(255,255,255,0.4)", opacity: p(f, lessAt, 10) }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, display: "flex", justifyContent: "center", gap: 30 }}>
        {[["A FUNNY JOKE", jokeAt], ["A COMPLIMENT", compAt]].map(([t, a]) => <div key={t as string} style={{ padding: "16px 30px", borderRadius: 40, background: "#fbfaf7", color: INK, ...lab, fontSize: 28, opacity: p(f, a as number, 10), transform: `scale(${0.7 + 0.3 * p(f, a as number, 10)})` }}>{t}</div>)}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", ...lab, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>BRICKMAN, COATES & JANOFF-BULMAN · 1978</div>
    </AbsoluteFill>
  );
};

/** The TV study: same show, with and without ad breaks; with breaks it was enjoyed more. */
export const TV: React.FC<{ from: number; moreAt: number; skipAt: number }> = ({ from, moreAt, skipAt }) => {
  const f = useCurrentFrame();
  const screen = (x: number, label: string, breaks: boolean) => {
    const k = p(f, from + (breaks ? 10 : 0), 12);
    const g = interpolate(f, [moreAt, moreAt + 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    const adOn = breaks && Math.floor((f - from) / 18) % 3 === 2;
    return (
      <div style={{ position: "absolute", left: x, top: 800, width: 380, opacity: k }}>
        <div style={{ height: 240, borderRadius: 18, border: "10px solid #fff", background: adOn ? FLASH : "#0b1e66", display: "flex", alignItems: "center", justifyContent: "center", ...lab, fontSize: 40, color: adOn ? INK : "rgba(255,255,255,0.5)" }}>{adOn ? "AD" : "SHOW"}</div>
        <div style={{ ...lab, fontSize: 24, color: "#fff", textAlign: "center", marginTop: 16 }}>{label}</div>
        <div style={{ ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)", textAlign: "center", marginTop: 40 }}>ENJOYED IT</div>
        <div style={{ margin: "10px auto 0", width: 120, height: 360, borderRadius: 14, background: "rgba(255,255,255,0.12)", position: "relative" }}>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${(breaks ? 85 : 55) * g}%`, borderRadius: 14, background: breaks ? FLASH : "#fff" }} />
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill>
      {screen(110, "NO AD BREAKS", false)}
      {screen(590, "WITH AD BREAKS", true)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 30, color: FLASH, opacity: p(f, skipAt, 10) }}>…EVEN THOUGH THEY'D RATHER SKIP THE ADS</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1640, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>NELSON, MEYVIS & GALAK · 2009</div>
    </AbsoluteFill>
  );
};
