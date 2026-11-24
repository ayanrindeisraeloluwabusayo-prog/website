// 3D shot for "Why mosquitoes bite you": the man stands still; his skin takes on a pulsing gold glow (the smell only
// mosquitoes notice), and small dark mosquitoes spiral in towards him from all sides. A picture of the idea.
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
/** frame where the mosquitoes start to arrive */
export const SWARM_AT = 20;
/** frames between clock ticks, and the frame of the first tick */
export const TICK = 12;
export const FIRST_TICK = 30;
export const TICKS = Array.from({ length: Math.floor((WAIT_FRAMES - FIRST_TICK) / TICK) }, (_, i) => FIRST_TICK + i * TICK);

export const GOLD = "#F3C21D";
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
  void lip;

  const glass = ease(interpolate(f, [2, 18], [0, 1], clamp));
  const mats = man.meshes[0].material as THREE.MeshStandardMaterial[];
  const skin = mats.find((m) => /head/i.test(m.name))!;
  if (!skin.transparent) { skin.transparent = true; skin.needsUpdate = true; }
  skin.opacity = 1; skin.depthWrite = true; void glass;
  skin.color.set("#ffffff");
  const rim = useMemo(() => rimMaterial("#F3C21D", true), []);
  const shell = useMemo(() => {
    const src = man.meshes[0];

    const m = new THREE.SkinnedMesh(src.geometry, (src.material as THREE.Material[]).map(() => rim));
    m.bind(src.skeleton, src.bindMatrix);
    m.frustumCulled = false;
    return m;
  }, [man, rim]);
  rim.uniforms.k.value = (2.4 + 0.9 * Math.sin(f / 5)) * interpolate(f, [4, 24], [0, 1], clamp);

  // camera: waist-up, a slow push towards the head
  const push = ease(interpolate(f, [0, WAIT_FRAMES], [0, 1], clamp));
  camera.position.copy(v(20, eye.y - 30, 300).lerp(v(10, eye.y - 20, 210), push));
  camera.lookAt(v(0, eye.y - 45, 0).lerp(v(0, eye.y - 35, 0), push));

  const bugs = Array.from({ length: 14 }, (_, i) => {
    const a0 = (i / 14) * Math.PI * 2, h = ((i * 37) % 11) / 10;
    const k = interpolate(f, [SWARM_AT + i * 3, SWARM_AT + i * 3 + 90], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
    const r = 120 - 92 * k, a = a0 + f * 0.06 + k * 2;
    return v(Math.cos(a) * r, eye.y - 70 + h * 90 - 10 * k + Math.sin(f / 3 + i) * 3, Math.sin(a) * r * 0.6 + 10);
  });

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      {bugs.map((p, i) => (
        <group key={i} position={p}>
          <mesh><sphereGeometry args={[2.0, 10, 8]} /><meshBasicMaterial color="#111" /></mesh>
          <mesh position={[0, 0.8, 0]} rotation={[0, 0, Math.sin(f * 2 + i) * 0.8]}><planeGeometry args={[6.5, 1.8]} /><meshBasicMaterial color="#dfe8ff" transparent opacity={0.55} side={THREE.DoubleSide} /></mesh>
        </group>
      ))}
    </>
  );
};

export const MagnetShot: React.FC = () => {
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
