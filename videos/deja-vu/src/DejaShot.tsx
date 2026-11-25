// 3D shot for the déjà vu video: a wire-frame room draws itself around the man; a gold "ghost" copy of the same room
// flickers in off to one side and slides into place, locking onto the real one at SNAP_AT (a familiar pattern). At CHECK_AT a
// gold ring scans up his body to his glass head, which lights up: the brain checking the feeling. A picture of the idea.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const WAIT_FRAMES = 210;
/** frame where the ghost room locks onto the real one */
export const SNAP_AT = 70;
/** frame where the checking scan starts (it reaches his head about 30 frames later) */
export const CHECK_AT = 140;

const GOLD = "#F3C21D";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => t * t * (3 - 2 * t);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rimSrc = {
  vertexSkinned: "#include <common>\n#include <skinning_pars_vertex>\nvarying vec3 n; varying vec3 e; void main(){\n#include <beginnormal_vertex>\n#include <skinbase_vertex>\n#include <skinnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\nvec4 mv = modelViewMatrix * vec4(transformed,1.0); n = normalize(normalMatrix * objectNormal); e = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
  vertexPlain: "varying vec3 n; varying vec3 e; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); n = normalize(normalMatrix * normal); e = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
  fragment: "uniform vec3 c; uniform float k; varying vec3 n; varying vec3 e; void main(){ float f = pow(1.0 - abs(dot(normalize(n), normalize(e))), 2.0); gl_FragColor = vec4(c * f * k, f * k); }",
};
const rimMaterial = (color: string, skinned: boolean) =>
  new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) }, k: { value: 0 } },
    vertexShader: skinned ? rimSrc.vertexSkinned : rimSrc.vertexPlain, fragmentShader: rimSrc.fragment,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });


/** a wire-frame room (floor, walls, a doorway) built from thin bars so it reads at video size */
const Room: React.FC<{ x: number; y: number; z: number; w: number; h: number; d: number; color: string; k: number }> = ({ x, y, z, w, h, d, color, k }) => {
  const bars = useMemo(() => {
    const out: [number, number, number, number, number, number][] = []; // centre xyz, size xyz
    const X = [-w / 2, w / 2], Y = [0, h], Z = [-d / 2, d / 2], s = 2.2;
    for (const yy of Y) for (const zz of Z) out.push([0, yy, zz, w, s, s]);
    for (const xx of X) for (const zz of Z) out.push([xx, h / 2, zz, s, h, s]);
    for (const xx of X) for (const yy of Y) out.push([xx, yy, 0, s, s, d]);
    // doorway on the back wall, and floor lines
    out.push([-40, 80, -d / 2, s, 160, s], [40, 80, -d / 2, s, 160, s], [0, 160, -d / 2, 80, s, s]);
    for (let i = 1; i < 5; i++) out.push([-w / 2 + (w * i) / 5, 0, 0, s * 0.6, s * 0.6, d]);
    return out;
  }, [w, h, d]);
  return (
    <group position={[x, y, z]}>
      {bars.map(([cx, cy, cz, sx, sy, sz], i) => (
        <mesh key={i} position={[cx, cy, cz]} scale={[sx, sy, sz]}>
          <boxGeometry args={[1, 1, 1]} />
          <meshBasicMaterial color={color} transparent opacity={k} depthWrite={false} />
        </mesh>
      ))}
    </group>
  );
};

const Scene: React.FC<{ man: Man }> = ({ man }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  const rest = useMemo(() => restPose(man), [man]);
  toRest(man, rest);
  man.root.updateMatrixWorld(true);
  for (const sd of ["L", "R"] as const) {
    const hip = B(`Bip01 ${sd} Thigh`).getWorldPosition(v(0, 0, 0));
    const out = hip.x >= B("Bip01 Pelvis").getWorldPosition(v(0, 0, 0)).x ? 1 : -1;
    reach(man, sd, hip.clone().add(v(out * 13, -22, 6)), hip.clone().add(v(out * 40, 0, -60)));
  }
  man.root.updateMatrixWorld(true);

  const eye = B("Bip01 LEye").getWorldPosition(v(0, 0, 0)).add(B("Bip01 REye").getWorldPosition(v(0, 0, 0))).multiplyScalar(0.5);
  const lip = B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0));
  const S = (eye.y - lip.y) / 0.53;
  const centre = v(eye.x, eye.y + 0.12 * S, eye.z - 0.62 * S);

  const glass = ease(interpolate(f, [2, 18], [0, 1], clamp));
  const mats = man.meshes[0].material as THREE.MeshStandardMaterial[];
  const skin = mats.find((m) => /head/i.test(m.name))!;
  if (!skin.transparent) { skin.transparent = true; skin.needsUpdate = true; }
  skin.opacity = 1 - 0.9 * glass; skin.depthWrite = glass < 0.3;
  skin.color.set(glass > 0.5 ? "#a9c8ff" : "#ffffff");
  const rim = useMemo(() => rimMaterial("#cfe6ff", true), []);
  const shell = useMemo(() => {
    const src = man.meshes[0];
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    const m = new THREE.SkinnedMesh(src.geometry, (src.material as THREE.Material[]).map((x) => (/head/i.test(x.name) ? rim : hidden)));
    m.bind(src.skeleton, src.bindMatrix);
    m.frustumCulled = false;
    return m;
  }, [man, rim]);
  rim.uniforms.k.value = 1.7 * glass;

  const feet = Math.min(B("Bip01 L Foot").getWorldPosition(v(0, 0, 0)).y, B("Bip01 R Foot").getWorldPosition(v(0, 0, 0)).y) - 8;
  // camera: a slow drift around him, pushing in a little on the check
  const t = interpolate(f, [0, WAIT_FRAMES], [0, 1], clamp);
  const ang = -0.35 + 0.5 * ease(t);
  const dist = interpolate(f, [0, CHECK_AT, WAIT_FRAMES], [420, 380, 250], clamp);
  camera.position.copy(v(Math.sin(ang) * dist, eye.y + 40 - 30 * t, Math.cos(ang) * dist));
  camera.lookAt(v(0, eye.y - 40 + 25 * t, -40));
  const draw = ease(interpolate(f, [12, 40], [0, 1], clamp));
  const ghost = interpolate(f, [SNAP_AT - 30, SNAP_AT - 18], [0, 1], clamp);
  const slide = ease(interpolate(f, [SNAP_AT - 30, SNAP_AT], [1, 0], clamp));
  const snap = Math.max(0, 1 - (f - SNAP_AT) / 14) * (f >= SNAP_AT ? 1 : 0);
  const flick = f < SNAP_AT ? 0.6 + 0.4 * Math.abs(Math.sin(f * 0.9)) : 1;
  const scan = interpolate(f, [CHECK_AT, CHECK_AT + 30], [0, 1], clamp);
  const glow = Math.max(snap, interpolate(f, [CHECK_AT + 20, CHECK_AT + 34], [0, 1], clamp));
  const room = { w: 300, h: 250, d: 300, y: feet, z: -90 };
  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <Room {...room} x={0} color="#ffffff" k={draw} />
      <Room {...room} x={70 * slide} z={room.z - 50 * slide} color={GOLD} k={ghost * flick * (1 - 0.6 * interpolate(f, [SNAP_AT + 14, SNAP_AT + 40], [0, 1], clamp))} />
      {scan > 0 && scan < 1 ? (
        <mesh position={[eye.x, feet + scan * (eye.y + 30 - feet), eye.z]} rotation={[-Math.PI / 2, 0, 0]}>
          <torusGeometry args={[42, 1.6, 12, 64]} /><meshBasicMaterial color={GOLD} transparent opacity={0.9} />
        </mesh>
      ) : null}
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <mesh><sphereGeometry args={[0.11 * glow + 0.02, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={glow} depthTest={false} /></mesh>
        <mesh><sphereGeometry args={[0.34 * glow, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.35 * glow} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
      </group>
    </>
  );
};

export const DejaShot: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlueStage glowY={50} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Scene man={man} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
