// Light presets per time of day. The sun is CAMERA-RELATIVE and frozen per shot (world.ts update()):
// az = degrees from the shot camera's forward axis (0 = sun straight ahead = backlight, +90 = screen right,
// 180 = behind camera), el = elevation. lit/shade/lift are LINEAR RGB multipliers for shade.ts (may exceed 1).
// Field names follow lighting.md 9.1 exactly (the CHAR and POST agents read them); values are tuned on renders.
type C3 = [number, number, number];
export type LightPreset = {
  az: number; el: number;
  lit: C3; shade: C3; lift: C3; lambert: number; sideK: number; term: number;      // world two-tone (shade.ts)
  charTint: C3; charShade: number; charGrad: number; bodyGrad: number; sideTint: C3; // character cards (cast.ts)
  blob: C3; actorShadow: boolean;                                                    // contact blobs / card shadows
  top: string; hor: string; skyCurve: C3; fog: string; fogNear: number; fogFar: number; sunDisc: string; // depth.md 6.5
  sunCol: string; sunI: number; sky: string; ground: string; hemiI: number;         // three lights (unpatched mats only)
  bias: number; normalBias: number;
};
export type LightName = "day" | "golden" | "night" | "drought";
export const LIGHTS: Record<LightName, LightPreset> = {
  day: {
    az: 75, el: 48,
    lit: [1.58, 1.5, 1.33], shade: [0.3, 0.29, 0.36], lift: [0.05, 0.06, 0.11], lambert: 0.35, sideK: 0.84, term: 0.2,
    charTint: [1.0, 0.94, 0.92], charShade: 0.86, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.92, 0.90, 0.96],
    blob: [0.62, 0.58, 0.58], actorShadow: false,
    top: "#3e7fd2", hor: "#b8d0ec", skyCurve: [0.0, 0.5, 0.6], fog: "#b8d0ec", fogNear: 25, fogFar: 300, sunDisc: "#000000",
    sunCol: "#fff3e0", sunI: 2.8, sky: "#dcecff", ground: "#b49a78", hemiI: 0.55,
    bias: -0.00025, normalBias: 0.015,
  },
  golden: {
    az: 6, el: 7,
    lit: [1.5, 0.68, 0.24], shade: [0.15, 0.15, 0.3], lift: [0.04, 0.06, 0.17], lambert: 0.35, sideK: 0.82, term: 0.07,
    charTint: [1.0, 0.78, 0.56], charShade: 0.88, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.85, 0.80, 0.95],
    blob: [0.75, 0.74, 0.9], actorShadow: true,
    top: "#6a4f8c", hor: "#ffd08a", skyCurve: [0.05, 0.6, 1.0], fog: "#efb489", fogNear: 50, fogFar: 380, sunDisc: "#ffcf9e",
    sunCol: "#ffab5e", sunI: 5.5, sky: "#d8b0b8", ground: "#8a6a60", hemiI: 0.5,
    bias: -0.0006, normalBias: 0.03,
  },
  // drought: a white-hot high sun, bleached dusty sky, hard short shadows
  drought: {
    az: 60, el: 62,
    lit: [1.75, 1.6, 1.28], shade: [0.42, 0.34, 0.3], lift: [0.08, 0.06, 0.05], lambert: 0.35, sideK: 0.86, term: 0.15,
    charTint: [1.0, 0.95, 0.86], charShade: 0.84, charGrad: 0.07, bodyGrad: 0.2, sideTint: [0.95, 0.9, 0.88],
    blob: [0.6, 0.52, 0.48], actorShadow: false,
    top: "#9fb4c8", hor: "#f0dcb8", skyCurve: [0.0, 0.5, 0.6], fog: "#ecd6ae", fogNear: 14, fogFar: 150, sunDisc: "#fff2c8",
    sunCol: "#fff0d0", sunI: 3.2, sky: "#f0e2c8", ground: "#c8a070", hemiI: 0.6,
    bias: -0.00025, normalBias: 0.015,
  },
  // club at night: a warm stage spot as the "sun", deep blue shade, dark navy sky, warm string lights do the rest (bloom)
  night: {
    az: 40, el: 38,
    lit: [0.62, 0.74, 1.25], shade: [0.1, 0.12, 0.3], lift: [0.03, 0.04, 0.12], lambert: 0.35, sideK: 0.8, term: 0.12,
    charTint: [0.72, 0.8, 1.0], charShade: 0.78, charGrad: 0.1, bodyGrad: 0.25, sideTint: [0.78, 0.76, 0.95],
    blob: [0.6, 0.6, 0.8], actorShadow: true,
    top: "#0d1430", hor: "#2a2a5a", skyCurve: [0.0, 0.5, 0.6], fog: "#232650", fogNear: 30, fogFar: 160, sunDisc: "#000000",
    sunCol: "#a8c0ff", sunI: 2.6, sky: "#3a3f7a", ground: "#2a2030", hemiI: 0.4,
    bias: -0.0004, normalBias: 0.02,
  },
};

/** world-only look per light (sky stops by elevation in degrees, river colours, cloud palette). All colours are
 *  ON-SCREEN targets under the current PBR-Neutral tone map; world.ts pre-inverts the tone map (shade.ts untone). */
export type WorldLook = {
  sky: { c: string[]; e: number[] };                         // 5 stops: c[i] at elevation e[i] (deg), smoothstep between
  water: { near: string; mid: string; far: string; crest: string; trough: string; glint: string; shade: C3 };
  bounce: C3;                                                 // shade.ts uBounce: albedo x bounce on shaded faces turned to the lens
  sat: number;                                                // shade.ts uSat: world albedo saturation (1 = as painted)
  cloud: { lit: string; mid: string; shade: string };
};
export const LOOK: Record<LightName, WorldLook> = {
  day: {
    // depth.md 2.2: horizon #9fb6e6 just above the skyline, upper sky #5e93d9 at ~20 deg (grade: frame top #5997e2)
    sky: { c: ["#b8d0ec", "#9cbfea", "#6a9fe0", "#4f8cdb", "#3373cc"], e: [0, 3, 8, 16, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0, 0, 0],
    sat: 1.08,
  },
  golden: {
    // sunset, not dusk: #ffd08a horizon, peach/orange through ~10 deg, warm rose at 20, muted warm mauve only near the top
    // (the golden grade adds ~+11/255 blue to shadows/mids, so these lean warm)
    sky: { c: ["#ffc47c", "#f7ae78", "#e8967c", "#c4848e", "#8a6f8a"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#355f96", far: "#d4a48e", crest: "#d9a088", trough: "#16294f", glint: "#ffe2b0", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#ffd2a8", mid: "#f2a08f", shade: "#a98fc4" },
    bounce: [0.04, 0.02, 0.0],
    sat: 1.1,
  },
  night: {
    sky: { c: ["#2c2a58", "#232552", "#1a1d46", "#121638", "#0a0e26"], e: [0, 4, 10, 20, 40] },
    water: { near: "#1e3a6e", mid: "#1a2f5c", far: "#2a2a5a", crest: "#4a6aa0", trough: "#0e1a38", glint: "#ffd890", shade: [0.42, 0.46, 0.72] },
    cloud: { lit: "#3a3c6a", mid: "#2c2e5a", shade: "#1e2048" },
    bounce: [0.03, 0.015, 0.0],
    sat: 1.1,
  },
  drought: {
    sky: { c: ["#f0dcb8", "#e6d6b8", "#cfd0c4", "#b4c2cc", "#98b0c8"], e: [0, 4, 10, 20, 40] },
    water: { near: "#22a7b6", mid: "#167fb2", far: "#1a5596", crest: "#7ddfe8", trough: "#0e4a80", glint: "#ffffff", shade: [0.5, 0.56, 0.72] },
    cloud: { lit: "#fbf8f1", mid: "#e1e5f3", shade: "#c3cbe9" },
    bounce: [0.05, 0.03, 0.0],
    sat: 0.9,
  },
};
