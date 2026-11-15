// 3D shot for "Why do you get a sudden urge to jump?": the man's head turns to glass.
//   mode "alarm": a red alarm deep in the head fires first (rings pulse out) and his body is pulled back from the edge;
//                 only later a slower white "thinking" light drifts in, looks around, and the alarm calms down.
//   mode "saved": the thinking light turns gold and a gold ring closes round his head (the brain had already saved him).
// The alarm and the light are a picture of the researchers' proposed explanation, not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const ALARM_FRAMES = 370;
export const SAVED_FRAMES = 115;
/** frames inside the "alarm" clip */
export const ALARM_AT = 16, PULL_AT = 120, THINK_AT = 169, LOOK_AT = 243, CALM_AT = 276;
/** frame inside the "saved" clip where the light turns gold */
export const GOLD_AT = 58;

const GOLD = "#F3C21D", RED = "#ff3b30";
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

/** a glowing ball: solid core plus two soft additive shells */
const Orb: React.FC<{ pos: [number, number, number]; color: string; r: number; o: number }> = ({ pos, color, r, o }) => (
  <group position={pos} visible={o > 0.01}>
    <mesh><sphereGeometry args={[r, 24, 18]} /><meshBasicMaterial color={color} transparent opacity={o} depthTest={false} /></mesh>
    <mesh><sphereGeometry args={[r * 2.1, 24, 18]} /><meshBasicMaterial color={color} transparent opacity={0.28 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
    <mesh><sphereGeometry args={[r * 3.6, 24, 18]} /><meshBasicMaterial color={color} transparent opacity={0.1 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
  </group>
);

const Scene: React.FC<{ man: Man; mode: "alarm" | "saved" }> = ({ man, mode }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  const saved = mode === "saved";

  // body: pulled back from the edge a moment after the alarm (alarm clip); already back and calm (saved clip)
  const rest = useMemo(() => restPose(man), [man]);
  const base = useMemo(() => man.root.position.clone(), [man]);
  toRest(man, rest);
  const pull = saved ? 1 : ease(interpolate(f, [PULL_AT, PULL_AT + 16], [0, 1], clamp));
  const settle = saved ? 0 : 0.25 * Math.sin(Math.max(0, f - PULL_AT - 16) / 9) * Math.exp(-Math.max(0, f - PULL_AT - 16) / 40);
  man.root.position.set(base.x, base.y, base.z - 13 * (pull + settle * 0.2));
  man.root.rotation.x = -0.05 * (pull + settle);
  man.root.updateMatrixWorld(true);
  // arms down by his sides (the model's rest pose holds them out)
  for (const sd of ["L", "R"] as const) {
    const sgn = sd === "L" ? 1 : -1;
    const hip = B(`Bip01 ${sd} Thigh`).getWorldPosition(v(0, 0, 0));
    const out = hip.x >= B("Bip01 Pelvis").getWorldPosition(v(0, 0, 0)).x ? 1 : -1;
    reach(man, sd, hip.clone().add(v(out * 13, -22, 6)), hip.clone().add(v(out * 40, 0, -60)));
    void sgn;
  }
  man.root.updateMatrixWorld(true);

  const eye = B("Bip01 LEye").getWorldPosition(v(0, 0, 0)).add(B("Bip01 REye").getWorldPosition(v(0, 0, 0))).multiplyScalar(0.5);
  const lip = B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0));
  const S = (eye.y - lip.y) / 0.53;
  const centre = v(eye.x, eye.y + 0.12 * S, eye.z - 0.62 * S);

  const push = saved ? 1 : ease(interpolate(f, [0, 24], [0, 1], clamp));
  const glass = saved ? 1 : ease(interpolate(f, [4, 22], [0, 1], clamp));

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
  // the rim flushes red while the alarm is loud, then cools back to blue
  const alarmOn = saved ? 0 : interpolate(f, [ALARM_AT, ALARM_AT + 4], [0, 1], clamp) * (1 - 0.85 * ease(interpolate(f, [CALM_AT, CALM_AT + 50], [0, 1], clamp)));
  rim.uniforms.c.value.set("#cfe6ff").lerp(new THREE.Color("#ff8a80"), 0.55 * alarmOn);
  rim.uniforms.k.value = 1.7 * glass;

  // camera: a fixed three-quarter view from his left (the base position, so the pull-back reads as him moving)
  const eyeY = eye.y, side = saved ? -1 : 1;
  const near = v(58 * side, eyeY - 2, 106 + base.z);
  camera.position.copy(v(14 * side, eyeY - 12, 165 + base.z).lerp(near, push));
  camera.lookAt(v(-2, eyeY - 22, base.z).lerp(v(0, eyeY - 2, base.z - 3), push));

  // the alarm: low and deep in the head
  const ALARM: [number, number, number] = [0, -0.1, -0.02];
  const beat = saved ? 0 : alarmOn * (0.75 + 0.25 * Math.sin(f / 2.2));
  const rings = [0, 1, 2].map((i) => {
    const t = ((f - ALARM_AT + i * 9) % 27) / 27;
    return { s: 0.06 + 0.42 * t, o: f >= ALARM_AT ? (1 - t) * alarmOn : 0 };
  });

  // the thinking light: arrives late, from the front of the head
  const arrive = saved ? 1 : ease(interpolate(f, [THINK_AT, THINK_AT + 62], [0, 1], clamp));
  const thinkO = saved ? 1 : interpolate(f, [THINK_AT, THINK_AT + 14], [0, 1], clamp);
  const look = saved ? 0 : interpolate(f, [LOOK_AT, LOOK_AT + 12], [0, 1], clamp) * (1 - interpolate(f, [CALM_AT + 30, CALM_AT + 55], [0, 1], clamp));
  const tp: [number, number, number] = [0.02 - 0.0 * arrive, 0.26 - 0.16 * arrive, 0.34 - 0.26 * arrive];
  const gold = saved ? ease(interpolate(f, [GOLD_AT, GOLD_AT + 16], [0, 1], clamp)) : 0;
  const thinkCol = new THREE.Color("#ffffff").lerp(new THREE.Color(GOLD), gold).getStyle();
  const shield = saved ? ease(interpolate(f, [GOLD_AT + 6, GOLD_AT + 30], [0, 1], clamp)) : 0;

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.18 * glass} depthWrite={false} />
        </mesh>
        {/* alarm */}
        <Orb pos={ALARM} color={RED} r={0.05 * (1 + 0.25 * Math.sin(f / 2.2))} o={saved ? 0.25 : beat} />
        {rings.map((r, i) => (
          <mesh key={i} position={ALARM} rotation={[Math.PI / 2 - 0.35, 0, 0]} scale={r.s / 0.1} visible={r.o > 0.01}>
            <torusGeometry args={[0.1, 0.004, 8, 64]} />
            <meshBasicMaterial color={RED} transparent opacity={0.9 * r.o} depthTest={false} />
          </mesh>
        ))}
        {/* thinking light, its trail, and the "looking around" sweep */}
        {!saved && thinkO > 0 ? [1, 2, 3, 4].map((i) => {
          const a = ease(interpolate(f - i * 5, [THINK_AT, THINK_AT + 62], [0, 1], clamp));
          return <Orb key={i} pos={[0.02, 0.26 - 0.16 * a, 0.34 - 0.26 * a]} color="#cfe0ff" r={0.022} o={0.22 * thinkO * (1 - arrive) * (1 - i / 5)} />;
        }) : null}
        <Orb pos={tp} color={thinkCol} r={0.05 + 0.02 * gold} o={thinkO} />
        <mesh position={tp} rotation={[Math.PI / 2, 0, f / 9]} visible={look > 0.01}>
          <torusGeometry args={[0.2, 0.004, 8, 64, Math.PI * 0.6]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9 * look} depthTest={false} />
        </mesh>
        <mesh position={tp} rotation={[Math.PI / 2 - 0.5, 0, -f / 12]} visible={look > 0.01}>
          <torusGeometry args={[0.27, 0.003, 8, 64, Math.PI * 0.4]} />
          <meshBasicMaterial color="#cfe0ff" transparent opacity={0.7 * look} depthTest={false} />
        </mesh>
        {/* saved: a gold ring closes round the head */}
        <mesh rotation={[Math.PI / 2 - 0.25, f / 50, 0]} scale={1.6 - 0.5 * shield} visible={shield > 0.01}>
          <torusGeometry args={[0.52, 0.008, 8, 96]} />
          <meshBasicMaterial color={GOLD} transparent opacity={shield} depthTest={false} />
        </mesh>
        <mesh rotation={[Math.PI / 2 + 0.5, -f / 60, 0.4]} scale={1.7 - 0.5 * shield} visible={shield > 0.01}>
          <torusGeometry args={[0.56, 0.005, 8, 96]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.6 * shield} depthTest={false} />
        </mesh>
      </group>
    </>
  );
};

const Shot: React.FC<{ mode: "alarm" | "saved" }> = ({ mode }) => {
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

export const VoidAlarm: React.FC = () => <Shot mode="alarm" />;
export const VoidSaved: React.FC = () => <Shot mode="saved" />;
