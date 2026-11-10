// Timeline of "The Boy Who Sounded Like Four Drummers": shots timed to the voice words (voice/words.json, 30 fps),
// three places in one world (the club stage at CLUB, the Lagos street at the origin, Tony's room at ROOM) and the
// camera grammar of the cartoon-3d-short skill: slow push-ins on every hold, symmetric glides, big reframes are cuts,
// 7-frame kicks on impacts.
export const FPS = 30;
export const TOTAL = 1985;
export const D0 = 0; // ground level (build.ts imports it)
export type V3 = [number, number, number];
export const CLUB: V3 = [-80, 0, 0];
export const ROOM: V3 = [80, 0, 0];
export const STAGE_Y = 0.6;
/** drum kit centre on the stage (floor point under the bass drum), and Tony's stool behind it */
export const KIT: V3 = [CLUB[0], STAGE_Y, -2.6];
export const STOOL: V3 = [KIT[0], STAGE_Y, KIT[2] - 0.5];
export const ROOM_KIT: V3 = [ROOM[0] + 2.5, 0, -0.7];
export const BPM = 112;

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const easeOut = (u: number) => 1 - (1 - clamp01(u)) ** 4;

// ---------------- shots ----------------
export type Light = "day" | "golden" | "night";
export type Place = "club" | "street" | "room";
export type ShotDef = { id: number; a: number; b: number; light: Light; place: Place; sunAz?: number; sunEl?: number };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 172, light: "night", place: "club" },          // hook: four Tonys at one kit
  { id: 2, a: 172, b: 349, light: "day", place: "street" },        // Lagos, late 1950s; Tony hears a street band
  { id: 3, a: 349, b: 498, light: "golden", place: "room" },       // teaching himself: records, magazine, knee taps
  { id: 4, a: 498, b: 715, light: "night", place: "club" },        // first band job: claves
  { id: 5, a: 715, b: 778, light: "night", place: "club" },        // the drummer quits
  { id: 6, a: 778, b: 959, light: "night", place: "club" },        // luckily / unluckily / ready
  { id: 7, a: 959, b: 1022, light: "night", place: "club" },       // his secret is independence
  { id: 8, a: 1022, b: 1108, light: "day", place: "street", sunAz: 120 }, // a kid tries the head-and-tummy trick
  { id: 9, a: 1108, b: 1361, light: "night", place: "club" },      // feet, four limbs, one drum section
  { id: 10, a: 1361, b: 1716, light: "night", place: "club" },     // Fela, Afrobeat
  { id: 11, a: 1716, b: 1860, light: "golden", place: "room" },    // callback: the claves on the shelf
  { id: 12, a: 1860, b: TOTAL, light: "golden", place: "street", sunAz: -10, sunEl: 8 }, // Lagos at golden hour
];
/** crossfades (frames) at place/time changes; a white 4-frame flash after the hook */
export const XFADE: Record<number, number> = { 3: 8, 4: 8, 8: 6, 9: 6, 11: 10, 12: 12 };
export const FLASH_AT = 172;

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};

// ---------------- story beats (frames) ----------------
export const B = {
  copiesIn: 58, copiesOut: 141,      // hook: the four copies appear on "four", snap back on "two feet"
  stopWalk: 284,                     // Tony stops to listen to the street band
  clickA: 670, clickB: 691,          // claves clicks
  quit: 744,                         // the drummer quits (stands up)
  sitDown: 830,                      // Tony sits at the empty kit
  rivalsShock: 884,                  // rival drummers' faces drop
  ready: 938,                        // "ready": first hit
  pat: 1046, rub: 1064, tangle: 1090, // kid: pats head, rubs tummy, gets tangled
  lines: 1205, merge: 1276,          // four rhythm lines appear, then braid into one
  felaTurn: 1440,                    // Fela turns to Tony
  dance: 1490, afro: 1543,           // the crowd starts moving; "Afrobeat" lights up
};
/** is the band playing at frame f (and is Tony at the kit)? */
export const tonyAtKit = (id: number, f: number) => id === 1 || id === 7 || id === 9 || id === 10 || (id === 6 && f >= B.sitDown);

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Shot = Partial<Cam> & { pos: V3; look: V3 };
type Key = { f: number; dur?: number; cut?: boolean; s: (f: number) => Shot };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };
const mix = (a: Cam, b: Cam, k: number): Cam => ({
  pos: a.pos.map((v, i) => v + (b.pos[i] - v) * k) as V3, look: a.look.map((v, i) => v + (b.look[i] - v) * k) as V3,
  fov: a.fov + (b.fov - a.fov) * k, roll: a.roll + (b.roll - a.roll) * k,
});
const full = (c: Shot): Cam => ({ fov: 40, roll: 0, ...c });
const run = (keys: Key[], f: number) => {
  let cur = full(keys[0].s(f));
  for (let i = 1; i < keys.length; i++) {
    const k = keys[i];
    if (f < k.f) break;
    cur = k.cut ? full(k.s(f)) : mix(cur, full(k.s(f)), glide((f - k.f) / (k.dur ?? 24)));
  }
  return cur;
};
const T = (f: number) => f / FPS;
const pushK = (f: number, f0: number, rate: number, punch = 0, n = 35) => {
  const x = Math.max(0, f - f0);
  let s = rate * x;
  if (punch > rate) for (let i = 0; i < Math.min(x, n); i++) s += (punch - rate) * Math.max(0, Math.min(1, (i + 0.5) / 8, (n - i - 0.5) / 8));
  return Math.exp(-s);
};
const dolly = (pos: V3, look: V3, k: number, rest: Partial<Cam> = {}): Shot =>
  ({ pos: [look[0] + (pos[0] - look[0]) * k, look[1] + (pos[1] - look[1]) * k, look[2] + (pos[2] - look[2]) * k], look, ...rest });
const add = (a: V3, x: number, y: number, z: number): V3 => [a[0] + x, a[1] + y, a[2] + z];

/** Tony's walk along the street (shot 2): x on the east sidewalk, z grows until he stops at the band */
export const TONY_WALK = (f: number): V3 => {
  const t = Math.min(f, B.stopWalk) - 172;
  return [3.6, 0, -3.5 + 1.2 * (t / FPS) - 0.6 * (1 - Math.exp(-Math.max(0, f - B.stopWalk) / 6)) * 0];
};
export const STREET_BAND: V3 = [6.1, 0, 5.2];
export const KID_SPOT: V3 = [-4.4, 0, -14];

// club framings (all relative to the kit)
const head = add(STOOL, 0, 1.25, 0);
const C1a = (f: number) => dolly(add(KIT, 0.3, 2.05, 3.5), add(head, 0, -0.3, 0), pushK(f, 0, 0.0025), { fov: 38 });
const C1b = (f: number) => dolly(add(KIT, 0.4, 2.4, 6.4), add(head, 0, -0.35, -0.3), pushK(f, 58, 0.0018), { fov: 42 });
const C1c = (f: number) => dolly(add(KIT, -0.3, 2.0, 3.6), add(head, 0, -0.25, 0), pushK(f, 141, 0.004, 0.008, 30), { fov: 38, roll: 0.03 });
// shot 4: bandstand wide -> Tony with claves -> claves CU
const CLAVES_SPOT = add(KIT, -1.75, 0, -1.0);
export const TONY_CLAVES = CLAVES_SPOT;
const C4a = (f: number) => dolly(add(KIT, 0.8, 3.6, 10.5), add(KIT, -0.3, 1.0, -0.2), pushK(f, 498, 0.0015), { fov: 42 });
const C4b = (f: number) => dolly(add(CLAVES_SPOT, 0.6, 1.55, 3.0), add(CLAVES_SPOT, 0, 1.45, 0), pushK(f, 567, 0.0025), { fov: 38, roll: -0.03 });
const C4c = (f: number) => dolly(add(CLAVES_SPOT, 0.2, 1.15, 1.9), add(CLAVES_SPOT, 0, 1.05, 0), pushK(f, 611, 0.002), { fov: 36 });
// shot 5: the drummer at the kit -> he storms off -> empty stool in the spotlight
const C5a = (f: number) => dolly(add(KIT, 0.4, 2.05, 3.6), add(head, 0, -0.3, 0), pushK(f, 715, 0.002), { fov: 40 });
const C5b = (f: number) => dolly(add(KIT, -1.4, 1.8, 4.6), add(KIT, -0.4, 1.0, -0.3), pushK(f, 744, 0.0015), { fov: 42 });
const C5c = (f: number) => dolly(add(KIT, 0.2, 1.6, 3.1), add(STOOL, 0, 0.6, 0), pushK(f, 762, 0.003), { fov: 38 });
// shot 6: Tony looks at the stool -> sits -> the rival drummers -> "ready"
const C6a = (f: number) => dolly(add(CLAVES_SPOT, 1.3, 1.6, 2.6), add(CLAVES_SPOT, 0.4, 1.4, 0), pushK(f, 778, 0.0025), { fov: 38 });
const C6b = (f: number) => dolly(add(KIT, 0.5, 2.0, 3.4), add(head, 0, -0.3, 0), pushK(f, 830, 0.002), { fov: 38, roll: 0.03 });
export const RIVALS: V3 = [CLUB[0] + 1.4, 0, 4.2];
const C6c = (f: number) => dolly(add(RIVALS, -0.8, 1.6, -3.4), add(RIVALS, 0, 1.45, 0), pushK(f, 850, 0.002, 0.007, 30), { fov: 40, roll: -0.03 });
const C6d = (f: number) => dolly(add(KIT, -0.25, 2.0, 3.0), add(head, 0, -0.25, 0), pushK(f, 927, 0.003, 0.008, 25), { fov: 37 });
// shot 7: drumming, push in
const C7a = (f: number) => dolly(add(KIT, 0.9, 2.2, 4.4), add(head, 0, -0.35, 0), pushK(f, 959, 0.003), { fov: 38 });
// shot 8: the kid in the street
const C8a = (f: number) => dolly(add(KID_SPOT, 3.0, 1.1, 0.9), add(KID_SPOT, 0, 0.85, 0), pushK(f, 1022, 0.0022), { fov: 40 });
const C8b = (f: number) => dolly(add(KID_SPOT, 2.0, 1.0, 0.45), add(KID_SPOT, 0, 0.9, 0), pushK(f, 1088, 0.004), { fov: 38, roll: 0.04 });
// shot 9: feet CU -> four limbs -> pull back over the crowd
const C9a = (f: number) => dolly(add(KIT, -2.5, 0.95, -0.2), add(KIT, -0.05, 0.5, -0.4), pushK(f, 1108, 0.002), { fov: 40 });
const C9b = (f: number) => dolly(add(KIT, 0.2, 1.9, 5.4), add(head, 0, -0.1, 0), pushK(f, 1205, 0.0018), { fov: 40 });
const C9c = (f: number): Shot => { const u = glide((f - 1276) / 70); return { pos: add(KIT, 0.2 + 1.5 * u, 1.9 + 2.6 * u, 5.4 + 7.0 * u), look: add(head, -0.2 * u, -0.1 - 0.5 * u, 0), fov: 40 + 4 * u }; };
// shot 10: Fela (front of the stage) and Tony behind him -> the crowd -> Fela MS -> Tony
export const FELA: V3 = [CLUB[0] - 1.2, STAGE_Y, -0.9];
const C10a = (f: number) => dolly(add(FELA, 0.9, 1.6, 4.2), add(FELA, 0.55, 1.3, -0.8), pushK(f, 1361, 0.0018), { fov: 40 });
const C10b = (f: number) => dolly(add(FELA, 0.8, 1.6, 2.4), add(FELA, 0, 1.55, 0), pushK(f, 1431, 0.003), { fov: 38, roll: -0.03 });
const C10c = (f: number) => dolly(add(KIT, 2.4, 2.5, 12.5), add(KIT, -0.4, 1.0, 1.0), pushK(f, 1478, 0.0018, 0.006, 30), { fov: 44 });
const C10d = (f: number) => dolly(add(FELA, 0.5, 1.6, 2.2), add(FELA, 0, 1.6, 0), pushK(f, 1578, 0.0022), { fov: 38, roll: 0.03 });
const C10e = (f: number) => dolly(add(KIT, 0.3, 2.0, 3.3), add(head, 0, -0.3, 0), pushK(f, 1621, 0.0025, 0.007, 30), { fov: 38 });
// shot 11: the claves on the shelf -> pull back to the kit beside them
export const SHELF: V3 = [ROOM[0] + 1.3, 1.45, -1.85];
const C11a = (f: number) => dolly(add(SHELF, 0.25, 0.08, 1.2), add(SHELF, 0, 0.05, 0), pushK(f, 1716, 0.0025), { fov: 36 });
const C11b = (f: number): Shot => { const u = glide((f - 1776) / 60); return { pos: add(SHELF, 0.25 + 1.2 * u, 0.08 - 0.15 * u, 1.2 + 2.6 * u), look: add(SHELF, 0.5 + 0.5 * u, 0.05 - 0.6 * u, 0), fov: 36 + 6 * u }; };
// shot 12: Lagos at golden hour, crane up from the street toward the lagoon
const C12a = (f: number): Shot => { const u = glide((f - 1854) / 120); return { pos: [1.5, 1.8 + 9 * u, 18 - 6 * u], look: [0, 1.6 + 2.5 * u, 60], fov: 44 }; };

const CAMS: Record<number, Key[]> = {
  1: [{ f: 0, s: C1a }, { f: 52, dur: 26, s: C1b }, { f: 141, dur: 22, s: C1c }],
  2: [
    { f: 168, s: (f) => dolly([-1.0, 5.5, -22], [2.2, 1.2, 4], pushK(f, 168, 0.0015), { fov: 44 }) },
    { f: 258, cut: true, s: (f) => { const p = TONY_WALK(f); return dolly(add(p, -1.5, 1.45, 3.6), add(p, 0.15, 1.2, 0), pushK(f, 258, 0.0022), { fov: 40 }); } },
    { f: 307, dur: 28, s: (f) => { const p = TONY_WALK(f); return dolly(add(p, -1.0, 1.45, 2.5), add(p, 0.1, 1.35, 0), pushK(f, 307, 0.003, 0.006, 30), { fov: 38, roll: 0.03 }); } },
  ],
  3: [
    { f: 345, s: (f) => dolly(add(ROOM, 1.0, 1.3, 2.1), add(ROOM, -0.2, 0.75, -1.0), pushK(f, 345, 0.002), { fov: 42 }) },
    { f: 402, cut: true, s: (f) => dolly(add(ROOM, 1.55, 1.05, -0.75), add(ROOM, 1.3, 0.72, -1.45), pushK(f, 402, 0.0025), { fov: 36 }) },
    { f: 429, cut: true, s: (f) => dolly(add(ROOM, -1.55, 1.05, -0.45), add(ROOM, -1.6, 0.36, -1.35), pushK(f, 429, 0.002), { fov: 36 }) },
    { f: 460, cut: true, s: (f) => dolly(add(ROOM, -0.2, 1.05, 1.1), add(ROOM, -0.8, 0.75, -1.05), pushK(f, 460, 0.003), { fov: 38, roll: -0.03 }) },
  ],
  4: [{ f: 494, s: C4a }, { f: 567, cut: true, s: C4b }, { f: 611, cut: true, s: C4c }],
  5: [{ f: 715, s: C5a }, { f: 744, cut: true, s: C5b }, { f: 762, cut: true, s: C5c }],
  6: [{ f: 778, s: C6a }, { f: 830, cut: true, s: C6b }, { f: 850, cut: true, s: C6c }, { f: 927, cut: true, s: C6d }],
  7: [{ f: 959, s: C7a }],
  8: [{ f: 1019, s: C8a }, { f: 1088, cut: true, s: C8b }],
  9: [{ f: 1105, s: C9a }, { f: 1205, cut: true, s: C9b }, { f: 1276, cut: true, s: C9c }],
  10: [{ f: 1361, s: C10a }, { f: 1431, dur: 24, s: C10b }, { f: 1478, cut: true, s: C10c }, { f: 1578, cut: true, s: C10d }, { f: 1621, cut: true, s: C10e }],
  11: [{ f: 1711, s: C11a }, { f: 1776, cut: true, s: C11b }],
  12: [{ f: 1854, s: C12a }],
};

// impact kicks: image offset flips sign every frame, decays in 7 f
const KICKS: [number, number][] = [[T(B.quit), 0.6], [T(B.ready), 1.0], [T(B.afro), 0.8], [T(B.clickA), 0.3], [T(B.clickB), 0.3]];
export const kickAt = (t: number) => {
  let a = 0;
  for (const [t0, g] of KICKS) {
    const n = Math.floor((t - t0) * FPS + 1e-6);
    if (n >= 0 && n < 7) a += g * (n % 2 ? -1 : 1) * (1 - n / 7) ** 1.5;
  }
  return a;
};
export const camAt = (id: number, f: number): Cam => {
  const c = run(CAMS[id], f), a = kickAt(T(f));
  if (!a) return c;
  const d: V3 = [c.look[0] - c.pos[0], c.look[1] - c.pos[1], c.look[2] - c.pos[2]];
  const L = Math.hypot(...d), h = Math.hypot(d[0], d[2]) || 1;
  const m = (3 / 640) * Math.tan((c.fov * Math.PI) / 360) * L * a;
  return { ...c, look: [c.look[0] - (d[2] / h) * m, c.look[1] + 0.6 * m, c.look[2] + (d[0] / h) * m], roll: c.roll + a * 0.004 };
};

// ---------------- lens ----------------
export type Dof = { f: number; dur?: number; cInf: number; focus?: (f: number) => V3 };
export const DOF: Dof[] = [
  { f: 0, cInf: 12 }, { f: 52, dur: 26, cInf: 8 }, { f: 141, dur: 22, cInf: 12 },
  { f: 172, cInf: 0 }, { f: 258, cInf: 10 },
  { f: 349, cInf: 6 }, { f: 402, cInf: 14 }, { f: 460, cInf: 9 },
  { f: 498, cInf: 0 }, { f: 567, cInf: 12 }, { f: 611, cInf: 16 },
  { f: 715, cInf: 10 }, { f: 744, cInf: 4 }, { f: 762, cInf: 12 },
  { f: 778, cInf: 12 }, { f: 850, cInf: 12 }, { f: 927, cInf: 12 },
  { f: 959, cInf: 10 }, { f: 1022, cInf: 10 }, { f: 1108, cInf: 14 }, { f: 1205, cInf: 6 }, { f: 1276, dur: 40, cInf: 0 },
  { f: 1361, cInf: 8, focus: () => add(FELA, 0, 1.5, 0) }, { f: 1478, cInf: 0 }, { f: 1578, cInf: 12 }, { f: 1621, cInf: 12 },
  { f: 1716, cInf: 14 }, { f: 1776, dur: 60, cInf: 8 },
  { f: 1860, cInf: 0 },
];
export const dofAt = (f: number) => {
  let i = 0; while (i + 1 < DOF.length && f >= DOF[i + 1].f) i++;
  const d = DOF[i], p = DOF[Math.max(0, i - 1)];
  const k = d.dur ? Math.min(1, (f - d.f) / d.dur) : 1;
  return { cInf: p.cInf + (d.cInf - p.cInf) * k, focus: d.focus };
};
