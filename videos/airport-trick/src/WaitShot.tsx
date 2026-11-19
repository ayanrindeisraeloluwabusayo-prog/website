// 3D shot for "The airport trick": the man stands still, his head turns to glass, and inside it a gold clock ticks
// second by second: with nothing to do, the mind just counts. A picture of the idea, not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const WAIT_FRAMES = 200;
/** frames between clock ticks, and the frame of the first tick */
export const TICK = 12;
export const FIRST_TICK = 30;
export const TICKS = Array.from({ length: Math.floor((WAIT_FRAMES - FIRST_TICK) / TICK) }, (_, i) => FIRST_TICK + i * TICK);

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

  // camera: slow push-in on the head while the clock ticks
  const push = ease(interpolate(f, [0, WAIT_FRAMES], [0, 1], clamp));
  camera.position.copy(v(10, eye.y + 2, 210).lerp(v(4, eye.y + 1, 82), push));
  camera.lookAt(v(0, eye.y - 4, 0).lerp(v(0, eye.y + 1, 0), push));

  const on = interpolate(f, [16, 28], [0, 1], clamp);
  const ticks = TICKS.filter((t) => f >= t).length;
  const last = TICKS.filter((t) => f >= t).pop() ?? 0;
  const snap = ease(interpolate(f, [last, last + 4], [0, 1], clamp));
  const angle = -((ticks - 1 + snap) / 12) * Math.PI * 2;
  const thump = 1 + 0.06 * Math.max(0, 1 - (f - last) / 6) * (ticks > 0 ? 1 : 0);
  const gm = (o: number) => <meshBasicMaterial color={GOLD} transparent opacity={o * on} depthTest={false} />;

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
        <group position={[0, 0.06, 0.12]} scale={0.95 * thump}>
          <mesh><torusGeometry args={[0.2, 0.014, 12, 64]} />{gm(1)}</mesh>
          <mesh><circleGeometry args={[0.2, 48]} /><meshBasicMaterial color={GOLD} transparent opacity={0.12 * on} depthTest={false} /></mesh>
          <mesh><circleGeometry args={[0.36, 48]} /><meshBasicMaterial color={GOLD} transparent opacity={0.08 * on} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
          {Array.from({ length: 12 }, (_, i) => {
            const a = (i / 12) * Math.PI * 2, lit = i < ticks % 12 || ticks >= 12;
            return <mesh key={i} position={[Math.sin(a) * 0.165, Math.cos(a) * 0.165, 0]} rotation={[0, 0, -a]}><boxGeometry args={[0.012, 0.035, 0.005]} />{gm(lit ? 1 : 0.35)}</mesh>;
          })}
          <group rotation={[0, 0, angle]}>
            <mesh position={[0, 0.07, 0.004]}><boxGeometry args={[0.012, 0.15, 0.005]} />{gm(1)}</mesh>
          </group>
          <mesh position={[0, 0, 0.006]}><circleGeometry args={[0.018, 20]} />{gm(1)}</mesh>
        </group>
      </group>
    </>
  );
};

export const WaitShot: React.FC = () => {
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
