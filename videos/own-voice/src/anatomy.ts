// Simple anatomy shapes for the glass-head shots, in "head units" (see AvatarShot.tsx): a jawbone that is a
// flat plate of bone (not a pipe), rows of separate teeth, and the snail-shaped inner ear.
import * as THREE from "three";

const V = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** Half the jaw line, from the joint by the ear, down the back edge, round the corner and along to the chin. */
const HALF: [number, number, number][] = [[0.43, -0.08, -0.02], [0.43, -0.3, -0.03], [0.42, -0.52, 0.0], [0.38, -0.6, 0.14], [0.27, -0.655, 0.36], [0.13, -0.675, 0.54], [0, -0.68, 0.6]];
export const JAW_CURVE = new THREE.CatmullRomCurve3([...HALF.map(([x, y, z]) => V(-x, y, z)), ...HALF.slice(0, -1).reverse().map(([x, y, z]) => V(x, y, z))]);

/** Sweep a flat oval along the jaw line: tall and thin, taller at the back (the ramus) than at the chin. */
export const jawGeometry = () => {
  const N = 120, R = 14;
  const pos: number[] = [], idx: number[] = [];
  for (let i = 0; i <= N; i++) {
    const u = i / N;
    const p = JAW_CURVE.getPoint(u), t = JAW_CURVE.getTangent(u);
    const radial = V(p.x, 0, p.z + 0.25).normalize();           // points out of the face
    const h = t.clone().cross(radial).normalize();              // across the bone, in its flat plane
    const out = h.clone().cross(t).normalize();
    const back = Math.pow(Math.abs(u - 0.5) * 2, 1.5);          // 0 at the chin, 1 at the joints
    const tall = 0.058 + 0.05 * back, thick = 0.026;
    for (let j = 0; j < R; j++) {
      const a = (j / R) * Math.PI * 2;
      const q = p.clone().add(h.clone().multiplyScalar(Math.cos(a) * tall)).add(out.clone().multiplyScalar(Math.sin(a) * thick));
      pos.push(q.x, q.y, q.z);
    }
  }
  for (let i = 0; i < N; i++) for (let j = 0; j < R; j++) {
    const a = i * R + j, b = i * R + ((j + 1) % R), c = a + R, d = b + R;
    idx.push(a, c, b, b, c, d);
  }
  const g = new THREE.BufferGeometry();
  g.setAttribute("position", new THREE.Float32BufferAttribute(pos, 3));
  g.setIndex(idx);
  g.computeVertexNormals();
  return g;
};

/** Where each tooth sits on an arch: lower teeth on top of the jaw's front part, upper teeth just above them. */
export const teeth = (upper: boolean) => {
  const arch = new THREE.CatmullRomCurve3([V(-0.25, 0, 0.3), V(-0.17, 0, 0.47), V(0, 0, 0.56), V(0.17, 0, 0.47), V(0.25, 0, 0.3)]);
  const y = upper ? -0.49 : -0.585;
  return Array.from({ length: 12 }, (_, i) => {
    const u = (i + 0.5) / 12;
    const p = arch.getPoint(u), t = arch.getTangent(u);
    const front = Math.abs(u - 0.5) < 0.2;
    return { pos: V(p.x * (upper ? 1.04 : 1), y, p.z * (upper ? 1.03 : 1)), rot: Math.atan2(t.x, t.z) + Math.PI / 2, w: front ? 0.04 : 0.05, h: front ? 0.07 : 0.055 };
  });
};

/** The inner ear's snail shell (cochlea): a small spiral tube. */
export const cochleaGeometry = () => {
  const pts: THREE.Vector3[] = [];
  for (let i = 0; i <= 60; i++) {
    const u = i / 60, a = u * Math.PI * 5, r = 0.085 * (1 - 0.8 * u);
    pts.push(V(0.02 * u, r * Math.cos(a), r * Math.sin(a)));
  }
  return new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 120, 0.017, 8);
};
