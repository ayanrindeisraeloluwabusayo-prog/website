// Timeline of "The Lazy Wife's Garri": shots timed to the voice words (voice/words.json, 30 fps). Three places in one
// world: the family compound at the origin, the market at MARKET, and a dry far-away village at FAR (the 1981 line).
// Camera grammar from the owner's playbook: a new angle every 1-2 s (hard cuts), a slow push-in on every hold,
// low / high / over-the-shoulder views of the same set so it reads as a real place.
export const FPS = 30;
export const TOTAL = 1975;
export const D0 = 0;
export type V3 = [number, number, number];
export const MARKET: V3 = [70, 0, 0];
export const FAR: V3 = [-90, 0, 0];
// compound landmarks
export const SACK: V3 = [-6.0, 0, -6.2];        // her sack, in the corner by her hut
export const WIFE: V3 = [-4.9, 0, -5.3];        // where she usually sits / stands beside it
export const GRATE: V3 = [2.4, 0, -1.4];        // the family's grating table
export const PRESS: V3 = [5.0, 0, -3.6];        // their press
export const FRY: V3 = [3.4, 0, 2.0];           // their frying pan on the mud stove
export const BASINS: V3 = [0.2, 0, 4.4];        // the row of full basins
export const STOOL: V3 = [-0.9, 0, 0.9];        // mother-in-law's stool
export const BARN: V3 = [-5.6, 0, 4.6];         // yam barn
export const MAIZE: V3 = [12.5, 0, 0];          // maize patch east of the compound
export const FIELD: V3 = [0, 0, -22];           // cassava field behind the house
export const TABLE: V3 = [-2.6, 0, 3.4];        // small table used for the cut-open cassava (explanation)
export const STALL: V3 = [MARKET[0], 0, -2.6];  // the family's market stall
export const WIFE_STALL: V3 = [MARKET[0] + 4.2, 0, -2.2];
export const PAPER: V3 = [FAR[0] - 3.2, 1.35, -3.9]; // the newspaper pinned on a wall

export const clamp01 = (x: number) => Math.max(0, Math.min(1, x));
export const smooth = (x: number) => { const u = clamp01(x); return u * u * (3 - 2 * u); };
export const glide = (u: number) => { const x = clamp01(u); return x * x * x * (x * (6 * x - 15) + 10); };

export type Light = "day" | "golden" | "night" | "drought";
export type Place = "compound" | "market" | "far";
export type ShotDef = { id: number; a: number; b: number; light: Light; place: Place; sunAz?: number; sunEl?: number; dry?: boolean };
export const SHOTS: ShotDef[] = [
  { id: 1, a: 0, b: 123, light: "day", place: "compound", sunAz: 120 },      // she ties the sack; three days pass
  { id: 2, a: 123, b: 201, light: "day", place: "compound" },                  // in this compound, garri is money
  { id: 3, a: 201, b: 284, light: "day", place: "market", sunAz: 110 },       // whoever reaches the market first
  { id: 4, a: 284, b: 372, light: "day", place: "compound", sunAz: 110 },     // grate, press and fry on the same day
  { id: 5, a: 372, b: 516, light: "golden", place: "compound", sunAz: 105, sunEl: 14 }, // full basins; hers: one sack
  { id: 6, a: 516, b: 628, light: "day", place: "compound", sunAz: 120 },     // mother-in-law says it out loud
  { id: 7, a: 628, b: 683, light: "day", place: "market", sunAz: 110 },       // they sell out before noon
  { id: 8, a: 683, b: 781, light: "golden", place: "market", sunAz: 75, sunEl: 12 }, // she arrives on day three
  { id: 9, a: 781, b: 809, light: "day", place: "market", sunAz: 110 },       // theirs is quick
  { id: 10, a: 809, b: 878, light: "day", place: "compound", sunAz: 120 },    // the whole compound agrees: lazy
  { id: 11, a: 878, b: 1104, light: "drought", place: "compound", dry: true },// the rains fail
  { id: 12, a: 1104, b: 1123, light: "night", place: "compound", dry: true, sunAz: 140, sunEl: 40 }, // ... and night
  { id: 13, a: 1123, b: 1301, light: "drought", place: "compound", dry: true },// rushing it; the legs go stiff
  { id: 14, a: 1301, b: 1380, light: "golden", place: "compound", dry: true, sunAz: 100, sunEl: 15 }, // she cannot stand up
  { id: 15, a: 1380, b: 1619, light: "day", place: "compound", sunAz: 120 },  // you see: the hidden poison
  { id: 16, a: 1619, b: 1685, light: "drought", place: "compound", dry: true },// bitter cassava in a drought
  { id: 17, a: 1685, b: 1821, light: "golden", place: "far", dry: true, sunAz: 130, sunEl: 14 }, // 1981, Mozambique
  { id: 18, a: 1821, b: TOTAL, light: "golden", place: "compound", dry: true, sunAz: 105, sunEl: 14 }, // the only safe garri
];
export const XFADE: Record<number, number> = { 11: 8, 15: 6, 17: 8, 18: 10 };
export const FLASH_AT = -100; // no flash in this film

export const shotAt = (f: number) => SHOTS.find((s) => f >= s.a && f < s.b) ?? SHOTS[SHOTS.length - 1];
export const layersAt = (f: number): { id: number; alpha: number }[] => {
  for (const s of SHOTS) {
    const x = XFADE[s.id];
    if (x && f >= s.a - x / 2 && f < s.a + x / 2) return [{ id: s.id - 1, alpha: 1 }, { id: s.id, alpha: (f - (s.a - x / 2) + 1) / (x + 1) }];
  }
  return [{ id: shotAt(f).id, alpha: 1 }];
};
/** light at a frame: three days flick past over the sack in the hook, and again while the poison leaves */
const CYCLE: Light[] = ["day", "day", "golden", "night", "night"];
export const lightAt = (id: number, f: number): Light => {
  if (id === 1 && f >= 86) return CYCLE[Math.floor((f - 86) / 2.4) % 5];
  if (id === 15 && f >= 1500 && f < 1560) return CYCLE[Math.floor((f - 1500) / 4) % 5];
  return SHOTS[id - 1].light;
};
/** which "day" tally mark is showing in the two time-lapses (0-3) */
export const dayCount = (f: number) => (f < 86 ? 0 : f < 123 ? Math.min(3, 1 + Math.floor((f - 86) / 12)) : f >= 1500 && f < 1560 ? Math.min(3, 1 + Math.floor((f - 1500) / 20)) : 3);

// ---------------- story beats (frames) ----------------
export const B = {
  stone: 44,                 // she sets the stone on the sack
  mil: 562, raising: 595,    // mother-in-law's line
  lazy: 857,
  knees: 1213, toes: 1263, stool: 1334,
  open: 1403, cyanide: 1439, grate: 1469, air: 1538, water: 1564,
  serve: 1896,
};

// ---------------- camera ----------------
export type Cam = { pos: V3; look: V3; fov: number; roll: number };
type Key = { f: number; s: (f: number) => Cam };
const add = (a: V3, x: number, y: number, z: number): V3 => [a[0] + x, a[1] + y, a[2] + z];
/** a framing that pushes in from frame f0: `from` is the lens offset from the anchor, `to` the look offset */
const K = (f0: number, at: V3, from: V3, to: V3, fov = 40, rate = 0.0022, roll = 0, drift: V3 = [0, 0, 0]): Key => ({
  f: f0,
  s: (f) => {
    const x = Math.max(0, f - f0), k = Math.exp(-rate * x), look = add(at, ...to);
    const p = add(at, ...from);
    return { pos: [look[0] + (p[0] - look[0]) * k + drift[0] * x, look[1] + (p[1] - look[1]) * k + drift[1] * x, look[2] + (p[2] - look[2]) * k + drift[2] * x], look, fov, roll };
  },
});
const O: V3 = [0, 0, 0];
const CAMS: Record<number, Key[]> = {
  1: [
    K(0, SACK, [-0.5, 1.35, 3.0], [0.4, 0.95, 0.1], 38, 0.003),                 // CU: her hands tying the sack
    K(44, SACK, [0.2, 2.2, 2.6], [0.3, 1.0, 0.1], 40, 0.003, 0.03),              // high angle: the stone goes on
    K(65, SACK, [2.8, 1.25, 4.6], [0.3, 0.85, 0], 42, 0.0018),                // the corner, locked off: three days pass
  ],
  2: [
    K(123, O, [3, 11, 17], [0, 0.5, -1], 44, 0.002),                          // the compound from above
    K(171, BASINS, [0.9, 0.75, 1.6], [0, 0.4, 0], 36, 0.003, -0.03),          // garri is money: basin + coins
  ],
  3: [
    K(201, MARKET, [-7, 3.2, 9], [0, 1.2, -2], 44, 0.002),                    // the market road
    K(243, STALL, [1.2, 1.5, 3.0], [0, 1.15, 0], 38, 0.003, 0.03),            // first stall sells first
  ],
  4: [
    K(284, O, [-1.5, 2.4, 8.5], [3, 1.0, -0.5], 42, 0.002),                   // the family at work
    K(306, GRATE, [-0.5, 1.55, 2.1], [0, 1.1, -0.4], 36, 0.004),                // grate
    K(320, PRESS, [-1.3, 1.5, 2.8], [0, 1.0, -0.2], 38, 0.004, -0.03),           // press
    K(331, FRY, [0.5, 1.8, 2.5], [0, 1.0, -0.45], 38, 0.004, 0.03),               // fry
    K(350, FRY, [-2.6, 2.0, 3.2], [-0.4, 0.9, -0.6], 42, 0.002),              // ... on the same day
  ],
  5: [
    K(372, BASINS, [-2.2, 0.8, 2.2], [0.6, 0.45, 0], 38, 0.002, 0, [0.012, 0, 0]), // full basins, tracking along the row
    K(423, SACK, [2.6, 1.3, 3.6], [0.4, 0.8, 0.2], 40, 0.0025),               // hers?
    K(446, SACK, [1.3, 0.45, 2.7], [0, 0.8, 0], 38, 0.003, -0.03),            // one sack, tied tight (low angle)
    K(483, SACK, [0.9, 2.1, 1.9], [0, 1.3, 0], 36, 0.004),                    // under a heavy stone
  ],
  6: [
    K(516, STOOL, [0.9, 1.35, 3.0], [0, 1.15, 0], 38, 0.0025),                // mother-in-law
    K(562, STOOL, [-0.7, 1.45, 3.4], [0, 1.3, 0.45], 36, 0.003, 0.03),           // her line, close
    K(595, WIFE, [1.9, 1.3, 2.3], [-0.3, 1.1, -0.3], 38, 0.003),              // the wife, deadpan, beside the sack
    K(610, O, [-3.5, 1.6, 6.5], [1.2, 1.1, 0], 40, 0.003, -0.03),             // the family laughing
  ],
  7: [
    K(628, STALL, [-2.6, 2.3, 5.2], [0, 1.1, 0], 42, 0.0025),                 // customers crowd the family stall
    K(651, STALL, [0.7, 1.3, 1.5], [0, 0.95, -0.2], 34, 0.004, 0.03),         // the last basin scraped empty
  ],
  8: [
    K(683, MARKET, [9, 2.6, 8], [3, 1.0, -2], 44, 0.002),                     // the empty market, late light
    K(718, WIFE_STALL, [-1.4, 1.35, 2.6], [0, 1.15, 0], 38, 0.003, -0.03),    // she waits alone
    K(749, WIFE_STALL, [1.5, 1.45, 3.0], [0.65, 1.2, 0], 36, 0.004),            // a customer tastes it: sour
  ],
  9: [K(781, STALL, [0.5, 1.4, 2.0], [0, 1.2, 0], 36, 0.004, 0.03)],          // theirs is quick: counting money
  10: [
    K(809, O, [2.5, 4.5, 11], [-1.5, 0.8, -2], 44, 0.002),                    // the whole compound, pointing
    K(857, WIFE, [1.5, 1.2, 2.5], [-0.1, 1.05, 0], 34, 0.005, 0.03),       // "lazy"
  ],
  11: [
    K(878, O, [0, 1.2, 9], [0, 9, -30], 46, 0.001),                           // the sky: the rains fail
    K(913, O, [7.5, 0.35, 8.5], [5.5, 0.05, 6], 38, 0.004, 0.03),             // one month: the ground cracks
    K(929, MAIZE, [-2, 2.8, 6], [0, 0.4, 0], 44, 0.003),                      // two
    K(950, BARN, [2.6, 1.5, 4.4], [0.4, 1.1, 0.2], 38, 0.003, -0.03),             // the yams are gone
    K(983, MAIZE, [-2.4, 1.3, 4.2], [0.3, 0.9, 0.2], 38, 0.003),                  // the maize is gone
    K(1022, FIELD, [1.6, 0.5, 4.3], [0, 1.0, 0], 40, 0.003, 0.03),           // only the bitter cassava survives (low hero angle)
    K(1070, O, [-2.8, 1.6, 6.2], [0.4, 0.9, 1.2], 40, 0.003),                 // everybody eats garri, morning...
  ],
  12: [K(1104, O, [2.6, 1.5, 6.4], [0.4, 0.9, 1.2], 40, 0.003, -0.03)],       // ...and night
  13: [
    K(1123, GRATE, [0.6, 1.55, 2.1], [0, 1.1, -0.4], 36, 0.005, 0.04),           // rushing: grate
    K(1140, FRY, [-0.6, 1.8, 2.5], [0, 1.0, -0.45], 38, 0.005, -0.04),           // rushing: fry
    K(1157, BASINS, [1.6, 1.6, 2.6], [0, 0.5, 0], 40, 0.005),                 // faster than ever
    K(1177, O, [-1.6, 1.4, 8.4], [1.0, 1.1, 3.4], 40, 0.0025),                // the brother-in-law walks in
    K(1213, O, [-1.1, 0.5, 6.8], [0.2, 0.55, 3.4], 36, 0.004, 0.03),          // his knees (low angle)
    K(1247, O, [-1.8, 1.0, 7.8], [-0.2, 0.7, 4.7], 40, 0.003, -0.03),        // the children, on their toes
  ],
  14: [
    K(1301, STOOL, [1.6, 1.2, 3.2], [0, 0.95, 0], 40, 0.0025),                // she tries to stand
    K(1334, STOOL, [-0.5, 1.2, 1.7], [0, 1.2, 0], 34, 0.004, 0.03),           // her face
    K(1352, WIFE, [3.4, 1.5, 5.2], [1.6, 1.0, 2.2], 42, 0.003),               // the wife watching from her corner
  ],
  15: [
    K(1380, TABLE, [0.7, 1.35, 2.0], [0, 0.86, 0], 34, 0.003),                // a cassava root on the table
    K(1414, TABLE, [-0.1, 1.3, 1.5], [0, 0.9, 0], 34, 0.004, 0.03),      // cut open: the hidden poison
    K(1469, GRATE, [0.5, 1.5, 1.8], [0, 1.1, -0.2], 36, 0.004, -0.03),         // grating breaks it loose
    K(1500, SACK, [2.4, 1.3, 3.8], [0.3, 1.3, 0], 40, 0.002),                 // it needs time: into the air
    K(1560, SACK, [0.9, 0.22, 1.5], [0, 0.2, 0.2], 36, 0.004, 0.03),          // and into the water squeezed out
  ],
  16: [K(1619, FIELD, [-1.4, 0.5, 2.8], [0, 1.0, 0], 38, 0.0035, -0.03)],     // bitter cassava in a drought carries the most
  17: [
    K(1681, PAPER, [0.3, 0.0, 1.75], [0, 0, 0], 34, 0.003),                  // the old newspaper: 1981
    K(1732, FAR, [-6, 1.5, 9], [1, 0.9, 0], 42, 0.0025, -0.03),               // a drought and rushed cassava
    K(1766, FAR, [3, 3.0, 9.5], [0, 0.6, -1], 44, 0.001, 0, [-0.01, 0.022, 0.016]), // more than a thousand people (crane up)
  ],
  18: [
    K(1816, SACK, [1.7, 1.0, 2.9], [0.2, 0.9, 0], 38, 0.003),                 // that sour sack in the corner
    K(1859, WIFE, [3.8, 1.7, 5.4], [0.8, 1.0, 0.6], 42, 0.0025, -0.03),       // the family comes to her
    K(1896, WIFE, [3.6, 1.9, 6.2], [1.7, 1.0, 1.0], 38, 0.003, 0.03),       // she serves it
    K(1932, SACK, [3.6, 2.7, 6.6], [1.2, 0.8, 1.0], 42, 0.0015),              // the only safe garri: final wide on the corner
  ],
};
export const camAt = (id: number, f: number): Cam => {
  const keys = CAMS[id];
  let k = keys[0];
  for (const x of keys) if (f >= x.f) k = x;
  return k.s(f);
};
/** frame of the latest camera cut at or before f (for sound whooshes and QA) */
export const CUTS: number[] = Object.values(CAMS).flatMap((ks) => ks.map((k) => k.f)).sort((a, b) => a - b);

// ---------------- lens: blur for close-ups, sharp wides ----------------
const SHARP = new Set([123, 201, 284, 350, 628, 683, 809, 878, 929, 1766, 1932]);
export const dofAt = (f: number): { cInf: number; focus?: (f: number) => V3 } => {
  let last = 0;
  for (const c of CUTS) if (f >= c) last = c;
  const cam = camAt(shotAt(f).id, f), d = Math.hypot(cam.pos[0] - cam.look[0], cam.pos[1] - cam.look[1], cam.pos[2] - cam.look[2]);
  return { cInf: SHARP.has(last) ? 0 : d < 2.2 ? 16 : d < 4 ? 11 : 6 };
};
