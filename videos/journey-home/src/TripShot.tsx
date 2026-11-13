// 3D shots for "Why does the journey back home feel shorter?": the man checks the time on his phone; then his
// head turns to glass and a glowing clock inside it shows how his brain keeps time (it ticks slowly on the way
// out, then races on the way back). The EXPECTED / ACTUAL bars are drawn over this in Video.tsx.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { holdPhone, PERSON, Phone } from "./Grip";
import { restPose } from "./pose";
import { BlueStage } from "./motion";

/** Clip lengths (frames): LOOK is the short "You." shot, HEAD runs from "Here's the trick" to "normal feels fast". */
export const LOOK_FRAMES = 70, HEAD_FRAMES = 482;
/** Inside HEAD: when the camera swings round for the way back (matches "So on the way back"). */
export const BACK_AT = 208;

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

const Scene: React.FC<{ man: Man; mode: "look" | "head" }> = ({ man, mode }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  const head = mode === "head";

  const push = head ? ease(interpolate(f, [30, 92], [0, 1], clamp)) : 0;
  const glass = head ? ease(interpolate(f, [62, 92], [0, 1], clamp)) : 0;
  const back = head ? ease(interpolate(f, [BACK_AT, BACK_AT + 34], [0, 1], clamp)) : 0;

  // he looks down at the phone in his hand; a small breath and a glance
  const rest = useMemo(() => restPose(man), [man]);
  const phone = holdPhone(man, rest, 0, 0, 0.03 * Math.sin(f / 22));
  const eye = B("Bip01 LEye").getWorldPosition(v(0, 0, 0)).add(B("Bip01 REye").getWorldPosition(v(0, 0, 0))).multiplyScalar(0.5);
  const lip = B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0));
  const S = (eye.y - lip.y) / 0.53;
  const centre = v(0, eye.y + 0.12 * S, eye.z - 0.62 * S);   // middle of the skull, a little above the eyes

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

  // camera
  if (!head) {
    const k = f / LOOK_FRAMES;
    camera.position.copy(v(22 - 8 * k, eye.y - 12, 172 - 26 * k));
    camera.lookAt(v(-2, eye.y - 17, 0));
  } else {
    const side = 1 - 2 * back;                                       // swings from his left to his right for the way back
    const orbit = Math.max(0, f - 92) * 0.02;
    const near = v(54 * side - orbit * side, eye.y - 2, 100 + orbit);
    camera.position.copy(v(14, eye.y - 12, 160).lerp(near, push));
    camera.lookAt(v(-2, eye.y - 24, 0).lerp(v(0, eye.y - 1, 2), push));
  }

  // the brain's clock: a glowing dial inside the skull. Slow, heavy ticks on the way out; a fast, light spin on the way back
  const spin = f < BACK_AT ? Math.floor(f / 15) * (Math.PI / 6) : (Math.floor((BACK_AT) / 15) * (Math.PI / 6)) + (f - BACK_AT) * 0.22;
  const dialOn = interpolate(f, [86, 104], [0, 1], clamp);
  const hue = back > 0.5 ? GOLD : "#ffffff";

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <Phone at={phone} opacity={1 - 0.6 * glass} />
      {head ? (
        <group position={centre} scale={S}>
          <mesh scale={[0.9, 0.98, 1.05]}>
            <sphereGeometry args={[0.46, 48, 36]} />
            <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.22 * glass} depthWrite={false} />
          </mesh>
          <group rotation={[0, 0, 0]} visible={dialOn > 0}>
            <mesh>
              <torusGeometry args={[0.24, 0.012, 12, 96]} />
              <meshBasicMaterial color={hue} transparent opacity={dialOn} depthTest={false} />
            </mesh>
            <mesh>
              <circleGeometry args={[0.235, 64]} />
              <meshBasicMaterial color={hue} transparent opacity={0.12 * dialOn} depthTest={false} side={THREE.DoubleSide} />
            </mesh>
            {Array.from({ length: 12 }, (_, i) => {
              const a = (i / 12) * Math.PI * 2;
              return (
                <mesh key={i} position={[Math.sin(a) * 0.2, Math.cos(a) * 0.2, 0]} rotation={[0, 0, -a]}>
                  <boxGeometry args={[0.012, i % 3 === 0 ? 0.05 : 0.028, 0.004]} />
                  <meshBasicMaterial color={hue} transparent opacity={dialOn} depthTest={false} />
                </mesh>
              );
            })}
            <group rotation={[0, 0, -spin]}>
              <mesh position={[0, 0.08, 0.002]}>
                <boxGeometry args={[0.014, 0.17, 0.004]} />
                <meshBasicMaterial color={hue} transparent opacity={dialOn} depthTest={false} />
              </mesh>
            </group>
            <mesh>
              <sphereGeometry args={[0.02, 16, 12]} />
              <meshBasicMaterial color={hue} transparent opacity={dialOn} depthTest={false} />
            </mesh>
            <mesh scale={1 + 0.15 * Math.sin(f / 5)}>
              <sphereGeometry args={[0.32, 24, 16]} />
              <meshBasicMaterial color={hue} transparent opacity={0.1 * dialOn} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
            </mesh>
          </group>
        </group>
      ) : null}
    </>
  );
};

const Shot: React.FC<{ mode: "look" | "head" }> = ({ mode }) => {
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

export const TripLook: React.FC = () => <Shot mode="look" />;
export const TripHead: React.FC = () => <Shot mode="head" />;
