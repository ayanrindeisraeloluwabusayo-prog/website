// Motion graphics for "Why nobody asks questions in class" (pluralistic ignorance): white on blue, gold for the key fact.
import React from "react";
import { AbsoluteFill, interpolate, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2, SERIF2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;
const INK = "#16161a";

const Person: React.FC<{ x: number; y: number; s?: number; color: string; o?: number }> = ({ x, y, s = 1, color, o = 1 }) => (
  <g transform={`translate(${x} ${y}) scale(${s})`} opacity={o}>
    <circle cx={0} cy={-22} r={13} fill={color} />
    <path d="M -20 30 C -20 2, 20 2, 20 30 Z" fill={color} />
  </g>
);

/** The Emperor's New Clothes as a storybook page: a crowd, an emperor whose "clothes" are only a dotted outline, then silence. */
export const Emperor: React.FC<{ from: number; nakedAt: number; silentAt: number }> = ({ from, nakedAt, silentAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14), nk = p(f, nakedAt, 14), si = p(f, silentAt, 12);
  return (
    <AbsoluteFill>
      <div style={{ position: "absolute", left: 90, top: 700, width: 900, height: 1000, background: "#f1ece0", borderRadius: 10, opacity: k,
        transform: `translateY(${(1 - k) * 60}px) rotate(${-1.5 + 0.5 * k}deg)`, boxShadow: "0 50px 100px rgba(0,0,0,0.5)", color: INK, overflow: "hidden" }}>
        <div style={{ position: "absolute", left: 50, top: 40, ...lab, fontSize: 26, opacity: 0.7 }}>HANS CHRISTIAN ANDERSEN · 1837</div>
        <div style={{ position: "absolute", left: 50, top: 82, fontFamily: SERIF2, fontSize: 64, lineHeight: 1.05 }}>The Emperor’s<br />New Clothes</div>
        <svg width={900} height={1000} style={{ position: "absolute", inset: 0 }}>
          {/* the emperor: crown, body drawn as a dotted outline ("the clothes") that fades away */}
          <g transform="translate(450 560) scale(1.6)">
            <path d="M -34 -112 L -20 -88 L 0 -112 L 20 -88 L 34 -112 L 30 -74 L -30 -74 Z" fill={FLASH} stroke={INK} strokeWidth={4} />
            <circle cx={0} cy={-42} r={34} fill="#e9c7a8" stroke={INK} strokeWidth={4} />
            <path d="M -60 120 C -60 -10, 60 -10, 60 120 Z" fill="#e9c7a8" stroke={INK} strokeWidth={4} />
            <path d="M -78 130 C -78 -24, 78 -24, 78 130 Z" fill="none" stroke="#7a3fb0" strokeWidth={6} strokeDasharray="10 12" opacity={1 - nk} />
            <text x={0} y={162} textAnchor="middle" fill={INK} fontSize={20} {...lab} opacity={nk}>NAKED</text>
          </g>
          {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => {
            const x = 70 + i * 108, y = 940;
            return (
              <g key={i}>
                <Person x={x} y={y} s={2.0} color="#4b4e6d" />
                <text x={x} y={y - 92} textAnchor="middle" fill={INK} fontSize={34} fontFamily={SANS2} fontWeight={900} opacity={si * (0.6 + 0.4 * Math.sin(f / 6 + i))}>…</text>
              </g>
            );
          })}
        </svg>
      </div>
    </AbsoluteFill>
  );
};

/** The smoke-filled room: a student filling in a form, smoke pouring from a vent, two calm strangers at the next desk. */
export const SmokeRoom: React.FC<{ from: number; smokeAt: number }> = ({ from, smokeAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14);
  const t = Math.max(0, f - smokeAt);
  const puffs = Array.from({ length: 40 }, (_, i) => {
    const age = t - i * 2.5; if (age <= 0) return null;
    const u = Math.min(1, age / 70);
    return { x: 880 - u * (250 + (i % 6) * 95), y: 990 + u * (60 + (i % 5) * 110) - Math.sin(i) * 20, r: 40 + u * 170, o: 0.72 * (1 - 0.35 * u) };
  });
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        <rect x={110} y={880} width={860} height={760} rx={24} fill="rgba(255,255,255,0.07)" stroke="#fff" strokeWidth={6} />
        <rect x={840} y={950} width={90} height={60} rx={6} fill="rgba(255,255,255,0.2)" stroke="#fff" strokeWidth={4} />
        {[0, 1, 2, 3].map((i) => <line key={i} x1={850} x2={920} y1={962 + i * 13} y2={962 + i * 13} stroke="#fff" strokeWidth={3} />)}
        {[{ x: 330, c: FLASH }, { x: 600, c: "#fff" }, { x: 780, c: "#fff" }].map((d, i) => (
          <g key={i}>
            <rect x={d.x - 85} y={1420} width={170} height={22} rx={6} fill="rgba(255,255,255,0.75)" />
            <Person x={d.x} y={1380} s={2.4} color={d.c} />
          </g>
        ))}
        {puffs.map((q, i) => q ? <circle key={i} cx={q.x} cy={q.y} r={q.r} fill="#d9dbe3" opacity={q.o} style={{ filter: "blur(10px)" }} /> : null)}
      </svg>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1690, textAlign: "center", ...lab, fontSize: 30, color: "#fff" }}>SMOKE THROUGH THE WALL VENT</div>
    </AbsoluteFill>
  );
};

/** Two labelled bars that fill to a percentage, with little figures above each. */
export const TwoBars: React.FC<{ from: number; at1: number; at2: number; title: string; footer: string;
  rows: [{ label: string; pct: number; people: number; gold: boolean; text?: string }, { label: string; pct: number; people: number; gold: boolean; text?: string }] }> = ({ from, at1, at2, title, footer, rows }) => {
  const f = useCurrentFrame();
  const row = (y: number, r: (typeof rows)[0], at: number) => {
    const k = p(f, at, 12);
    const g = interpolate(f, [at, at + 24], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
    const col = r.gold ? FLASH : "#fff";
    return (
      <div style={{ position: "absolute", left: 110, width: 860, top: y, opacity: k, transform: `translateY(${(1 - k) * 40}px)` }}>
        <div style={{ ...lab, fontSize: 30, color: col }}>{r.label}</div>
        <svg width={860} height={r.people ? 90 : 10} style={{ display: "block", marginTop: 6 }}>
          {Array.from({ length: r.people }, (_, i) => <Person key={i} x={30 + i * 62} y={50} s={1.15} color={i === 0 ? col : "rgba(255,255,255,0.55)"} />)}
        </svg>
        <div style={{ display: "flex", alignItems: "center", gap: 26, marginTop: 8 }}>
          <div style={{ flex: 1, height: 64, borderRadius: 32, background: "rgba(255,255,255,0.12)", border: "2px solid rgba(255,255,255,0.3)" }}>
            <div style={{ width: `${r.pct * g}%`, height: "100%", borderRadius: 32, background: col, boxShadow: r.gold ? "0 0 30px rgba(243,194,29,0.8)" : "none" }} />
          </div>
          <div style={{ fontFamily: SANS2, fontWeight: 900, fontSize: r.text ? 44 : 96, letterSpacing: "-0.03em", color: col, width: 230, textAlign: "right" }}>{r.text ?? `${Math.round(r.pct * g)}%`}</div>
        </div>
      </div>
    );
  };
  return (
    <AbsoluteFill style={{ opacity: p(f, from, 12) }}>
      <div style={{ position: "absolute", left: 0, right: 0, top: 820, textAlign: "center", ...lab, fontSize: 32, color: "#fff" }}>{title}</div>
      {row(900, rows[0], at1)}
      {row(1250, rows[1], at2)}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1620, textAlign: "center", ...lab, fontSize: 28, color: "rgba(255,255,255,0.8)" }}>{footer}</div>
    </AbsoluteFill>
  );
};
