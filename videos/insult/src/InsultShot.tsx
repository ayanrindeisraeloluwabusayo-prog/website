// 3D shot for "Why one insult beats ten compliments": the man reads his phone; ten small gold lights (compliments) circle
// in his glass head, then one red light (the insult) swells and pulses until it outshines them all. A picture of the idea.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { holdPhone, Phone, PERSON } from "./Grip";
import { restPose } from "./pose";
import { BlueStage } from "./motion";

export const WAIT_FRAMES = 125;
/** frame where the red "insult" light appears */
export const RED_AT = 30;
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
  const at = holdPhone(man, rest, 0);

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

  // camera: waist-up, a slow push towards the head
  const push = ease(interpolate(f, [0, WAIT_FRAMES], [0, 1], clamp));
  camera.position.copy(v(14, eye.y - 10, 175).lerp(v(8, eye.y - 4, 120), push));
  camera.lookAt(v(0, eye.y - 14, 0).lerp(v(0, eye.y - 8, 0), push));

  const on = interpolate(f, [16, 24], [0, 1], clamp);
  const red = interpolate(f, [RED_AT, RED_AT + 40], [0, 1], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 3) });
  const pulse = 1 + 0.12 * Math.sin(f / 3) * red;
  const golds = Array.from({ length: 10 }, (_, i) => { const a = (i / 10) * Math.PI * 2 + f * 0.03; return [Math.cos(a) * 0.26, Math.sin(a) * 0.2 + 0.05] as [number, number]; });

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <Phone at={at} glow={1} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        {golds.map(([x, y], i) => (
          <mesh key={i} position={[x, y, 0.1]}><sphereGeometry args={[0.035, 16, 12]} /><meshBasicMaterial color={GOLD} transparent opacity={on * (1 - 0.7 * red)} depthTest={false} /></mesh>
        ))}
        <group position={[0.02, 0.05, 0.12]} visible={red > 0.01}>
          <mesh><sphereGeometry args={[0.13 * red * pulse, 24, 18]} /><meshBasicMaterial color="#ff2d2d" transparent opacity={red} depthTest={false} /></mesh>
          <mesh><sphereGeometry args={[0.3 * red * pulse, 24, 18]} /><meshBasicMaterial color="#ff2d2d" transparent opacity={0.3 * red} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
          <mesh><sphereGeometry args={[0.55 * red, 24, 18]} /><meshBasicMaterial color="#ff2d2d" transparent opacity={0.12 * red} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
        </group>
      </group>
    </>
  );
};

export const InsultShot: React.FC = () => {
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
