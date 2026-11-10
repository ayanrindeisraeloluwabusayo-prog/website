// The Lagos cast as lit flat cards in the 3D world (canvas pool, cardShade, contact blobs, unlit effect cards), from
// the cartoon-3d-short template, with a new stage() for this story: Tony, the Cool Cats, Fela, the crowd, the kid.
import * as THREE from "three";
import {
  Pen, bodyFront, bodySide, fxNote, fxBurst, fxStars, fxRing, fxShadow, fxContact, INK,
  Outfit, Expr, FrontOpts, SideOpts, BROWN,
} from "./toon";
import {
  FPS, SHOTS, V3, B, BPM, KIT, STOOL, CLUB, ROOM, STAGE_Y, TONY_CLAVES, TONY_WALK, STREET_BAND, KID_SPOT, RIVALS, FELA, SHELF,
  smooth, clamp01, glide,
} from "./story";
import { NOINK } from "./ink";
import { cardShade, blobMaterial, CARD_K } from "./cardshade";


// ---------------- canvas pool ----------------
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
let LNAME: "day" | "golden" | "night" = "day";
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
const CONTACT: Record<"day" | "golden" | "night", [number, number, number]> = { day: [0.2, 0.21, 0.33], golden: [0.24, 0.2, 0.33], night: [0.3, 0.26, 0.4] };
const TAIL: [number, number, number] = [0.42, 0.44, 0.62];
const toSrgb = (v: number) => { const c = clamp01(v); return c <= 0.0031308 ? 12.92 * c : 1.055 * c ** (1 / 2.4) - 0.055; };
const hexOf = (c: [number, number, number], k: number) => "#" + c.map((v) => Math.round(255 * toSrgb(1 - (1 - v) * k)).toString(16).padStart(2, "0")).join("");
const blob = (out: Stage, x: number, y: number, z: number, sc = 1, k = 1) => {
  const hl = Math.hypot(SUN.x, SUN.z) || 1, ox = -SUN.x / hl, oz = -SUN.z / hl, rot = Math.atan2(-ox, -oz);
  if (LNAME === "day") {
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
export type Stage = { places: Place[]; fx: FxPlace[] };
const HAIR = "#1a1214";
const fit = (o: Partial<Outfit> & { jacket: string }): Outfit => ({ pants: "#2b2a3a", boots: "#1e1a20", hat: "afro", hair: HAIR, ...o });
export const TONY = fit({ jacket: "#2f8a78", skin: BROWN[1] });
const COPIES = ["#e2453c", "#f2b632", "#3aa55a", "#3d7fd6"].map((c) => fit({ jacket: c, skin: BROWN[1] }));
const FELA_O = fit({ jacket: "#e8742a", pants: "#efe3cb", boots: "#3a2a20", skin: BROWN[0] });
const LEADER = fit({ jacket: "#f4f1ea", pants: "#f4f1ea", boots: "#3a2a20", skin: BROWN[2], moustache: HAIR, build: "stout" });
const DRUMMER = fit({ jacket: "#6a3fa0", skin: BROWN[3] });
const GUITAR = fit({ jacket: "#c23a4a", skin: BROWN[4] });
const BASSIST = fit({ jacket: "#3a6fb5", skin: BROWN[2] });
const KID_O = fit({ jacket: "#f2b632", pants: "#3b5b9a", skin: BROWN[1], build: "kid" });
const RIVAL_O = [fit({ jacket: "#5d7a3a", skin: BROWN[0] }), fit({ jacket: "#b5653f", skin: BROWN[4], moustache: HAIR }), fit({ jacket: "#2f5f6a", skin: BROWN[3] })];
const SHIRTS = ["#e2453c", "#3d7fd6", "#f2b632", "#5d7a3a", "#c25a7a", "#2f8a78", "#e8742a", "#7b5ac9", "#f4f1ea", "#d9a441"];
const folk = (i: number): Outfit => {
  const skin = BROWN[i % BROWN.length], j = SHIRTS[(i * 3 + 1) % SHIRTS.length];
  return i % 3 === 1
    ? fit({ jacket: j, skin, dress: SHIRTS[(i * 7 + 4) % SHIRTS.length], hat: "gele", cap: SHIRTS[(i * 5 + 2) % SHIRTS.length] })
    : fit({ jacket: j, skin, pants: ["#2b2a3a", "#efe3cb", "#3b5b9a"][i % 3] });
};
const FOLK = Array.from({ length: 12 }, (_, i) => folk(i));

const beatOf = (f: number) => (f / FPS) * (BPM / 60); // beats since frame 0
type H2 = [number, number];
// kit targets on Tony's card (u from the torso centre, head-heights below the chin); see world.ts drum layout
const PADS: Record<string, H2> = { hat: [-98, -0.15], snare: [-29, 0.32], rack: [24, -0.12], floor: [94, 0.42], ride: [118, -0.4], crash: [-69, -0.8] }; // lifted above the true tops: the drums stand in front of the card
const SL_U = 62, SL_H = 0.66; // stick length in u (x) and head-heights (y)
const tipToHand = (pad: H2, ang: number): H2 => [pad[0] - SL_U * Math.sin(ang * Math.PI / 180), pad[1] + SL_H * Math.cos(ang * Math.PI / 180)];
/** one hand moving between hits: frac 0 / 1 = stick tip on the pad, 0.5 = raised */
const strike = (from: H2, to: H2, frac: number, side: number, lift: number): { h: H2; a: number } => {
  const s = Math.sin(Math.PI * frac) ** 0.8, hitA = side < 0 ? 118 : -118, upA = side < 0 ? -20 : 20;
  const a = hitA + (upA - hitA) * s;
  const k = smooth(frac), pad: H2 = [from[0] + (to[0] - from[0]) * k, from[1] + (to[1] - from[1]) * k];
  const h = tipToHand(pad, a);
  return { h: [h[0], h[1] - lift * s], a };
};
/** Tony's (or any drummer's) groove at frame f: left hand on the hi-hat in eighths, right hand round the kit */
const groove = (f: number, energy = 1, offset = 0): Pick<FrontOpts, "hands" | "stick" | "hold"> => {
  const b = beatOf(f) + offset, e8 = (b * 2) % 1;
  const L = strike(PADS.hat, PADS.hat, e8, -1, 0.3 * energy);
  const seq = ["floor", "snare", "rack", "snare", "floor", "snare", "ride", "crash"];
  const i = Math.floor(b) % seq.length, fr = b % 1;
  const R = strike(PADS[seq[(i + seq.length - 1) % seq.length]], PADS[seq[i]], fr, 1, 0.45 * energy);
  return { hands: [L.h, R.h], stick: [L.a, R.a], hold: "sticks" };
};
const restSticks = (): Pick<FrontOpts, "hands" | "stick" | "hold"> => ({ hands: [[-40, 0.95], [40, 0.95]], stick: [60, -60], hold: "sticks" });

/** legs from the hip down to the pedals (feet card standing on the stage, design space like a body card) */
const feetDraw = (f: number, playing: boolean, light: number) => (p: Pen) => {
  const b = beatOf(f), legCol = "#4a4a72", shoe = "#1e1a20", hip = 975 - 0.5 / SU;
  const kick = playing ? Math.max(0, Math.cos(Math.PI * 2 * (b % 1))) ** 6 : 0; // right foot: bass drum on every beat
  const hat = playing ? Math.max(0, Math.cos(Math.PI * 2 * ((b + 0.5) % 1))) ** 6 : 0; // left foot: hi-hat on the off-beats
  void light;
  for (const [side, k] of [[-1, hat], [1, kick]] as const) {
    const hx = 300 + side * 40, kx = 300 + side * 72, ky = hip + 70, ax = 300 + side * 66, ay = 975 - 30 - 18 * (1 - k);
    p.stroke([[hx, hip], [kx, ky], [ax, ay]], 40, INK);
    p.stroke([[hx, hip], [kx, ky], [ax, ay]], 28, legCol);
    // shoe: heel down, toe presses the pedal on the hit
    const toe = 10 + 16 * (1 - k);
    p.poly([[ax - 30, ay - 8], [ax + 30, ay - 8], [ax + 36, 975 - toe], [ax - 34, 975 - toe + 8]], shoe, 6);
  }
};

const who = (i: number, o: Outfit, key: string) => ({ i, o, okey: key });
const lid = (f: number, i: number) => lidAt(f / FPS, i);
const front = (cam: CamInfo, i: number, o: Outfit, key: string, x: number, y: number, z: number, fo: FrontOpts, out: Stage, scale = 1, shadow = true) => {
  const pl = person(cam, who(i, o, key), x, y, z, { side: false, mirror: false }, { blink: lid(fo.phase === undefined ? 0 : 0, i), ...fo }, {}, scale);
  out.places.push(pl);
  if (shadow) blob(out, x, y, z, scale);
  return pl;
};

/** Tony at the kit (and his feet on the pedals) */
const tonyKit = (cam: CamInfo, f: number, out: Stage, o: Outfit, x: number, z: number, play: boolean, expr: Expr, extra: Partial<FrontOpts> = {}, i = 0, feet = true) => {
  const y = STOOL[1] + 0.35;
  const g = play ? groove(f, 1, i * 0.13) : restSticks();
  front(cam, i, o, `kit${i}`, x, y, z, { mode: "sit", expr, noLegs: true, blink: lid(f, i), ...g, ...extra }, out, 1, false);
  if (feet) {
    const fk = play ? Math.round(((beatOf(f) * 8) % 8)) : -1;
    // the legs card stands between the stool and the lens, so the stool never hides the legs
    const dx = cam.pos.x - x, dz = cam.pos.z - z, d = Math.hypot(dx, dz) || 1;
    out.places.push({ key: `feet|${fk}`, draw: feetDraw(play ? f : 0, play, 0), x: x + (dx / d) * 0.28, y: STOOL[1], z: z + (dz / d) * 0.28, size: [600, 1000, 1] });
  }
};

const fxAt = (out: Stage, key: string, cw: number, ch: number, draw: (p: Pen) => void, x: number, y: number, z: number, w: number, h: number, rot = 0, soft = false) =>
  out.fx.push({ key, cw, ch, draw, x, y, z, w, h, rot, soft });
const q30 = (u: number) => Math.round(clamp01(u) * 30) / 30;

/** the club crowd: rows in front of the stage; dance 0 = standing, 1 = dancing with arms up */
const crowd = (cam: CamInfo, f: number, out: Stage, dance: number, n = 44, skip?: (x: number, z: number) => boolean) => {
  const b = beatOf(f);
  for (let i = 0; i < n; i++) {
    const row = Math.floor(i / 9), col = i % 9;
    const x = CLUB[0] - 4.4 + col * 1.1 + (hh(i, 1) - 0.5) * 0.6 + (row % 2) * 0.5, z = 1.7 + row * 1.25 + (hh(i, 2) - 0.5) * 0.5;
    if (skip && skip(x, z)) continue;
    const o = FOLK[i % FOLK.length];
    const d = dance > 0 && hh(i, 4) < 0.35 + 0.65 * dance;
    const ph = (b * 0.5 + hh(i, 5)) % 1;
    const up = d && i % 3 === 0;
    front(cam, i + 10, o, `crowd${i % FOLK.length}`, x, 0, z, {
      mode: d ? "stroll" : "stand", phase: d ? q30(ph) : 0, expr: d ? (i % 4 === 0 ? "laugh" : "grin") : i % 3 ? "smile" : "neutral",
      wave: up ? q30(Math.sin(Math.PI * 2 * ph) * 0.5 + 0.5) : undefined, blink: lid(f, i + 10),
    }, out, 0.96 + 0.08 * hh(i, 6));
  }
};

/** the Cool Cats on the bandstand (shots 4-6): leader on a horn, guitarist, the drummer at the kit until he quits */
const coolCats = (cam: CamInfo, f: number, out: Stage, id: number) => {
  const b = beatOf(f), sway = q30((b * 0.5) % 1);
  front(cam, 3, LEADER, "leader", KIT[0] - 2.5, STAGE_Y, KIT[2] + 1.7, { mode: "stand", expr: "whistle", hands: [[-8, 0.3], [10, 0.7]], hold: "sax", blink: lid(f, 3) }, out);
  front(cam, 4, GUITAR, "guitar", KIT[0] + 2.3, STAGE_Y, KIT[2] + 1.3, { mode: "stroll", phase: sway, expr: "smile_closed", hands: [[-30, 0.7], [20, 0.85]], blink: lid(f, 4) }, out);
  if (id === 4 || (id === 5 && f < B.quit)) tonyKit(cam, f, out, DRUMMER, KIT[0], STOOL[2], true, "neutral", {}, 2);
  else if (id === 5) {
    // he stands up, slams the sticks down and storms off stage right
    const u = clamp01((f - B.quit - 6) / 40);
    const x = KIT[0] + 0.1 + 3.6 * u * u, z = STOOL[2] + 0.4;
    front(cam, 2, DRUMMER, "drummer", x, STAGE_Y, z, { mode: u > 0 ? "stroll" : "stand", phase: q30((f / 16) % 1), expr: "stern", facing: 1, look: 1, blink: lid(f, 2) }, out);
    if (f < B.quit + 8) fxAt(out, `quitburst${q30((f - B.quit) / 8)}`, 500, 500, (p) => fxBurst(p, q30((f - B.quit) / 8), "#ffd84a"), KIT[0] + 0.1, STAGE_Y + 1.9, STOOL[2] + 0.6, 0.9, 0.9);
  }
};

/** Tony with the claves at the back of the bandstand */
const tonyClaves = (cam: CamInfo, f: number, out: Stage, expr: Expr, look = 0) => {
  const hit = [B.clickA, B.clickB].some((c) => f >= c - 2 && f < c + 3) || (f > 520 && f < 640 && (Math.floor(beatOf(f) * 2) % 2 === 0) && (beatOf(f) * 2) % 1 < 0.25);
  front(cam, 0, TONY, "claves", TONY_CLAVES[0], STAGE_Y, TONY_CLAVES[2], {
    mode: "stand", expr, look, blink: lid(f, 0), hold: "claves",
    hands: [[-20, 0.48], hit ? [-4, 0.4] : [16, 0.28]], stick: [75, hit ? -80 : -60],
  }, out);
  for (const c of [B.clickA, B.clickB]) if (f >= c && f < c + 9) {
    const u = q30((f - c) / 9);
    fxAt(out, `click${u}`, 500, 500, (p) => fxBurst(p, u, "#fff3b0", 8, 30, 200), TONY_CLAVES[0] - 0.02, STAGE_Y + 1.3, TONY_CLAVES[2] + 0.25, 0.42, 0.42);
  }
};

/** four coloured rhythm lines: one from each limb, rising and braiding into one groove above Tony's head */
const LINE_COLS = ["#e2453c", "#f2b632", "#3aa55a", "#3d7fd6"];
const rhythmLines = (f: number, out: Stage) => {
  if (f < B.lines) return;
  const grow = q30((f - B.lines) / 26), merge = q30((f - B.merge + 6) / 30), ph = Math.round(((f / FPS) * 2) % 1 * 12) / 12;
  const W = 3.2, H = 2.75, x0 = KIT[0], y0 = STAGE_Y, z0 = STOOL[2] + 0.75;
  // start / bend / end points in metres from the card's bottom-left: hands at the sticks, feet at the pedals,
  // each line swings out round the body and they meet in one point above Tony's head
  const c0 = W / 2;
  const paths: [H2, H2][] = [[[c0 - 0.5, 1.05], [c0 - 1.25, 1.9]], [[c0 + 0.5, 1.05], [c0 + 1.25, 1.9]], [[c0 - 0.22, 0.05], [c0 - 1.45, 0.9]], [[c0 + 0.22, 0.05], [c0 + 1.45, 0.9]]];
  const top: H2 = [c0, 2.5], freqs = [9, 6, 4, 5], cw = 640, ch = 550, k = cw / W;
  fxAt(out, `lines${grow}|${merge}|${ph}`, cw, ch, (p) => {
    paths.forEach(([s, m], i) => {
      const pts: [number, number][] = [];
      const n = Math.round(70 * grow);
      for (let j = 0; j <= n; j++) {
        const t = j / 70, a = (1 - t) * (1 - t), b2 = 2 * t * (1 - t), c2 = t * t;
        const x = a * s[0] + b2 * m[0] + c2 * top[0], y = a * s[1] + b2 * m[1] + c2 * top[1];
        const amp = 0.05 * Math.sin(Math.PI * Math.min(1, t * 1.2)) * (1 - merge * 0.6);
        const w = Math.sin((t * freqs[i] - ph) * Math.PI * 2) * amp;
        pts.push([(x + w) * k, ch - (y + w * 0.6) * k]);
      }
      if (pts.length > 1) p.line(pts, LINE_COLS[i], 6);
    });
    if (merge > 0) {
      const r = 10 + 16 * merge;
      p.ell(top[0] * k, ch - top[1] * k, r, r, "#ffffff", 5);
      for (let i = 0; i < 4; i++) p.ell(top[0] * k + Math.cos(i * 1.57 + ph * 6.28) * r * 0.55, ch - top[1] * k + Math.sin(i * 1.57 + ph * 6.28) * r * 0.55, 5, 5, LINE_COLS[i], 0);
    }
  }, x0, y0 + H / 2, z0, W, H);
};

/** music notes drifting up from the record player */
const notes = (f: number, out: Stage, at: V3, n = 4, size = 0.12) => {
  for (let i = 0; i < n; i++) {
    const u = ((f / FPS) * 0.45 + i / n) % 1, kind = i % 2;
    fxAt(out, `note${kind}${LINE_COLS[i % 4]}`, 240, 240, (p) => fxNote(p, kind, LINE_COLS[i % 4]), at[0] + Math.sin(u * 6 + i) * 0.12, at[1] + u * 0.7, at[2], size * (1 - 0.3 * u), size * (1 - 0.3 * u), Math.sin(u * 4 + i) * 0.3);
  }
};

const street = (cam: CamInfo, f: number, out: Stage, id: number) => {
  const b = beatOf(f);
  // passers-by on both sidewalks and at the stalls
  for (let i = 0; i < 16; i++) {
    const side = i % 2 ? 1 : -1, speed = 0.9 + 0.4 * hh(i, 3), dir = hh(i, 4) < 0.5 ? 1 : -1;
    const walk = i % 4 !== 0;
    const z = -30 + ((i * 7.3 + (walk ? dir * speed * f / FPS : 0)) % 60 + 60) % 60 - (id === 12 ? -10 : 0);
    const x = side * (4.6 + 0.9 * hh(i, 5));
    if (id === 2 && Math.hypot(x - STREET_BAND[0], z - STREET_BAND[2]) < 2.2) continue;
    const view = viewOf(cam, x, z, 0, dir);
    const o = FOLK[i % FOLK.length];
    if (walk && view.side) {
      const pl = person(cam, who(i + 30, o, `folk${i % 12}`), x, 0, z, view, {}, { mode: "march", phase: q30((f * speed / 30 + hh(i, 6)) % 1), stride: 0.55 * view.fs, expr: "smile", blink: lid(f, i + 30) }, 1);
      out.places.push(pl); blob(out, x, 0, z);
    } else front(cam, i + 30, o, `folk${i % 12}`, x, 0, z, { mode: walk ? "stroll" : "stand", phase: q30((f / 30 + hh(i, 6)) % 1), expr: i % 3 ? "smile" : "neutral", blink: lid(f, i + 30) }, out);
  }
  if (id === 2) {
    // the street band: a horn and a hand drummer at a conga
    front(cam, 5, LEADER, "streethorn", STREET_BAND[0], 0, STREET_BAND[2], { mode: "stroll", phase: q30((b * 0.5) % 1), expr: "whistle", hands: [[-8, 0.3], [10, 0.7]], hold: "sax", blink: lid(f, 5) }, out);
    const hit = (b * 2) % 1, up = Math.sin(Math.PI * hit) * 0.25;
    front(cam, 6, GUITAR, "conga", STREET_BAND[0] + 0.3, 0, STREET_BAND[2] - 1.3, { mode: "stand", expr: "grin", hands: [[-24, 1.05 - up], [24, 1.05 - (0.25 - up)]], blink: lid(f, 6) }, out);
    notes(f, out, [STREET_BAND[0] - 0.4, 1.9, STREET_BAND[2] - 0.4], 3, 0.18);
    // Tony walks up the sidewalk, then stops and listens
    const p = TONY_WALK(f), walking = f < B.stopWalk;
    const view = viewOf(cam, p[0], p[2], 0, 1);
    if (walking && view.side) out.places.push(person(cam, who(0, TONY, "tony"), p[0], 0, p[2], view, {}, { mode: "march", phase: q30((f / 22) % 1), stride: 0.6 * view.fs, expr: "neutral", blink: lid(f, 0) }, 1));
    else front(cam, 0, TONY, "tony", p[0], 0, p[2], { mode: walking ? "stroll" : "stand", phase: q30((f / 22) % 1), expr: f > 300 ? "smile_closed" : "neutral", look: walking ? 0 : 1, facing: walking ? 0 : 1, blink: lid(f, 0) }, out);
    if (walking && view.side) blob(out, p[0], 0, p[2]);
  }
  if (id === 8) {
    // the kid tries to pat his head and rub his tummy at the same time
    const t = f / FPS, patting = f >= B.pat, rubbing = f >= B.rub, tangled = f >= B.tangle;
    let L: H2 = [-30, 0.95], R: H2 = [30, 0.95];
    if (patting) L = [-6, -1.02 + 0.07 * Math.abs(Math.sin(t * Math.PI * 3))];
    if (rubbing) R = tangled
      ? [10 + 14 * Math.sin(t * 9), 0.5 - 0.5 * Math.abs(Math.sin(t * 7))] // it all goes wrong: the hands swap jobs
      : [8 + 10 * Math.cos(t * 7), 0.55 + 0.08 * Math.sin(t * 7)];
    if (tangled) L = [-6 + 10 * Math.cos(t * 8), -1.0 + 0.1 * Math.sin(t * 11)];
    const expr: Expr = tangled ? "dazed" : rubbing ? "nervous" : patting ? "smile" : "grin";
    front(cam, 7, KID_O, "kid", KID_SPOT[0], 0, KID_SPOT[2], { mode: "stand", expr, hands: [L, R], blink: tangled ? 0 : lid(f, 7), headTilt: tangled ? 6 * Math.sin(t * 5) : 0 }, out);
    if (tangled) { const u = q30(((f - B.tangle) / 40) % 1); fxAt(out, `stars${u}`, 420, 220, (p) => fxStars(p, u), KID_SPOT[0], 1.55, KID_SPOT[2] + 0.1, 0.62, 0.33); }
  }
};

/** cast for shot `id` at frame f */
export const stage = (id: number, f: number, cam: CamInfo): Stage => {
  const out: Stage = { places: [], fx: [] };
  const s = SHOTS[id - 1];
  LNAME = s.light;
  findSun(cam, SUN);
  if (s.place === "street") street(cam, f, out, id);
  if (s.place === "room" && id === 3) {
    // Tony on his bed tapping his knees along with a record
    const b = beatOf(f), e = (b * 2) % 1, k = Math.sin(Math.PI * e) * 0.22, alt = Math.floor(b * 2) % 2;
    const L: H2 = [-30, 1.12 - (alt ? k : 0)], R: H2 = [30, 1.12 - (alt ? 0 : k)];
    front(cam, 0, TONY, "room", ROOM[0] - 0.8, 0.12, -1.05, { mode: "sit", expr: f >= 460 ? "grin" : f >= 402 ? "smile_closed" : "neutral", hands: [L, R], blink: lid(f, 0), look: f < 402 ? 1 : 0 }, out);
    notes(f, out, [ROOM[0] + 1.3, 0.85, -1.4], 4, 0.11);
  }
  if (s.place === "club") {
    if (id === 1) {
      tonyKit(cam, f, out, TONY, KIT[0], STOOL[2], true, "grin");
      // four copies pop in around the kit on "four", then snap back into him on "two feet"
      const offs: V3[] = [[-0.95, 0, 0.25], [0.95, 0, 0.25], [-0.6, 0, -0.8], [0.6, 0, -0.8]];
      if (f >= B.copiesIn && f < B.copiesOut + 12) {
        const pop = smooth((f - B.copiesIn) / 6), back = glide((f - B.copiesOut) / 12), sc = pop * (1 - 0.6 * back);
        offs.forEach((o, i) => {
          if (sc <= 0.01) return;
          const x = KIT[0] + o[0] * (1 - back), z = STOOL[2] + o[2] * (1 - back) - 0.05;
          const g = groove(f, 1, (i + 1) * 0.25);
          front(cam, 20 + i, COPIES[i], `copy${i}`, x, STAGE_Y, z, { mode: "stand", expr: i % 2 ? "laugh" : "grin", ...g, blink: lid(f, 20 + i) }, out, sc, back < 0.5);
          if (f < B.copiesIn + 10) { const u = q30((f - B.copiesIn) / 10); fxAt(out, `ring${u}`, 600, 600, (p) => fxRing(p, u), x, STAGE_Y + 1.1, z + 0.1, 1.6, 1.6); }
        });
      }
    }
    if (id >= 4 && id <= 6) {
      coolCats(cam, f, out, id);
      if (!(id === 6 && f >= B.sitDown)) tonyClaves(cam, f, out, id === 6 ? "neutral" : f >= 611 ? "stern" : "neutral", id === 6 ? 1 : 0);
      else tonyKit(cam, f, out, TONY, KIT[0], STOOL[2], f >= B.ready, f >= B.ready - 6 ? "grin" : "smile", f < B.ready ? { hands: [[-40, 0.2], [40, 0.2]], stick: [-20, 20] } : {});
      crowd(cam, f, out, 0.25, 44, id === 6 && f >= 850 && f < 927 ? (x, z) => z < RIVALS[2] + 0.4 || Math.abs(x - RIVALS[0]) < 1.4 : undefined);
      if (id === 6 && f >= 850 && f < 927) {
        // three rival drummers, sticks in hand: smug, then their faces drop
        RIVAL_O.forEach((o, i) => {
          const x = RIVALS[0] - 0.75 + i * 0.75, z = RIVALS[2] + (i === 1 ? -0.3 : 0);
          front(cam, 40 + i, o, `rival${i}`, x, 0, z, { mode: "stand", expr: f >= B.rivalsShock ? "shock" : i === 1 ? "smile" : "smile_closed", hands: [[-18, 0.55], [18, 0.55]], hold: "sticks", stick: [-10, 10], look: -0.5, blink: f >= B.rivalsShock ? 0 : lid(f, 40 + i) }, out);
        });
      }
    }
    if (id === 7 || id === 9 || id === 10) {
      const afro = id === 10;
      tonyKit(cam, f, out, TONY, KIT[0], STOOL[2], true, f % 90 < 45 ? "grin" : "smile_closed");
      if (id === 9) rhythmLines(f, out);
      front(cam, 4, GUITAR, "guitar", KIT[0] + 2.3, STAGE_Y, KIT[2] + 1.3, { mode: "stroll", phase: q30((beatOf(f) * 0.5) % 1), expr: "smile_closed", hands: [[-30, 0.7], [20, 0.85]], blink: lid(f, 4) }, out);
      if (afro) {
        const talk = f >= 1590 && f < 1700, turned = f >= B.felaTurn;
        const mouth: Expr = talk ? (Math.floor(f / 4) % 2 ? "relief_open" : "smile") : turned && f < 1478 ? "smile" : "whistle";
        front(cam, 8, FELA_O, "fela", FELA[0], FELA[1], FELA[2], { mode: f >= B.dance ? "stroll" : "stand", phase: q30((beatOf(f) * 0.5) % 1), expr: mouth, look: turned && f < 1478 ? 1 : 0, facing: turned && f < 1478 ? 1 : 0, hands: talk ? [[-8, 0.55], [10, 0.95]] : [[-8, 0.3], [10, 0.7]], hold: "sax", blink: lid(f, 8) }, out);
        front(cam, 9, BASSIST, "bass", KIT[0] + 1.4, STAGE_Y, KIT[2] - 0.6, { mode: "stroll", phase: q30((beatOf(f) * 0.5 + 0.3) % 1), expr: "grin", hands: [[-34, 0.65], [16, 0.82]], blink: lid(f, 9) }, out);
        crowd(cam, f, out, smooth((f - B.dance) / 40), 54);
      } else crowd(cam, f, out, id === 9 ? 0.6 : 0.35);
    }
  }
  return out;
};
export { FPS, SU as SU_CARD, KIT, ROOM, SHELF };
