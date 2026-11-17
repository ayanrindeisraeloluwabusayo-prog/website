// 3D shot for the door-check video (current three.js style): the man's head turns to glass and inside it floats
// his memory of the locked door, a softly glowing card with a gold padlock on it. `blur` (0-1) makes the memory
// go blurry and grey, the way repeated checking does. A picture of the finding, not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const LOCK_FRAMES = 75;
/** the push-in lasts this many frames (longer clips move more slowly) */
let MOVE = 75;

const GOLD = "#F3C21D";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => t * t * (3 - 2 * t);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

const rimMaterial = (color: string) =>
  new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) }, k: { value: 0 } },
    vertexShader: "#include <common>\n#include <skinning_pars_vertex>\nvarying vec3 n; varying vec3 e; void main(){\n#include <beginnormal_vertex>\n#include <skinbase_vertex>\n#include <skinnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\nvec4 mv = modelViewMatrix * vec4(transformed,1.0); n = normalize(normalMatrix * objectNormal); e = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 c; uniform float k; varying vec3 n; varying vec3 e; void main(){ float f = pow(1.0 - abs(dot(normalize(n), normalize(e))), 2.0); gl_FragColor = vec4(c * f * k, f * k); }",
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });


/** The memory card with its padlock. `blur` stacks faint offset copies and drains the gold. */
const Memory: React.FC<{ blur: number; o: number; f: number }> = ({ blur, o, f }) => {
  const copies = blur > 0.02 ? [[0, 0, 1], [0.012, 0.006, 0.5], [-0.014, -0.004, 0.5], [0.006, -0.012, 0.4], [-0.008, 0.011, 0.4]] : [[0, 0, 1]];
  const gold = new THREE.Color(GOLD).lerp(new THREE.Color("#9aa3b8"), blur).getStyle();
  return (
    <group>
      {copies.map(([dx, dy, w], i) => {
        const k = i === 0 ? 1 - 0.55 * blur : w * blur;
        const x = dx * blur * 3, y = dy * blur * 3;
        return (
          <group key={i} position={[x, y, i * 0.002]}>
            <mesh><planeGeometry args={[0.3, 0.21]} /><meshBasicMaterial color="#dfe9ff" transparent opacity={0.62 * o * k} depthTest={false} side={THREE.DoubleSide} /></mesh>
            <mesh position={[0, -0.022, 0.004]}><boxGeometry args={[0.1, 0.078, 0.03]} /><meshBasicMaterial color={gold} transparent opacity={o * k} depthTest={false} /></mesh>
            <mesh position={[0, 0.024, 0.004]}><torusGeometry args={[0.034, 0.0095, 12, 40, Math.PI]} /><meshBasicMaterial color={gold} transparent opacity={o * k} depthTest={false} /></mesh>
            <mesh position={[0, -0.022, 0.021]}><circleGeometry args={[0.011, 20]} /><meshBasicMaterial color="#5a4300" transparent opacity={o * k * (1 - blur)} depthTest={false} /></mesh>
          </group>
        );
      })}
      <mesh scale={1 + 0.03 * Math.sin(f / 6)}><planeGeometry args={[0.42, 0.3]} /><meshBasicMaterial color={gold} transparent opacity={0.14 * o * (1 - blur)} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
    </group>
  );
};

const Scene: React.FC<{ man: Man; blurAt?: number }> = ({ man, blurAt = 1e9 }) => {
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
  const blur = ease(interpolate(f, [blurAt, blurAt + 40], [0, 1], clamp));

  const mats = man.meshes[0].material as THREE.MeshStandardMaterial[];
  const skin = mats.find((m) => /head/i.test(m.name))!;
  if (!skin.transparent) { skin.transparent = true; skin.needsUpdate = true; }
  skin.opacity = 0.1; skin.depthWrite = false; skin.color.set("#a9c8ff");
  const rim = useMemo(() => rimMaterial("#cfe6ff"), []);
  const shell = useMemo(() => {
    const src = man.meshes[0];
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    const m = new THREE.SkinnedMesh(src.geometry, (src.material as THREE.Material[]).map((x) => (/head/i.test(x.name) ? rim : hidden)));
    m.bind(src.skeleton, src.bindMatrix);
    m.frustumCulled = false;
    return m;
  }, [man, rim]);
  rim.uniforms.c.value.set("#ffe7a8").lerp(new THREE.Color("#8fa6d6"), blur);
  rim.uniforms.k.value = 1.8 - 0.6 * blur;

  // the same move as the Blender version: a three-quarter view that slowly pushes in
  const t = ease(interpolate(f, [0, MOVE - 1], [0, 1], clamp));
  const dist = 132 - 30 * t, ang = ((24 - 9 * t) * Math.PI) / 180;
  camera.position.copy(v(Math.sin(ang) * dist, eye.y + 1, Math.cos(ang) * dist));
  camera.lookAt(v(0, eye.y - 7 + 4 * t, 0));
  const toCam = camera.position.clone().sub(centre).setY(0).normalize();

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16} depthWrite={false} />
        </mesh>
        <group position={[0, 0.03, 0.04]} rotation={[0, Math.atan2(toCam.x, toCam.z) * 0.6, 0]}>
          <Memory blur={blur} o={1} f={f} />
        </group>
      </group>
    </>
  );
};

export const LockShot: React.FC<{ blurAt?: number; move?: number }> = ({ blurAt, move = 75 }) => {
  MOVE = move;
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlueStage glowY={50} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Scene man={man} blurAt={blurAt} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
