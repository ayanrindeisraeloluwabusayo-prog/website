// Motion graphics for "Why do you walk into a room and forget why you went?": white on blue, gold for the reason
// and the doorway, Inter Tight labels.
import React from "react";
import { AbsoluteFill, Img, interpolate, staticFile, useCurrentFrame } from "remotion";
import { FLASH, H, p, W } from "./kit";
import { SANS2 } from "./type";

const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const lab = { fontFamily: SANS2, fontWeight: 800, letterSpacing: "0.14em" } as const;

/** Two floor plans, same length of walk: one inside a room, one through a doorway. Then "forgot" bars. */
export const TwoPaths: React.FC<{ from: number; doorAt: number; sameAt: number; forgotAt: number }> = ({ from, doorAt, sameAt, forgotAt }) => {
  const f = useCurrentFrame();
  const inA = p(f, from, 14), inB = p(f, doorAt, 14);
  const walkA = interpolate(f, [from + 6, from + 46], [0, 1], clamp), walkB = interpolate(f, [doorAt + 6, doorAt + 46], [0, 1], clamp);
  const same = p(f, sameAt, 14), forgot = p(f, forgotAt, 26);
  const Y = 880, PH = 520, PW = 430;
  const plan = (x: number, k: number, walk: number, door: boolean, title: string) => {
    const pathD = door
      ? `M ${x + 110} ${Y + PH - 90} C ${x + 110} ${Y + PH / 2 + 40}, ${x + PW / 2} ${Y + PH / 2 + 60}, ${x + PW / 2} ${Y + PH / 2} S ${x + PW - 110} ${Y + PH / 2 - 60}, ${x + PW - 110} ${Y + 90}`
      : `M ${x + 110} ${Y + PH - 90} C ${x + 110} ${Y + PH / 2 + 40}, ${x + PW / 2} ${Y + PH / 2 + 60}, ${x + PW / 2} ${Y + PH / 2} S ${x + PW - 110} ${Y + PH / 2 - 60}, ${x + PW - 110} ${Y + 90}`;
    return (
      <g opacity={k} transform={`translate(0 ${(1 - k) * 40})`}>
        <text x={x + PW / 2} y={Y - 34} textAnchor="middle" fill={door ? FLASH : "#fff"} fontSize={32} {...lab}>{title}</text>
        <rect x={x} y={Y} width={PW} height={PH} rx={18} fill="rgba(255,255,255,0.06)" stroke="#fff" strokeWidth={5} />
        {door ? (
          <>
            {/* a wall across the middle with a doorway in it */}
            <line x1={x} x2={x + PW / 2 - 60} y1={Y + PH / 2} y2={Y + PH / 2} stroke="#fff" strokeWidth={5} />
            <line x1={x + PW / 2 + 60} x2={x + PW} y1={Y + PH / 2} y2={Y + PH / 2} stroke="#fff" strokeWidth={5} />
            <line x1={x + PW / 2 - 60} x2={x + PW / 2 + 60} y1={Y + PH / 2} y2={Y + PH / 2} stroke={FLASH} strokeWidth={10} strokeLinecap="round" style={{ filter: "drop-shadow(0 0 14px rgba(243,194,29,0.9))" }} />
          </>
        ) : null}
        <rect x={x + 70} y={Y + PH - 130} width={80} height={80} rx={10} fill="rgba(255,255,255,0.9)" />
        <rect x={x + PW - 150} y={Y + 50} width={80} height={80} rx={10} fill="rgba(255,255,255,0.9)" />
        <path d={pathD} fill="none" stroke={door ? FLASH : "#fff"} strokeWidth={5} strokeDasharray="14 12" pathLength={1000} opacity={walk > 0 ? 0.45 : 0} />
        <Walker d={pathD} t={walk} color={door ? FLASH : "#fff"} />
      </g>
    );
  };
  const bar = (x: number, w: number, gold: boolean, label: string) => (
    <g>
      <text x={x} y={1555} fill={gold ? FLASH : "#fff"} fontSize={28} {...lab}>{label}</text>
      <rect x={x} y={1575} width={420} height={44} rx={22} fill="rgba(255,255,255,0.12)" stroke="rgba(255,255,255,0.35)" strokeWidth={2} />
      <rect x={x} y={1575} width={Math.max(0.001, w * forgot)} height={44} rx={22} fill={gold ? FLASH : "#fff"} style={gold ? { filter: "drop-shadow(0 0 16px rgba(243,194,29,0.8))" } : undefined} />
    </g>
  );
  return (
    <AbsoluteFill>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {plan(80, inA, walkA, false, "SAME ROOM")}
        {plan(570, inB, walkB, true, "THROUGH A DOOR")}
        <text x={W / 2} y={1480} textAnchor="middle" fill="#fff" fontSize={30} {...lab} opacity={same * (1 - forgot)}>SAME DISTANCE · SAME TIME</text>
        <g opacity={forgot > 0 ? 1 : 0}>
          <text x={W / 2} y={1490} textAnchor="middle" fill="rgba(255,255,255,0.85)" fontSize={30} {...lab}>FORGOT WHAT THEY CARRIED</text>
          {bar(80, 150, false, "ROOM")}
          {bar(570, 360, true, "DOORWAY")}
        </g>
      </svg>
    </AbsoluteFill>
  );
};

/** A dot walking along an SVG path, leaving a solid trail behind it. */
const Walker: React.FC<{ d: string; t: number; color: string }> = ({ d, t, color }) => (
  <>
    <path d={d} fill="none" stroke={color} strokeWidth={7} strokeLinecap="round" pathLength={1} strokeDasharray={`${t} 2`} opacity={t > 0 ? 0.9 : 0} />
    {t > 0 ? (
      <circle r={16} fill={color} style={{ offsetPath: `path('${d}')`, offsetDistance: `${t * 100}%`, filter: "drop-shadow(0 0 10px rgba(255,255,255,0.8))" } as React.CSSProperties} />
    ) : null}
  </>
);

/** "Your brain doesn't record your day like one long video. It cuts it into scenes, like episodes." */
export const FilmStrip: React.FC<{ from: number; cutAt: number; labelAt: number }> = ({ from, cutAt, labelAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 12);
  const cut = p(f, cutAt, 18);
  const lbl = p(f, labelAt, 14);
  const pics = ["d-kitchen.jpg", "d-sofa.jpg", "d-door.jpg", "d-hall.jpg", "d-kitchen2.jpg", "d-doors.jpg"];
  const FW = 300, FH = 220, Y = 1060;
  const scroll = interpolate(f, [from, cutAt], [0, 260], clamp);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      {pics.map((src, i) => {
        // in the strip: one long row sliding left; once cut: a grid of separate scenes (2 rows of 3)
        const sx = 90 + i * (FW + 8) - scroll - 140, sy = Y;
        const gx = 45 + (i % 3) * 335, gy = 900 + Math.floor(i / 3) * 360 + (i % 2 ? 18 : -18);
        const x = sx + (gx - sx) * cut, y = sy + (gy - sy) * cut;
        const tilt = cut * ((i % 2 ? 1 : -1) * 3);
        return (
          <div key={i} style={{ position: "absolute", left: x, top: y, width: FW, height: FH + 70, background: "#111", borderRadius: 10 * cut,
            transform: `rotate(${tilt}deg)`, boxShadow: `0 ${30 * cut}px ${60 * cut}px rgba(0,0,0,0.45)` }}>
            {[0, 1].map((r) => (
              <div key={r} style={{ position: "absolute", left: 0, right: 0, top: r ? FH + 45 : 8, height: 18, display: "flex", justifyContent: "space-around" }}>
                {Array.from({ length: 9 }, (_, j) => <div key={j} style={{ width: 18, height: 14, borderRadius: 3, background: "rgba(255,255,255,0.85)" }} />)}
              </div>
            ))}
            <Img src={staticFile(`media/${src}`)} style={{ position: "absolute", left: 10, top: 35, width: FW - 20, height: FH, objectFit: "cover" }} />
            <div style={{ position: "absolute", left: 18, top: 45, ...lab, fontSize: 24, color: "#fff", background: i === 2 ? FLASH : "rgba(0,0,0,0.55)", padding: "4px 10px", borderRadius: 6, opacity: lbl,
              ...(i === 2 ? { color: "#111" } : {}) }}>SCENE {i + 1}</div>
          </div>
        );
      })}
      <div style={{ position: "absolute", left: 0, right: 0, top: 1480, textAlign: "center", ...lab, fontSize: 32, color: "#fff", opacity: 1 - cut }}>ONE LONG VIDEO?</div>
      <div style={{ position: "absolute", left: 0, right: 0, top: 1660, textAlign: "center", ...lab, fontSize: 32, color: FLASH, opacity: cut }}>NO · SEPARATE SCENES</div>
    </AbsoluteFill>
  );
};

/** 2021: the doorway only wipes the reason when the head is already full. Two heads, one door sweep. */
export const FullHead: React.FC<{ from: number; fullAt: number; wipeAt: number }> = ({ from, fullAt, wipeAt }) => {
  const f = useCurrentFrame();
  const k = p(f, from, 14);
  const full = (i: number) => p(f, fullAt + i * 3, 10);
  const sweep = interpolate(f, [wipeAt - 8, wipeAt + 14], [-0.15, 1.15], clamp);
  const wiped = f >= wipeAt + 4;
  const after = p(f, wipeAt + 8, 12);
  const head = (cx: number, busy: boolean) => {
    const CY = 1180, R = 190;
    const chips = Array.from({ length: 12 }, (_, i) => {
      const a = i * 2.39996, r = 70 + 55 * ((i * 7) % 10) / 10;
      return { x: cx + Math.cos(a) * r, y: CY - 10 + Math.sin(a) * r * 0.75, rot: ((i * 3) % 5 - 2) * 9 };
    });
    const goldGone = busy && wiped;
    const flick = busy && f >= wipeAt && f < wipeAt + 8 ? (f % 2 ? 0.2 : 1) : 1;
    return (
      <g>
        {/* head outline, side view facing right */}
        <path d={`M ${cx - R * 0.85} ${CY + R * 0.55} C ${cx - R * 1.15} ${CY - R * 0.2}, ${cx - R * 0.7} ${CY - R * 1.1}, ${cx + R * 0.1} ${CY - R * 1.05}
          C ${cx + R * 0.85} ${CY - R * 1.0}, ${cx + R * 1.1} ${CY - R * 0.3}, ${cx + R * 0.95} ${CY + R * 0.05} L ${cx + R * 1.12} ${CY + R * 0.35}
          L ${cx + R * 0.92} ${CY + R * 0.42} C ${cx + R * 0.95} ${CY + R * 0.7}, ${cx + R * 0.7} ${CY + R * 0.85}, ${cx + R * 0.35} ${CY + R * 0.82} L ${cx + R * 0.3} ${CY + R * 1.25}
          L ${cx - R * 0.55} ${CY + R * 1.25} Z`} fill="rgba(255,255,255,0.08)" stroke="#fff" strokeWidth={5} strokeLinejoin="round" />
        {busy ? chips.map((c, i) => (
          <rect key={i} x={c.x - 34} y={c.y - 22} width={68} height={44} rx={6} fill="#fff" opacity={0.85 * full(i)}
            transform={`rotate(${c.rot} ${c.x} ${c.y}) translate(0 ${(1 - full(i)) * -40})`} />
        )) : null}
        <g opacity={goldGone ? 0 : flick} transform={`translate(${cx - 56} ${CY - 44})`}>
          <rect width={112} height={72} rx={8} fill={FLASH} style={{ filter: "drop-shadow(0 0 18px rgba(243,194,29,0.9))" }} />
          {[18, 34, 50].map((y) => <rect key={y} x={16} y={y} width={70} height={7} rx={3} fill="#8a6a00" />)}
        </g>
        <text x={cx} y={CY + R * 1.25 + 70} textAnchor="middle" fill={busy ? FLASH : "#fff"} fontSize={30} {...lab}>{busy ? "HEAD ALREADY FULL" : "HEAD NOT BUSY"}</text>
        <text x={cx} y={CY + R * 1.25 + 120} textAnchor="middle" fill={busy ? FLASH : "#fff"} fontSize={34} {...lab} opacity={after}>{busy ? "REASON WIPED" : "REASON KEPT"}</text>
      </g>
    );
  };
  const dx = -60 + sweep * (W + 120);
  return (
    <AbsoluteFill style={{ opacity: k }}>
      <svg width={W} height={H} style={{ position: "absolute", inset: 0 }}>
        {head(290, false)}
        {head(790, true)}
        {sweep > -0.15 && sweep < 1.15 ? (
          <g>
            <rect x={dx - 60} y={900} width={120} height={720} fill="rgba(255,226,160,0.35)" style={{ filter: "blur(18px)" }} />
            <rect x={dx - 40} y={940} width={80} height={640} rx={6} fill="none" stroke="#ffe2a0" strokeWidth={10} />
          </g>
        ) : null}
      </svg>
    </AbsoluteFill>
  );
};
