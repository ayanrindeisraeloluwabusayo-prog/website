// 3D shot for "Why you feel like someone is watching you": the man stands in the dark with a glass head; pairs of eyes
// float around him, dim and looking every which way (uncertain). At LOOK_AT they all swing round to stare at him and his
// head lights up gold: the brain's default answer, "you're being watched". A picture of the idea, not a real scene.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const WAIT_FRAMES = 150;
/** frame where every eye turns to stare at him */
export const LOOK_AT = 54;

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


// eye pairs: [x, height above his eyes, depth behind him, size]
const PAIRS: [number, number, number, number][] = [
  [-30, 24, 40, 1], [29, 10, 60, 1.05], [-27, -26, 30, 0.95], [33, -38, 80, 0.9], [-35, 44, 100, 0.85],
  [21, 40, 50, 0.9], [-12, 58, 70, 0.8], [38, 62, 120, 0.75], [-40, -6, 110, 0.8], [14, -58, 45, 0.85],
];

const EyePair: React.FC<{ pos: THREE.Vector3; target: THREE.Vector3; wander: number; size: number; look: number; f: number; i: number }> = ({ pos, target, wander, size, look, f, i }) => {
  // before LOOK_AT each pair drifts its gaze around; after, it turns to face the target
  const lost = new THREE.Vector3(Math.sin(f * 0.05 + i * 1.7) * 80, Math.cos(f * 0.04 + i) * 40, Math.cos(f * 0.05 + i * 2.3) * 80).add(pos).add(new THREE.Vector3(0, 0, 200));
  const aimAt = lost.lerp(target, look);
  const m = new THREE.Matrix4().lookAt(aimAt, pos, new THREE.Vector3(0, 1, 0));
  const q = new THREE.Quaternion().setFromRotationMatrix(m);
  const blink = Math.abs(Math.sin(f * 0.07 + i * 3)) > 0.985 ? 0.15 : 1;
  const r = 3.6 * size, op = (0.35 + 0.65 * look) * wander;
  return (
    <group position={pos} quaternion={q}>
      {[-1, 1].map((s) => (
        <group key={s} position={[s * r * 1.5, 0, 0]} scale={[1, blink, 1]}>
          <mesh scale={[1.35, 0.75, 0.5]}><sphereGeometry args={[r, 24, 16]} /><meshBasicMaterial color="#ffffff" transparent opacity={op} /></mesh>
          <mesh position={[0, 0, r * 0.42]}><sphereGeometry args={[r * 0.48, 20, 14]} /><meshBasicMaterial color="#0b1a6e" transparent opacity={op} /></mesh>
          <mesh position={[0, 0, r * 0.62]}><sphereGeometry args={[r * 0.24, 16, 12]} /><meshBasicMaterial color="#000" transparent opacity={op} /></mesh>
          <mesh scale={[1.6, 1, 0.6]}><sphereGeometry args={[r * 1.15, 20, 14]} /><meshBasicMaterial color={GOLD} transparent opacity={0.18 * look * wander} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </group>
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

  // camera: starts wide to show the eyes around him, then pushes in on the head after they all turn
  const push = ease(interpolate(f, [0, WAIT_FRAMES], [0, 1], clamp));
  camera.position.copy(v(10, eye.y - 4, 300).lerp(v(6, eye.y - 2, 150), push));
  camera.lookAt(v(0, eye.y - 2, 0));

  const look = ease(interpolate(f, [LOOK_AT, LOOK_AT + 10], [0, 1], clamp));
  const flare = Math.max(0, 1 - (f - LOOK_AT) / 18) * (f >= LOOK_AT ? 1 : 0);
  const alarm = look * (1 + 0.1 * Math.sin(f / 3));
  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      {PAIRS.map(([x, h, back, size], i) => {
        const pos = v(eye.x + x, eye.y + h, eye.z - back);
        const wander = interpolate(f, [4 + i * 3, 16 + i * 3], [0, 1], clamp);
        return <EyePair key={i} pos={pos} target={eye} wander={wander} size={size} look={look} f={f} i={i} />;
      })}
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <mesh><sphereGeometry args={[0.12 * alarm + 0.02, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={Math.min(1, alarm)} depthTest={false} /></mesh>
        <mesh><sphereGeometry args={[0.32 * alarm + 0.3 * flare, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.3 * alarm + 0.4 * flare} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
      </group>
    </>
  );
};

export const WatchedShot: React.FC = () => {
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
