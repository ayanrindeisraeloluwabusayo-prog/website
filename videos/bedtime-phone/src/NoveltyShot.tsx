// 3D shot for "Why the new phone stops feeling exciting": the man holds his new phone; a gold glow of excitement in his
// glass head starts big, then fades as he gets used to it. The screen goes dark (a break); when it lights again the
// glow flares back. A picture of hedonic adaptation, not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { holdPhone, Phone, PERSON } from "./Grip";
import { restPose } from "./pose";
import { BlueStage } from "./motion";

export const WAIT_FRAMES = 230;
/** the screen goes dark at OFF_AT and lights again at ON_AT; the glow flares back then */
export const OFF_AT = 140, ON_AT = 166;
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
  const fade = interpolate(f, [26, 100], [1, 0.18], { ...clamp, easing: (t) => 1 - Math.pow(1 - t, 2) });
  const back = interpolate(f, [ON_AT, ON_AT + 10], [0, 1], clamp);
  const level = Math.max(fade, back);
  const screen = f >= OFF_AT && f < ON_AT ? 0 : 1;
  const pulse = 1 + 0.08 * Math.sin(f / 4) * level;
  const r = (0.03 + 0.11 * level) * pulse;
  const flare = Math.max(0, 1 - (f - ON_AT) / 14) * (f >= ON_AT ? 1 : 0);

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <Phone at={at} glow={screen} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <group position={[0.02, 0.05, 0.1]} visible={on > 0.01}>
          <mesh><sphereGeometry args={[r, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={on * (0.35 + 0.65 * level)} depthTest={false} /></mesh>
          <mesh><sphereGeometry args={[r * 2.2, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={on * 0.3 * level} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
          <mesh><sphereGeometry args={[r * 4 + 0.4 * flare, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={on * (0.12 * level + 0.25 * flare)} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
        </group>
      </group>
    </>
  );
};

export const NoveltyShot: React.FC = () => {
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
