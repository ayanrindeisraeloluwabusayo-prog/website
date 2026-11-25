// 3D shot for "the spotlight effect": the man stands alone in a spotlight on a dark stage, his glass head glowing. At
// RING_AT the camera pulls back and a ring of other people light up, each under a spotlight of their own. A picture of the idea.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";

export const WAIT_FRAMES = 200;
/** frame where the other spotlights start to switch on */
export const RING_AT = 70;

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


const Cone: React.FC<{ base: THREE.Vector3; height: number; radius: number; on: number }> = ({ base, height, radius, on }) => (
  <group position={base}>
    <mesh position={[0, height / 2, 0]}>
      <coneGeometry args={[radius, height, 48, 1, true]} />
      <meshBasicMaterial color="#fff3c4" transparent opacity={0.16 * on} blending={THREE.AdditiveBlending} depthWrite={false} side={THREE.DoubleSide} />
    </mesh>
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.5, 0]}>
      <circleGeometry args={[radius * 1.05, 48]} />
      <meshBasicMaterial color="#fff3c4" transparent opacity={0.35 * on} blending={THREE.AdditiveBlending} depthWrite={false} />
    </mesh>
  </group>
);

/** a simple glowing stand-in person: body capsule + head */
const Figure: React.FC<{ at: THREE.Vector3; h: number; on: number }> = ({ at, h, on }) => (
  <group position={at}>
    <mesh position={[0, h * 0.42, 0]}><capsuleGeometry args={[h * 0.13, h * 0.5, 8, 16]} /><meshBasicMaterial color={GOLD} transparent opacity={0.9 * on} /></mesh>
    <mesh position={[0, h * 0.9, 0]}><sphereGeometry args={[h * 0.1, 20, 14]} /><meshBasicMaterial color={GOLD} transparent opacity={0.9 * on} /></mesh>
    <mesh position={[0, h * 0.9, 0]}><sphereGeometry args={[h * 0.25, 20, 14]} /><meshBasicMaterial color={GOLD} transparent opacity={0.2 * on} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
  </group>
);

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
  const tall = eye.y - feet + 14;
  // camera: close on him in his spotlight, then a pull-back that reveals everyone else in theirs
  const pull = ease(interpolate(f, [RING_AT - 10, WAIT_FRAMES - 10], [0, 1], clamp));
  camera.position.copy(v(8, eye.y + 4, 170).lerp(v(20, eye.y + 420, 1150), pull));
  camera.lookAt(v(0, eye.y - 6, 0).lerp(v(0, feet + 20, -150), pull));
  const SPOTS: [number, number][] = [[-170, -60], [170, -90], [-90, -260], [100, -300], [-260, -220], [260, -250], [0, -430], [-200, 110], [210, 90], [-330, -20], [330, -10], [-60, -560]];
  const ring = SPOTS.map(([x, z], i) => ({ at: v(eye.x + x, feet, eye.z + z), on: ease(interpolate(f, [RING_AT + i * 5, RING_AT + i * 5 + 12], [0, 1], clamp)) }));
  const glow = interpolate(f, [8, 24], [0, 1], clamp);
  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <Cone base={v(eye.x, feet, eye.z)} height={tall + 120} radius={55} on={interpolate(f, [0, 10], [0.4, 1], clamp)} />
      {ring.map((r, i) => (
        <React.Fragment key={i}>
          <Cone base={r.at} height={tall + 120} radius={50} on={r.on} />
          <Figure at={r.at} h={tall - 6} on={r.on} />
        </React.Fragment>
      ))}
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <mesh><sphereGeometry args={[0.1 * glow + 0.02, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={glow} depthTest={false} /></mesh>
        <mesh><sphereGeometry args={[0.3 * glow, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.3 * glow} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
      </group>
    </>
  );
};

export const SpotShot: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 60%, #0b2a9e 0%, #020a3a 55%, #01041a 100%)" }}>
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Scene man={man} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
