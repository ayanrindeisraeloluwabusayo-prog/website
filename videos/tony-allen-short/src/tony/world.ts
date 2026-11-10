// The whole Lagos world as one three.js scene: a late-1950s street (laterite sidewalks, painted shop houses with
// corrugated roofs, mammy wagons, market umbrellas, palms, the lagoon at its end), an open-air club with a bandstand,
// string lights and a drum kit, and Tony's room. update(id, f, camera) poses everything for shot `id` at frame f.
import * as THREE from "three";
import { Batch, boxGeo, V, lam, Kit } from "./build";
import { ctex, rep, facadeHD, cloudHD } from "./paint";
import { Pen } from "./toon";
import { LIGHTS, LOOK, LightPreset } from "./lights";
import { TONE, CHAR, twoTone, untone } from "./shade";
import { NOINK } from "./ink";
import { Pool, Actor, Fx, stage } from "./cast";
import { FPS, SHOTS, CLUB, ROOM, KIT, STOOL, STAGE_Y, ROOM_KIT, SHELF, B, camAt, V3, ShotDef, smooth, clamp01 } from "./story";

export const loadKit = () => Promise.resolve({} as Kit);

// ---------------- painted textures ----------------
const U = (r: () => number, a: number, b: number) => a + (b - a) * r();
const blotches = (g: CanvasRenderingContext2D, r: () => number, W: number, H: number, n: number, rgb: string, a: number, rad: [number, number]) => {
  for (let i = 0; i < n; i++) {
    const x = U(r, 0, W), y = U(r, 0, H), R = U(r, rad[0], rad[1]);
    const gr = g.createRadialGradient(x, y, 0, x, y, R);
    gr.addColorStop(0, `rgba(${rgb},${a})`); gr.addColorStop(1, `rgba(${rgb},0)`);
    g.fillStyle = gr; g.fillRect(x - R, y - R, 2 * R, 2 * R);
  }
};
const tarmac = () => ctex("tarmac", 1024, 1024, (g, r) => {
  g.fillStyle = "#6a6266"; g.fillRect(0, 0, 1024, 1024);
  blotches(g, r, 1024, 1024, 40, "40,34,40", 0.12, [40, 160]);
  blotches(g, r, 1024, 1024, 30, "200,150,110", 0.1, [30, 120]);
  for (let i = 0; i < 2000; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,240,230,0.08)" : "rgba(20,15,20,0.1)"; g.fillRect(U(r, 0, 1024), U(r, 0, 1024), 3, 3); }
});
const laterite = () => ctex("laterite", 1024, 1024, (g, r) => {
  g.fillStyle = "#c98a58"; g.fillRect(0, 0, 1024, 1024);
  blotches(g, r, 1024, 1024, 50, "150,80,45", 0.14, [40, 180]);
  blotches(g, r, 1024, 1024, 30, "240,190,140", 0.12, [30, 140]);
  for (let i = 0; i < 2500; i++) { g.fillStyle = r() > 0.5 ? "rgba(255,230,200,0.12)" : "rgba(110,55,30,0.14)"; g.fillRect(U(r, 0, 1024), U(r, 0, 1024), 3, 3); }
});
const corrugated = (key: string, base: string) => ctex("corr" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  for (let x = 0; x < 512; x += 16) {
    const gr = g.createLinearGradient(x, 0, x + 16, 0);
    gr.addColorStop(0, "rgba(255,240,220,0.22)"); gr.addColorStop(0.5, "rgba(0,0,0,0)"); gr.addColorStop(1, "rgba(40,20,10,0.25)");
    g.fillStyle = gr; g.fillRect(x, 0, 16, 512);
  }
  blotches(g, r, 512, 512, 18, "150,70,30", 0.35, [20, 90]); // rust
  for (let y = 0; y < 512; y += 128) { g.fillStyle = "rgba(40,20,10,0.25)"; g.fillRect(0, y, 512, 3); }
});
const planks = (key: string, base: string) => ctex("plk" + key, 512, 512, (g, r) => {
  for (let y = 0; y < 512; y += 64) {
    g.fillStyle = base; g.fillRect(0, y, 512, 64);
    g.fillStyle = `rgba(${r() > 0.5 ? "255,230,200,0.1" : "40,20,10,0.12"})`; g.fillRect(0, y, 512, 64);
    for (let k = 0; k < 6; k++) { g.strokeStyle = "rgba(40,20,10,0.12)"; g.lineWidth = 2; g.beginPath(); const yy = y + U(r, 8, 56); g.moveTo(0, yy); g.bezierCurveTo(170, yy + U(r, -6, 6), 340, yy + U(r, -6, 6), 512, yy); g.stroke(); }
    g.fillStyle = "rgba(30,15,10,0.45)"; g.fillRect(0, y, 512, 3);
    const jx = U(r, 0, 512); g.fillRect(jx, y, 3, 64);
  }
});
const plaster = (key: string, base: string) => ctex("pl" + key, 512, 512, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 512, 512);
  blotches(g, r, 512, 512, 24, "255,255,255", 0.08, [40, 150]);
  blotches(g, r, 512, 512, 18, "100,70,50", 0.07, [40, 150]);
});
const text = (g: CanvasRenderingContext2D, s: string, x: number, y: number, size: number, col: string, font = "Georgia, serif") => {
  g.font = `bold ${size}px ${font}`; g.textAlign = "center"; g.textBaseline = "middle"; g.fillStyle = col; g.fillText(s, x, y);
};
const sign = (key: string, w: number, h: number, bg: string, fg: string, lines: string[], border = "#241726") => ctex("sign" + key, w, h, (g) => {
  g.fillStyle = border; g.fillRect(0, 0, w, h);
  g.fillStyle = bg; g.fillRect(10, 10, w - 20, h - 20);
  const n = lines.length, size = Math.min(h / (n + 0.7), (w * 1.6) / Math.max(...lines.map((l) => l.length)));
  lines.forEach((l, i) => text(g, l, w / 2, h / 2 + (i - (n - 1) / 2) * size * 1.05, size * 0.9, fg));
});
/** club back-wall boards: the Cool Cats poster, then a word-free sunburst for the Afrobeat nights */
const clubBoard = (k: 0 | 1) => ctex("clubBoard" + k, 1024, 512, (g) => {
  g.fillStyle = "#241726"; g.fillRect(0, 0, 1024, 512);
  if (k === 0) {
    g.fillStyle = "#1f3f8a"; g.fillRect(14, 14, 996, 484);
    text(g, "THE COOL CATS", 512, 190, 120, "#ffd84a");
    text(g, "HIGHLIFE TONIGHT", 512, 340, 78, "#f4efe2", "Arial, sans-serif");
    for (let i = 0; i < 18; i++) { g.fillStyle = i % 2 ? "#e2453c" : "#ffd84a"; g.beginPath(); g.arc(60 + i * 53, 470, 12, 0, Math.PI * 2); g.fill(); }
  } else {
    g.fillStyle = "#c2361f"; g.fillRect(14, 14, 996, 484);
    const cx = 512, cy = 520;
    for (let i = 0; i < 22; i++) {
      const a0 = Math.PI + (i / 22) * Math.PI, a1 = Math.PI + ((i + 0.5) / 22) * Math.PI;
      g.fillStyle = i % 2 ? "#ffd84a" : "#f28a2c"; g.beginPath(); g.moveTo(cx, cy); g.lineTo(cx + 900 * Math.cos(a0), cy + 900 * Math.sin(a0)); g.lineTo(cx + 900 * Math.cos(a1), cy + 900 * Math.sin(a1)); g.fill();
    }
    g.fillStyle = "#241726"; g.beginPath(); g.arc(cx, cy, 170, 0, Math.PI * 2); g.fill();
    g.fillStyle = "#3aa55a"; g.beginPath(); g.arc(cx, cy, 140, 0, Math.PI * 2); g.fill();
  }
});
const stripes = (key: string, a: string, b: string, n = 8) => ctex("str" + key, 512, 64, (g) => {
  for (let i = 0; i < n; i++) { g.fillStyle = i % 2 ? a : b; g.fillRect((i * 512) / n, 0, 512 / n + 1, 64); }
});
const bassHead = () => ctex("bassHead", 512, 512, (g) => {
  g.fillStyle = "#f1ece0"; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = "#241726"; g.lineWidth = 18; g.beginPath(); g.arc(256, 256, 150, 0, Math.PI * 2); g.stroke();
  g.fillStyle = "#e2453c"; g.beginPath(); g.arc(256, 256, 120, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#ffd84a"; g.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + (i * Math.PI) / 5, R = i % 2 ? 40 : 95; g.lineTo(256 + R * Math.cos(a), 256 + R * Math.sin(a)); } g.fill();
});
const wagonSide = (key: string, base: string, trim: string, slogan: string) => ctex("wag" + key, 1024, 384, (g, r) => {
  g.fillStyle = base; g.fillRect(0, 0, 1024, 384);
  for (let x = 0; x < 1024; x += 128) { g.fillStyle = "rgba(40,20,10,0.25)"; g.fillRect(x, 0, 6, 384); }
  g.fillStyle = trim; g.fillRect(0, 0, 1024, 60); g.fillRect(0, 320, 1024, 64);
  for (let i = 0; i < 16; i++) { g.fillStyle = i % 2 ? "#e2453c" : "#3aa55a"; g.beginPath(); g.moveTo(i * 64, 320); g.lineTo(i * 64 + 32, 290); g.lineTo(i * 64 + 64, 320); g.fill(); }
  text(g, slogan, 512, 175, 92, "#241726");
  blotches(g, r, 1024, 384, 8, "80,50,30", 0.12, [30, 90]);
});
const magazinePage = () => ctex("mag", 512, 700, (g) => {
  g.fillStyle = "#f7f0dc"; g.fillRect(0, 0, 512, 700);
  g.fillStyle = "#c2361f"; g.fillRect(0, 0, 512, 120);
  text(g, "DRUM LESSONS", 256, 62, 62, "#fff6d8");
  // a little drawing of a kit and a row of notes on a stave
  g.strokeStyle = "#241726"; g.lineWidth = 8;
  g.beginPath(); g.arc(256, 330, 90, 0, Math.PI * 2); g.stroke();
  g.strokeRect(120, 230, 90, 40); g.strokeRect(300, 220, 90, 40);
  g.beginPath(); g.moveTo(90, 190); g.lineTo(190, 200); g.stroke(); g.beginPath(); g.moveTo(330, 170); g.lineTo(440, 190); g.stroke();
  for (let i = 0; i < 5; i++) { g.lineWidth = 3; g.beginPath(); g.moveTo(40, 480 + i * 18); g.lineTo(472, 480 + i * 18); g.stroke(); }
  for (let i = 0; i < 8; i++) { g.fillStyle = "#241726"; g.beginPath(); g.ellipse(70 + i * 54, 525 - (i % 3) * 18, 13, 10, -0.4, 0, Math.PI * 2); g.fill(); g.fillRect(80 + i * 54, 455 - (i % 3) * 18, 4, 70); }
  for (let i = 0; i < 4; i++) { g.fillStyle = "rgba(36,23,38,0.35)"; g.fillRect(40, 600 + i * 22, 432 - (i % 2) * 120, 9); }
});
const poster = () => ctex("poster", 512, 720, (g) => {
  g.fillStyle = "#ffd84a"; g.fillRect(0, 0, 512, 720);
  g.fillStyle = "#241726"; g.fillRect(0, 560, 512, 160);
  text(g, "JAZZ", 256, 640, 120, "#ffd84a");
  g.fillStyle = "#241726"; // a drummer silhouette made of circles
  g.beginPath(); g.arc(256, 170, 70, 0, Math.PI * 2); g.fill();
  g.beginPath(); g.ellipse(256, 380, 150, 110, 0, 0, Math.PI * 2); g.fill();
  g.fillStyle = "#e2453c"; g.beginPath(); g.arc(256, 430, 80, 0, Math.PI * 2); g.fill();
});
const blanket = () => ctex("blanket", 512, 512, (g) => {
  const cols = ["#e2453c", "#f2b632", "#3aa55a", "#241726", "#3d7fd6"];
  for (let i = 0; i < 16; i++) { g.fillStyle = cols[i % 5]; g.fillRect(0, i * 32, 512, 32); }
  for (let i = 0; i < 16; i++) { g.fillStyle = "rgba(255,255,255,0.18)"; g.fillRect(i * 32, 0, 12, 512); }
});
const glowTex = () => ctex("glow", 128, 128, (g) => {
  const gr = g.createRadialGradient(64, 64, 0, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(0.4, "rgba(255,255,255,0.35)"); gr.addColorStop(1, "rgba(255,255,255,0)");
  g.fillStyle = gr; g.fillRect(0, 0, 128, 128);
});

// ---------------- geometry helpers ----------------
const M4 = (x: number, y: number, z: number, rx = 0, ry = 0, rz = 0, s = 1) =>
  new THREE.Matrix4().compose(V(x, y, z), new THREE.Quaternion().setFromEuler(new THREE.Euler(rx, ry, rz)), V(s, s, s));
const cyl = (r: number, h: number, n = 24, rTop = r) => new THREE.CylinderGeometry(rTop, r, h, n, 1, false);
const groundQ = (x0: number, x1: number, z0: number, z1: number, y: number, tile: number) => {
  const g = new THREE.PlaneGeometry(x1 - x0, z1 - z0); g.rotateX(-Math.PI / 2); g.translate((x0 + x1) / 2, y, (z0 + z1) / 2);
  const uv = g.attributes.uv as THREE.BufferAttribute;
  for (let i = 0; i < uv.count; i++) uv.setXY(i, uv.getX(i) * (x1 - x0) / tile, uv.getY(i) * (z1 - z0) / tile);
  return g;
};
/** a vertical quad facing +z (or rotated by ry) with the whole texture on it */
const panel = (w: number, h: number, x: number, y: number, z: number, ry = 0) => { const g = new THREE.PlaneGeometry(w, h); g.applyMatrix4(M4(x, y, z, 0, ry)); return g; };

type Mats = Record<string, THREE.Material>;
const basic = (c: THREE.ColorRepresentation, k = 1) => new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(k), fog: false, toneMapped: true });

/** a drum kit facing +z, floor point `at`; layout matches cast.ts PADS */
const drumKit = (b: Batch, M: Mats, at: V3) => {
  const [x, y, z] = at;
  const bass = cyl(0.28, 0.4, 32); bass.rotateX(Math.PI / 2);
  b.add(bass, M.shell, M4(x, y + 0.3, z + 0.1));
  for (const s of [-1, 1]) b.add(new THREE.TorusGeometry(0.285, 0.018, 8, 32), M.chrome, M4(x, y + 0.3, z + 0.1 + s * 0.2));
  const head = new THREE.CircleGeometry(0.27, 32); b.add(head, M.bassHead, M4(x, y + 0.3, z + 0.305));
  const drum = (dx: number, dy: number, dz: number, r: number, h: number, tilt: number) => {
    b.add(cyl(r, h, 28), M.shell, M4(x + dx, y + dy - h / 2, z + dz, tilt));
    b.add(new THREE.CircleGeometry(r * 0.97, 28), M.head, M4(x + dx, y + dy + 0.002, z + dz, -Math.PI / 2 + tilt));
    b.add(new THREE.TorusGeometry(r, 0.012, 6, 28), M.chrome, M4(x + dx, y + dy, z + dz, Math.PI / 2 + tilt));
  };
  drum(-0.15, 0.665, -0.15, 0.17, 0.13, 0.12);   // snare
  drum(0.12, 0.91, 0.0, 0.14, 0.18, 0.35);        // rack tom (on the bass drum)
  drum(0.48, 0.6, -0.15, 0.19, 0.42, 0.05);       // floor tom
  for (const [dx, dz] of [[0.36, -0.3], [0.6, -0.3], [0.48, 0.03]]) b.add(cyl(0.012, 0.22, 6), M.chrome, M4(x + dx, y + 0.08, z + dz)); // floor tom legs
  b.add(cyl(0.18, 0.04, 8), M.dark, M4(x - 0.15, y + 0.33, z - 0.15)); // snare stand
  b.add(cyl(0.012, 0.6, 6), M.chrome, M4(x - 0.15, y + 0.3, z - 0.15));
  const cymbal = (dx: number, dy: number, dz: number, r: number, tilt: number) => {
    b.add(cyl(r, 0.035, 32, 0.03), M.cymbal, M4(x + dx, y + dy, z + dz, tilt, 0, -tilt * 0.6));
    b.add(cyl(0.012, dy, 6), M.chrome, M4(x + dx, y + dy / 2, z + dz));
    b.add(cyl(0.16, 0.02, 3), M.dark, M4(x + dx, y + 0.01, z + dz));
  };
  cymbal(-0.5, 0.92, -0.1, 0.17, 0);       // hi-hat (two plates)
  b.add(cyl(0.17, 0.03, 32, 0.03), M.cymbal, M4(x - 0.5, y + 0.96, z - 0.1, Math.PI));
  cymbal(0.6, 1.1, 0.05, 0.24, 0.25);      // ride
  cymbal(-0.35, 1.32, 0.15, 0.2, 0.3);     // crash
  b.add(cyl(0.18, 0.07, 20), M.seat, M4(x, y + 0.47, z - 0.5)); // stool
  b.add(cyl(0.02, 0.45, 8), M.chrome, M4(x, y + 0.22, z - 0.5));
  b.add(cyl(0.2, 0.02, 3), M.dark, M4(x, y + 0.01, z - 0.5));
  // pedals: bass drum (centre) and hi-hat (left)
  b.add(boxGeo(V(x - 0.05, y, z - 0.35), V(x + 0.05, y + 0.04, z - 0.12)), M.chrome);
  b.add(boxGeo(V(x - 0.38, y, z - 0.38), V(x - 0.28, y + 0.04, z - 0.15)), M.chrome);
  b.add(cyl(0.01, 0.2, 6), M.chrome, M4(x, y + 0.12, z - 0.12, -0.5));
};

/** palm: a leaning trunk of stacked rings and drooping fronds (flattened, two-sided) */
const palm = (b: Batch, M: Mats, x: number, z: number, h: number, lean: number, seed: number) => {
  const n = 9;
  let px = x, py = 0, pz = z;
  for (let i = 0; i < n; i++) {
    const seg = h / n, r = 0.2 - 0.008 * i, dx = Math.sin(lean) * seg * (0.4 + i / n);
    b.add(cyl(r, seg * 1.02, 10, r * 0.92), i % 2 ? M.trunk : M.trunk2, M4(px + dx / 2, py + seg / 2, pz, 0, 0, -lean * (0.4 + i / n)));
    px += dx; py += seg;
  }
  for (let k = 0; k < 9; k++) {
    const a = (k / 9) * Math.PI * 2 + seed, L = 2.1 + 0.4 * Math.sin(seed * 3 + k);
    const leaf = new THREE.BufferGeometry(), pts: number[] = [], seg = 8;
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

const umbrella = (b: Batch, M: Mats, x: number, z: number, mat: THREE.Material) => {
  b.add(new THREE.ConeGeometry(1.25, 0.45, 12, 1, true), mat, M4(x, 2.35, z));
  b.add(cyl(0.03, 2.3, 6), M.dark, M4(x, 1.15, z));
  b.add(boxGeo(V(x - 0.8, 0.7, z - 0.45), V(x + 0.8, 0.78, z + 0.45)), M.wood);
  for (const [dx, dz] of [[-0.7, -0.38], [0.7, -0.38], [-0.7, 0.38], [0.7, 0.38]]) b.add(boxGeo(V(x + dx - 0.03, 0, z + dz - 0.03), V(x + dx + 0.03, 0.7, z + dz + 0.03)), M.wood);
  // produce heaps: tomatoes, peppers, yams
  const cols = [M.tomato, M.pepper, M.yam];
  for (let i = 0; i < 3; i++) {
    const cx = x - 0.5 + i * 0.5;
    for (let k = 0; k < 7; k++) {
      const a = k * 2.4, rr = k ? 0.12 : 0;
      b.add(new THREE.SphereGeometry(0.075, 8, 6), cols[i], M4(cx + rr * Math.cos(a), 0.84 + (k ? 0 : 0.08), z + rr * Math.sin(a)));
    }
  }
};

/** mammy wagon: painted wooden lorry body with a slogan board, cab and wheels; faces +z (or -z) */
const wagon = (b: Batch, M: Mats, x: number, z: number, dir: 1 | -1, side: THREE.Material, cab: THREE.Material) => {
  const L = 5.2, W = 2.2;
  const z0 = z - (dir * L) / 2, z1 = z + (dir * L) / 2;
  const [za, zb] = [Math.min(z0, z1), Math.max(z0, z1)];
  const cabZ0 = dir > 0 ? zb - 1.5 : za, cabZ1 = dir > 0 ? zb : za + 1.5;
  const bodyZ0 = dir > 0 ? za : za + 1.5, bodyZ1 = dir > 0 ? zb - 1.5 : zb;
  b.add(boxGeo(V(x - W / 2, 0.55, cabZ0), V(x + W / 2, 1.95, cabZ1)), cab);
  b.add(boxGeo(V(x - W / 2 + 0.1, 1.35, cabZ0 + 0.1), V(x + W / 2 - 0.1, 1.85, cabZ1 - 0.1)), M.glass);
  b.add(boxGeo(V(x - W / 2, 0.55, bodyZ0), V(x + W / 2, 0.75, bodyZ1)), M.dark);
  for (const s of [-1, 1]) b.add(panel(bodyZ1 - bodyZ0, 1.1, x + s * (W / 2 + 0.005), 1.3, (bodyZ0 + bodyZ1) / 2, s * Math.PI / 2), side);
  b.add(boxGeo(V(x - W / 2, 2.4, bodyZ0), V(x + W / 2, 2.5, bodyZ1)), M.roofCorr);
  for (const zz of [bodyZ0 + 0.1, bodyZ1 - 0.1]) for (const s of [-1, 1]) b.add(boxGeo(V(x + s * (W / 2 - 0.05) - 0.05, 0.75, zz - 0.05), V(x + s * (W / 2 - 0.05) + 0.05, 2.4, zz + 0.05)), M.wood);
  for (const zz of [za + 0.9, zb - 0.9]) for (const s of [-1, 1]) { const w = cyl(0.42, 0.3, 18); w.rotateZ(Math.PI / 2); b.add(w, M.tyre, M4(x + s * (W / 2 - 0.1), 0.42, zz)); }
  b.add(boxGeo(V(x - 0.7, 0.6, dir > 0 ? zb : za - 0.05), V(x + 0.7, 1.0, dir > 0 ? zb + 0.05 : za)), M.chrome);
};

/** a two-storey shop house facing the road (+x side faces -x, and the reverse), with sign, balcony and corrugated roof */
const shopHouse = (b: Batch, M: Mats, side: 1 | -1, z0: number, w: number, h: number, wall: string, shutter: string, signMat: THREE.Material | null, i: number) => {
  const xf = side * 7.2, d = 7, xb = xf + side * d, z1 = z0 + w;
  const fac = lam(`fac${i}`, () => ({ map: facadeHD(`lagos${i}`, w, h, { wall, shutter, door: true }) }));
  const walls = lam(`wall${i}`, () => ({ map: rep(plaster(`w${wall}`, wall), Math.max(1, w / 4), 1) }));
  b.add(boxGeo(V(Math.min(xf, xb), 0, z0), V(Math.max(xf, xb), h, z1)), walls);
  b.add(panel(w, h, xf - side * 0.01, h / 2, (z0 + z1) / 2, -side * Math.PI / 2), fac);
  // corrugated roof, gently pitched toward the street
  const roof = new THREE.PlaneGeometry(d + 0.8, w + 0.6); roof.rotateX(-Math.PI / 2); roof.rotateZ(side * 0.12);
  b.add(roof, M.roofCorr, M4((xf + xb) / 2 - side * 0.2, h + 0.35, (z0 + z1) / 2));
  b.add(boxGeo(V(Math.min(xf, xf - side * 1.1), h * 0.5 - 0.08, z0 + 0.2), V(Math.max(xf, xf - side * 1.1), h * 0.5 + 0.05, z1 - 0.2)), M.wood); // balcony floor
  for (let k = 0; k <= Math.floor(w / 1.2); k++) { const zz = z0 + 0.25 + k * ((w - 0.5) / Math.floor(w / 1.2)); b.add(boxGeo(V(xf - side * 1.1 - 0.03, h * 0.5, zz - 0.03), V(xf - side * 1.1 + 0.03, h * 0.5 + 0.9, zz + 0.03)), M.rail); }
  b.add(boxGeo(V(Math.min(xf, xf - side * 1.1), h * 0.5 + 0.88, z0 + 0.2), V(Math.max(xf, xf - side * 1.1), h * 0.5 + 0.95, z1 - 0.2)), M.rail);
  for (const zz of [z0 + 0.3, z1 - 0.3]) b.add(boxGeo(V(xf - side * 1.1 - 0.06, 0, zz - 0.06), V(xf - side * 1.1 + 0.06, h * 0.5, zz + 0.06)), M.wood); // posts
  if (signMat) b.add(panel(Math.min(w - 0.6, 4.2), 0.8, xf - side * 1.16, h * 0.5 - 0.5, (z0 + z1) / 2, -side * Math.PI / 2), signMat);
};

export class World {
  root = new THREE.Group();
  private pool = new Pool();
  private actors: Actor[] = [];
  private fxs: Fx[] = [];
  private hemi: THREE.HemisphereLight; private sun: THREE.DirectionalLight;
  private sky: THREE.Mesh; private skyMat: THREE.ShaderMaterial;
  private fog = new THREE.Fog("#bccbec", 25, 420);
  private sunDisc: THREE.Sprite; private sunHalo: THREE.Sprite;
  private sunCache = new Map<number, THREE.Vector3>();
  private cloudMaps: Record<"day" | "golden", THREE.Texture[]>;
  private clouds: THREE.Mesh[] = [];
  private record: THREE.Mesh;
  private boardMat: THREE.MeshLambertMaterial; private boards: THREE.Texture[];
  private bulbs: THREE.InstancedMesh; private bulbMat: THREE.MeshBasicMaterial; private glows: THREE.Sprite[] = [];
  private spot: THREE.Mesh;
  private windowMat: THREE.MeshBasicMaterial;
  private frustum = new THREE.Frustum();
  private m4 = new THREE.Matrix4(); private v = new THREE.Vector3(); private sph = new THREE.Sphere();

  constructor(_kit: Kit) {
    const R = this.root, M: Mats = {};
    // ---- sky + light (as the template) ----
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
    this.sky.renderOrder = -1; this.sky.frustumCulled = false; this.sky.layers.set(NOINK);
    R.add(this.sky);
    const disc = ctex("sunDisc", 128, 128, (g) => { const gr = g.createRadialGradient(64, 64, 58, 64, 64, 64); gr.addColorStop(0, "rgba(255,255,255,1)"); gr.addColorStop(1, "rgba(255,255,255,0)"); g.fillStyle = gr; g.fillRect(0, 0, 128, 128); });
    this.sunDisc = new THREE.Sprite(new THREE.SpriteMaterial({ map: disc, color: new THREE.Color(6.0, 4.4, 2.4), fog: false, depthWrite: false }));
    this.sunHalo = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: new THREE.Color(1, 1, 1), fog: false, depthWrite: false, transparent: true, blending: THREE.AdditiveBlending }));
    this.sunDisc.renderOrder = -0.5; this.sunHalo.renderOrder = 5;
    for (const m of [this.sunDisc, this.sunHalo]) { m.frustumCulled = false; m.layers.set(NOINK); R.add(m); }
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
    M.tarmac = lam("tarmac", () => ({ map: tarmac() }));
    M.laterite = lam("laterite", () => ({ map: laterite() }));
    M.roofCorr = lam("roofCorr", () => ({ map: rep(corrugated("rust", "#a8a39a"), 3, 3), side: THREE.DoubleSide }));
    M.wood = lam("wood", () => ({ map: planks("w", "#9a6a44") }));
    M.floorClub = lam("floorClub", () => ({ map: planks("club", "#6e4a34") }));
    M.floorRoom = lam("floorRoom", () => ({ map: planks("room", "#a87a52") }));
    M.dark = twoTone(new THREE.MeshLambertMaterial({ color: "#2e2a36" }));
    M.rail = twoTone(new THREE.MeshLambertMaterial({ color: "#f4efe2" }));
    M.chrome = twoTone(new THREE.MeshPhongMaterial({ color: "#c9cdd4", specular: "#ffffff", shininess: 70 }), 0.15);
    M.cymbal = twoTone(new THREE.MeshPhongMaterial({ color: "#d9a640", specular: "#fff0b0", shininess: 60, side: THREE.DoubleSide }), 0.15);
    M.shell = twoTone(new THREE.MeshPhongMaterial({ color: "#b8322e", specular: "#ffb0a0", shininess: 50 }), 0.2);
    M.head = twoTone(new THREE.MeshLambertMaterial({ color: "#f1ece0" }));
    M.bassHead = twoTone(new THREE.MeshLambertMaterial({ map: bassHead() }));
    M.seat = twoTone(new THREE.MeshLambertMaterial({ color: "#241726" }));
    M.trunk = twoTone(new THREE.MeshLambertMaterial({ color: "#8a6a4a" }));
    M.trunk2 = twoTone(new THREE.MeshLambertMaterial({ color: "#7a5a3c" }));
    M.frond = twoTone(new THREE.MeshLambertMaterial({ color: "#4f9e3e", side: THREE.DoubleSide }));
    M.bush = twoTone(new THREE.MeshLambertMaterial({ color: "#5aa846" }));
    M.tomato = twoTone(new THREE.MeshLambertMaterial({ color: "#e2453c" }));
    M.pepper = twoTone(new THREE.MeshLambertMaterial({ color: "#f2b632" }));
    M.yam = twoTone(new THREE.MeshLambertMaterial({ color: "#9a6a44" }));
    M.tyre = twoTone(new THREE.MeshLambertMaterial({ color: "#2a2628" }));
    M.glass = twoTone(new THREE.MeshPhongMaterial({ color: "#6f8fb0", specular: "#ffffff", shininess: 80 }), 0.2);
    M.water = twoTone(new THREE.MeshPhongMaterial({ color: "#2f7fb0", specular: "#ffffff", shininess: 40 }), 0.3);
    M.sand = twoTone(new THREE.MeshLambertMaterial({ color: "#e2c992" }));
    M.green = twoTone(new THREE.MeshLambertMaterial({ color: "#4f8f45" }));
    M.stage = twoTone(new THREE.MeshLambertMaterial({ color: "#8a2a2a" }));
    M.clubWall = lam("clubWall", () => ({ map: rep(plaster("club", "#8a5a6a"), 3, 1) }));
    M.roomWall = lam("roomWall", () => ({ map: rep(plaster("room", "#f0dcb4"), 2, 1) }));
    M.blanket = twoTone(new THREE.MeshLambertMaterial({ map: blanket() }));
    M.pillow = twoTone(new THREE.MeshLambertMaterial({ color: "#f4efe2" }));
    M.mag = twoTone(new THREE.MeshLambertMaterial({ map: magazinePage() }));
    M.poster = twoTone(new THREE.MeshLambertMaterial({ map: poster() }));
    M.vinyl = twoTone(new THREE.MeshPhongMaterial({ color: "#1d1a20", specular: "#9090a0", shininess: 90 }), 0.2);
    M.label = twoTone(new THREE.MeshLambertMaterial({ color: "#e2453c" }));
    M.clave = twoTone(new THREE.MeshLambertMaterial({ color: "#b2703c" }));
    const umb = [stripes("u1", "#e2453c", "#f4efe2"), stripes("u2", "#3d7fd6", "#f2b632"), stripes("u3", "#3aa55a", "#f4efe2")].map((t) => twoTone(new THREE.MeshLambertMaterial({ map: t, side: THREE.DoubleSide })));
    const signs = [
      sign("rec", 840, 160, "#f2b632", "#241726", ["HIGHLIFE RECORDS"]),
      sign("chop", 840, 160, "#e2453c", "#fff6d8", ["MAMA T CHOP BAR"]),
      sign("tailor", 840, 160, "#f4efe2", "#1f3f8a", ["TAILOR & SONS"]),
      sign("radio", 840, 160, "#3aa55a", "#fff6d8", ["RADIO REPAIRS"]),
      sign("photo", 840, 160, "#1f3f8a", "#ffd84a", ["PHOTO STUDIO"]),
    ].map((t) => twoTone(new THREE.MeshLambertMaterial({ map: t })));

    const b = new Batch();
    // ================= the street (origin) =================
    b.add(groundQ(-4, 4, -120, 60, 0, 6), M.tarmac);
    b.add(groundQ(-30, -4, -120, 60, 0.0, 5), M.laterite);
    b.add(groundQ(4, 30, -120, 60, 0.0, 5), M.laterite);
    b.add(groundQ(-400, -30, -400, 60, -0.02, 8), M.green);
    b.add(groundQ(30, 400, -400, 60, -0.02, 8), M.green);
    b.add(groundQ(-30, 30, -400, -120, -0.02, 8), M.green);
    // lagoon beyond the end of the street, a sand strip, the far shore
    b.add(groundQ(-400, 400, 60, 64, -0.05, 4), M.sand);
    b.add(groundQ(-600, 600, 64, 300, -0.35, 20), M.water);
    b.add(groundQ(-600, 600, 300, 340, 0.2, 20), M.green);
    for (let k = 0; k < 30; k++) { const x = -300 + k * 21, hgt = 3 + (k * 37) % 5; b.add(boxGeo(V(x, 0, 305), V(x + 12, hgt, 318)), [M.rail, M.clubWall, M.roomWall][k % 3]); }
    const WALLS = ["#f2d16b", "#7fc4b8", "#e98a6a", "#f4efe2", "#9fb8e8", "#e8b4c8", "#f2b632", "#c7e0a8"];
    const SHUT = ["#2f7d4f", "#1f3f8a", "#8a2a2a", "#2f7d4f", "#6a3fa0", "#2f5f6a"];
    let i = 0;
    for (const side of [-1, 1] as const) {
      let z = -60;
      while (z < 56) {
        const w = 5 + ((i * 7) % 4), h = 6 + ((i * 3) % 3) * 0.6;
        shopHouse(b, M, side, z, w, h, WALLS[i % WALLS.length], SHUT[i % SHUT.length], i % 2 === 0 ? signs[(i / 2) % signs.length] : null, i);
        z += w + 0.4; i++;
      }
    }
    for (const [x, z, s] of [[-5.6, -8, 0], [5.6, -20, 1], [-5.7, 18, 2], [5.4, 30, 0], [-5.8, 40, 1], [-5.6, -32, 2], [5.6, 12, 2]] as const) umbrella(b, M, x, z, umb[s]);
    for (const [x, z, l, s] of [[-5.2, 4, 0.12, 1], [5.4, -10, -0.15, 2], [-5.4, 26, 0.18, 3], [5.6, 45, -0.1, 4], [-5.3, 52, 0.1, 5], [5.2, 56, -0.2, 6],
      [-12, 61, 0.2, 7], [10, 62, -0.18, 8], [18, 61.5, 0.1, 9], [-22, 62, -0.12, 10]] as const) palm(b, M, x, z, 6.5 + (s % 3), l, s);
    const wagSides = [wagonSide("a", "#f2b632", "#241726", "NO TIME TO CHECK TIME"), wagonSide("b", "#3d7fd6", "#f4efe2", "PATIENCE IS SWEET"), wagonSide("c", "#e2453c", "#f2b632", "GOOD NAME")]
      .map((t) => twoTone(new THREE.MeshLambertMaterial({ map: t })));
    const cabs = ["#f2b632", "#3d7fd6", "#e2453c"].map((c) => twoTone(new THREE.MeshLambertMaterial({ color: c })));
    wagon(b, M, -2.0, -4, 1, wagSides[0], cabs[0]);
    wagon(b, M, 2.0, -16, -1, wagSides[1], cabs[1]);
    wagon(b, M, -2.0, 38, 1, wagSides[2], cabs[2]);
    // conga for the street band
    b.add(cyl(0.17, 0.75, 20, 0.15), M.shell, M4(6.4, 0.375, 3.9));
    b.add(new THREE.CircleGeometry(0.15, 20), M.head, M4(6.4, 0.751, 3.9, -Math.PI / 2));
    // wall for the kid
    b.add(boxGeo(V(-7.0, 0, -18), V(-6.6, 2.4, -10)), lam("kidWall", () => ({ map: rep(plaster("kid", "#f2d16b"), 2, 1) })));

    // ================= the club (CLUB) =================
    const [cx, , cz] = CLUB;
    b.add(groundQ(cx - 14, cx + 14, cz - 8, cz + 16, 0.01, 3), M.floorClub);
    b.add(groundQ(cx - 60, cx + 60, cz - 60, cz + 60, -0.01, 6), M.laterite);
    b.add(boxGeo(V(cx - 6, 0, cz - 6), V(cx + 6, STAGE_Y, cz)), M.stage);
    b.add(groundQ(cx - 6, cx + 6, cz - 6, cz, STAGE_Y + 0.002, 2), M.floorClub);
    b.add(boxGeo(V(cx - 7, 0, cz - 6.6), V(cx + 7, 4.2, cz - 6)), M.clubWall);
    for (const s of [-1, 1]) b.add(boxGeo(V(cx + s * 7 - 0.3, 0, cz - 6.6), V(cx + s * 7 + 0.3, 4.2, cz + 14)), M.clubWall);
    for (const s of [-1, 1]) for (let k = 0; k < 5; k++) b.add(cyl(0.12, 4.6, 10), M.wood, M4(cx + s * 6.2, 2.3, cz - 5 + k * 4));
    this.boards = [clubBoard(0), clubBoard(1)];
    this.boardMat = twoTone(new THREE.MeshLambertMaterial({ map: this.boards[0] }));
    const board = new THREE.Mesh(panel(5.2, 2.6, cx, 3.0, cz - 5.98), this.boardMat);
    board.receiveShadow = true; R.add(board);
    for (const [x, z, l, s] of [[cx - 9, cz - 9, 0.1, 1], [cx + 9.5, cz - 8, -0.15, 2], [cx - 4, cz - 10, 0.05, 3], [cx + 4.5, cz - 10.5, -0.08, 4], [cx - 10, cz + 8, 0.12, 5], [cx + 10, cz + 9, -0.1, 6]] as const)
      palm(b, M, x, z, 7.5 + (s % 3), l, s);
    drumKit(b, M, KIT);
    // string lights: four sagging lines across the dance floor, plus two along the stage front
    const bulbs: THREE.Matrix4[] = [], bulbCols: THREE.Color[] = [];
    const BC = ["#ffd27a", "#ff8a5a", "#ffe9b0", "#7ad0ff", "#ff6a8a"];
    const lines: [V3, V3][] = [[[cx - 6.2, 4.4, cz - 1], [cx + 6.2, 4.4, cz - 1]], [[cx - 6.2, 4.4, cz + 3], [cx + 6.2, 4.4, cz + 3]], [[cx - 6.2, 4.4, cz + 7], [cx + 6.2, 4.4, cz + 7]],
      [[cx - 6.2, 4.4, cz + 11], [cx + 6.2, 4.4, cz + 11]], [[cx - 6.2, 4.5, cz - 5], [cx - 6.2, 4.5, cz + 13]], [[cx + 6.2, 4.5, cz - 5], [cx + 6.2, 4.5, cz + 13]]];
    lines.forEach(([a, c], li) => {
      const n = 22;
      for (let k = 0; k <= n; k++) {
        const t = k / n, sag = 0.9 * 4 * t * (1 - t);
        bulbs.push(M4(a[0] + (c[0] - a[0]) * t, a[1] + (c[1] - a[1]) * t - sag, a[2] + (c[2] - a[2]) * t));
        bulbCols.push(new THREE.Color(BC[(k + li) % BC.length]));
      }
    });
    this.bulbMat = new THREE.MeshBasicMaterial({ color: new THREE.Color(1, 1, 1), fog: false });
    this.bulbs = new THREE.InstancedMesh(new THREE.SphereGeometry(0.07, 10, 8), this.bulbMat, bulbs.length);
    bulbs.forEach((m, k) => { this.bulbs.setMatrixAt(k, m); this.bulbs.setColorAt(k, bulbCols[k].multiplyScalar(2.6)); });
    this.bulbs.layers.set(NOINK); this.bulbs.frustumCulled = false; R.add(this.bulbs);
    for (let k = 0; k < bulbs.length; k += 2) {
      const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: glowTex(), color: bulbCols[k].clone().multiplyScalar(0.35), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
      sp.position.setFromMatrixPosition(bulbs[k]); sp.scale.setScalar(0.7); sp.layers.set(NOINK); this.glows.push(sp); R.add(sp);
    }
    // the spotlight pool on the stage floor (a soft additive disc)
    this.spot = new THREE.Mesh(new THREE.CircleGeometry(1.3, 40), new THREE.MeshBasicMaterial({ map: glowTex(), color: new THREE.Color(0.9, 0.7, 0.45), transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, fog: false }));
    this.spot.rotation.x = -Math.PI / 2; this.spot.position.set(STOOL[0], STAGE_Y + 0.01, STOOL[2] + 0.2); this.spot.layers.set(NOINK); R.add(this.spot);

    // ================= Tony's room (ROOM) =================
    const [rx, , rz] = ROOM;
    b.add(groundQ(rx - 2.5, rx + 4.5, rz - 2, rz + 3, 0.01, 1.5), M.floorRoom);
    b.add(groundQ(rx - 40, rx + 40, rz - 40, rz + 40, -0.01, 6), M.laterite);
    b.add(boxGeo(V(rx - 2.7, 0, rz - 2.2), V(rx + 4.5, 2.7, rz - 2)), M.roomWall);
    b.add(boxGeo(V(rx - 2.7, 0, rz - 2.2), V(rx - 2.5, 2.7, rz + 3)), M.roomWall);
    // window (a glowing evening sky behind a wooden frame)
    this.windowMat = new THREE.MeshBasicMaterial({ color: new THREE.Color("#ffb070").multiplyScalar(1.4), fog: false });
    const win = new THREE.Mesh(panel(1.0, 0.9, rx + 0.2, 1.65, rz - 1.98), this.windowMat); win.layers.set(NOINK); R.add(win);
    for (const [x0, y0, x1, y1] of [[-0.55, 1.15, 0.55, 1.22], [-0.55, 2.08, 0.55, 2.15], [-0.55, 1.15, -0.48, 2.15], [0.48, 1.15, 0.55, 2.15], [-0.03, 1.15, 0.03, 2.15]])
      b.add(boxGeo(V(rx + 0.2 + x0, y0, rz - 1.99), V(rx + 0.2 + x1, y1, rz - 1.94)), M.wood);
    b.add(panel(0.7, 0.98, rx - 2.48, 1.55, rz - 0.6, Math.PI / 2), M.poster);
    // bed with a striped blanket, pillow, and the drum magazine open on it
    b.add(boxGeo(V(rx - 2.4, 0, rz - 1.95), V(rx - 0.1, 0.2, rz - 0.9)), M.wood);
    b.add(boxGeo(V(rx - 2.35, 0.2, rz - 1.92), V(rx - 0.15, 0.36, rz - 0.93)), M.blanket);
    b.add(boxGeo(V(rx - 2.3, 0.36, rz - 1.85), V(rx - 1.7, 0.48, rz - 1.1)), M.pillow);
    const mag = new THREE.PlaneGeometry(0.34, 0.46); mag.rotateX(-Math.PI / 2); mag.rotateY(0.25); b.add(mag, M.mag, M4(rx - 1.6, 0.365, rz - 1.35));
    // table, record player, lamp
    b.add(boxGeo(V(rx + 0.9, 0.62, rz - 1.95), V(rx + 1.8, 0.67, rz - 1.15)), M.wood);
    for (const [dx, dz] of [[0.95, -1.9], [1.75, -1.9], [0.95, -1.2], [1.75, -1.2]]) b.add(boxGeo(V(rx + dx - 0.03, 0, rz + dz - 0.03), V(rx + dx + 0.03, 0.62, rz + dz + 0.03)), M.wood);
    b.add(boxGeo(V(rx + 1.0, 0.67, rz - 1.75), V(rx + 1.55, 0.75, rz - 1.25)), M.dark);
    b.add(boxGeo(V(rx + 1.45, 0.75, rz - 1.7), V(rx + 1.48, 0.8, rz - 1.38)), M.chrome);
    this.record = new THREE.Mesh(cyl(0.16, 0.01, 40), M.vinyl);
    this.record.position.set(rx + 1.25, 0.76, rz - 1.5); this.record.castShadow = true; this.record.receiveShadow = true;
    const lab = new THREE.Mesh(cyl(0.055, 0.012, 24), M.label); lab.position.y = 0.002; this.record.add(lab);
    const mark = new THREE.Mesh(boxGeo(V(0.02, 0.006, -0.01), V(0.05, 0.0075, 0.01)), M.pillow); this.record.add(mark);
    R.add(this.record);
    b.add(cyl(0.07, 0.3, 12), M.dark, M4(rx + 1.68, 0.82, rz - 1.8));
    b.add(cyl(0.16, 0.2, 16, 0.08), lam("shade", () => ({ color: "#f2d16b", side: THREE.DoubleSide })), M4(rx + 1.68, 1.05, rz - 1.8));
    const bulb = new THREE.Mesh(new THREE.SphereGeometry(0.06, 12, 8), basic("#ffd890", 3)); bulb.position.set(rx + 1.68, 0.98, rz - 1.8); bulb.layers.set(NOINK); R.add(bulb);
    // the shelf with the two claves, and the drum kit beside it
    b.add(boxGeo(V(SHELF[0] - 0.45, SHELF[1] - 0.04, SHELF[2] - 0.15), V(SHELF[0] + 0.45, SHELF[1], SHELF[2] + 0.12)), M.wood);
    for (const dx of [-0.6, 0.6]) b.add(boxGeo(V(SHELF[0] + dx * 0.6 - 0.02, SHELF[1] - 0.2, SHELF[2] - 0.15), V(SHELF[0] + dx * 0.6 + 0.02, SHELF[1] - 0.04, SHELF[2] - 0.11)), M.wood);
    for (const [dz, rot] of [[-0.06, 0.22], [0.06, -0.18]]) { const c = cyl(0.022, 0.24, 10); c.rotateZ(Math.PI / 2); c.rotateY(rot); b.add(c, M.clave, M4(SHELF[0], SHELF[1] + 0.024, SHELF[2] + dz)); }
    drumKit(b, M, ROOM_KIT);
    b.build(R);
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
    const room = s.place === "room", club = s.place === "club";
    const az = THREE.MathUtils.degToRad(s.sunAz ?? (room ? 140 : club ? 150 : L.az)), el = THREE.MathUtils.degToRad(s.sunEl ?? (room ? 32 : club ? 42 : L.el));
    const hx = fx * Math.cos(az) - fz * Math.sin(az), hz = fz * Math.cos(az) + fx * Math.sin(az);
    v = new THREE.Vector3(hx * Math.cos(el), Math.sin(el), hz * Math.cos(el)).normalize();
    this.sunCache.set(id, v);
    return v;
  }

  private actor(i: number) { while (this.actors.length <= i) this.actors.push(new Actor(this.root)); return this.actors[i]; }
  private fx(i: number) { while (this.fxs.length <= i) this.fxs.push(new Fx(this.root)); return this.fxs[i]; }

  update(id: number, f: number, cam: THREE.PerspectiveCamera, scene: THREE.Scene) {
    const t = f / FPS, s = SHOTS[id - 1], L = LIGHTS[s.light], K = LOOK[s.light];
    const c = camAt(id, f);
    cam.position.set(...c.pos); cam.up.set(0, 1, 0); cam.lookAt(...c.look); cam.rotateZ(c.roll);
    cam.fov = c.fov; cam.near = 0.05; cam.far = 1500; cam.updateProjectionMatrix(); cam.updateMatrixWorld();
    const focus = V(...c.look), dist = cam.position.distanceTo(focus);
    cam.layers.enable(NOINK);
    // ---- light rig: camera-relative sun frozen per shot, two-tone uniforms, shadow fit ----
    const sunDir = this.shotSun(id, s, L);
    this.hemi.color.set(L.sky); this.hemi.groundColor.set(L.ground); this.hemi.intensity = L.hemiI;
    this.sun.color.set(L.sunCol); this.sun.intensity = L.sunI;
    const Rr = THREE.MathUtils.clamp(dist * 1.15 + 6, 8, s.place === "street" && dist > 15 ? 90 : 40);
    this.sun.position.copy(focus).addScaledVector(sunDir, 220); this.sun.target.position.copy(focus);
    const sc = this.sun.shadow.camera;
    sc.left = -Rr; sc.right = Rr; sc.top = Rr; sc.bottom = -Rr; sc.near = 20; sc.far = 480; sc.updateProjectionMatrix();
    this.sun.shadow.bias = L.bias; this.sun.shadow.normalBias = L.normalBias * (Rr / 12);
    TONE.uLitCol.value.set(...L.lit); TONE.uShadeCol.value.set(...L.shade); TONE.uShadeLift.value.set(...L.lift);
    TONE.uLambert.value = L.lambert; TONE.uSideK.value = L.sideK; TONE.uTerm.value = L.term; TONE.uBounce.value.set(...K.bounce); TONE.uSat.value = K.sat;
    CHAR.uCharTint.value.set(...L.charTint); CHAR.uCharShade.value = L.charShade; CHAR.uGrad.value = L.charGrad;
    CHAR.uBodyGrad.value = L.bodyGrad; CHAR.uSideTint.value.set(...L.sideTint);
    // ---- sky, fog, sun disc, clouds ----
    const su = this.skyMat.uniforms;
    K.sky.c.forEach((h, i) => untone(h, su["c" + i].value));
    const e = K.sky.e.map((deg) => THREE.MathUtils.degToRad(deg));
    su.e.value.set(e[1], e[2], e[3], e[4]);
    this.sky.position.copy(cam.position);
    untone(L.fog, this.fog.color); this.fog.near = L.fogNear; this.fog.far = L.fogFar;
    scene.fog = this.fog; scene.background = null;
    const showSun = s.light === "golden" && s.place === "street";
    this.sunDisc.visible = this.sunHalo.visible = showSun;
    if (showSun) {
      this.sunDisc.position.copy(cam.position).addScaledVector(sunDir, 900);
      this.sunDisc.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(1.7)));
      this.sunHalo.position.copy(this.sunDisc.position); this.sunHalo.scale.setScalar(2 * 900 * Math.tan(THREE.MathUtils.degToRad(24)));
      (this.sunHalo.material as THREE.SpriteMaterial).color.set(L.sunDisc).multiplyScalar(1.3);
    }
    for (let i = 0; i < this.clouds.length; i++) {
      const m = this.clouds[i], mat = m.material as THREE.MeshBasicMaterial;
      m.visible = s.light !== "night";
      m.lookAt(cam.position.x, m.position.y, cam.position.z);
      mat.map = this.cloudMaps[s.light === "night" ? "day" : s.light][i % 4];
    }
    // ---- animated props ----
    this.record.rotation.y = -t * (33.3 / 60) * Math.PI * 2;
    this.boardMat.map = this.boards[id >= 4 && id <= 6 ? 0 : 1];
    const lit = s.light === "night" ? (id === 10 ? 1 + 0.9 * smooth((f - B.afro) / 10) * (1 - 0.35 * smooth((f - B.afro - 20) / 40)) : 1) : 0;
    this.bulbs.visible = lit > 0; for (const g of this.glows) g.visible = lit > 0;
    this.bulbMat.color.setScalar(lit);
    for (const g of this.glows) (g.material as THREE.SpriteMaterial).opacity = Math.min(1, lit);
    this.spot.visible = s.place === "club";
    (this.spot.material as THREE.MeshBasicMaterial).color.setRGB(0.9, 0.7, 0.45).multiplyScalar(id === 5 && f >= 762 ? 1.4 : 0.6);
    this.windowMat.color.set(s.light === "golden" ? "#ffb070" : "#9fc8f0").multiplyScalar(1.4);
    // ---- cast + effects ----
    const right = V(0, 0, 0).setFromMatrixColumn(cam.matrixWorld, 0);
    const st = stage(id, f, { pos: cam.position, right });
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
    void clamp01; void Pen;
    return focus;
  }
}
