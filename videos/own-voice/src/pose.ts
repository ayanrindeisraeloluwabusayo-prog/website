// Posing helpers for the Rocketbox avatars (3ds Max "Biped" skeleton): aim a bone, reach a point with the arm,
// turn the hand to face a direction, and wrap the fingers round a phone that sits flat on the palm.
import * as THREE from "three";
import { key, Man } from "./Avatar";

const V = (x = 0, y = 0, z = 0) => new THREE.Vector3(x, y, z);
const wp = (b: THREE.Object3D) => b.getWorldPosition(V());

/** Turn `bone` so the line from it to `child` points along `dir` (world space). */
export const aim = (bone: THREE.Bone, child: THREE.Object3D, dir: THREE.Vector3) => {
  bone.updateWorldMatrix(true, true);
  const delta = new THREE.Quaternion().setFromUnitVectors(wp(child).sub(wp(bone)).normalize(), dir.clone().normalize());
  turn(bone, delta);
};

/** Apply a world-space rotation to a bone. */
export const turn = (bone: THREE.Bone, worldRot: THREE.Quaternion) => {
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(worldRot);
  bone.quaternion.copy(bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
  bone.updateWorldMatrix(false, true);
};

export const restPose = (man: Man) => Object.fromEntries(Object.entries(man.bones).map(([k, b]) => [k, b.quaternion.clone()]));
export const toRest = (man: Man, rest: Record<string, THREE.Quaternion>) => { for (const [k, b] of Object.entries(man.bones)) b.quaternion.copy(rest[k]); man.root.updateMatrixWorld(true); };

/** The hand's own directions: u along the fingers, w from the index side to the little-finger side, n out of the palm. */
export const handAxes = (man: Man, sd: "L" | "R") => {
  const B = (n: string) => man.bones[key(`Bip01 ${sd} ${n}`)];
  const u = wp(B("Finger2")).sub(wp(B("Hand"))).normalize();
  const w0 = wp(B("Finger4")).sub(wp(B("Finger1")));
  const w = w0.sub(u.clone().multiplyScalar(w0.dot(u))).normalize();
  const n = u.clone().cross(w).multiplyScalar(sd === "R" ? 1 : -1).normalize();
  return { u, w, n };
};

/** Two-bone reach: put the wrist at `target`, with the elbow pushed towards `pole`. */
export const reach = (man: Man, sd: "L" | "R", target: THREE.Vector3, pole: THREE.Vector3) => {
  const B = (n: string) => man.bones[key(`Bip01 ${sd} ${n}`)];
  const up = B("UpperArm"), fore = B("Forearm"), hand = B("Hand");
  up.updateWorldMatrix(true, true);
  const s = wp(up), l1 = wp(fore).distanceTo(s), l2 = wp(hand).distanceTo(wp(fore));
  const to = target.clone().sub(s);
  const d = Math.min(to.length(), (l1 + l2) * 0.999);
  const dir = to.clone().normalize();
  const a = (l1 * l1 - l2 * l2 + d * d) / (2 * d);
  const h = Math.sqrt(Math.max(0, l1 * l1 - a * a));
  const side = pole.clone().sub(dir.clone().multiplyScalar(pole.dot(dir))).normalize();
  const elbow = s.clone().add(dir.clone().multiplyScalar(a)).add(side.multiplyScalar(h));
  aim(up, fore, elbow.clone().sub(s));
  aim(fore, hand, s.clone().add(dir.multiplyScalar(d)).sub(elbow));
};

/** Turn the hand so its palm faces `n1` and the index-to-little-finger line runs along `w1`. */
export const faceHand = (man: Man, sd: "L" | "R", n1: THREE.Vector3, w1: THREE.Vector3) => {
  const hand = man.bones[key(`Bip01 ${sd} Hand`)];
  hand.updateWorldMatrix(true, true);
  const { u, w, n } = handAxes(man, sd);
  const nn = n1.clone().normalize();
  const ww = w1.clone().sub(nn.clone().multiplyScalar(w1.dot(nn))).normalize();
  const uu = ww.clone().cross(nn).multiplyScalar(sd === "R" ? 1 : -1).normalize();
  const from = new THREE.Matrix4().makeBasis(u, w, n), to = new THREE.Matrix4().makeBasis(uu, ww, nn);
  turn(hand, new THREE.Quaternion().setFromRotationMatrix(to.multiply(from.invert())));
};

/** Curl the four fingers (and bring the thumb in) around something lying on the palm. `k` 0 = open, 1 = closed. */
export const grip = (man: Man, sd: "L" | "R", k = 1, curls: [number, number, number] = [1.35, 1.45, 0.5], thumb: [number, number, number] = [0.5, 0.35, 0.5]) => {
  const B = (n: string) => man.bones[key(`Bip01 ${sd} ${n}`)];
  const { u, w, n } = handAxes(man, sd);
  const sign = sd === "R" ? 1 : -1;
  const axis = w.clone().multiplyScalar(-sign);          // rotating about this takes the fingers from u towards n
  for (const f of [1, 2, 3, 4]) {
    [B(`Finger${f}`), B(`Finger${f}1`), B(`Finger${f}2`)].forEach((b, i) => {
      if (b) turn(b, new THREE.Quaternion().setFromAxisAngle(axis, curls[i] * k * (1 - 0.04 * f)));
    });
  }
  // thumb: swing it across towards the palm side, then bend it
  const t0 = B("Finger0"), t1 = B("Finger01"), t2 = B("Finger02");
  if (t0) turn(t0, new THREE.Quaternion().setFromAxisAngle(u, -thumb[0] * k * sign));
  if (t1) turn(t1, new THREE.Quaternion().setFromAxisAngle(axis, thumb[1] * k));
  if (t2) turn(t2, new THREE.Quaternion().setFromAxisAngle(axis, thumb[2] * k));
  return { u, w, n };
};

/** Where a phone sits when it lies on the palm: its centre and its three directions (x across, y up its length, z out of the screen). */
export const phoneOnPalm = (man: Man, sd: "L" | "R", lift = 0.9) => {
  const B = (n: string) => man.bones[key(`Bip01 ${sd} ${n}`)];
  const { u, w, n } = handAxes(man, sd);
  const palm = wp(B("Hand")).lerp(wp(B("Finger2")), 0.62);
  const centre = palm.add(n.clone().multiplyScalar(lift)).add(w.clone().multiplyScalar(-1.2));
  const m = new THREE.Matrix4().makeBasis(u.clone().multiplyScalar(sd === "R" ? -1 : 1), w.clone().negate(), n);
  return { centre, quat: new THREE.Quaternion().setFromRotationMatrix(m) };
};
