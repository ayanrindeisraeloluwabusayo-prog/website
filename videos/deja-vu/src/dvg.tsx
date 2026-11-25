// Motion graphics for "Why you get déjà vu": white lines on blue, gold for the key fact, small Inter Tight labels.
// Facts: Brown (2003) Psychological Bulletin (about 60% have had déjà vu, less with age); Cleary et al. (2012) Consciousness
// and Cognition (new scenes with the same layout as a forgotten one raised déjà vu); Cleary & Claxton (2018) Psychological
// Science (felt sure of the next turn, no better than chance). The film is named as plain text only: no logo, no stills.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { BLUE_DEEP, FLASH, p } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const RED = "#ff3b3b";
const big = (size: number, face = "#fff", depth = FLASH): React.CSSProperties => ({ fontFamily: SANS2, fontWeight: 900, fontSize: size, lineHeight: 0.9, letterSpacing: "-0.04em", color: face,
  textShadow: `${Array.from({ length: 12 }, (_, i) => `${i + 1}px ${i + 1}px 0 ${i < 6 ? depth : BLUE_DEEP}`).join(", ")}, 0 0 70px rgba(243,194,29,0.6)` });
const note = (text: string, top = 1600) => (
  <div style={{ position: "absolute", left: 0, right: 0, top, textAlign: "center", ...lab, fontSize: 22, color: "rgba(255,255,255,0.7)" }}>{text}</div>
);
const glow = (c = "#fff") => ({ filter: `drop-shadow(0 0 10px ${c === "#fff" ? "rgba(255,255,255,0.4)" : "rgba(243,194,29,0.8)"})` });

/** "and suddenly you freeze": the laughing frame stops dead, tinted blue, with pause bars and a stopped timecode.
 *  At `againAt` ("You've lived this exact moment before") copies of the same frame stack up behind it: a replay. */
export const Freeze: React.FC<{ from: number; againAt: number }> = ({ from, againAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 6);
  const again = p(f, againAt, 16);
  const card = (i: number) => {
    const t = interpolate(again, [i * 0.18, Math.min(1, i * 0.18 + 0.5)], [0, 1], clamp);
    return (
      <div key={i} style={{ position: "absolute", left: 190 + i * 34 * t, top: 820 - i * 46 * t, width: 700, height: 700, overflow: "hidden", borderRadius: 18,
        border: `6px solid ${i === 0 ? "#fff" : FLASH}`, opacity: i === 0 ? 1 : t * (1 - i * 0.18), zIndex: 10 - i,
        boxShadow: "0 40px 80px rgba(0,0,0,0.5)", transform: `scale(${i === 0 ? 1 - 0.12 * again : 1})` }}>
        <Img src={staticFile("media/s-freeze.jpg")} style={{ width: "100%", height: "100%", objectFit: "cover", objectPosition: "50% 45%", filter: "grayscale(0.6) contrast(1.1)" }} />
        <AbsoluteFill style={{ background: "rgba(2,67,241,0.35)", mixBlendMode: "multiply" }} />
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: k }}>
      {[3, 2, 1, 0].map(card)}
      <div style={{ position: "absolute", left: 230, top: 860, display: "flex", gap: 16, zIndex: 20, opacity: 1 - again }}>
        <div style={{ width: 26, height: 90, background: "#fff", borderRadius: 4 }} /><div style={{ width: 26, height: 90, background: "#fff", borderRadius: 4 }} />
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1560, textAlign: "center", ...lab, fontSize: 40, color: again > 0.5 ? FLASH : "#fff", zIndex: 20 }}>
        {again > 0.5 ? "↺  AGAIN" : "00:00:03:14"}
      </div>
    </AbsoluteFill>
  );
};

/** A film-title card in our own type (plain text, no logo): "THE MATRIX", "A FILM · 1999". */
export const FilmTitle: React.FC<{ from: number }> = ({ from }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14);
  const lines = Array.from({ length: 14 }, (_, i) => i);
  return (
    <AbsoluteFill>
      {lines.map((i) => (
        <div key={i} style={{ position: "absolute", left: 120 + ((i * 137) % 840), top: 780 + ((i * 263) % 760), width: 3, height: 60 + (i % 4) * 30,
          background: "rgba(255,255,255,0.35)", transform: `translateY(${((f - from) * (6 + (i % 3) * 3)) % 300}px)`, opacity: k * 0.7 }} />
      ))}
      <div style={{ position: "absolute", left: 0, right: 0, top: 960, textAlign: "center", ...lab, fontSize: 34, color: FLASH, opacity: k }}>A FILM · 1999</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1030, textAlign: "center", ...big(170), opacity: k, transform: `scale(${1.15 - 0.15 * k})`, letterSpacing: "0.02em" }}>THE MATRIX</div>
    </AbsoluteFill>
  );
};

const CatShape: React.FC<{ color: string; stroke?: boolean; step: number }> = ({ color, stroke, step }) => {
  const s = Math.sin(step);
  const legs = [[-58, 1], [-38, -1], [40, 1], [60, -1]];
  return (
    <g>
      <path d="M -80 -20 Q -78 -62 -20 -66 L 50 -64 Q 84 -62 88 -30 L 86 -6 Q 60 6 0 4 L -60 4 Q -84 0 -80 -20 Z" fill={stroke ? "none" : color} stroke={color} strokeWidth={stroke ? 5 : 0} />
      <path d="M 70 -60 L 74 -100 L 92 -78 L 108 -100 L 112 -58 Q 120 -30 92 -24 Q 66 -26 70 -60 Z" fill={stroke ? "none" : color} stroke={color} strokeWidth={stroke ? 5 : 0} />
      <path d={`M -80 -30 Q -130 -${60 + 10 * s} -118 -120`} fill="none" stroke={color} strokeWidth={10} strokeLinecap="round" />
      {legs.map(([x, d], i) => <line key={i} x1={x} y1={0} x2={x + 14 * s * d} y2={52} stroke={color} strokeWidth={stroke ? 5 : 12} strokeLinecap="round" />)}
      {stroke ? null : <circle cx={100} cy={-50} r={5} fill={FLASH} />}
    </g>
  );
};

/** The same black cat walks past twice: a solid cat, then at `twiceAt` the exact same walk as a gold ghost, "×2". */
export const Cat: React.FC<{ from: number; twiceAt: number }> = ({ from, twiceAt }) => {
  const f = useCurrentFrame();
  const x1 = interpolate(f, [from, from + 40], [-200, 1280], clamp);
  const x2 = interpolate(f, [twiceAt, twiceAt + 50], [-200, 1280], clamp);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <line x1={60} y1={1300} x2={1020} y2={1300} stroke="rgba(255,255,255,0.6)" strokeWidth={4} />
        <g transform={`translate(${x1} 1248)`}><CatShape color="#0a0f2a" step={(f - from) * 0.5} /></g>
        {f >= twiceAt ? <g transform={`translate(${x2} 1248)`} style={glow(FLASH)}><CatShape color={FLASH} stroke step={(f - twiceAt) * 0.5} /></g> : null}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1380, textAlign: "center", ...big(200, FLASH, "#fff"), opacity: p(f, twiceAt + 4, 8), transform: `scale(${1.5 - 0.5 * p(f, twiceAt + 4, 8)})` }}>×2</div>
    </AbsoluteFill>
  );
};

/** "A glitch in the Matrix": a screen whose picture tears into sliding slices and colour-split edges. */
export const Glitch: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 10);
  const g = f >= at ? 1 : 0;
  const slices = Array.from({ length: 12 }, (_, i) => i);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <div style={{ position: "absolute", left: 140, top: 840, width: 800, height: 560, borderRadius: 26, border: "8px solid #fff", overflow: "hidden", background: BLUE_DEEP, boxShadow: "0 40px 90px rgba(0,0,0,0.5)" }}>
        {slices.map((i) => {
          const off = g ? Math.sin(f * 1.7 + i * 2.3) * (i % 3 === 0 ? 90 : 24) : 0;
          return (
            <div key={i} style={{ position: "absolute", left: off, top: i * (560 / 12), width: "100%", height: 560 / 12 + 1, overflow: "hidden" }}>
              <div style={{ position: "absolute", left: 0, top: -i * (560 / 12), width: 800, height: 560, display: "flex", alignItems: "center", justifyContent: "center" }}>
                <svg width={400} height={260} viewBox="-150 -140 300 220" style={{ overflow: "visible" }}>
                  {g ? <g transform="translate(-8 0)" opacity={0.7}><CatShape color={RED} step={0} /></g> : null}
                  {g ? <g transform="translate(8 0)" opacity={0.7}><CatShape color="#38e1ff" step={0} /></g> : null}
                  <CatShape color="#fff" step={0} />
                </svg>
              </div>
            </div>
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1460, textAlign: "center", ...big(130, g ? FLASH : "#fff", "#fff"), opacity: g, transform: `translateX(${g ? Math.sin(f * 3.1) * 8 : 0}px)` }}>GLITCH?</div>
    </AbsoluteFill>
  );
};

const Person: React.FC<{ x: number; y: number; on: number; s?: number }> = ({ x, y, on, s = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`}>
    <circle cx={0} cy={-90} r={26} fill={on ? FLASH : "rgba(255,255,255,0.25)"} />
    <path d="M -38 0 Q -38 -56 0 -56 Q 38 -56 38 0 Z" fill={on ? FLASH : "rgba(255,255,255,0.25)"} />
  </g>
);

/** "About six in ten people": ten figures, six turn gold one by one, with a big "6 IN 10". */
export const SixTen: React.FC<{ from: number; at: number; youngAt: number }> = ({ from, at, youngAt }) => {
  const f = useCurrentFrame();
  const lit = Math.round(interpolate(f, [at, at + 24], [0, 6], clamp));
  const young = p(f, youngAt, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 800, textAlign: "center", ...big(190, FLASH, "#fff"), opacity: p(f, at, 8) }}>6 IN 10</div>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0, opacity: p(f, from, 10) }}>
        {Array.from({ length: 10 }, (_, i) => <Person key={i} x={170 + (i % 5) * 185} y={1210 + Math.floor(i / 5) * 230} on={i < lit ? 1 : 0} />)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", ...lab, fontSize: 34, color: "#fff", opacity: young }}>MOST OFTEN WHEN YOU'RE YOUNG</div>
      {note("BROWN · PSYCHOLOGICAL BULLETIN · 2003", 1570)}
    </AbsoluteFill>
  );
};

type RoomKind = "a" | "b";
const SPOTS: [number, number][] = [[32, 77], [78, 22], [76, 72]];
/** One room seen from above: walls with a door gap and three things in fixed spots. `draw` draws the walls, `things` pops the objects. */
const Plan: React.FC<{ x: number; y: number; s: number; kind: RoomKind; draw: number; things: number; dim?: number; dots?: number }> = ({ x, y, s, kind, draw, things, dim = 1, dots = 0 }) => {
  const c = `rgba(255,255,255,${dim})`;
  const st = { fill: "none", stroke: c, strokeWidth: 2.4, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  const pop = (i: number) => ({ opacity: interpolate(things, [i * 0.25, i * 0.25 + 0.4], [0, 1], clamp), transformOrigin: `${SPOTS[i][0]}px ${SPOTS[i][1]}px`, transform: `scale(${0.4 + 0.6 * interpolate(things, [i * 0.25, i * 0.25 + 0.4], [0, 1], clamp)})` });
  return (
    <g transform={`translate(${x} ${y}) scale(${s / 100})`} style={glow()}>
      <path d="M 38 0 H 0 V 100 H 100 V 0 H 62" fill="none" stroke={c} strokeWidth={3} pathLength={1} strokeDasharray={1} strokeDashoffset={1 - draw} />
      {kind === "a" ? (
        <>
          <rect x={10} y={66} width={44} height={22} rx={5} {...st} style={pop(0)} />
          <circle cx={78} cy={22} r={9} {...st} style={pop(1)} />
          <rect x={64} y={60} width={24} height={24} {...st} style={pop(2)} />
        </>
      ) : (
        <>
          <path d="M 10 70 L 32 88 L 54 70 Z" {...st} style={pop(0)} />
          <rect x={69} y={13} width={18} height={18} transform="rotate(45 78 22)" {...st} style={pop(1)} />
          <circle cx={76} cy={72} r={12} {...st} style={pop(2)} />
        </>
      )}
      {SPOTS.map(([px, py], i) => <circle key={i} cx={px} cy={py} r={3.2} fill={FLASH} opacity={dots} />)}
    </g>
  );
};
const L = { x: 100, y: 860, s: 380 }, R = { x: 600, y: 860, s: 380 };
const Links: React.FC<{ t: number }> = ({ t }) => (
  <>
    {SPOTS.map(([px, py], i) => {
      const x1 = L.x + (px * L.s) / 100, y1 = L.y + (py * L.s) / 100, x2 = R.x + (px * R.s) / 100, y2 = R.y + (py * R.s) / 100;
      return <path key={i} d={`M ${x1} ${y1} Q ${(x1 + x2) / 2} ${Math.min(y1, y2) - 120 - i * 30} ${x2} ${y2}`} fill="none" stroke={FLASH} strokeWidth={6} strokeDasharray="14 14" strokeLinecap="round"
        pathLength={1000} strokeDashoffset={0} style={{ ...glow(FLASH), opacity: interpolate(t, [i * 0.2, i * 0.2 + 0.4], [0, 1], clamp) }} />;
    })}
  </>
);
const RoomLabels: React.FC<{ left: string; right: string; leftDim?: number; op?: number }> = ({ left, right, leftDim = 1, op = 1 }) => (
  <div style={{ position: "absolute", left: 0, right: 0, top: 1280, ...lab, fontSize: 30, color: "#fff", opacity: op }}>
    <span style={{ position: "absolute", left: L.x, width: L.s, textAlign: "center", opacity: leftDim }}>{left}</span>
    <span style={{ position: "absolute", left: R.x, width: R.s, textAlign: "center" }}>{right}</span>
  </div>
);

/** The Sims trick: an earlier room, then a new room with the same shape ("just like"), the same spots ("same places"),
 *  but different things ("every object different"). */
export const Layout: React.FC<{ from: number; likeAt: number; placesAt: number; diffAt: number }> = ({ from, likeAt, placesAt, diffAt }) => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Plan {...L} kind="a" draw={p(f, from, 18)} things={p(f, from + 10, 24)} />
        <Plan {...R} kind="b" draw={p(f, likeAt, 18)} things={p(f, diffAt, 20)} dots={p(f, placesAt, 10)} />
        <Links t={p(f, placesAt, 24)} />
      </svg>
      <RoomLabels left="EARLIER SCENE" right="NEW SCENE" op={p(f, from, 10)} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 1400, textAlign: "center", ...big(96, "#fff"), opacity: p(f, placesAt, 8) }}>SAME LAYOUT</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1500, textAlign: "center", ...big(96, FLASH, "#fff"), opacity: p(f, diffAt, 8) }}>NEW THINGS</div>
    </AbsoluteFill>
  );
};

/** The result: the earlier room fades (forgotten), the new one gets a gold DÉJÀ VU stamp. */
export const Stamp: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const fade = 1 - 0.75 * p(f, from, 20);
  const s = p(f, at, 7);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Plan {...L} kind="a" draw={1} things={1} dim={fade} />
        <Plan {...R} kind="b" draw={1} things={1} dots={1} />
      </svg>
      <RoomLabels left="FORGOTTEN" right="NEW SCENE" leftDim={fade} />
      <div style={{ position: "absolute", left: R.x - 40, width: R.s + 80, top: 960, textAlign: "center", opacity: s, transform: `rotate(-8deg) scale(${2 - s})` }}>
        <span style={{ display: "inline-block", padding: "6px 24px 12px", border: `9px solid ${FLASH}`, borderRadius: 18, background: "rgba(1,26,140,0.75)", ...big(82, FLASH, "#fff") }}>DÉJÀ VU</span>
      </div>
      {note("CLEARY ET AL. · CONSCIOUSNESS AND COGNITION · 2012", 1560)}
    </AbsoluteFill>
  );
};

/** The two rooms again, joined by gold lines, with a "?" where the old memory's name should be. */
export const Match: React.FC<{ from: number; nameAt: number }> = ({ from, nameAt }) => {
  const f = useCurrentFrame();
  const q = p(f, nameAt, 8);
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <Plan {...L} kind="a" draw={1} things={1} dim={0.35} />
        <Plan {...R} kind="b" draw={1} things={1} dots={1} />
        <Links t={p(f, from, 20)} />
      </svg>
      <div style={{ position: "absolute", left: L.x, width: L.s, top: 960, textAlign: "center", ...big(220, FLASH, "#fff"), opacity: q, transform: `scale(${1.6 - 0.6 * q})` }}>?</div>
      <RoomLabels left="WHERE?" right="HERE" leftDim={q} />
    </AbsoluteFill>
  );
};

/** "Which way the path would turn": a path runs up to a fork; a FELT SURE meter fills high. */
export const Path: React.FC<{ from: number; turnAt: number }> = ({ from, turnAt }) => {
  const f = useCurrentFrame();
  const run = p(f, from, 40);
  const fork = p(f, turnAt - 10, 14);
  const sure = interpolate(f, [from + 10, turnAt + 10], [0, 0.88], { ...clamp, easing: (x) => 1 - Math.pow(1 - x, 2) });
  const dotY = 1560 - 380 * run;
  return (
    <AbsoluteFill>
      <svg width={1080} height={1920} style={{ position: "absolute", inset: 0 }}>
        <path d="M 400 1600 L 400 1180" stroke="#fff" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - run} style={glow()} />
        <path d="M 400 1180 Q 400 1080 250 1000" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fork} />
        <path d="M 400 1180 Q 400 1080 550 1000" fill="none" stroke="#fff" strokeWidth={14} strokeLinecap="round" pathLength={1} strokeDasharray={1} strokeDashoffset={1 - fork} />
        <circle cx={400} cy={dotY} r={26} fill={FLASH} style={glow(FLASH)} />
        <text x={250} y={960} textAnchor="middle" fontFamily={SANS2} fontWeight={900} fontSize={70} fill="#fff" opacity={fork}>?</text>
        <text x={550} y={960} textAnchor="middle" fontFamily={SANS2} fontWeight={900} fontSize={70} fill="#fff" opacity={fork}>?</text>
      </svg>
      <div style={{ position: "absolute", left: 720, top: 860, width: 120, height: 700, borderRadius: 60, border: "6px solid #fff", overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: `${sure * 100}%`, background: FLASH, boxShadow: "0 0 40px rgba(243,194,29,0.8)" }} />
      </div>
      <div style={{ position: "absolute", left: 650, width: 260, top: 1580, textAlign: "center", ...lab, fontSize: 30, color: FLASH }}>FELT SURE</div>
    </AbsoluteFill>
  );
};

/** "No more often than a random guess": a spinning coin, then two equal bars, RIGHT and A COIN TOSS. */
export const Chance: React.FC<{ from: number; at: number }> = ({ from, at }) => {
  const f = useCurrentFrame();
  const spin = Math.cos((f - from) * 0.45);
  const bars = p(f, at, 18);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 420, top: 800, width: 240, height: 240, borderRadius: 120, background: FLASH, transform: `scaleX(${spin})`,
        boxShadow: "0 0 50px rgba(243,194,29,0.7)", display: "flex", alignItems: "center", justifyContent: "center", ...big(130, BLUE_DEEP, FLASH), textShadow: "none", opacity: 1 - 0.6 * bars }}>?</div>
      {[["THEIR GUESS", 190, "#fff"], ["A COIN TOSS", 610, FLASH]].map(([label, left, c]) => (
        <div key={label as string} style={{ position: "absolute", left: left as number, top: 1100, width: 280, textAlign: "center" }}>
          <div style={{ position: "relative", height: 380 }}><div style={{ position: "absolute", left: 60, right: 60, bottom: 0, height: 300 * bars, borderRadius: "16px 16px 0 0", background: c as string }} /></div>
          <div style={{ ...lab, fontSize: 30, color: c as string, marginTop: 16 }}>{label}</div>
        </div>
      ))}
      <div style={{ position: "absolute", left: 160, right: 160, top: 1260, height: 0, borderTop: "5px dashed rgba(255,255,255,0.8)", opacity: bars }} />
      {note("CLEARY & CLAXTON · PSYCHOLOGICAL SCIENCE · 2018 · ILLUSTRATION", 1600)}
    </AbsoluteFill>
  );
};

/** "The feeling of knowing was real. The knowing wasn't." */
export const Real: React.FC<{ from: number; wasntAt: number }> = ({ from, wasntAt }) => {
  const f = useCurrentFrame();
  const a = p(f, from, 10), b = p(f, wasntAt, 8);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 880, textAlign: "center", opacity: a }}>
        <span style={{ ...big(130) }}>FEELING </span><span style={{ ...big(150, FLASH, "#fff") }}>✓</span>
      </div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1160, textAlign: "center", opacity: b, transform: `scale(${1.3 - 0.3 * b})` }}>
        <span style={{ ...big(130) }}>KNOWING </span><span style={{ ...big(150, RED, "#fff") }}>✗</span>
      </div>
    </AbsoluteFill>
  );
};

export const BigWord: React.FC<{ from: number; text: string; sub?: string }> = ({ from, text, sub }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 10);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1000, textAlign: "center", ...big(190, FLASH, "#fff"), opacity: k, transform: `scale(${1.3 - 0.3 * k})` }}>{text}</div>
      {sub ? <div style={{ position: "absolute", left: 0, right: 0, top: 1210, textAlign: "center", fontFamily: SERIF2, fontSize: 90, color: "#fff", opacity: p(f, from + 6, 10) }}>{sub}</div> : null}
    </AbsoluteFill>
  );
};
