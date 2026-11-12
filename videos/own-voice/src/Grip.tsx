// Step-by-step stills for the chosen person (B): the grip on the phone, the "looking at it" pose and the
// "speaking into it" pose, each from two angles.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { aim, faceHand, grip, phoneOnPalm, reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
export const PERSON: [string, boolean] = ["Male_Adult_04", true];
export const PHONE = { w: 7.0, h: 14.2, t: 0.8 };

/** Pose the man holding his phone. `lift` 0 = looking at it at chest height, 1 = speaking into it. Returns the phone's place. */
export const holdPhone = (man: Man, rest: Record<string, THREE.Quaternion>, lift: number, talk = 0, nod = 0) => {
  const B = (n: string) => man.bones[key(n)];
  toRest(man, rest);
  const head = B("Bip01 Head").getWorldPosition(v(0, 0, 0));
  const eyes = head.clone().add(v(0, 10, 9));
  // the phone's centre: low and in front of the chest, or just below the mouth
  const c = v(-7, head.y - 30, 27).lerp(v(-9.5, head.y - 6.5, 20), lift);
  const n1 = v(0.18, 0.6, -0.78).lerp(v(0.32, 0.3, -0.9), lift).normalize();   // the screen leans back towards his face
  const up = v(0, 1, 0).sub(n1.clone().multiplyScalar(n1.y)).normalize();  // the phone's long side, as upright as it can be
  const w1 = up.clone().negate();
  const u1 = w1.clone().cross(n1).normalize();
  const wrist = c.clone().sub(n1.clone().multiplyScalar(1.0)).sub(u1.clone().multiplyScalar(5.6)).add(w1.clone().multiplyScalar(2.6));
  // left arm hangs
  aim(B("Bip01 L UpperArm"), B("Bip01 L Forearm"), v(0.16, -1, 0.02));
  aim(B("Bip01 L Forearm"), B("Bip01 L Hand"), v(0.06, -1, 0.2));
  grip(man, "L", 0.25);
  // right arm brings the phone up
  reach(man, "R", wrist, v(-0.35, -1, 0.15));
  faceHand(man, "R", n1, w1);
  grip(man, "R", 1, [1.3, 1.0, 0.4], [0.6, 0.35, 0.4]);
  // head: look down at the phone when it is low; the jaw moves with the words
  const look = c.clone().sub(eyes).normalize();
  const fwd = v(0, 0.45, 0.89);
  aim(B("Bip01 Head"), B("Bip01 MNose"), fwd.clone().add(v(look.x * 0.35, (look.y * 0.5 - nod) * (1 - 0.6 * lift), 0)).normalize());
  aim(B("Bip01 MJaw"), B("Bip01 MBottomLip"), B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0)).sub(B("Bip01 MJaw").getWorldPosition(v(0, 0, 0))).normalize().add(v(0, -0.14 * talk, 0)));
  man.root.updateMatrixWorld(true);
  return phoneOnPalm(man, "R", 0.55);
};

export const Phone: React.FC<{ at: { centre: THREE.Vector3; quat: THREE.Quaternion }; glow?: number; opacity?: number }> = ({ at, glow = 1, opacity = 1 }) => (
  <group position={at.centre} quaternion={at.quat}>
    <mesh><boxGeometry args={[PHONE.w, PHONE.h, PHONE.t]} /><meshStandardMaterial color="#0c0d12" roughness={0.25} metalness={0.6} transparent={opacity < 1} opacity={opacity} /></mesh>
    <mesh position={[0, 0, PHONE.t / 2 + 0.02]}><planeGeometry args={[PHONE.w - 0.6, PHONE.h - 0.9]} /><meshBasicMaterial color="#3d74ff" transparent opacity={0.9 * glow * opacity} /></mesh>
    <mesh position={[0, -2.2, PHONE.t / 2 + 0.04]}><planeGeometry args={[PHONE.w - 1.8, 2.2]} /><meshBasicMaterial color="#F3C21D" transparent opacity={glow * opacity} /></mesh>
  </group>
);

const VIEWS: { lift: number; cam: (h: THREE.Vector3, c: THREE.Vector3) => [THREE.Vector3, THREE.Vector3] }[] = [
  { lift: 0, cam: (h, c) => [c.clone().add(v(14, 4, 34)), c] },                 // grip close-up, low pose
  { lift: 0, cam: (h, c) => [c.clone().add(v(-36, 10, 4)), c] },                // the grip from his right side
  { lift: 0, cam: (h) => [v(10, h.y - 16, 150), v(0, h.y - 16, 0)] },           // waist-up, looking at the phone
  { lift: 1, cam: (h) => [v(10, h.y - 16, 150), v(0, h.y - 16, 0)] },           // waist-up, speaking
  { lift: 1, cam: (h, c) => [c.clone().add(v(16, 3, 36)), c] },                 // grip close-up, speaking
  { lift: 1, cam: (h) => [v(34, h.y + 6, 62), v(0, h.y + 3, 6)] },              // face, speaking
];

const GripScene: React.FC<{ man: Man }> = ({ man }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const rest = useMemo(() => restPose(man), [man]);
  const view = VIEWS[f % VIEWS.length];
  const at = holdPhone(man, rest, view.lift, view.lift ? 0.6 : 0);
  const head = man.bones[key("Bip01 Head")].getWorldPosition(v(0, 0, 0));
  const [pos, look] = view.cam(head, at.centre);
  camera.position.copy(pos); camera.lookAt(look);
  return (<><Studio /><primitive object={man.root} /><Phone at={at} /></>);
};

export const GripCheck: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill>
      <BlueStage glowY={52} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><GripScene man={man} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
