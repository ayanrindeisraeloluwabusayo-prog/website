// 3D shot for the bystander effect: the man's head turns to glass with one bright gold light in it ("it's on me").
// Then four more glass heads appear around him, and each time the light splits: his gets smaller and dimmer and
// a small dim light appears in the new head. A picture of "diffusion of responsibility", not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const SHARE_FRAMES = 150;
/** frames where each of the four other heads appears */
export const JOIN_AT = [34, 50, 66, 82];

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

const Orb: React.FC<{ pos: [number, number, number]; r: number; o: number }> = ({ pos, r, o }) => (
  <group position={pos} visible={o > 0.01}>
    <mesh><sphereGeometry args={[r, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={Math.min(1, o)} depthTest={false} /></mesh>
    <mesh><sphereGeometry args={[r * 2.1, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.3 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
    <mesh><sphereGeometry args={[r * 3.8, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.12 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
  </group>
);

/** A bystander: a plain glass head and shoulders (no face), so the man stays the only "person". */
const Bystander: React.FC<{ pos: THREE.Vector3; s: number; k: number; orb: number; orbR: number }> = ({ pos, s, k, orb, orbR }) => {
  const rim = useMemo(() => rimMaterial("#cfe6ff", false), []);
  rim.uniforms.k.value = 2.4 * k;
  return (
    <group position={[pos.x, pos.y - (1 - k) * 6, pos.z]} scale={s} visible={k > 0.01}>
      <mesh scale={[0.86, 1.05, 0.95]}><sphereGeometry args={[0.5, 40, 30]} /><primitive object={rim} attach="material" /></mesh>
      <mesh scale={[0.86, 1.05, 0.95]}><sphereGeometry args={[0.5, 40, 30]} /><meshBasicMaterial color="#bcd4ff" transparent opacity={0.22 * k} depthWrite={false} /></mesh>
      <mesh position={[0, -0.72, 0]}><cylinderGeometry args={[0.2, 0.24, 0.5, 24]} /><meshBasicMaterial color="#9fc0ff" transparent opacity={0.26 * k} depthWrite={false} /></mesh>
      <mesh position={[0, -1.35, 0]} scale={[1.9, 0.9, 0.8]}><sphereGeometry args={[0.6, 32, 20, 0, Math.PI * 2, 0, Math.PI / 2]} /><meshBasicMaterial color="#9fc0ff" transparent opacity={0.3 * k} depthWrite={false} /></mesh>
      <Orb pos={[0, 0.05, 0.1]} r={orbR} o={orb} />
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

  // camera: starts close on him, pulls back as the others arrive
  const back = ease(interpolate(f, [JOIN_AT[0] - 8, JOIN_AT[3] + 14], [0, 1], clamp));
  camera.position.copy(v(26, eye.y - 1, 118).lerp(v(4, eye.y + 10, 300), back));
  camera.lookAt(v(0, eye.y - 3, 0).lerp(v(0, eye.y - 14, -20), back));

  // how many heads share the job so far (fractional while one is arriving)
  const joined = JOIN_AT.map((a) => ease(interpolate(f, [a, a + 12], [0, 1], clamp)));
  const n = 1 + joined.reduce((s, x) => s + x, 0);
  const share = 1 / n;                                   // each head's share of the light
  const on = interpolate(f, [14, 26], [0, 1], clamp);
  const pulse = 1 + 0.06 * Math.sin(f / 5);
  const spots = [v(-24, -1, -24), v(24, -1, -24), v(-42, -1, -58), v(42, -1, -58)];

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <Orb pos={[0.02, 0.05, 0.1]} r={(0.03 + 0.085 * share) * pulse} o={on * (0.25 + 0.95 * share)} />
      </group>
      {spots.map((p, i) => (
        <Bystander key={i} pos={centre.clone().add(p)} s={S * 0.92} k={joined[i]} orb={joined[i] * (0.25 + 0.95 * share)} orbR={0.03 + 0.085 * share} />
      ))}
    </>
  );
};

export const ShareShot: React.FC = () => {
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
