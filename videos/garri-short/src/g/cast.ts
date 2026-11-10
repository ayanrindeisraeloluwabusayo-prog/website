// The garri story's cast as lit flat cards in the 3D world (canvas pool, cardShade, contact blobs, unlit effect
// cards from the cartoon-3d-short template) and stage(): who stands where, doing what, at every frame.
import * as THREE from "three";
import { Pen, bodyFront, bodySide, fxBurst, fxStars, fxShadow, fxContact, INK, Outfit, Expr, FrontOpts, SideOpts, BROWN } from "./toon";
import { FPS, V3, B, SACK, WIFE, GRATE, PRESS, FRY, BASINS, STOOL, BARN, MAIZE, FIELD, TABLE, STALL, WIFE_STALL, MARKET, FAR, smooth, clamp01, Light } from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";

type Entry = { cv: HTMLCanvasElement; tex: THREE.CanvasTexture; w: number; h: number };
export type Req = { key: string; w: number; h: number; k: number; draw: (p: Pen) => void; tex?: THREE.CanvasTexture };
const makeEntry = (w: number, h: number): Entry => {
  const cv = document.createElement("canvas");
  cv.width = w; cv.height = h;
  const tex = new THREE.CanvasTexture(cv);
  tex.colorSpace = THREE.SRGBColorSpace; tex.anisotropy = 8;
  return { cv, tex, w, h };
};
export class Pool {
  private live = new Map<string, Entry>();
  private free: Entry[] = [];
  private reqs: Req[] = [];
  req(key: string, w: number, h: number, k: number, draw: (p: Pen) => void) {
    const r: Req = { key: `${w}x${h}|${key}`, w, h, k, draw };
    this.reqs.push(r);
    return r;
  }
  flush() {
    const want = new Map<string, Req[]>();
    for (const r of this.reqs) { const l = want.get(r.key); if (l) l.push(r); else want.set(r.key, [r]); }
    for (const [key, e] of this.live) if (!want.has(key)) { this.live.delete(key); this.free.push(e); }
    for (const [key, rs] of want) {
      let e = this.live.get(key);
      if (!e) {
        const r = rs[0], i = this.free.findIndex((x) => x.w === r.w && x.h === r.h);
        e = i >= 0 ? this.free.splice(i, 1)[0] : makeEntry(r.w, r.h);
        const g = e.cv.getContext("2d")!;
        g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, e.w, e.h); g.setTransform(r.k, 0, 0, r.k, 0, 0);
        r.draw(new Pen(g));
        e.tex.needsUpdate = true;
        this.live.set(key, e);
      }
      for (const r of rs) r.tex = e.tex;
    }
    this.reqs = [];
  }
}

// ---------------- sprite meshes ----------------
const blank = (() => { const c = document.createElement("canvas"); c.width = c.height = 2; return new THREE.CanvasTexture(c); })();
export const SU = 0.00216; // metres per design unit: 1000 units = 2.16 m
export const SU_SWING = 2.3 / 1830; // swing canvas: rope of 1830 units = 2.3 m
const BODY = (() => { const g = new THREE.PlaneGeometry(600 * SU, 1000 * SU); g.translate(0, (975 - 500) * SU, 0); return g; })();
const CARD = new THREE.PlaneGeometry(1, 1);
/** world roots that hold actors (to find the scene's sun when world.ts does not pass it) */
const ROOTS = new Set<THREE.Object3D>();

/** lit flat character: cardShade() material, receives shadows (dims to the bright floor only), casts its silhouette
 *  when world.ts says so (golden). Drawn after the contact blobs (renderOrder 1). */
export class Actor {
  mesh: THREE.Mesh; mat: THREE.MeshLambertMaterial; dmat: THREE.MeshDepthMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D, geo: THREE.BufferGeometry = BODY) {
    this.mat = cardShade(new THREE.MeshLambertMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide }));
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.dmat = new THREE.MeshDepthMaterial({ depthPacking: THREE.RGBADepthPacking, map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mesh = new THREE.Mesh(geo, this.mat);
    this.mesh.customDepthMaterial = this.dmat;
    // rim width is in output pixels: tell the card shader the render height (1920 = 1080 x 1920 frame)
    this.mesh.onBeforeRender = (r) => { const rt = r.getRenderTarget(); CARD_K.uPx.value = (rt ? rt.height : r.domElement.height) / 1920; };
    this.mesh.castShadow = false; this.mesh.receiveShadow = true; this.mesh.visible = false;
    this.mesh.rotation.order = "YXZ"; this.mesh.renderOrder = 1; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
    ROOTS.add(parent);
  }
  bind() { const t = this.r?.tex; if (t) { this.mat.map = t; this.dmat.map = t; } }
}
/** unlit effect card: hard cut-out (ink drawings), soft see-through (dust, mist) or a multiply ground blob */
export class Fx {
  mesh: THREE.Mesh; mat: THREE.MeshBasicMaterial; soft: THREE.MeshBasicMaterial; blob: THREE.MeshBasicMaterial; r: Req | null = null;
  constructor(parent: THREE.Object3D) {
    this.mat = new THREE.MeshBasicMaterial({ map: blank, alphaTest: 0.5, side: THREE.DoubleSide });
    this.mat.alphaToCoverage = false; // A2C + MSAA left 1 px sky-depth seams on blurred far cards (POST)
    this.soft = new THREE.MeshBasicMaterial({ map: blank, transparent: true, depthWrite: false, side: THREE.DoubleSide });
    this.blob = blobMaterial(blank);
    this.mesh = new THREE.Mesh(CARD, this.mat);
    this.mesh.visible = false; this.mesh.layers.set(NOINK);
    parent.add(this.mesh);
  }
  use(soft: boolean) { this.mesh.material = soft ? this.soft : this.mat; }
  bind() {
    const t = this.r?.tex;
    if (!t) return;
    if (this.r!.key.includes("|blob|")) {
      // no mipmaps: at grazing views the mip chain averages the blob with its white surround and it fades out
      if (t.generateMipmaps) { t.generateMipmaps = false; t.minFilter = THREE.LinearFilter; t.needsUpdate = true; }
      this.blob.map = t; this.mesh.material = this.blob; this.mesh.renderOrder = 0.5;
    }
    else { this.mat.map = t; this.soft.map = t; this.mesh.renderOrder = 0; }
  }
}

// ---------------- placements ----------------
export type Place = {
  key: string; draw: (p: Pen) => void; x: number; y: number; z: number;
  scale?: number; mirror?: boolean; yaw?: number; geo?: "body" | "swing"; roll?: number; size?: [number, number, number];
};
export type FxPlace = { key: string; cw: number; ch: number; draw: (p: Pen) => void; x: number; y: number; z: number; w: number; h: number; flat?: boolean; rot?: number; soft?: boolean };
/** sun = world direction TOWARD the sun (optional: when absent the scene's shadow-casting light is used) */
export type CamInfo = { pos: THREE.Vector3; right: THREE.Vector3; sun?: THREE.Vector3 };

const hh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };
const q = (v: number, n = 120) => Math.round(v * n) / n;
/** head-shape seed: 7 shapes, so marching soldiers in step still share canvases */
const seedOf = (i: number) => ((i * 5 + 3) % 7) + 1;
/** drawing resolution by distance: [canvas w, h, scale from the 600 x 1000 design]; sized for the 1440 x 2560 final */
const tier = (d: number): [number, number, number] =>
  d < 3.2 ? [1800, 3000, 3.0] : d < 6.5 ? [1080, 1800, 1.8] : d < 16 ? [480, 800, 0.8] : [240, 400, 0.4];

// ---------------- light ----------------
const SUN = new THREE.Vector3(0.5, 0.75, -0.4).normalize();
const tmp = new THREE.Vector3();
let LNAME: "day" | "golden" | "night" | "drought" = "day";
const sunOf = (root: THREE.Object3D) => {
  let s: THREE.DirectionalLight | null = null;
  root.traverse((o) => { if (!s && o instanceof THREE.DirectionalLight && o.castShadow) s = o; });
  return s as THREE.DirectionalLight | null;
};
/** the sun of the world that is calling: the attached root whose sun target sits on this camera's view axis */
const findSun = (cam: CamInfo, out: THREE.Vector3) => {
  if (cam.sun) return out.copy(cam.sun).normalize();
  let best: THREE.DirectionalLight | null = null, err = Infinity;
  for (const r of ROOTS) {
    if (!r.parent) continue;
    const s = sunOf(r);
    if (!s) continue;
    const d = tmp.copy(s.target.position).sub(cam.pos), e = Math.abs(d.dot(cam.right)) / (d.length() || 1);
    if (e < err) { err = e; best = s; }
  }
  return best ? out.copy(best.position).sub(best.target.position).normalize() : out;
};
/** canvas angle the sun comes FROM on an upright card facing the camera, in 45-degree steps (small texture cache) */
const light2D = (cam: CamInfo, mirror: boolean) => {
  const sx = SUN.dot(cam.right) * (mirror ? -1 : 1), sy = -SUN.y;
  return Math.round(Math.atan2(sy, sx) / (Math.PI / 4)) * (Math.PI / 4);
};

/** front / side view and mirroring for someone at (x, z) walking along (dx, dz); fs = foreshortening of the walk */
const viewOf = (cam: CamInfo, x: number, z: number, dx: number, dz: number) => {
  const tx = cam.pos.x - x, tz = cam.pos.z - z, tl = Math.hypot(tx, tz) || 1;
  const c = (tx * dx + tz * dz) / tl;
  return { side: c < 0.57, mirror: dx * cam.right.x + dz * cam.right.z < 0, fs: Math.round(Math.sqrt(Math.max(0, 1 - c * c)) * 20) / 20 };
};

// ---------------- life: blinks and reaction timing ----------------
/** reference expression and action changes land 0-3 f before the word onset */
const LEAD = 2 / FPS;
/** eyelid 0 open .. 1 shut. Reference: gaps 0.5-2.3 s, 4-frame blink half / shut / shut / half, plus a blink across
 *  every expression swap (the shut frames hide the swap) */
const LID = [0.5, 1, 1, 0.5];
const lidAt = (t: number, i: number, swaps: number[] = []) => {
  const f = Math.round(t * FPS);
  for (const ts of swaps) { const k = f - Math.round((ts - LEAD) * FPS) + 1; if (k >= 0 && k < 4) return LID[k]; }
  let s = Math.round(-60 * hh(i, 9));
  for (let n = 0; s <= f && n < 400; n++) {
    const k = f - s;
    if (k >= 0 && k < 4) return LID[k];
    s += Math.round(15 + 54 * hh(i * 31 + n, 13)); // next blink 0.5-2.3 s later
  }
  return 0;
};
const fkey = (o: object) => JSON.stringify(o, (_k, v) => (typeof v === "number" ? q(v) : v));

type Who = { i: number; o: Outfit; okey: string };
/** one character drawing in the 600 x 1000 design space, sized by distance, lit from the scene's sun */
const person = (cam: CamInfo, who: Who, x: number, y: number, z: number, view: { side: boolean; mirror: boolean }, fo: FrontOpts, so: SideOpts, scale = 1): Place & { tierKey: string } => {
  const d = cam.pos.distanceTo(tmp.set(x, y + 1.2, z)) / scale;
  const [w, h, k] = tier(d);
  const mirror = view.side && view.mirror, light = light2D(cam, mirror), seed = seedOf(who.i);
  const f2: FrontOpts = { ...fo, light, seed }, s2: SideOpts = { ...so, light, seed };
  const key = view.side ? `S|${who.okey}|${fkey(s2)}` : `F|${who.okey}|${fkey(f2)}`;
  return {
    key, x, y, z, scale, mirror, tierKey: `${w}`,
    draw: (p) => (view.side ? bodySide(p, who.o, s2) : bodyFront(p, who.o, f2)),
    size: [w, h, k],
  };
};

/** ground shadow under a standing / sitting card (review rounds 2-4), multiply, blue-violet: a TIGHT contact pool right under
 *  the feet (~.5 on screen at the core) so nobody floats, plus by day (cards cast no real shadow) a lighter soft tail
 *  stretched AWAY from the sun, length ~1.6 m / tan(sun elevation), capped. Golden: world.ts casts real card shadows. */
const CONTACT: Record<"day" | "golden" | "night" | "drought", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.3, 0.26, 0.4], drought: [0.3, 0.24, 0.24] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day" || LNAME === "drought") {
    const el = Math.asin(Math.min(0.99, Math.max(0.1, SUN.y)));
    const len = Math.min(2.4, Math.max(0.5, 1.6 / Math.tan(el))) * sc, h = len + 0.55 * sc, c = 0.3 * h; // feet at v = .2 of the card
    const tc = hexOf(TAIL, k);
    out.fx.push({ key: `blob|shadow|${tc}`, cw: 128, ch: 256, draw: (p) => fxShadow(p, tc), x: x + ox * c, y: y + 0.018, z: z + oz * c,
      w: 0.72 * sc, h, flat: true, rot });
  }
  const cc = hexOf(CONTACT[LNAME], k);
  out.fx.push({ key: `blob|contact|${cc}`, cw: 128, ch: 128, draw: (p) => fxContact(p, cc), x: x + ox * 0.03 * sc, y: y + 0.022, z: z + oz * 0.03 * sc,
    w: 0.52 * sc, h: 0.4 * sc, flat: true, rot });
};

// ---------------- the Lagos cast ----------------

// ---------------- the cast ----------------
export type Stage = { places: Place[]; fx: FxPlace[] };
const HAIR = "#1a1214";
const man = (jacket: string, skin: number, extra: Partial<Outfit> = {}): Outfit => ({ jacket, pants: "#3a3442", boots: "#2a2024", hat: "afro", hair: HAIR, skin: BROWN[skin], ...extra });
const woman = (jacket: string, dress: string, gele: string, skin: number, extra: Partial<Outfit> = {}): Outfit => ({ jacket, dress, pants: "#3a3442", boots: "#2a2024", hat: "gele", cap: gele, skin: BROWN[skin], ...extra });
const WIFE_O = woman("#2f9a8a", "#1f6f9a", "#f2b632", 1);
const MIL_O = woman("#8a3aa0", "#6a2a86", "#d0402f", 2, { build: "stout" });
const SIL_O = woman("#e0688a", "#c2466e", "#2f6fc0", 3);
const BIL_O = man("#e8742a", 0);
const HUS_O = man("#3d6fc0", 4, { moustache: HAIR });
const KID_A = man("#f2b632", 1, { build: "kid", pants: "#3b5b9a" });
const KID_B: Outfit = { ...woman("#e2453c", "#e2453c", "#f4efe2", 3), build: "kid", hat: "afro", hair: HAIR };
const SHIRTS = ["#d0402f", "#2f6fc0", "#f2b632", "#5d7a3a", "#c25a7a", "#2f8a78", "#e8742a", "#7b5ac9", "#f4f1ea", "#d9a441"];
const FOLK = Array.from({ length: 12 }, (_, i) => (i % 2 ? woman(SHIRTS[(i * 3 + 1) % 10], SHIRTS[(i * 7 + 4) % 10], SHIRTS[(i * 5 + 2) % 10], i % 5) : man(SHIRTS[(i * 3 + 1) % 10], i % 5, i % 4 === 0 ? { pants: "#efe3cb" } : {})));

type H2 = [number, number];
const who = (i: number, o: Outfit, key: string) => ({ i, o, okey: key });
const lid = (f: number, i: number) => lidAt(f / FPS, i);
const q30 = (u: number) => Math.round(clamp01(u) * 30) / 30;
const qn = (v: number, n = 40) => Math.round(v * n) / n;
const hq = (h: H2): H2 => [Math.round(h[0]), qn(h[1])];
let CAM: CamInfo, OUT: Stage, F = 0;
/** one front-view character; hands are quantised so nearly equal poses share a drawing */
const C = (i: number, o: Outfit, key: string, at: V3, fo: FrontOpts = {}, scale = 1, shadow = true) => {
  const fo2: FrontOpts = { blink: lid(F, i), mode: "stand", ...fo };
  if (fo2.hands) fo2.hands = [fo2.hands[0] ? hq(fo2.hands[0]) : null, fo2.hands[1] ? hq(fo2.hands[1]) : null];
  if (fo2.tilt !== undefined) fo2.tilt = Math.round(fo2.tilt * 2) / 2;
  OUT.places.push(person(CAM, who(i, o, key), at[0], at[1], at[2], { side: false, mirror: false }, fo2, {}, scale));
  if (shadow) blob(OUT, at[0], Math.max(0, at[1] > 0.2 ? 0 : at[1]), at[2], scale);
};
const add = (a: V3, x: number, y: number, z: number): V3 => [a[0] + x, a[1] + y, a[2] + z];
const seat = (a: V3, h: number): V3 => [a[0], h - 0.153, a[2]];
const FX = (key: string, cw: number, ch: number, draw: (p: Pen) => void, at: V3, w: number, h: number, rot = 0) =>
  OUT.fx.push({ key, cw, ch, draw, x: at[0], y: at[1], z: at[2], w, h, rot });

// ---- effect drawings ----
const GREEN = "#7ad23a";
/** a rising curl of "poison" on a 200 x 300 canvas; t = phase 0..1 */
const wispDraw = (t: number, col = GREEN) => (p: Pen) => {
  const pts: [number, number][] = [];
  for (let i = 0; i <= 22; i++) { const u = i / 22; pts.push([100 + Math.sin(u * 7 + t * 6.283) * (16 + 34 * u), 280 - u * 250]); }
  p.line(pts, col, 16);
  p.ell(pts[22][0], pts[22][1] - 4, 15, 15, col, 9);
};
const skullDraw = (p: Pen) => {
  p.ell(100, 88, 70, 64, GREEN, 12);
  p.poly([[62, 130], [138, 130], [130, 176], [70, 176]], GREEN, 12);
  p.ell(74, 90, 17, 20, INK, 0); p.ell(126, 90, 17, 20, INK, 0);
  p.poly([[100, 110], [90, 128], [110, 128]], INK, 0);
  for (const x of [86, 100, 114]) p.stroke([[x, 150], [x, 174]], 6);
};
const coinDraw = (p: Pen) => { p.ell(60, 60, 44, 44, "#f2c230", 9); p.ell(60, 60, 26, 26, "#ffe27a", 5); };
const dropDraw = (p: Pen) => { p.poly([[40, 8], [66, 62], [40, 92], [14, 62]], "#a8d87a", 8); };
const zigDraw = (p: Pen) => { p.stroke([[20, 20], [60, 50], [24, 84], [64, 116], [28, 150]], 16, "#f6f2e6"); p.stroke([[20, 20], [60, 50], [24, 84], [64, 116], [28, 150]], 8, "#d0402f"); };
const linesDraw = (t: number) => (p: Pen) => { for (let i = 0; i < 5; i++) { const y = 30 + i * 46 + 12 * Math.sin(t * 6.283 + i); p.stroke([[20 + 30 * (i % 2), y], [230 - 40 * ((i + 1) % 2), y]], 10, "#ffffff"); } };
const smokeDraw = (t: number) => (p: Pen) => { for (const [x, y, r] of [[110, 190, 50], [150, 130, 62], [100, 80, 46]] as const) p.ell(x + 10 * Math.sin(t * 6.283 + y), y, r, r * 0.85, "#e8e4de", 8); };

const wisps = (at: V3, n: number, spread: number, rise: number, size: number, seed = 0, speed = 0.5) => {
  for (let i = 0; i < n; i++) {
    const u = ((F / FPS) * speed + i / n + seed * 0.37) % 1, ph = q30(u);
    const a = i * 2.4 + seed;
    FX(`wisp${ph}`, 200, 300, wispDraw(ph), [at[0] + Math.cos(a) * spread * (0.4 + 0.6 * u), at[1] + u * rise, at[2] + Math.sin(a) * spread * 0.4], size * (0.6 + 0.6 * u) * (1 - 0.5 * u * u), size * 1.5 * (0.6 + 0.6 * u) * (1 - 0.5 * u * u));
  }
};
const coins = (at: V3, f0: number, n = 5) => {
  for (let i = 0; i < n; i++) {
    const u = (F - f0 - i * 5) / 18;
    if (u < 0 || u > 1) continue;
    FX("coin", 120, 120, coinDraw, [at[0] + 0.12 * Math.sin(i * 2.3), at[1] + 0.6 * (1 - u * u), at[2] + 0.05 * i], 0.11, 0.11, u * 4);
  }
};

// ---- recurring bits of acting ----
const grateHands = (speed: number): FrontOpts => { const s = Math.sin((F / FPS) * 6.283 * speed); return { hands: [[-8 + 3 * s, 0.6 + 0.16 * s], [8 + 3 * s, 0.62 + 0.16 * s]] }; };
const pressHands = (): FrontOpts => { const s = Math.abs(Math.sin((F / FPS) * 5)); return { hands: [[-22, 0.42 + 0.12 * s], [22, 0.42 + 0.12 * s]], tilt: 2 * s }; };
const fryHands = (speed: number): FrontOpts => { const s = Math.sin((F / FPS) * 6.283 * speed); return { hands: [[-26, 0.75], [16 + 12 * s, 0.5]], hold: "pole", stick: [0, 176 + 14 * s] }; };
const eatHands = (i: number): FrontOpts => { const s = smooth(0.5 + 0.5 * Math.sin((F / FPS) * 5 + i * 1.9)); return { hands: [[-24, 0.62], [10 - 4 * s, 0.6 - 0.62 * s]], hold: "bowl" }; };
const pointLeft: FrontOpts = { hands: [[-92, 0.22], [28, 0.95]] };
const talk = (a: number, b: number, yes: Expr, no: Expr): Expr => (F >= a && F < b && Math.floor(F / 4) % 2 === 0 ? yes : no);

/** the family at their work stations (wide shots and the three close-ups) */
const workYard = (speed = 1, mood: Expr = "smile_closed") => {
  C(2, BIL_O, "bil", add(GRATE, 0, 0, -0.8), { expr: mood, ...grateHands(1.6 * speed) });
  C(4, HUS_O, "hus", add(PRESS, 0, 0, -0.55), { expr: mood, ...pressHands() });
  C(3, SIL_O, "sil", add(FRY, 0, 0, -0.95), { expr: mood, ...fryHands(0.9 * speed) });
};
const wifeSeated = (expr: Expr = "neutral", look = 0, fo: FrontOpts = {}) => C(0, WIFE_O, "wife", seat(WIFE, 0.26), { mode: "sit", expr, look, hands: [[-30, 1.1], [30, 1.1]], ...fo });
const milSeated = (expr: Expr, fo: FrontOpts = {}, at: V3 = STOOL, dy = 0) => C(1, MIL_O, "mil", [at[0], 0.45 - 0.153 + dy, at[2]], { mode: "sit", expr, hands: [[-34, 1.12], [34, 1.12]], ...fo });
const kids = (at: V3, expr: Expr = "grin") => {
  const ph = q30(((F / FPS) * 1.2) % 1);
  C(5, KID_A, "kida", add(at, 0, 0, 0), { mode: "stroll", phase: ph, expr });
  C(6, KID_B, "kidb", add(at, 0.8, 0, 0.3), { mode: "stroll", phase: q30((ph + 0.4) % 1), expr });
};
const passers = (centre: V3, n: number, zr: [number, number], skip?: (x: number, z: number) => boolean) => {
  for (let i = 0; i < n; i++) {
    const dir = hh(i, 4) < 0.5 ? 1 : -1, speed = 0.7 + 0.5 * hh(i, 3);
    const x = centre[0] - 11 + ((i * 3.7 + dir * speed * F / FPS) % 22 + 22) % 22, z = zr[0] + hh(i, 5) * (zr[1] - zr[0]);
    if (skip && skip(x, z)) continue;
    const view = viewOf(CAM, x, z, dir, 0), o = FOLK[i % FOLK.length];
    if (view.side) { OUT.places.push(person(CAM, who(i + 30, o, `folk${i % 12}`), x, 0, z, view, {}, { mode: "march", phase: q30((F * speed / 26 + hh(i, 6)) % 1), stride: 0.5 * view.fs, expr: "smile", blink: lid(F, i + 30) }, 1)); blob(OUT, x, 0, z); }
    else C(i + 30, o, `folk${i % 12}`, [x, 0, z], { mode: "stroll", phase: q30((F / 26 + hh(i, 6)) % 1), expr: i % 3 ? "smile" : "neutral" });
  }
};

/** cast for shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo, light: Light): Stage => {
  const out: Stage = { places: [], fx: [] };
  CAM = cam; OUT = out; F = f;
  LNAME = light;
  findSun(cam, SUN);
  const t = f / FPS;
  switch (id) {
    case 1: {
      if (f < 65) {
        // she ties the neck of the sack, then lowers the stone onto it
        const tie = Math.sin(t * 9), down = smooth((f - B.stone) / 12);
        const hands: [H2, H2] = f < 30 ? [[-40 + 6 * tie, 0.02 + 0.05 * tie], [-18 - 6 * tie, -0.02 - 0.05 * tie]]
          : [[-58, -0.6 + 0.45 * down], [-22, -0.6 + 0.45 * down]];
        C(0, WIFE_O, "wife", add(SACK, 0.8, 0, 0.3), { expr: "neutral", hands, look: -1, facing: -1 });
      } else wifeSeated("smile_closed");
      break;
    }
    case 2: {
      workYard(); milSeated("stern"); wifeSeated("smile_closed"); kids([-2.6, 0, 4.2]);
      if (f >= 171) coins(add(BASINS, 0, 0.45, 0.1), 176, 6);
      break;
    }
    case 3: {
      C(1, MIL_O, "mil", add(STALL, -0.5, 0, -0.75), { expr: "grin", hands: f >= 243 ? [[-10, 0.55], [26, 0.42 + 0.06 * Math.sin(t * 8)]] : [[-30, 0.8], [30, 0.8]] });
      C(3, SIL_O, "sil", add(STALL, 0.6, 0, -0.8), { expr: "smile" });
      C(40, FOLK[2], "cust2", add(STALL, 1.5, 0, 0.9), { expr: "smile", hands: [[-40, 0.5], [20, 0.9]] });
      C(41, FOLK[5], "cust5", add(STALL, -1.6, 0, 1.0), { expr: "grin" });
      passers(MARKET, 12, [1.5, 6], (x, z) => Math.abs(x - STALL[0]) < 1.2 && z < 3.4);
      if (f >= 243) coins(add(STALL, 0.2, 1.0, 0.2), 246, 6);
      break;
    }
    case 4: { workYard(); if (f < 306 || f >= 350) { milSeated("smile_closed"); kids([-2.6, 0, 4.2]); wifeSeated("neutral"); } break; }
    case 5: {
      if (f < 423) {
        [BIL_O, SIL_O, HUS_O].forEach((o, i) => C(2 + i, o, ["bil", "sil", "hus"][i], add(BASINS, -1.2 + i * 1.3, 0, -1.0 - 0.15 * (i % 2)), { expr: i === 1 ? "laugh" : "grin", hands: [[-36, 0.92], [36, 0.92]] }));
        milSeated("grin");
      } else wifeSeated("smile_closed", 0, f >= 483 ? {} : { look: -1 });
      break;
    }
    case 6: {
      const line = f >= B.mil && f < 624;
      C(1, MIL_O, "mil", add(STOOL, 0, 0, 0.45), { expr: line ? talk(B.mil, 624, "relief_open", "stern") : "stern", ...(f >= 540 ? pointLeft : {}), look: -1, facing: -1 });
      if (f >= 595) {
        wifeSeated("neutral");
        [BIL_O, SIL_O, HUS_O].forEach((o, i) => C(2 + i, o, ["bil", "sil", "hus"][i], [1.0 + i * 1.15, 0, -0.5 + 0.3 * (i % 2)], { expr: f >= 606 ? "laugh" : "grin", tilt: f >= 606 ? 3 * Math.sin(t * 9 + i) : 0, look: -1 }));
        kids([-2.4, 0, 2.6], "laugh");
      }
      break;
    }
    case 7: {
      C(1, MIL_O, "mil", add(STALL, -0.5, 0, -0.75), { expr: "laugh", hands: [[-10, 0.55], [26, 0.42 + 0.06 * Math.sin(t * 8)]] });
      C(3, SIL_O, "sil", add(STALL, 0.6, 0, -0.8), { expr: "grin", hands: f >= 651 ? [[-18, 0.72], [14 + 6 * Math.sin(t * 10), 0.7]] : undefined });
      if (f < 651) {
        for (let i = 0; i < 7; i++) C(40 + i, FOLK[(i * 5 + 1) % 12], `cust${i}`, add(STALL, -2.6 + i * 0.85 + (i > 2 ? 0.5 : 0), 0, 1.0 + 0.5 * (i % 2)), { expr: i % 2 ? "grin" : "smile", wave: i % 3 === 0 ? q30(0.5 + 0.5 * Math.sin(t * 6 + i)) : undefined });
        coins(add(STALL, -0.3, 1.0, 0.3), 634, 8);
      }
      break;
    }
    case 8: {
      C(0, WIFE_O, "wife", add(WIFE_STALL, 0, 0, -0.65), { expr: f >= 749 ? "smile" : "neutral", hands: [[-28, 0.8], [28, 0.8]], look: f >= 740 ? 1 : 0 });
      if (f >= 740) {
        const taste = smooth((f - 746) / 6) * (1 - smooth((f - 772) / 6));
        C(42, FOLK[4], "taster", add(WIFE_STALL, 1.05, 0, 0.15), { expr: f >= 758 ? "pained" : "neutral", hands: [[-30, 0.9], [6, 0.9 - 0.95 * taste]], headTilt: f >= 758 ? 5 * Math.sin(t * 14) : 0 });
      }
      if (f < 718) passers(MARKET, 3, [3, 6]);
      break;
    }
    case 9: {
      const s = Math.sin(t * 12);
      C(1, MIL_O, "mil", add(STALL, 0, 0, -0.7), { expr: "grin", hands: [[-12, 0.5 + 0.05 * s], [12, 0.42 - 0.05 * s]] });
      C(3, SIL_O, "sil", add(STALL, 1.0, 0, -0.85), { expr: "laugh" });
      coins(add(STALL, 0, 1.25, -0.3), 783, 6);
      break;
    }
    case 10: {
      const pts: FrontOpts = pointLeft;
      milSeated("stern", f < 857 ? { hands: [[-88, 0.25], [34, 1.12]] } : {});
      [BIL_O, SIL_O, HUS_O].forEach((o, i) => C(2 + i, o, ["bil", "sil", "hus"][i], [1.2 + i * 1.3, 0, 0.6 - 0.5 * (i % 2)], { expr: i === 1 ? "laugh" : "grin", ...pts, look: -1 }));
      for (let i = 0; i < 5; i++) C(40 + i, FOLK[(i * 5 + 2) % 12], `nb${i}`, [-2.5 + i * 1.5 + (i > 2 ? 1.5 : 0), 0, 4.2 + 0.6 * (i % 2)], { expr: i % 2 ? "grin" : "smile", ...pts, look: -1 });
      kids([-1.8, 0, 2.2], "laugh");
      wifeSeated("neutral");
      break;
    }
    case 11: {
      if (f >= 950 && f < 983) C(2, BIL_O, "bil", add(BARN, 1.15, 0, 0.5), { expr: "shock", look: -1, facing: -1, hands: [[-30, 0.2], [30, 0.2]] });
      if (f >= 983 && f < 1022) C(3, SIL_O, "sil", add(MAIZE, 0.7, 0, 0.5), { expr: "nervous", look: -1, hands: [[-10, -0.1], [24, 0.9]] });
      if (f >= 1070) eating("neutral");
      break;
    }
    case 12: eating("neutral"); break;
    case 13: {
      if (f < 1177) {
        workYard(2.4, "grin");
        if (f < 1157) { const ph = q30((t * 3) % 1); FX(`lines${ph}`, 250, 250, linesDraw(ph), add(f < 1140 ? GRATE : FRY, 0.55, 1.3, 0.1), 0.45, 0.45); }
        if (f >= 1140 && f < 1157) { const ph = q30((t * 1.5) % 1); FX(`smoke${ph}`, 250, 250, smokeDraw(ph), add(FRY, 0.1, 1.5 + 0.4 * ph, 0), 0.8, 0.8); }
        if (f >= 1157) [HUS_O, MIL_O].forEach((o, i) => C(i ? 1 : 4, o, i ? "mil" : "hus", add(BASINS, -0.9 + i * 1.6, 0, -1.0), { expr: "grin", hands: [[-36, 0.92], [36, 0.92]] }));
      } else if (f < 1247) {
        // the brother-in-law walks in on legs that will not bend
        const u = clamp01((f - 1177) / 60), x = 2.0 - 1.8 * u, rock = Math.sin(t * 7) * (u < 1 ? 1 : 0.3);
        C(2, BIL_O, "bil", [x, 0.02 * Math.abs(rock), 3.4], { expr: f >= B.knees ? "pained" : "nervous", tilt: 4 * rock, hands: [[-34, 0.7], [40, 0.62]], hold: "pole", stick: [0, 176] });
        if (f >= B.knees) for (const s of [-1, 1]) FX("zig", 90, 170, zigDraw, [x + s * 0.3, 0.45, 3.55], 0.13, 0.25, s * 0.3 + 0.15 * Math.sin(t * 20));
        C(3, SIL_O, "sil", [-1.4, 0, 2.2], { expr: "nervous", look: 1 });
      } else {
        // the children: up on their toes, arms out, wobbling
        [KID_A, KID_B].forEach((o, i) => {
          const rock = Math.sin(t * 8 + i * 2);
          C(5 + i, o, i ? "kidb" : "kida", [-0.7 + i * 0.95, f >= B.toes ? 0.07 : 0.02, 4.6 + 0.2 * i], { expr: "nervous", tilt: 5 * rock, hands: [[-70, 0.35 - 0.1 * rock], [70, 0.35 + 0.1 * rock]] });
        });
        C(3, SIL_O, "sil", [1.5, 0, 3.7], { expr: "shock", look: -1, facing: -1, hands: [[-20, -0.15], [20, -0.15]] });
      }
      break;
    }
    case 14: {
      // she pushes on her knees, lifts a little, and drops back onto the stool
      const tries = [1318, 1340].map((a) => smooth((f - a) / 8) * (1 - smooth((f - a - 10) / 5))).reduce((x, y) => Math.max(x, y), 0);
      milSeated(f >= B.stool ? "shock" : "nervous", { hands: [[-36, 1.05 - 0.12 * tries], [36, 1.05 - 0.12 * tries]], tilt: 5 * tries }, STOOL, 0.1 * tries);
      if (f < 1352) {
        C(3, SIL_O, "sil", add(STOOL, 1.05, 0, -0.3), { expr: "shock", look: -1, facing: -1, hands: [[-56, 0.5], [10, 0.7]] });
        C(2, BIL_O, "bil", add(STOOL, -1.25, 0, -0.2), { expr: "pained", hands: [[-34, 0.7], [40, 0.62]], hold: "pole", stick: [0, 176], look: 1 });
      } else C(0, WIFE_O, "wife", add(WIFE, 0.2, 0, 0.4), { expr: "nervous", look: 1, facing: 1, hands: [[-20, 0.5], [16, 0.42]] });
      break;
    }
    case 15: {
      if (f >= B.open && f < B.grate) {
        // the cut root: green wisps curling out of both white faces, then a small skull pops on "cyanide"
        wisps(add(TABLE, 0, 0.9, 0.12), 5, 0.16, 0.34, 0.07, 1, 0.55);
        if (f >= B.cyanide) { const k = smooth((f - B.cyanide) / 6); FX("skull", 200, 200, skullDraw, add(TABLE, 0.02, 1.32 + 0.03 * Math.sin(t * 5), 0.14), 0.2 * k, 0.2 * k, 0.1 * Math.sin(t * 3)); }
      }
      if (f >= B.grate && f < 1500) {
        C(2, BIL_O, "bil", add(GRATE, 0, 0, -0.8), { expr: "neutral", ...grateHands(1.2) });
        wisps(add(GRATE, 0, 1.0, 0.25), 8, 0.4, 0.75, 0.12, 2, 0.9);
        if (f < B.grate + 8) { const u = q30((f - B.grate) / 8); FX(`burst${u}`, 500, 500, (p) => fxBurst(p, u, GREEN, 9, 30, 210), add(GRATE, 0, 1.0, 0.3), 0.6, 0.6); }
      }
      if (f >= 1500 && f < 1560) { wifeSeated("smile_closed"); wisps(add(SACK, 0, 1.45, 0.2), 6, 0.3, 1.3, 0.2, 3, 0.7); }
      if (f >= 1560) for (let i = 0; i < 5; i++) {
        const u = ((t * 1.3 + i * 0.2) % 1);
        FX("drop", 80, 100, dropDraw, [SACK[0] - 0.3 + i * 0.15, 0.2 - 0.17 * u * u, SACK[2] + 0.42 + 0.03 * (i % 2)], 0.035, 0.045);
        if (i < 2) wisps([SACK[0] - 0.1 + i * 0.25, 0.03, SACK[2] + 0.55], 1, 0.02, 0.22, 0.05, 5 + i, 0.6);
      }
      break;
    }
    case 16: {
      wisps(add(FIELD, 0, 0.15, 0.25), 9, 0.45, 1.9, 0.26, 4, 0.6);
      const k = smooth((f - 1647) / 8);
      if (k > 0) FX("skull", 200, 200, skullDraw, add(FIELD, 0.05, 1.15 + 0.04 * Math.sin(t * 5), 0.5), 0.5 * k, 0.5 * k, 0.1 * Math.sin(t * 3));
      break;
    }
    case 17: {
      if (f >= 1732) {
        const n = f >= 1766 ? 64 : 14;
        for (let i = 0; i < n; i++) {
          const row = Math.floor(i / 8), x = FAR[0] - 4.2 + (i % 8) * 1.2 + 0.5 * (row % 2) + 0.4 * (hh(i, 1) - 0.5), z = 1.6 - row * 1.5 + 0.5 * (hh(i, 2) - 0.5);
          C(50 + i, FOLK[i % 12], `sit${i % 12}`, [x, -0.06, z], { mode: "sit", expr: i % 3 === 0 ? "stern" : i % 3 === 1 ? "neutral" : "nervous", hands: [[-30, 1.1], [34, 0.55]], hold: "pole", stick: [0, 178], look: hh(i, 3) < 0.5 ? -1 : 1 }, 0.96 + 0.08 * hh(i, 6));
        }
      }
      break;
    }
    case 18: {
      const came = f >= 1859, serve = f >= B.serve, eat = f >= 1916;
      if (!came) { wifeSeated("smile_closed"); break; }
      C(0, WIFE_O, "wife", add(WIFE, 0.25, 0, 0.35), { expr: "smile_closed", look: 1, facing: 1, hands: serve && !eat ? [[-22, 0.55], [52, 0.5]] : [[-22, 0.8], [22, 0.8]], hold: serve && !eat ? "bowl" : null });
      const at: V3 = [WIFE[0] + 1.5, 0, WIFE[2] + 1.2];
      milSeated(eat ? "relief" : "nervous", eat ? eatHands(1) : {}, at);
      const ring: [Outfit, string, number, V3, Expr][] = [[BIL_O, "bil", 2, add(at, 1.0, 0, -0.5), "relief"], [SIL_O, "sil", 3, add(at, 1.9, 0, 0.1), "smile"], [HUS_O, "hus", 4, add(at, 0.9, 0, 0.9), "relief_open"]];
      ring.forEach(([o, key, i, p, ex]) => C(i, o, key, p, eat ? { expr: ex, ...eatHands(i) } : { expr: "nervous", look: -1, hands: i === 2 ? [[-34, 0.7], [40, 0.62]] : undefined, hold: i === 2 ? "pole" : null, stick: [0, 176] }));
      [KID_A, KID_B].forEach((o, i) => C(5 + i, o, i ? "kidb" : "kida", add(at, 2.7 + i * 0.75, 0, 0.8 + 0.25 * i), eat ? { expr: "smile", ...eatHands(5 + i) } : { expr: "nervous" }));
      break;
    }
  }
  void bodySide; void fxStars; void TABLE; void PRESS;
  return out;
};
/** the family eating garri round the stool (morning, then by the fire at night) */
function eating(expr: Expr) {
  milSeated(expr, eatHands(1));
  const spots: [Outfit, string, number, V3][] = [[BIL_O, "bil", 2, [0.6, -0.06, 1.6]], [SIL_O, "sil", 3, [1.7, -0.06, 0.9]], [HUS_O, "hus", 4, [-2.3, -0.06, 1.5]], [KID_A, "kida", 5, [-0.1, -0.06, 2.4]], [KID_B, "kidb", 6, [1.2, -0.06, 2.6]]];
  spots.forEach(([o, key, i, p]) => C(i, o, key, p, { mode: "sit", expr: i % 2 ? "smile" : expr, ...eatHands(i) }));
}
export { FPS, SU as SU_CARD };
