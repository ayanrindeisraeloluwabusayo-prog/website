// Motion graphics for "Why time slows down in an accident", in the mosquito look: thin serif for big words and numbers,
// small spaced labels, light shapes, white on blue with gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const serif = (size: number, color = "#fff"): React.CSSProperties => ({ fontFamily: SERIF2, fontSize: size, lineHeight: 1, color });
const RED = "#ff5a5a";
const note = (text: string, top = 1620) => <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>;

/** A pause symbol and a frame counter that slows almost to a stop. */
export const Pause: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const t = f - from;
  const n = Math.floor(40 * Math.log1p(t / 4));
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 430, top: 900, display: "flex", gap: 50, opacity: p(f, from, 8) }}>
        <div style={{ width: 70, height: 260, borderRadius: 14, background: "#fff" }} /><div style={{ width: 70, height: 260, borderRadius: 14, background: "#fff" }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", ...lab, fontSize: 28, color: FLASH }}>FRAME {String(n).padStart(4, "0")}</div>
    </AbsoluteFill>
  );
};

/** "1 second" on one side, "felt like 10" on the other. */
export const OneTen: React.FC<{ from: number; tenAt: number }> = ({ from, tenAt }) => {
  const f = useCurrentFrame();
  const k = p(f, tenAt, 14);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 900, width: 360, textAlign: "center", opacity: p(f, from, 8) }}>
        <div style={serif(240)}>1</div><div style={{ ...lab, fontSize: 28, color: "#fff", marginTop: 10 }}>SECOND</div>
      </div>
      <div style={{ position: "absolute", left: 600, top: 900, width: 360, textAlign: "center", opacity: k, transform: `scale(${0.7 + 0.3 * k})` }}>
        <div style={serif(240, FLASH)}>10</div><div style={{ ...lab, fontSize: 28, color: FLASH, marginTop: 10 }}>FELT LIKE</div>
      </div>
      <div style={{ position: "absolute", left: 120, right: 120, top: 1300, height: 4, background: "rgba(255,255,255,0.4)" }} />
      <div style={{ position: "absolute", left: 120, top: 1288, width: 28, height: 28, borderRadius: 14, background: "#fff" }} />
      <div style={{ position: "absolute", left: 120, top: 1294, height: 16, borderRadius: 8, background: FLASH, width: 840 * k }} />
    </AbsoluteFill>
  );
};

/** A timeline that keeps stretching: "felt like forever". */
export const Forever: React.FC<{ from: number; to: number }> = ({ from, to }) => {
  const f = useCurrentFrame();
  const k = interpolate(f, [from, to], [0, 1], clamp);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 120, top: 1050, width: 140 + 700 * k, height: 14, borderRadius: 7, background: FLASH }} />
      <div style={{ position: "absolute", left: 120, top: 1100, ...lab, fontSize: 26, color: "#fff" }}>HOW THE FALL FELT</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1240, textAlign: "center", ...serif(110), opacity: p(f, from + 10, 12) }}>forever</div>
    </AbsoluteFill>
  );
};

/** A roof edge and a falling dot; a timer stops at 0.86 s: "less than one second". */
export const Roof: React.FC<{ from: number; lessAt: number }> = ({ from, lessAt }) => {
  const f = useCurrentFrame();
  const fall = interpolate(f, [from + 6, from + 32], [0, 1], { ...clamp, easing: (x) => x * x });
  const secs = (0.86 * fall).toFixed(2);
  return (
    <AbsoluteFill>
      <svg viewBox="0 0 400 400" style={{ position: "absolute", left: 140, top: 760, width: 800, height: 800, opacity: p(f, from, 8) }}>
        <path d="M40 120 L130 60 L220 120 V330 H40 Z" fill="none" stroke="#fff" strokeWidth="5" strokeLinejoin="round" />
        <line x1="20" y1="330" x2="380" y2="330" stroke="#fff" strokeWidth="5" />
        <line x1="250" y1="120" x2="250" y2="330" stroke="rgba(255,255,255,0.35)" strokeWidth="3" strokeDasharray="8 8" />
        <circle cx="250" cy={110 + 205 * fall} r="14" fill={FLASH} />
        <text x="262" y="230" fill="#fff" fontFamily={SANS2} fontWeight={800} fontSize="16" letterSpacing="2">~12 FT</text>
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1420, textAlign: "center", ...serif(170, FLASH) }}>{secs}s</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1600, textAlign: "center", ...lab, fontSize: 28, color: "#fff", opacity: p(f, lessAt, 10) }}>LESS THAN ONE SECOND</div>
    </AbsoluteFill>
  );
};

/** About 3 seconds, then two bars: how long their own fall felt vs other people's falls (+36%). */
export const Estimate: React.FC<{ from: number; threeAt: number; thirdAt: number }> = ({ from, threeAt, thirdAt }) => {
  const f = useCurrentFrame();
  const bars = p(f, thirdAt - 10, 10);
  const bar = (left: number, h: number, label: string, gold: boolean, at: number) => {
    const g = interpolate(f, [at, at + 20], [0, 1], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 3) });
    return <div style={{ position: "absolute", left, top: 880, width: 300, textAlign: "center", opacity: bars }}>
      <div style={{ position: "relative", height: 520 }}><div style={{ position: "absolute", left: 90, right: 90, bottom: 0, height: h * g, borderRadius: "12px 12px 0 0", background: gold ? FLASH : "#fff" }} /></div>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginTop: 16 }}>{label}</div>
    </div>;
  };
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", opacity: p(f, threeAt, 10) * (1 - bars) }}>
        <div style={serif(260)}>3s</div><div style={{ ...lab, fontSize: 28, color: "#fff", marginTop: 16 }}>THE REAL FALL</div>
      </div>
      {bar(170, 370, "OTHERS' FALLS", false, thirdAt - 6)}
      {bar(610, 500, "THEIR OWN FALL", true, thirdAt)}
      <div style={{ position: "absolute", left: 610, width: 300, top: 790, textAlign: "center", ...serif(90, FLASH), opacity: p(f, thirdAt + 14, 10) }}>+36%</div>
      {note("STETSON, FIESTA & EAGLEMAN · PLOS ONE · 2007", 1600)}
    </AbsoluteFill>
  );
};

/** The wrist screen: numbers flashing too fast to read. */
export const Chrono: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const digit = (Math.floor((f - from) * 7.3) % 90) + 10;
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 290, top: 860, width: 500, height: 420, borderRadius: 60, border: "6px solid #fff", background: "rgba(0,8,40,0.85)", opacity: p(f, from, 8),
        display: "flex", alignItems: "center", justifyContent: "center" }}>
        <div style={{ ...serif(230, FLASH), filter: "blur(3px)", opacity: 0.9 }}>{digit}</div>
      </div>
      <div style={{ position: "absolute", left: 340, top: 820, width: 400, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left: 340, top: 1280, width: 400, height: 40, borderRadius: 20, background: "rgba(255,255,255,0.25)" }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", ...lab, fontSize: 28, color: "#fff" }}>TOO FAST TO READ</div>
    </AbsoluteFill>
  );
};

/** If time slowed: readable. What happened: they couldn't read it. */
export const Readable: React.FC<{ from: number; cantAt: number }> = ({ from, cantAt }) => {
  const f = useCurrentFrame();
  const row = (top: number, label: string, value: string, color: string, at: number) => (
    <div style={{ position: "absolute", left: 140, right: 140, top, opacity: p(f, at, 10) }}>
      <div style={{ ...lab, fontSize: 24, color: "rgba(255,255,255,0.75)" }}>{label}</div>
      <div style={{ ...serif(110, color), marginTop: 10 }}>{value}</div>
    </div>
  );
  return <AbsoluteFill>{row(880, "IF TIME REALLY SLOWED DOWN", "they'd read it", "#fff", from + 4)}{row(1180, "WHAT HAPPENED", "they couldn't", FLASH, cantAt)}</AbsoluteFill>;
};

/** "time" crossed out, "memory" in gold. */
export const Never: React.FC<{ from: number; memoryAt: number }> = ({ from, memoryAt }) => {
  const f = useCurrentFrame();
  const s = p(f, from + 10, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 920, textAlign: "center" }}>
        <span style={{ position: "relative", display: "inline-block", ...serif(200), opacity: 1 - 0.5 * s }}>time
          <span style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 6, background: RED, transform: `scaleX(${s})`, transformOrigin: "left" }} /></span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1180, textAlign: "center", ...serif(220, FLASH), opacity: p(f, memoryAt, 10), transform: `scale(${0.7 + 0.3 * p(f, memoryAt, 10)})` }}>memory</div>
    </AbsoluteFill>
  );
};

/** A calm moment stores a few frames; a scary one stores many more, so it feels longer. */
export const Longer: React.FC<{ from: number; longerAt: number }> = ({ from, longerAt }) => {
  const f = useCurrentFrame();
  const strip = (top: number, count: number, gold: boolean, label: string, at: number) => (
    <div style={{ position: "absolute", left: 110, right: 110, top, opacity: p(f, at, 8) }}>
      <div style={{ ...lab, fontSize: 24, color: gold ? FLASH : "#fff", marginBottom: 14 }}>{label}</div>
      <div style={{ display: "flex", gap: 8 }}>
        {Array.from({ length: count }, (_, i) => <div key={i} style={{ flex: 1, height: 90, borderRadius: 6, border: `3px solid ${gold ? FLASH : "#fff"}`, background: gold ? "rgba(243,194,29,0.18)" : "rgba(255,255,255,0.08)", opacity: p(f, at + i * 1.5, 4) }} />)}
      </div>
    </div>
  );
  return (
    <AbsoluteFill>
      {strip(880, 4, false, "A NORMAL MOMENT", from + 2)}
      {strip(1100, 14, true, "A SCARY MOMENT", from + 14)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1340, textAlign: "center", ...serif(110, FLASH), opacity: p(f, longerAt, 10) }}>feels longer</div>
    </AbsoluteFill>
  );
};
