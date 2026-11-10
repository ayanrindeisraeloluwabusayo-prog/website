// The garri story's world as one three.js scene: a family compound (mud houses under rusty zinc and thatch, the
// family's grating table, press and frying pan, the wife's sack in its corner), the yam barn, maize patch and cassava
// field around it, a market road, and a dry far-away village. Sets are dressed like a film set (textures, many small
// props) and every explanation prop lives inside the scene. update(id, f, camera) poses it for shot id at frame f.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex, rep, cloudHD } from "./paint";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, MARKET, FAR, SACK, GRATE, PRESS, FRY, BASINS, STOOL, BARN, MAIZE, FIELD, TABLE, STALL, WIFE_STALL, PAPER, WIFE, B,
  camAt, lightAt, dayCount, ShotDef, smooth } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

// ---------------- painted textures ----------------
const U = (r: () => number, a: number, b: number) => a + (b - a) * r();
const blot = (g: CanvasRenderingContext2D, r: () => number, W: number, H: number, n: number, rgb: string, a: number, rad: [number, number]) => {
  for (let i = 0; i < n; i++) {
    const x = U(r, 0, W), y = U(r, 0, H), R = U(r, rad[0], rad[1]);
    const gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
};
const speck = (g: CanvasRenderingContext2D, r: () => number, W: number, H: number, n: number, cols: string[], s = 3) => {
  for (let i = 0; i < n; i++) { g.fillStyle = cols[Math.floor(r() * cols.length)]; const k = U(r, 1, s); g.fillRect(U(r, 0, W), U(r, 0, H), k, k); }
};
const crack = (g: CanvasRenderingContext2D, r: () => number, x: number, y: number, len: number, a: number, w: number, col: string) => {
  g.strokeStyle = col; g.lineWidth = w; g.lineCap = "round"; g.beginPath(); g.moveTo(x, y);
  for (let i = 0; i < len; i++) { a += U(r, -0.6, 0.6); x += Math.cos(a) * 14; y += Math.sin(a) * 14; g.lineTo(x, y); }
  g.stroke();
};
const earth = () => ctex("earth", 1024, 1024, (g, r) => {
  g.fillStyle = "#c58a56"; g.fillRect(0, 0, 1024, 1024);
  blot(g, r, 1024, 1024, 60, "150,84,46", 0.16, [40, 190]);
  blot(g, r, 1024, 1024, 40, "236,186,136", 0.14, [30, 150]);
  speck(g, r, 1024, 1024, 3500, ["rgba(255,228,196,0.16)", "rgba(104,54,30,0.18)", "rgba(190,120,70,0.2)"], 4);
  for (let i = 0; i < 90; i++) { g.fillStyle = "rgba(96,60,44,0.5)"; g.beginPath(); g.ellipse(U(r, 0, 1024), U(r, 0, 1024), U(r, 2, 6), U(r, 2, 4), U(r, 0, 3), 0, 7); g.fill(); }
});
const cracked = () => ctex("cracked", 1024, 1024, (g, r) => {
  g.fillStyle = "#cfa878"; g.fillRect(0, 0, 1024, 1024);
  blot(g, r, 1024, 1024, 40, "168,120,80", 0.16, [40, 170]);
  blot(g, r, 1024, 1024, 40, "246,222,180", 0.18, [30, 150]);
  // dried-mud plates: a jittered cell grid joined by dark cracks with a pale lip
  const N = 9, P: [number, number][][] = [];
  for (let j = 0; j <= N; j++) { P.push([]); for (let i = 0; i <= N; i++) P[j].push([(i + (i % N ? U(r, -0.32, 0.32) : 0)) * 1024 / N, (j + (j % N ? U(r, -0.32, 0.32) : 0)) * 1024 / N]); }
  for (const [w, col] of [[9, "rgba(250,232,198,0.55)"], [4.5, "rgba(70,40,26,0.9)"]] as const) {
    g.strokeStyle = col; g.lineWidth = w; g.lineJoin = "round";
    for (let j = 0; j <= N; j++) for (let i = 0; i <= N; i++) {
      if (i < N) { g.beginPath(); g.moveTo(...P[j][i]); g.lineTo((P[j][i][0] + P[j][i + 1][0]) / 2 + U(r, -8, 8), (P[j][i][1] + P[j][i + 1][1]) / 2 + U(r, -8, 8)); g.lineTo(...P[j][i + 1]); g.stroke(); }
      if (j < N) { g.beginPath(); g.moveTo(...P[j][i]); g.lineTo((P[j][i][0] + P[j + 1][i][0]) / 2 + U(r, -8, 8), (P[j][i][1] + P[j + 1][i][1]) / 2 + U(r, -8, 8)); g.lineTo(...P[j + 1][i]); g.stroke(); }
    }
  }
  for (let i = 0; i < 40; i++) crack(g, r, U(r, 0, 1024), U(r, 0, 1024), 3, U(r, 0, 6), 2, "rgba(70,40,26,0.6)");
});
const mud = (key: string, base: string) => ctex("mud" + key, 1024, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 512);
  blot(g, r, 1024, 512, 40, "255,236,200", 0.1, [40, 160]);
  blot(g, r, 1024, 512, 40, "110,60,34", 0.1, [40, 160]);
  speck(g, r, 1024, 512, 1400, ["rgba(250,226,170,0.35)", "rgba(96,56,32,0.25)"], 5); // straw flecks
  const gr = g.createLinearGradient(0, 512, 0, 330); gr.addColorStop(0, "rgba(96,50,30,0.55)"); gr.addColorStop(1, "rgba(96,50,30,0)");
  g.fillStyle = gr; g.fillRect(0, 330, 1024, 182); // rain-splash band at the foot of the wall
  for (let i = 0; i < 14; i++) crack(g, r, U(r, 0, 1024), U(r, 0, 300), Math.floor(U(r, 3, 8)), U(r, 1, 2.2), U(r, 1.5, 3), "rgba(84,44,28,0.55)");
});
/** a mud facade with a plank door and a shuttered window (w x h in metres) */
const mudFacade = (key: string, w: number, h: number, base: string, door: string, shutter: string) => ctex("mudF" + key, Math.round(w * 110), Math.round(h * 110), (g, r) => {
  const W = Math.round(w * 110), H = Math.round(h * 110), m = 110;
  g.fillStyle = base; g.fillRect(0, 0, W, H);
  blot(g, r, W, H, 30, "255,236,200", 0.1, [40, 160]); blot(g, r, W, H, 30, "110,60,34", 0.1, [40, 160]);
  speck(g, r, W, H, 900, ["rgba(250,226,170,0.35)", "rgba(96,56,32,0.25)"], 5);
  const gr = g.createLinearGradient(0, H, 0, H - 0.7 * m); gr.addColorStop(0, "rgba(96,50,30,0.6)"); gr.addColorStop(1, "rgba(96,50,30,0)");
  g.fillStyle = gr; g.fillRect(0, H - 0.7 * m, W, 0.7 * m);
  for (let i = 0; i < 8; i++) crack(g, r, U(r, 0, W), U(r, 0, H * 0.6), Math.floor(U(r, 3, 7)), U(r, 1, 2.2), 2.5, "rgba(84,44,28,0.55)");
  const frame = (x: number, y: number, ww: number, hh: number, col: string, planks: number) => {
    g.fillStyle = "#3a2418"; g.fillRect(x - 7, y - 7, ww + 14, hh + 14);
    g.fillStyle = col; g.fillRect(x, y, ww, hh);
    for (let i = 1; i < planks; i++) { g.fillStyle = "rgba(30,16,10,0.5)"; g.fillRect(x + (i * ww) / planks - 2, y, 4, hh); }
    g.fillStyle = "rgba(255,240,210,0.14)"; g.fillRect(x, y, ww, 8);
    g.fillStyle = "rgba(30,16,10,0.35)"; g.fillRect(x, y + hh * 0.3, ww, 7); g.fillRect(x, y + hh * 0.72, ww, 7);
  };
  frame(W * 0.5 - 0.48 * m, H - 2.0 * m, 0.96 * m, 2.0 * m, door, 4);
  g.fillStyle = "#e2b84a"; g.beginPath(); g.arc(W * 0.5 + 0.34 * m, H - 1.0 * m, 7, 0, 7); g.fill();
  if (w > 3.4) { frame(W * 0.2 - 0.4 * m, H - 1.95 * m, 0.8 * m, 0.8 * m, shutter, 2); frame(W * 0.8 - 0.4 * m, H - 1.95 * m, 0.8 * m, 0.8 * m, shutter, 2); }
});
const zinc = () => ctex("zinc", 512, 512, (g, r) => {
  g.fillStyle = "#a9a59d"; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 16) {
    const gr = g.createLinearGradient(x, 0, x + 16, 0);
    gr.addColorStop(0, "rgba(255,246,230,0.25)"); gr.addColorStop(0.5, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(40,22,12,0.28)");
    g.fillStyle = gr; g.fillRect(x, 0, 16, 512);
  }
  blot(g, r, 512, 512, 26, "160,74,30", 0.42, [20, 100]);
  for (let y = 0; y < 512; y += 128) { g.fillStyle = "rgba(40,20,10,0.3)"; g.fillRect(0, y, 512, 3); }
});
const thatch = () => ctex("thatch", 512, 512, (g, r) => {
  g.fillStyle = "#b9954e"; g.fillRect(0, 0, 512, 512);
  for (let y = 0; y < 512; y += 64) {
    for (let i = 0; i < 260; i++) { g.strokeStyle = ["rgba(240,214,140,0.5)", "rgba(110,80,36,0.5)", "rgba(200,168,92,0.6)"][i % 3]; g.lineWidth = U(r, 1, 3); const x = U(r, 0, 512); g.beginPath(); g.moveTo(x, y + U(r, 0, 10)); g.lineTo(x + U(r, -8, 8), y + 64 + U(r, 0, 14)); g.stroke(); }
    g.fillStyle = "rgba(60,38,16,0.4)"; g.fillRect(0, y + 58, 512, 8);
  }
});
const jute = () => ctex("jute", 256, 256, (g, r) => {
  g.fillStyle = "#c9a56a"; g.fillRect(0, 0, 256, 256);
  for (let i = 0; i < 256; i += 8) { g.fillStyle = "rgba(96,64,30,0.28)"; g.fillRect(i, 0, 3, 256); g.fillRect(0, i, 256, 3); }
  speck(g, r, 256, 256, 500, ["rgba(250,230,180,0.4)", "rgba(96,64,30,0.3)"], 3);
  g.fillStyle = "rgba(40,90,150,0.55)"; g.fillRect(0, 100, 256, 10); g.fillRect(0, 122, 256, 5);
});
const wood = (key: string, base: string) => ctex("wd" + key, 512, 512, (g, r) => {
  for (let y = 0; y < 512; y += 64) {
    g.fillStyle = base; g.fillRect(0, y, 512, 64);
    g.fillStyle = `rgba(${r() > 0.5 ? "255,230,200,0.1" : "40,20,10,0.14"})`; g.fillRect(0, y, 512, 64);
    for (let k = 0; k < 6; k++) { g.strokeStyle = "rgba(40,20,10,0.16)"; g.lineWidth = 2; g.beginPath(); const yy = y + U(r, 8, 56); g.moveTo(0, yy); g.bezierCurveTo(170, yy + U(r, -6, 6), 340, yy + U(r, -6, 6), 512, yy); g.stroke(); }
    g.fillStyle = "rgba(30,15,10,0.5)"; g.fillRect(0, y, 512, 3);
  }
});
const grater = () => ctex("grater", 256, 256, (g) => {
  g.fillStyle = "#b9bcc2"; g.fillRect(0, 0, 256, 256);
  for (let y = 10; y < 256; y += 18) for (let x = 10 + ((y / 18) % 2) * 9; x < 256; x += 18) { g.fillStyle = "#4a4d55"; g.beginPath(); g.arc(x, y, 3.6, 0, 7); g.fill(); g.fillStyle = "#f2f4f7"; g.beginPath(); g.arc(x - 1.5, y - 2.5, 2, 0, 7); g.fill(); }
});
const stripes = (key: string, a: string, b: string, n = 8) => ctex("str" + key, 512, 64, (g) => {
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect((i * 512) / n, 0, 512 / n + 1, 64); }
});
const ankara = (key: string, a: string, b: string, c: string) => ctex("ank" + key, 256, 256, (g) => {
  g.fillStyle = a; g.fillRect(0, 0, 256, 256);
  for (let y = 0; y < 4; y++) for (let x = 0; x < 4; x++) { g.fillStyle = b; g.beginPath(); g.arc(x * 64 + 32, y * 64 + 32, 22, 0, 7); g.fill(); g.fillStyle = c; g.beginPath(); g.arc(x * 64 + 32, y * 64 + 32, 9, 0, 7); g.fill(); }
});
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col: string, font = "Georgia, serif") => {
  g.font = `bold ${size}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y);
};
const board = (key: string, bg: string, fg: string, s: string) => ctex("board" + key, 640, 160, (g) => {
  g.fillStyle = "#241726"; g.fillRect(0, 0, 640, 160); g.fillStyle = bg; g.fillRect(10, 10, 620, 140); text(g, s, 320, 84, 84, fg);
});
/** chalk tally on her hut wall: n strokes */
const tally = (n: number) => ctex("tally" + n, 256, 128, (g, r) => {
  g.clearRect(0, 0, 256, 128);
  for (let i = 0; i < n; i++) { g.strokeStyle = "rgba(255,250,240,0.95)"; g.lineWidth = 12; g.lineCap = "round"; g.beginPath(); g.moveTo(50 + i * 60 + U(r, -5, 5), 18); g.lineTo(56 + i * 60 + U(r, -5, 5), 110); g.stroke(); }
});
const newspaper = () => ctex("paper", 600, 800, (g, r) => {
  g.fillStyle = "#ece2c6"; g.fillRect(0, 0, 600, 800);
  blot(g, r, 600, 800, 14, "150,120,70", 0.12, [60, 200]);
  g.fillStyle = "#241726"; g.fillRect(30, 96, 540, 5); g.fillRect(30, 222, 540, 3);
  text(g, "THE DAILY POST", 300, 54, 54, "#241726");
  text(g, "1981", 300, 164, 104, "#8a1f1f");
  text(g, "MOZAMBIQUE", 300, 270, 60, "#241726", "Arial, sans-serif");
  // a drawing: a cracked field, a cassava root, people sitting with sticks
  g.strokeStyle = "#241726"; g.lineWidth = 5; g.strokeRect(40, 320, 520, 260);
  g.fillStyle = "#d9c9a0"; g.fillRect(43, 323, 514, 254);
  for (let i = 0; i < 5; i++) { const x = 100 + i * 100; g.fillStyle = "#241726"; g.beginPath(); g.arc(x, 440, 22, 0, 7); g.fill(); g.fillRect(x - 16, 462, 32, 62); g.fillRect(x + 28, 420, 5, 110); }
  g.beginPath(); g.moveTo(43, 540); for (let x = 43; x < 557; x += 30) g.lineTo(x + 15, 540 + (x % 60 ? 12 : -8)); g.stroke();
  for (let i = 0; i < 7; i++) { g.fillStyle = "rgba(36,23,38,0.45)"; g.fillRect(40, 610 + i * 24, i % 3 === 2 ? 380 : 520, 10); }
});
const glowTex = () => ctex("glow", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

// ---------------- geometry helpers ----------------
const M4 = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, sx = 1, sy = sx, sz = sx) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(sx, sy, sz));
const cyl = (r: number, h: number, n = 20, rTop = r) => new THREE.CylinderGeometry(rTop, r, h, n, 1, false);
const ball = (r: number, n = 14) => new THREE.SphereGeometry(r, n, Math.max(6, n - 4));
const groundQ = (x0: number, x1: number, z0: number, z1: number, y: number, tile: number) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / tile, uv.getY(i) * (z1 - z0) / tile);
  return g;
};
const panel = (w: number, h: number, x: number, y: number, z: number, ry = 0) => { const g = new THREE.PlaneGeometry(w, h); g.applyMatrix4(M4(x, y, z, 0, ry)); return g; };
const hsh = (i: number, s = 0) => { const v = Math.sin(i * 127.1 + s * 311.7) * 43758.5453; return v - Math.floor(v); };

type Mats = Record<string, THREE.Material>;
const tt = (o: THREE.MeshLambertMaterialParameters) => twoTone(new THREE.MeshLambertMaterial(o));

/** a mud house: walls, painted facade on the side `face` (0 = +z, 1 = +x, 2 = -x), zinc gable roof or thatch cone */
const house = (b: Batch, M: Mats, key: string, x0: number, z0: number, w: number, d: number, h: number, face: 0 | 1 | 2, wall: string, door: string, shut: string, roof: "zinc" | "thatch") => {
  const x1 = x0 + w, z1 = z0 + d, wallM = lam("mud" + wall, () => ({ map: rep(mud(wall, wall), Math.max(1, Math.round(Math.max(w, d) / 4)), 1) }));
  b.add(boxGeo(V(x0, 0, z0), V(x1, h, z1)), wallM);
  const fw = face === 0 ? w : d, fac = lam("mudF" + key, () => ({ map: mudFacade(key, fw, h, wall, door, shut) }));
  if (face === 0) b.add(panel(w, h, (x0 + x1) / 2, h / 2, z1 + 0.012), fac);
  if (face === 1) b.add(panel(d, h, x1 + 0.012, h / 2, (z0 + z1) / 2, Math.PI / 2), fac);
  if (face === 2) b.add(panel(d, h, x0 - 0.012, h / 2, (z0 + z1) / 2, -Math.PI / 2), fac);
  if (roof === "zinc") {
    const ridgeAlongX = w >= d, half = (ridgeAlongX ? d : w) / 2 + 0.55, len = (ridgeAlongX ? w : d) + 0.9, rise = 1.05, sl = Math.hypot(half, rise), ang = Math.atan2(rise, half);
    for (const s of [-1, 1]) {
      const g = new THREE.PlaneGeometry(len, sl); g.rotateX(-Math.PI / 2 + s * ang);
      if (!ridgeAlongX) g.rotateY(Math.PI / 2);
      const off = (s * half) / 2;
      b.add(g, M.zinc, M4((x0 + x1) / 2 + (ridgeAlongX ? 0 : off), h + rise / 2 - 0.08, (z0 + z1) / 2 + (ridgeAlongX ? off : 0)));
    }
    // gable ends
    for (const s of [-1, 1]) {
      const g = new THREE.BufferGeometry(), hw = (ridgeAlongX ? d : w) / 2;
      const pts = ridgeAlongX ? [[0, 0, -hw], [0, 0, hw], [0, rise * (hw / half), 0]] : [[-hw, 0, 0], [hw, 0, 0], [0, rise * (hw / half), 0]];
      g.setAttribute("position", new THREE.Float32BufferAttribute((s > 0 ? pts : [pts[1], pts[0], pts[2]]).flat(), 3)); g.computeVertexNormals();
      g.setAttribute("uv", new THREE.Float32BufferAttribute([0, 0, 1, 0, 0.5, 1], 2));
      b.add(g, wallM, M4(ridgeAlongX ? (s > 0 ? x1 : x0) : (x0 + x1) / 2, h, ridgeAlongX ? (z0 + z1) / 2 : (s > 0 ? z1 : z0), 0, ridgeAlongX ? 0 : (s > 0 ? 0 : Math.PI)));
    }
    for (let k = 0; k < 4; k++) b.add(ball(0.16, 8), M.stone, M4(x0 + 0.6 + hsh(k, w) * (w - 1.2), h + 0.5 + 0.3 * hsh(k, 3), z0 + 0.5 + hsh(k, 5) * (d - 1)));
  } else {
    const R = Math.hypot(w, d) / 2 + 0.5;
    const c = new THREE.ConeGeometry(R, 1.9, 18, 1, true); b.add(c, M.thatch, M4((x0 + x1) / 2, h + 0.85, (z0 + z1) / 2));
    b.add(cyl(0.12, 0.3, 8), M.woodDark, M4((x0 + x1) / 2, h + 1.9, (z0 + z1) / 2));
  }
};

/** enamel basin (0 = empty .. 1 = heaped with white garri) */
const basin = (b: Batch, M: Mats, x: number, y: number, z: number, col: THREE.Material, fill: number, s = 1) => {
  b.add(cyl(0.2 * s, 0.2 * s, 20, 0.34 * s), col, M4(x, y + 0.1 * s, z));
  b.add(new THREE.TorusGeometry(0.34 * s, 0.018 * s, 6, 24), M.enamelRim, M4(x, y + 0.2 * s, z, Math.PI / 2));
  if (fill > 0) b.add(ball(0.31 * s, 16), M.garri, M4(x, y + 0.17 * s, z, 0, 0, 0, 1, 0.25 + 0.5 * fill, 1));
};
const tuber = (b: Batch, mat: THREE.Material, x: number, y: number, z: number, ry: number, len = 0.42, r = 0.055) => {
  const g = cyl(r * 0.45, len, 10, r); g.rotateZ(Math.PI / 2); b.add(g, mat, M4(x, y, z, 0, ry));
};
const palm = (b: Batch, M: Mats, x: number, z: number, h: number, lean: number, seed: number) => {
  const n = 9; let px = x, py = 0; const pz = z;
  for (let i = 0; i < n; i++) {
    const seg = h / n, r = 0.2 - 0.008 * i, dx = Math.sin(lean) * seg * (0.4 + i / n);
    b.add(cyl(r, seg * 1.02, 10, r * 0.92), i % 2 ? M.trunk : M.trunk2, M4(px + dx / 2, py + seg / 2, pz, 0, 0, -lean * (0.4 + i / n)));
    px += dx; py += seg;
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + seed, L = 2.1 + 0.4 * Math.sin(seed * 3 + k), leaf = new THREE.BufferGeometry(), pts: number[] = [], seg = 8;
    for (let j = 0; j < seg; j++) {
      const t0 = j / seg, t1 = (j + 1) / seg, w0 = 0.32 * Math.sin(Math.PI * Math.min(1, t0 * 1.15 + 0.05)), w1 = 0.32 * Math.sin(Math.PI * Math.min(1, t1 * 1.15 + 0.05));
      const P = (t: number, w: number): [number, number, number] => [t * L, 0.35 * t * L - 1.25 * (t * L) ** 2 / L, w];
      const a0 = P(t0, -w0), a1 = P(t0, w0), b0 = P(t1, -w1), b1 = P(t1, w1);
      pts.push(...a0, ...b0, ...b1, ...a0, ...b1, ...a1);
    }
    leaf.setAttribute("position", new THREE.Float32BufferAttribute(pts, 3)); leaf.computeVertexNormals();
    b.add(leaf, M.frond, M4(px, py, pz, 0, a, 0));
  }
};
/** a cassava plant: a knobbly stem and hand-shaped leaves */
const cassava = (b: Batch, stem: THREE.Material, leaf: THREE.Material, x: number, z: number, h: number, seed: number) => {
  b.add(cyl(0.03, h, 6, 0.022), stem, M4(x, h / 2, z, 0.06 * Math.sin(seed), 0, 0.08 * Math.cos(seed)));
  for (let k = 0; k < 5; k++) {
    const a = seed + k * 1.3, y = h * (0.62 + 0.09 * k), R = 0.3;
    for (let j = 0; j < 5; j++) {
      const g = new THREE.SphereGeometry(0.16, 6, 4); const fa = a + (j - 2) * 0.42;
      b.add(g, leaf, M4(x + Math.cos(a) * 0.22 + Math.cos(fa) * R, y - 0.03 * Math.abs(j - 2), z + Math.sin(a) * 0.22 + Math.sin(fa) * R, 0, -fa, 0, 1.25, 0.1, 0.34));
    }
  }
};
const stall = (b: Batch, M: Mats, x: number, z: number, canopy: THREE.Material, basins: number, fill: number) => {
  b.add(boxGeo(V(x - 1.1, 0.72, z - 0.45), V(x + 1.1, 0.8, z + 0.45)), M.wood);
  for (const [dx, dz] of [[-1, -0.38], [1, -0.38], [-1, 0.38], [1, 0.38]]) b.add(boxGeo(V(x + dx - 0.04, 0, z + dz - 0.04), V(x + dx + 0.04, 0.72, z + dz + 0.04)), M.woodDark);
  for (const dx of [-1.1, 1.1]) b.add(cyl(0.035, 2.4, 6), M.woodDark, M4(x + dx, 1.2, z - 0.5));
  const c = new THREE.PlaneGeometry(2.7, 1.5); c.rotateX(-Math.PI / 2 + 0.22); b.add(c, canopy, M4(x, 2.3, z - 0.05));
  for (let i = 0; i < basins; i++) basin(b, M, x - 0.75 + i * 0.75, 0.8, z, [M.enBlue, M.enRed, M.enGreen][i % 3], fill);
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite; private moon: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private wet = new THREE.Group(); private dry = new THREE.Group();
  private stone: THREE.Mesh; private tallyMat: THREE.MeshBasicMaterial; private tallies: THREE.Texture[];
  private fire: THREE.Mesh[] = []; private fireGlow: THREE.Sprite;
  private rootWhole = new THREE.Group(); private rootCut = new THREE.Group();
  private fullBasins = new THREE.Group(); private emptyStall = new THREE.Group(); private fullStall = new THREE.Group();
  private wifeBasin = new THREE.Group(); private bowls = new THREE.Group();
  private stars: THREE.Points;
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    // ---- sky + light ----
    this.skyMat = new THREE.ShaderMaterial({
      uniforms: { c0: { value: new THREE.Color() }, c1: { value: new THREE.Color() }, c2: { value: new THREE.Color() },
        c3: { value: new THREE.Color() }, c4: { value: new THREE.Color() }, e: { value: new THREE.Vector4() } },
      vertexShader: "varying vec3 vP; void main(){ vP = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",
      fragmentShader: `uniform vec3 c0, c1, c2, c3, c4; uniform vec4 e; varying vec3 vP;
        void main(){ float el = asin(clamp(normalize(vP).y, -1.0, 1.0));
          vec3 c = mix(c0, c1, smoothstep(0.0, e.x, el));
          c = mix(c, c2, smoothstep(e.x, e.y, el));
          c = mix(c, c3, smoothstep(e.y, e.z, el));
          c = mix(c, c4, smoothstep(e.z, e.w, el));
          gl_FragColor = vec4(c, 1.0); }`,
      side: THREE.BackSide, depthWrite: false, fog: false,
    });
    this.sky = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), this.skyMat);
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK); R.add(this.sky);
    const disc = ctex("sunDisc", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 56, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
    this.moon = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, color: new THREE.Color(2.2, 2.3, 2.6), fog: false, depthWrite: false }));
    this.sunDisc.renderOrder = -0.5; this.moon.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo, this.moon]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
    const sp: number[] = []; for (let i = 0; i < 500; i++) { const a = hsh(i) * 6.283, e = 0.12 + hsh(i, 2) * 1.3; sp.push(Math.cos(a) * Math.cos(e) * 1000, Math.sin(e) * 1000, Math.sin(a) * Math.cos(e) * 1000); }
    const sg = new THREE.BufferGeometry(); sg.setAttribute("position", new THREE.Float32BufferAttribute(sp, 3));
    this.stars = new THREE.Points(sg, new THREE.PointsMaterial({ color: new THREE.Color(1.6, 1.6, 1.9), size: 2.2, sizeAttenuation: false, fog: false, depthWrite: false }));
    this.stars.frustumCulled = false; this.stars.layers.set(NOINK); this.stars.renderOrder = -0.8; R.add(this.stars);
    this.hemi = new THREE.HemisphereLight("#cfe6ff", "#6c5c8c", 1.1);
    this.sun = new THREE.DirectionalLight("#fff0d6", 2.6);
    this.sun.castShadow = true; this.sun.shadow.mapSize.set(4096, 4096);
    R.add(this.hemi, this.sun, this.sun.target);
    this.cloudMaps = { day: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.day.cloud)), golden: [0, 1, 2, 3].map((k) => cloudHD(k, LOOK.golden.cloud)) };
    for (let i = 0; i < 9; i++) {
      const a = (i / 9) * Math.PI * 2 + 0.3, d = 620 + (i % 3) * 60;
      const m = new THREE.Mesh(new THREE.PlaneGeometry(1, 1), new THREE.MeshBasicMaterial({ map: this.cloudMaps.day[i % 4], color: new THREE.Color(1.1, 1.1, 1.1), transparent: true, depthWrite: false, fog: false }));
      const w = 130 + (i % 4) * 30;
      m.position.set(Math.cos(a) * d, 110 + (i % 4) * 34, Math.sin(a) * d); m.scale.set(w, w / 2, 1); m.layers.set(NOINK);
      this.clouds.push(m); R.add(m);
    }

    // ---- materials ----
    M.earth = lam("earth", () => ({ map: earth() }));
    M.cracked = lam("cracked", () => ({ map: cracked() }));
    M.zinc = lam("zinc", () => ({ map: rep(zinc(), 3, 2), side: THREE.DoubleSide }));
    M.thatch = lam("thatch", () => ({ map: rep(thatch(), 6, 2), side: THREE.DoubleSide }));
    M.wood = lam("wood", () => ({ map: wood("a", "#a8743f") }));
    M.woodDark = tt({ color: "#6b4426" });
    M.stone = tt({ color: "#8f8a86" });
    M.stoneBig = twoTone(new THREE.MeshLambertMaterial({ color: "#7d7873", flatShading: true }));
    M.jute = lam("jute", () => ({ map: rep(jute(), 1.5, 1.5) }));
    M.rope = tt({ color: "#e8d9b0" });
    M.garri = tt({ color: "#f7f0d8" });
    M.mash = tt({ color: "#fbf8ee" });
    M.peel = tt({ color: "#6e4a2e" });
    M.flesh = tt({ color: "#fdfaf0" });
    M.iron = twoTone(new THREE.MeshPhongMaterial({ color: "#2c2a30", specular: "#8a8a90", shininess: 40 }), 0.15);
    M.grater = lam("grater", () => ({ map: rep(grater(), 2, 3) }));
    M.clay = tt({ color: "#b0603a" });
    M.enBlue = twoTone(new THREE.MeshPhongMaterial({ color: "#2f6fc0", specular: "#ffffff", shininess: 60 }), 0.2);
    M.enRed = twoTone(new THREE.MeshPhongMaterial({ color: "#d0402f", specular: "#ffffff", shininess: 60 }), 0.2);
    M.enGreen = twoTone(new THREE.MeshPhongMaterial({ color: "#2f9a62", specular: "#ffffff", shininess: 60 }), 0.2);
    M.enamelRim = tt({ color: "#f4f1ea" });
    M.trunk = tt({ color: "#8a6a4a" }); M.trunk2 = tt({ color: "#7a5a3c" });
    M.frond = tt({ color: "#4f9e3e", side: THREE.DoubleSide });
    M.leaf = tt({ color: "#4a9a3c" }); M.leaf2 = tt({ color: "#63ad45" });
    M.cassLeaf = tt({ color: "#3f8f3a" }); M.cassStem = tt({ color: "#9a5a48" });
    M.dryLeaf = tt({ color: "#c2a35a" }); M.dryStem = tt({ color: "#a08a5a" });
    M.grass = tt({ color: "#6aa84a" }); M.dryGrass = tt({ color: "#c8b06a" });
    M.yam = tt({ color: "#7a5236" });
    M.maizeCob = tt({ color: "#f2c230" });
    M.water = twoTone(new THREE.MeshPhongMaterial({ color: "#8a7a5a", specular: "#ffffff", shininess: 80, transparent: true, opacity: 0.6 }), 0.3);
    M.chicken = tt({ color: "#f6f2ea" }); M.comb = tt({ color: "#d0302a" }); M.beak = tt({ color: "#f2b632" });
    M.paper = tt({ map: newspaper() });
    const cloths = [ankara("a", "#1f5fae", "#f2b632", "#d0402f"), ankara("b", "#b83a2f", "#f4efe2", "#1f5fae"), ankara("c", "#2f8a52", "#f2b632", "#241726"), ankara("d", "#7b3fa0", "#f2a0c0", "#f4efe2")]
      .map((t) => tt({ map: t, side: THREE.DoubleSide }));
    const canopies = [stripes("u1", "#d0402f", "#f4efe2"), stripes("u2", "#2f6fc0", "#f2b632"), stripes("u3", "#2f9a62", "#f4efe2")].map((t) => tt({ map: t, side: THREE.DoubleSide }));

    const b = new Batch(), bw = new Batch(), bd = new Batch(); // always / before the drought / during the drought
    // ================= ground =================
    bw.add(groundQ(-300, 300, -300, 300, 0, 7), M.earth);
    bd.add(groundQ(-300, 300, -300, 300, 0, 4), M.cracked);
    // pebbles, grass tufts (green -> straw), scattered everywhere the camera goes
    for (let i = 0; i < 260; i++) {
      const x = -16 + hsh(i, 1) * 34, z = -12 + hsh(i, 2) * 24;
      b.add(ball(0.03 + 0.05 * hsh(i, 3), 6), M.stone, M4(x, 0.02, z, 0, hsh(i, 4) * 3, 0, 1, 0.6, 1.3));
    }
    for (let i = 0; i < 220; i++) {
      const ring = hsh(i, 5) * 6.283, rad = 9 + hsh(i, 6) * 9, x = Math.cos(ring) * rad * 1.1, z = Math.sin(ring) * rad * 0.9;
      for (let k = 0; k < 3; k++) {
        const g = new THREE.ConeGeometry(0.035, 0.3 + 0.2 * hsh(i, k), 4);
        const m = M4(x + 0.07 * k, 0.14, z + 0.05 * k, 0.3 * (hsh(i, k + 9) - 0.5), 0, 0.5 * (hsh(i, k + 3) - 0.5));
        bw.add(g, M.grass, m); bd.add(g.clone(), M.dryGrass, m);
      }
    }
    // ================= the compound =================
    house(b, M, "big", -6.5, -12.5, 10, 4.2, 2.9, 0, "#c98d5a", "#3f6f8a", "#2f7d4f", "zinc");      // the family's house (north)
    house(b, M, "hut", -11.6, -8.6, 3.6, 5.4, 2.5, 1, "#bf8050", "#8a3a2a", "#8a3a2a", "thatch");    // her hut (west)
    house(b, M, "kit", 7.2, -6.5, 3.6, 4.4, 2.4, 2, "#d09a66", "#5a4a3a", "#5a4a3a", "zinc");        // kitchen store (east)
    house(b, M, "far1", -15, 2.5, 4, 4, 2.5, 1, "#c58a58", "#3f6f8a", "#3f6f8a", "thatch");
    house(b, M, "far2", 13, -16, 6, 4, 2.7, 0, "#c98d5a", "#8a3a2a", "#2f7d4f", "zinc");
    house(b, M, "far3", -22, -14, 5, 4, 2.6, 0, "#d09a66", "#3f6f8a", "#8a3a2a", "zinc");
    // stick fence round the yard, open to the south
    for (let i = 0; i < 70; i++) {
      const t = i / 70, per = 2 * (20 + 9), s = t * per;
      let x: number, z: number;
      if (s < 9) { x = -10; z = 9 - s; } else if (s < 9 + 0) { x = -10; z = 0; } else if (s < 29) { continue; } else { x = 10; z = 9 - (s - 29) * (15 / 29); }
      b.add(cyl(0.03, 1.1 + 0.2 * hsh(i), 5), M.woodDark, M4(x + 0.1 * hsh(i, 2), 0.55, z, 0.1 * (hsh(i, 3) - 0.5), 0, 0.1 * (hsh(i, 4) - 0.5)));
    }
    // mango tree with a bench under it, palms behind the houses
    b.add(cyl(0.26, 3.2, 10, 0.2), M.trunk, M4(6.6, 1.6, 6.2));
    for (let k = 0; k < 9; k++) b.add(new THREE.IcosahedronGeometry(1.2 + 0.5 * hsh(k), 1), k % 2 ? M.leaf : M.leaf2, M4(6.6 + Math.cos(k * 2.1) * 1.5, 3.9 + 0.8 * hsh(k, 2), 6.2 + Math.sin(k * 2.1) * 1.5));
    b.add(boxGeo(V(5.4, 0.4, 5.0), V(6.9, 0.46, 5.35)), M.wood); for (const dx of [5.5, 6.8]) b.add(boxGeo(V(dx - 0.04, 0, 5.05), V(dx + 0.04, 0.4, 5.3)), M.woodDark);
    for (const [x, z, l, s] of [[-13, -14, 0.1, 1], [-2, -15.5, -0.08, 2], [6, -15, 0.12, 3], [12.5, -9, -0.14, 4], [-17, -4, 0.1, 5], [16, 6, -0.1, 6], [-14, 9, 0.12, 7]] as const) palm(b, M, x, z, 7 + (s % 3), l, s);
    // ---- her corner: the sack on a plank rack with a heavy stone, a puddle under it, a low stool, tally marks on the wall
    const [sx, , sz] = SACK;
    for (const dz of [-0.28, 0, 0.28]) b.add(boxGeo(V(sx - 0.5, 0.2, sz + dz - 0.1), V(sx + 0.5, 0.25, sz + dz + 0.1)), M.wood);
    for (const dx of [-0.42, 0.42]) b.add(boxGeo(V(sx + dx - 0.06, 0, sz - 0.4), V(sx + dx + 0.06, 0.2, sz + 0.4)), M.woodDark);
    b.add(ball(0.4, 20), M.jute, M4(sx, 0.75, sz, 0, 0.4, 0.06, 1.0, 1.3, 0.88));
    b.add(ball(0.3, 14), M.jute, M4(sx + 0.12, 0.5, sz + 0.05, 0, 0, 0, 1.2, 0.9, 1.0));
    b.add(cyl(0.09, 0.2, 10, 0.17), M.jute, M4(sx, 1.3, sz));                       // the tied neck
    b.add(new THREE.TorusGeometry(0.11, 0.022, 6, 14), M.rope, M4(sx, 1.25, sz, Math.PI / 2));
    const puddle = new THREE.CircleGeometry(0.2, 20); puddle.rotateX(-Math.PI / 2); b.add(puddle, M.water, M4(sx + 0.05, 0.012, sz + 0.5, 0, 0, 0, 1.3, 1, 0.7));
    this.stone = new THREE.Mesh(new THREE.DodecahedronGeometry(0.2, 0), M.stoneBig); this.stone.castShadow = true; this.stone.receiveShadow = true; this.stone.scale.set(1.25, 0.8, 1.05); R.add(this.stone);
    b.add(cyl(0.16, 0.26, 12), M.wood, M4(WIFE[0], 0.13, WIFE[2]));                  // her low stool
    this.tallies = [0, 1, 2, 3].map((n) => tally(n));
    this.tallyMat = new THREE.MeshBasicMaterial({ map: this.tallies[0], transparent: true, depthWrite: false, fog: true });
    const tm = new THREE.Mesh(panel(0.7, 0.35, -7.98, 1.75, sz + 0.7, Math.PI / 2), this.tallyMat); tm.layers.set(NOINK); R.add(tm);
    b.add(ball(0.2, 12), M.clay, M4(sx + 1.0, 0.2, sz - 0.5, 0, 0, 0, 1, 1.1, 1)); b.add(cyl(0.1, 0.1, 10, 0.13), M.clay, M4(sx + 1.0, 0.44, sz - 0.5));
    // ---- the family's work yard
    const [gx, , gz] = GRATE;
    b.add(boxGeo(V(gx - 0.8, 0.74, gz - 0.45), V(gx + 0.8, 0.8, gz + 0.45)), M.wood);
    for (const [dx, dz] of [[-0.7, -0.38], [0.7, -0.38], [-0.7, 0.38], [0.7, 0.38]]) b.add(boxGeo(V(gx + dx - 0.04, 0, gz + dz - 0.04), V(gx + dx + 0.04, 0.74, gz + dz + 0.04)), M.woodDark);
    const gr = new THREE.BoxGeometry(0.4, 0.03, 0.75); b.add(gr, M.grater, M4(gx, 0.98, gz, -0.5));
    b.add(boxGeo(V(gx - 0.24, 0.8, gz - 0.36), V(gx - 0.2, 1.16, gz - 0.3)), M.woodDark); b.add(boxGeo(V(gx + 0.2, 0.8, gz - 0.36), V(gx + 0.24, 1.16, gz - 0.3)), M.woodDark);
    basin(b, M, gx + 0.52, 0.8, gz + 0.1, M.enBlue, 0.7, 0.7);
    for (let k = 0; k < 9; k++) tuber(b, k % 3 ? M.flesh : M.peel, gx - 0.55 + 0.1 * (k % 3), 0.86 + 0.07 * Math.floor(k / 3), gz - 0.1 + 0.12 * (k % 2), 0.5 * k);
    for (let k = 0; k < 16; k++) tuber(b, M.peel, gx - 1.6 + 0.3 * hsh(k), 0.07 + 0.1 * (k % 3), gz + 0.5 + 0.5 * hsh(k, 2), hsh(k, 3) * 3, 0.5, 0.07); // unpeeled heap on the ground
    const [px, , pz] = PRESS; // the press: two posts, a cross beam, a stack of small sacks squeezed under a log
    for (const dx of [-0.6, 0.6]) b.add(boxGeo(V(px + dx - 0.07, 0, pz - 0.07), V(px + dx + 0.07, 1.7, pz + 0.07)), M.woodDark);
    b.add(boxGeo(V(px - 0.75, 1.55, pz - 0.09), V(px + 0.75, 1.7, pz + 0.09)), M.woodDark);
    for (let k = 0; k < 3; k++) b.add(ball(0.36, 14), M.jute, M4(px, 0.2 + k * 0.3, pz, 0, k, 0, 1.15, 0.5, 0.95));
    b.add(boxGeo(V(px - 0.5, 1.05, pz - 0.25), V(px + 0.5, 1.13, pz + 0.25)), M.wood); b.add(cyl(0.05, 0.45, 8), M.iron, M4(px, 1.34, pz));
    const [fx, , fz] = FRY; // the mud stove, wide iron pan, firewood, flames
    b.add(cyl(0.6, 0.5, 18, 0.5), M.clay, M4(fx, 0.25, fz));
    b.add(cyl(0.3, 0.16, 20, 0.62), M.iron, M4(fx, 0.58, fz));
    b.add(ball(0.56, 18), M.garri, M4(fx, 0.6, fz, 0, 0, 0, 1, 0.12, 1));
    for (let k = 0; k < 4; k++) { const g = cyl(0.045, 1.0, 6); g.rotateZ(Math.PI / 2); b.add(g, M.woodDark, M4(fx + 0.55 * Math.cos(2.0 + k * 0.35), 0.06, fz + 0.75 * Math.sin(2.0 + k * 0.35) + 0.2, 0, 1.2 - k * 0.3)); }
    for (let k = 0; k < 5; k++) {
      const m = new THREE.Mesh(new THREE.ConeGeometry(0.07 + 0.02 * k, 0.3, 6), new THREE.MeshBasicMaterial({ color: new THREE.Color(k % 2 ? "#ffb030" : "#ff6a20").multiplyScalar(2.4), fog: false }));
      m.position.set(fx + 0.28 * Math.cos(1.4 + k * 0.5), 0.2, fz + 0.52 + 0.1 * Math.sin(k)); m.layers.set(NOINK); this.fire.push(m); R.add(m);
    }
    this.fireGlow = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1.0, 0.5, 0.15), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    this.fireGlow.position.set(fx, 0.5, fz + 0.5); this.fireGlow.scale.setScalar(2.6); this.fireGlow.layers.set(NOINK); R.add(this.fireGlow);
    for (let k = 0; k < 10; k++) { const g = cyl(0.05, 0.9, 6); g.rotateZ(Math.PI / 2); b.add(g, M.woodDark, M4(8.2, 0.06 + 0.1 * Math.floor(k / 4), 0.6 + 0.12 * (k % 4), 0, 0.1 * (k % 3))); } // firewood stack
    // the row of basins: heaped (their quick garri) -> the group can be hidden when they have sold out
    const fb = new Batch();
    for (let i = 0; i < 6; i++) basin(fb, M, BASINS[0] - 1.6 + i * 0.8, 0, BASINS[2] + 0.12 * (i % 2), [M.enBlue, M.enRed, M.enGreen][i % 3], 0.8 + 0.2 * hsh(i));
    fb.build(this.fullBasins); R.add(this.fullBasins);
    // mother-in-law's stool, a second stool in the wife's corner (for the ending), a mat, clay water pots, chickens
    for (const [x, z] of [[STOOL[0], STOOL[2]], [WIFE[0] + 1.5, WIFE[2] + 1.2]]) { b.add(cyl(0.2, 0.06, 14), M.wood, M4(x, 0.42, z)); for (let k = 0; k < 3; k++) b.add(cyl(0.025, 0.42, 6), M.woodDark, M4(x + 0.13 * Math.cos(k * 2.1), 0.21, z + 0.13 * Math.sin(k * 2.1), 0.15 * Math.sin(k * 2.1), 0, -0.15 * Math.cos(k * 2.1))); }
    for (const [x, z, s] of [[-7.4, -1.6, 1.3], [-7.1, -0.7, 1], [7.0, -1.2, 1.2]] as const) { b.add(ball(0.26 * s, 14), M.clay, M4(x, 0.26 * s, z, 0, 0, 0, 1, 1.05, 1)); b.add(cyl(0.12 * s, 0.1 * s, 12, 0.16 * s), M.clay, M4(x, 0.55 * s, z)); }
    for (const [x, z, a] of [[-2.2, 6.0, 0.4], [1.6, 6.8, 2.2], [-3.6, 1.8, 4.0], [5.6, 0.2, 1.0]] as const) {
      b.add(ball(0.13, 10), M.chicken, M4(x, 0.2, z, 0, a, 0, 1.3, 1, 0.9)); b.add(ball(0.065, 8), M.chicken, M4(x + 0.15 * Math.cos(a), 0.34, z - 0.15 * Math.sin(a)));
      b.add(ball(0.03, 6), M.comb, M4(x + 0.15 * Math.cos(a), 0.41, z - 0.15 * Math.sin(a))); b.add(new THREE.ConeGeometry(0.02, 0.06, 5), M.beak, M4(x + 0.22 * Math.cos(a), 0.34, z - 0.22 * Math.sin(a), 0, a, -Math.PI / 2));
      for (const s of [-1, 1]) b.add(cyl(0.008, 0.1, 4), M.beak, M4(x + 0.04 * s * Math.sin(a), 0.05, z + 0.04 * s * Math.cos(a)));
    }
    // a clothes line of wrappers between two poles (east side)
    for (const z of [3.2, 7.4]) b.add(cyl(0.04, 2.1, 6), M.woodDark, M4(8.8, 1.05, z));
    b.add(boxGeo(V(8.79, 1.98, 3.2), V(8.81, 2.0, 7.4)), M.rope);
    cloths.forEach((c, i) => b.add(panel(0.85, 1.15, 8.8, 1.42, 3.8 + i * 0.95, Math.PI / 2 + 0.06 * (i % 2 ? 1 : -1)), c));
    // the small table for the cut-open root
    const [tx, , tz] = TABLE;
    b.add(boxGeo(V(tx - 0.45, 0.72, tz - 0.3), V(tx + 0.45, 0.78, tz + 0.3)), M.wood);
    for (const [dx, dz] of [[-0.4, -0.25], [0.4, -0.25], [-0.4, 0.25], [0.4, 0.25]]) b.add(boxGeo(V(tx + dx - 0.03, 0, tz + dz - 0.03), V(tx + dx + 0.03, 0.72, tz + dz + 0.03)), M.woodDark);
    const rw = new Batch(), rc = new Batch();
    tuber(rw, M.peel, tx, 0.85, tz, 0.25, 0.6, 0.075);
    { // two halves: the brown skin and the white flesh on the cut faces
      for (const s of [-1, 1]) {
        const g = cyl(s < 0 ? 0.075 : 0.05, 0.27, 14, s < 0 ? 0.062 : 0.075); g.rotateZ(Math.PI / 2);
        rc.add(g, M.peel, M4(tx + s * 0.2, 0.85, tz + s * 0.03, 0, 0.25 + s * 0.25));
        rc.add(new THREE.CircleGeometry(0.058, 16), M.flesh, M4(tx + s * 0.062, 0.85, tz + s * 0.05, 0, s * Math.PI / 2 + 0.25 + s * 0.25));
      }
      rc.add(boxGeo(V(tx - 0.012, 0.79, tz - 0.2), V(tx + 0.012, 0.83, tz + 0.2)), M.grater); // the knife
    }
    rw.build(this.rootWhole); rc.build(this.rootCut); R.add(this.rootWhole, this.rootCut);
    // ---- yam barn (full / empty), maize patch (green / dead), cassava field
    const [bx, , bz] = BARN;
    for (const dx of [-1, 0, 1]) for (const dz of [-0.4, 0.4]) b.add(cyl(0.045, 2.0, 6), M.woodDark, M4(bx + dx, 1.0, bz + dz));
    for (const y of [0.6, 1.2, 1.8]) for (const dz of [-0.4, 0.4]) b.add(boxGeo(V(bx - 1.1, y, bz + dz - 0.03), V(bx + 1.1, y + 0.05, bz + dz + 0.03)), M.woodDark);
    const th = new THREE.PlaneGeometry(2.6, 1.3); th.rotateX(-Math.PI / 2 + 0.25); b.add(th, M.thatch, M4(bx, 2.15, bz));
    for (let k = 0; k < 24; k++) bw.add(ball(0.11, 8), M.yam, M4(bx - 0.9 + (k % 6) * 0.36, 0.72 + Math.floor(k / 12) * 0.6, bz - 0.3 + (Math.floor(k / 6) % 2) * 0.55, 0, hsh(k) * 3, 0, 1.7, 0.9, 0.9));
    bd.add(ball(0.09, 8), M.yam, M4(bx + 0.5, 0.71, bz - 0.2, 0, 1, 0, 1.5, 0.7, 0.8)); // one shrivelled yam left
    const [mx, , mz] = MAIZE;
    for (let i = 0; i < 40; i++) {
      const x = mx - 2 + (i % 8) * 0.6 + 0.2 * hsh(i), z = mz - 1.6 + Math.floor(i / 8) * 0.8, hgt = 1.7 + 0.4 * hsh(i, 2);
      bw.add(cyl(0.03, hgt, 5), M.cassLeaf, M4(x, hgt / 2, z));
      for (let k = 0; k < 4; k++) { const g = new THREE.PlaneGeometry(0.7, 0.1); bw.add(g, M.frond, M4(x, hgt * (0.35 + 0.16 * k), z, 0.5, k * 1.7 + i, 0.5)); }
      bw.add(ball(0.06, 6), M.maizeCob, M4(x + 0.07, hgt * 0.55, z, 0, 0, 0.3, 0.8, 2.2, 0.8));
      const lean = 0.5 + 0.7 * hsh(i, 5);
      bd.add(cyl(0.025, hgt * 0.8, 5), M.dryStem, M4(x + 0.3 * lean, hgt * 0.36, z, 0, 0, -lean));
      for (let k = 0; k < 2; k++) { const g = new THREE.PlaneGeometry(0.6, 0.08); bd.add(g, tt({ color: "#c2a35a", side: THREE.DoubleSide }), M4(x + 0.4, 0.25 + 0.3 * k, z, 1.2, k * 2 + i, 1.2)); }
    }
    for (let i = 0; i < 70; i++) {
      const x = FIELD[0] - 6 + (i % 10) * 1.3 + 0.3 * hsh(i), z = FIELD[2] + 1.5 - Math.floor(i / 10) * 1.5;
      if (Math.abs(x - FIELD[0]) < 0.3 && Math.abs(z - FIELD[2]) < 1.2 && i !== 4) continue;
      cassava(b, M.cassStem, M.cassLeaf, x, z, 1.5 + 0.5 * hsh(i, 2), i * 1.7);
    }
    cassava(b, M.cassStem, M.cassLeaf, FIELD[0], FIELD[2], 1.9, 0.7); // the hero plant
    for (let k = 0; k < 4; k++) tuber(b, M.peel, FIELD[0] + 0.14 * Math.cos(k * 1.6), 0.03, FIELD[2] + 0.14 * Math.sin(k * 1.6) + 0.12, k * 1.6, 0.4, 0.07); // roots breaking the ground
    // ================= the market =================
    const [qx, , qz] = MARKET;
    for (let i = 0; i < 7; i++) {
      const x = qx - 9 + i * 3.0, isFam = i === 3;
      if (isFam) { const fs = new Batch(), es = new Batch(); stall(fs, M, x, STALL[2], canopies[0], 3, 0.9); stall(es, M, x, STALL[2], canopies[0], 3, 0); fs.build(this.fullStall); es.build(this.emptyStall); }
      else if (Math.abs(x - WIFE_STALL[0]) < 1.4) continue;
      else stall(b, M, x, STALL[2] - 0.2 * (i % 2), canopies[i % 3], 3, 0.6);
    }
    R.add(this.fullStall, this.emptyStall);
    // her own small table at the end of the row, with one basin
    b.add(boxGeo(V(WIFE_STALL[0] - 0.6, 0.7, WIFE_STALL[2] - 0.35), V(WIFE_STALL[0] + 0.6, 0.76, WIFE_STALL[2] + 0.35)), M.wood);
    for (const [dx, dz] of [[-0.5, -0.28], [0.5, -0.28], [-0.5, 0.28], [0.5, 0.28]]) b.add(boxGeo(V(WIFE_STALL[0] + dx - 0.035, 0, WIFE_STALL[2] + dz - 0.035), V(WIFE_STALL[0] + dx + 0.035, 0.7, WIFE_STALL[2] + dz + 0.035)), M.woodDark);
    { const wb = new Batch(); basin(wb, M, WIFE_STALL[0], 0.76, WIFE_STALL[2], M.enGreen, 1); wb.build(this.wifeBasin); R.add(this.wifeBasin); }
    b.add(panel(2.2, 0.55, STALL[0], 2.75, STALL[2] + 0.72), tt({ map: board("g", "#f2b632", "#241726", "GARRI") }));
    for (let i = 0; i < 5; i++) house(b, M, "mk" + i, qx - 14 + i * 6.2, qz - 9.5, 5.2, 4, 2.7 + 0.3 * (i % 2), 0, ["#c98d5a", "#d09a66", "#bf8050"][i % 3], ["#3f6f8a", "#8a3a2a", "#2f7d4f"][i % 3], "#2f7d4f", i % 2 ? "thatch" : "zinc");
    for (const [x, z, l, s] of [[qx - 12, qz - 12, 0.1, 1], [qx + 2, qz - 12.5, -0.1, 2], [qx + 11, qz - 11, 0.12, 3], [qx - 16, qz + 3, -0.1, 4], [qx + 15, qz + 2, 0.1, 5]] as const) palm(b, M, x, z, 7 + (s % 3), l, s);
    for (let i = 0; i < 80; i++) b.add(ball(0.03 + 0.04 * hsh(i, 7), 6), M.stone, M4(qx - 12 + hsh(i, 8) * 24, 0.02, qz - 2 + hsh(i, 9) * 9, 0, 0, 0, 1, 0.6, 1.3));
    // ================= the far village (1981) =================
    const [ax, , az] = FAR;
    house(b, M, "fv1", ax - 6, az - 8.4, 6, 4.4, 2.7, 0, "#c0915e", "#5a4a3a", "#5a4a3a", "thatch");
    house(b, M, "fv2", ax + 3, az - 9.5, 5, 4, 2.6, 0, "#b8875a", "#5a4a3a", "#5a4a3a", "thatch");
    house(b, M, "fv3", ax - 14, az - 6, 4, 4, 2.5, 1, "#c0915e", "#5a4a3a", "#5a4a3a", "thatch");
    b.add(panel(0.6, 0.8, PAPER[0], PAPER[1], PAPER[2]), M.paper);
    for (let i = 0; i < 26; i++) cassava(b, M.dryStem, M.cassLeaf, ax + 9 + (i % 6) * 1.3, az - 6 + Math.floor(i / 6) * 1.4, 1.4 + 0.4 * hsh(i), i);
    for (const [x, z, s] of [[ax - 9, az - 11, 1], [ax + 10, az - 12, 2]] as const) palm(b, M, x, z, 7, 0.1 * (s % 2 ? 1 : -1), s);
    for (let i = 0; i < 80; i++) b.add(ball(0.03 + 0.04 * hsh(i, 17), 6), M.stone, M4(ax - 12 + hsh(i, 18) * 24, 0.02, az - 3 + hsh(i, 19) * 12, 0, 0, 0, 1, 0.6, 1.3));
    // bowls for the ending (her safe garri shared out), on a mat by her corner
    { const bb = new Batch(); for (let i = 0; i < 4; i++) basin(bb, M, WIFE[0] + 0.7 + (i % 2) * 0.5, 0, WIFE[2] + 1.0 + Math.floor(i / 2) * 0.5, [M.enRed, M.enBlue, M.enGreen][i % 3], 0.8, 0.55); bb.build(this.bowls); R.add(this.bowls); }
    b.build(R); bw.build(this.wet); bd.build(this.dry); R.add(this.wet, this.dry);
  }

  private shotSun(id: number, s: ShotDef, L: LightPreset) {
    let v = this.sunCache.get(id);
    if (v) return v;
    let fx = 0, fz = 0;
    for (let f = s.a; f < s.b; f += 3) {
      const c = camAt(id, f), x = c.look[0] - c.pos[0], z = c.look[2] - c.pos[2], n = Math.hypot(x, z) || 1;
      fx += x / n; fz += z / n;
    }
    const n = Math.hypot(fx, fz) || 1; fx /= n; fz /= n;
    const az = THREE.MathUtils.degToRad(s.sunAz ?? L.az), el = THREE.MathUtils.degToRad(s.sunEl ?? L.el);
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }
  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], lname = lightAt(id, f), L = LIGHTS[lname], K = LOOK[lname];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig ----
    let sunDir = this.shotSun(id, s, LIGHTS[s.light]);
    if (lname !== s.light) { // the time-lapse: swing the sun low for golden, behind the lens for night
      const el = THREE.MathUtils.degToRad(lname === "golden" ? 12 : lname === "night" ? 40 : 48), h = Math.hypot(sunDir.x, sunDir.z) || 1;
      sunDir = new THREE.Vector3((sunDir.x / h) * Math.cos(el) * (lname === "night" ? -1 : 1), Math.sin(el), (sunDir.z / h) * Math.cos(el)).normalize();
    }
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.2 + 5, 6, 48);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, sun / moon, stars, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position); this.stars.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const night = lname === "night", showSun = lname === "golden" || lname === "drought";
    this.stars.visible = night; this.moon.visible = night;
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      // drought: the sun hangs straight ahead of the lens, high and huge
      const sd = lname === "drought" ? new THREE.Vector3(c.look[0] - c.pos[0], 0, c.look[2] - c.pos[2]).normalize().multiplyScalar(Math.cos(0.75)).setY(Math.sin(0.75)) : sunDir;
      this.sunDisc.position.copy(cam.position).addScaledVector(sd, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(lname === "drought" ? 3.2 : 1.9)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(lname === "drought" ? 34 : 24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(lname === "drought" ? 1.0 : 1.3);
    }
    if (night) {
      const md = new THREE.Vector3(c.look[0] - c.pos[0], 0, c.look[2] - c.pos[2]).normalize().applyAxisAngle(V(0, 1, 0), 0.22).multiplyScalar(Math.cos(0.5)).setY(Math.sin(0.5));
      this.moon.position.copy(cam.position).addScaledVector(md, 900); this.moon.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(2.0)));
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.visible = !night && lname !== "drought" && !s.dry;
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[lname === "golden" ? "golden" : "day"][i % 4];
    }
    // ---- the world's state ----
    const dryNow = !!s.dry;
    this.wet.visible = !dryNow; this.dry.visible = dryNow;
    // the stone: carried above the sack, then set down on it (hook); always resting afterwards
    const lift = id === 1 && f < B.stone + 14 ? 1 - smooth((f - B.stone) / 12) : 0;
    this.stone.position.set(SACK[0] + 0.25 * lift, 1.5 + 0.5 * lift, SACK[2] + 0.35 * lift);
    this.stone.rotation.set(0.2, 0.6, 0.1 + 0.2 * lift);
    this.stone.visible = !(id === 1 && f < 30);
    this.tallyMat.map = this.tallies[id === 1 || id === 15 ? dayCount(f) : 3];
    const fireOn = (s.place === "compound" && (id === 4 || id === 12 || id === 13 || id === 5)) ? 1 : 0;
    this.fire.forEach((m, i) => { m.visible = fireOn > 0; m.scale.set(1, 0.7 + 0.5 * Math.abs(Math.sin(t * 9 + i * 1.7)) * (id === 13 ? 1.5 : 1), 1); m.position.y = 0.2 + 0.07 * m.scale.y; });
    this.fireGlow.visible = fireOn > 0; (this.fireGlow.material as THREE.SpriteMaterial).opacity = (night ? 1 : 0.45) * (0.8 + 0.2 * Math.sin(t * 11));
    this.rootWhole.visible = f < B.open; this.rootCut.visible = f >= B.open;
    this.fullBasins.visible = id <= 6 || id === 10 || id === 13;
    const sold = id === 7 && f >= 651 || id === 8 || id === 9;
    this.fullStall.visible = !sold; this.emptyStall.visible = sold;
    this.wifeBasin.visible = id === 8;
    this.bowls.visible = id === 18 && f >= B.serve - 10;
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right }, lname);
    this.frustum.setFromProjectionMatrix(this.m4.multiplyMatrices(cam.projectionMatrix, cam.matrixWorldInverse));
    let ai = 0;
    const used: Actor[] = [];
    for (const p of st.places) {
      const sc2 = p.scale ?? 1;
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y + 1.1 * sc2, p.z), 3.5))) continue;
      const a = this.actor(ai++);
      const [w, h, k] = p.size ?? [300, 500, 0.5];
      a.r = this.pool.req(p.key, w, h, k, p.draw);
      a.mesh.visible = true;
      a.mesh.position.set(p.x, p.y, p.z);
      a.mesh.rotation.set(0, p.yaw ?? Math.atan2(cam.position.x - p.x, cam.position.z - p.z), p.roll ?? 0);
      a.mesh.scale.set(p.mirror ? -sc2 : sc2, sc2, sc2);
      a.mesh.castShadow = L.actorShadow;
      used.push(a);
    }
    for (let i = ai; i < this.actors.length; i++) this.actors[i].mesh.visible = false;
    let fi = 0;
    const fused: Fx[] = [];
    for (const p of st.fx) {
      if (!this.frustum.intersectsSphere(this.sph.set(this.v.set(p.x, p.y, p.z), Math.max(p.w, p.h)))) continue;
      const e2 = this.fx(fi++);
      e2.r = this.pool.req(p.key, p.cw, p.ch, 1, p.draw);
      e2.use(!!p.soft);
      e2.mesh.visible = true;
      e2.mesh.position.set(p.x, p.y, p.z);
      if (p.flat) e2.mesh.rotation.set(-Math.PI / 2, 0, p.rot ?? 0);
      else { e2.mesh.quaternion.copy(cam.quaternion); e2.mesh.rotateZ(p.rot ?? 0); }
      e2.mesh.scale.set(p.w, p.h, 1);
      fused.push(e2);
    }
    for (let i = fi; i < this.fxs.length; i++) this.fxs[i].mesh.visible = false;
    this.pool.flush();
    for (const a of used) a.bind();
    for (const e3 of fused) e3.bind();
    void GRATE; void PRESS; void MARKET;
    return focus;
  }
}
