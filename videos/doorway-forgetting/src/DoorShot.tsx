// 3D shot for "Why do you walk into a room and forget why you went?": the man's head turns to glass; inside it his
// day is a set of floating "scene cards", with one golden card (the reason he got up) in front.
//   mode "file": a glowing doorway sweeps past, then every card slides down into a drawer, the golden one last,
//                and the drawer shuts (the brain files the old scene away, and the reason with it).
//   mode "back": he walks back through the doorway, the drawer opens and the golden card rises out again.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const FILE_FRAMES = 240;
export const BACK_FRAMES = 150;
/** frame (inside each clip) where the doorway passes the camera; Video.tsx flashes the screen there */
export const DOOR_FILE = 42;
export const DOOR_BACK = 14;

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

const DRAWER_Y = -0.24;

/** A flat glowing card: white for ordinary scenes, gold for the reason. */
const Card: React.FC<{ pos: [number, number, number]; rot: number; s: number; o: number; gold?: boolean; glow?: number }> = ({ pos, rot, s, o, gold, glow = 1 }) => (
  <group position={pos} rotation={[0, 0, rot]} scale={s * 1.55}>
    <mesh><boxGeometry args={gold ? [0.2, 0.125, 0.006] : [0.13, 0.08, 0.005]} /><meshBasicMaterial color={gold ? GOLD : "#ffffff"} transparent opacity={o} depthTest={false} /></mesh>
    {/* a few "picture" lines on the card */}
    {[0.25, 0, -0.25].map((y, i) => (
      <mesh key={i} position={[-(gold ? 0.02 : 0.012), y * (gold ? 0.1 : 0.064), 0.004]}>
        <boxGeometry args={[gold ? 0.13 : 0.08, gold ? 0.012 : 0.008, 0.001]} />
        <meshBasicMaterial color={gold ? "#8a6a00" : "#9fb4d8"} transparent opacity={o} depthTest={false} />
      </mesh>
    ))}
    <mesh><boxGeometry args={gold ? [0.32, 0.22, 0.001] : [0.2, 0.13, 0.001]} /><meshBasicMaterial color={gold ? GOLD : "#cfe0ff"} transparent opacity={(gold ? 0.3 : 0.14) * o * glow} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
  </group>
);

/** The doorway: a warm glowing frame that sweeps past the camera. */
const Doorway: React.FC<{ x: number; y: number; z: number; o: number }> = ({ x, y, z, o }) => {
  const W = 34, H = 64, T = 2.6;
  const bar = (px: number, py: number, w: number, h: number, i: number) => (
    <mesh key={i} position={[px, py, 0]}><boxGeometry args={[w, h, T]} /><meshBasicMaterial color="#ffe2a0" transparent opacity={o} /></mesh>
  );
  return (
    <group position={[x, y, z]} visible={o > 0.01}>
      {bar(-W / 2, 0, T, H, 0)}{bar(W / 2, 0, T, H, 1)}{bar(0, H / 2, W + T, T, 2)}
      <mesh><planeGeometry args={[W, H]} /><meshBasicMaterial color="#ffd27a" transparent opacity={0.28 * o} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
    </group>
  );
};

const Scene: React.FC<{ man: Man; mode: "file" | "back" }> = ({ man, mode }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  const back = mode === "back";

  // pose: standing still, head tilted a little (the "why am I here?" tilt), a slow breath
  const rest = useMemo(() => restPose(man), [man]);
  toRest(man, rest);
  const tilt = back ? 0.02 : 0.1 * ease(interpolate(f, [60, 110], [0, 1], clamp));
  B("Bip01 Head").rotateX(tilt);
  B("Bip01 Head").rotateY(0.02 * Math.sin(f / 30));
  man.root.updateMatrixWorld(true);

  const eye = B("Bip01 LEye").getWorldPosition(v(0, 0, 0)).add(B("Bip01 REye").getWorldPosition(v(0, 0, 0))).multiplyScalar(0.5);
  const lip = B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0));
  const S = (eye.y - lip.y) / 0.53;
  const centre = v(0, eye.y + 0.12 * S, eye.z - 0.62 * S);

  const push = back ? 1 : ease(interpolate(f, [0, 30], [0, 1], clamp));
  const glass = back ? 1 : ease(interpolate(f, [8, 30], [0, 1], clamp));

  // glass head
  const mats = man.meshes[0].material as THREE.MeshStandardMaterial[];
  const skin = mats.find((m) => /head/i.test(m.name))!;
  if (!skin.transparent) { skin.transparent = true; skin.needsUpdate = true; }
  skin.opacity = 1 - 0.9 * glass; skin.depthWrite = glass < 0.3;
  skin.color.set(glass > 0.5 ? "#a9c8ff" : "#ffffff");
  const rim = useMemo(() => rimMaterial("#cfe6ff"), []);
  const shell = useMemo(() => {
    const src = man.meshes[0];
    const hidden = new THREE.MeshBasicMaterial({ visible: false });
    const m = new THREE.SkinnedMesh(src.geometry, (src.material as THREE.Material[]).map((x) => (/head/i.test(x.name) ? rim : hidden)));
    m.bind(src.skeleton, src.bindMatrix);
    m.frustumCulled = false;
    return m;
  }, [man, rim]);
  rim.uniforms.k.value = 1.7 * glass;

  // camera: in close on his left, drifting slowly round
  const side = back ? -1 : 1;
  const orbit = f * 0.03;
  const near = v(50 * side - orbit * side, eye.y - 2, 104 + orbit);
  camera.position.copy(v(14 * side, eye.y - 12, 165).lerp(near, push));
  camera.lookAt(v(-2, eye.y - 22, 0).lerp(v(0, eye.y - 2, 2), push));

  // the doorway sweeps across, between the camera and his head
  const doorAt = back ? DOOR_BACK : DOOR_FILE;
  const sweep = interpolate(f, [doorAt - 10, doorAt + 10], [0, 1], clamp);
  const doorO = sweep > 0 && sweep < 1 ? Math.min(1, 1.6 * Math.sin(sweep * Math.PI)) : 0;
  const camDir = camera.position.clone().sub(centre).normalize();
  const doorPos = centre.clone().add(camDir.clone().multiplyScalar(-34));   // just behind his head
  const sideDir = v(camDir.z, 0, -camDir.x).normalize().multiplyScalar((back ? -1 : 1) * (sweep - 0.5) * 150);

  // scene cards
  const cards = useMemo(() => Array.from({ length: 9 }, (_, i) => {
    const a = i * 2.39996 + 0.6, r = 0.24 + 0.12 * ((i * 7) % 10) / 10;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.75 + 0.06, z: ((i * 5) % 7) / 7 * 0.16 - 0.1, rot: ((i * 3) % 5 - 2) * 0.12 };
  }), []);
  const on = back ? 1 : interpolate(f, [24, 40], [0, 1], clamp);
  // filing (mode file): card i slides into the drawer from frame 72 + 9i; the golden one goes last
  const slide = (start: number) => ease(interpolate(f, [start, start + 24], [0, 1], clamp));
  const rise = (start: number) => ease(interpolate(f, [start, start + 30], [0, 1], clamp));
  const goldStart = 165;
  const drawerShut = back ? 1 - ease(interpolate(f, [DOOR_BACK + 4, DOOR_BACK + 20], [0, 1], clamp)) : ease(interpolate(f, [goldStart + 26, goldStart + 40], [0, 1], clamp));
  const drawerO = back ? 1 : interpolate(f, [60, 72], [0, 1], clamp);
  const at = (from: [number, number, number], k: number): [number, number, number] => [
    from[0] * (1 - k), from[1] + (DRAWER_Y - from[1]) * k, from[2] * (1 - k),
  ];

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <Doorway x={doorPos.x + sideDir.x} y={doorPos.y - 4} z={doorPos.z + sideDir.z} o={doorO} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.2 * glass} depthWrite={false} />
        </mesh>
        {cards.map((c, i) => {
          const k = back ? 1 - rise(DOOR_BACK + 26 + i * 4) : slide(72 + i * 9);
          const bob = 0.01 * Math.sin(f / 14 + i);
          const o = on * (k > 0.92 ? (1 - k) / 0.08 : 1);
          return o > 0.01 ? <Card key={i} pos={at([c.x, c.y + bob, c.z], k)} rot={c.rot * (1 - k)} s={1 - 0.5 * k} o={o} /> : null;
        })}
        {(() => {
          const k = back ? 1 - rise(DOOR_BACK + 30) : slide(goldStart);
          const glow = back ? interpolate(f, [DOOR_BACK + 40, DOOR_BACK + 70], [0.3, 1.4], clamp) : 1 - 0.7 * k;
          const o = on * (k > 0.92 ? (1 - k) / 0.08 : 1);
          const pulse = 1 + (back ? 0.06 * Math.sin(f / 5) * glow : 0);
          return o > 0.01 ? <Card pos={at([0.0, 0.02, 0.1], k)} rot={0} s={(1 - 0.5 * k) * pulse} o={o} gold glow={glow} /> : null;
        })()}
        {back ? (
          <group position={[0, 0.02, 0.1]}>
            <mesh rotation={[1.2, f / 30, 0]}><torusGeometry args={[0.17, 0.005, 8, 64]} /><meshBasicMaterial color={GOLD} transparent opacity={interpolate(f, [DOOR_BACK + 55, DOOR_BACK + 75], [0, 0.9], clamp)} depthTest={false} /></mesh>
          </group>
        ) : null}
        {/* the drawer: an open box at the bottom of the head, whose front panel rises to shut it */}
        <group position={[0, DRAWER_Y - 0.03, 0]} visible={drawerO > 0.01}>
          {[[0, 0.065, 0.46, 0.008], [0, -0.065, 0.46, 0.008], [-0.23, 0, 0.008, 0.138], [0.23, 0, 0.008, 0.138]].map(([x, y, w, h], i) => (
            <mesh key={i} position={[x, y, 0.126]}><boxGeometry args={[w, h, 0.002]} /><meshBasicMaterial color={GOLD} transparent opacity={0.95 * drawerO} depthTest={false} /></mesh>
          ))}
          <mesh><boxGeometry args={[0.46, 0.13, 0.24]} /><meshBasicMaterial color={GOLD} transparent opacity={0.12 * drawerO} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
          <mesh position={[0, -0.065 + 0.065 * drawerShut, 0.122]} scale={[1, Math.max(0.001, drawerShut), 1]}>
            <boxGeometry args={[0.46, 0.13, 0.002]} />
            <meshBasicMaterial color="#2a4fb8" transparent opacity={0.95 * drawerO} depthTest={false} />
          </mesh>
          <mesh position={[0, 0, 0.128]} visible={drawerShut > 0.9}>
            <boxGeometry args={[0.1, 0.016, 0.002]} />
            <meshBasicMaterial color={GOLD} depthTest={false} />
          </mesh>
        </group>
      </group>
    </>
  );
};

const Shot: React.FC<{ mode: "file" | "back" }> = ({ mode }) => {
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlueStage glowY={50} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Scene man={man} mode={mode} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};

export const DoorFile: React.FC = () => <Shot mode="file" />;
export const DoorBack: React.FC = () => <Shot mode="back" />;
