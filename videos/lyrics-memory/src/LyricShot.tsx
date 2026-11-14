// 3D shot for "Why do you remember song lyrics?" (adapted from the journey video's 3D shot): the man checks the time on his phone; then his
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

/** One clip: he looks at his phone (a song playing), the camera moves in, his head turns to glass. Inside, a
 *  golden song glows in its own protected spot while the white memories around it dim and drift away. */
export const LYRIC_FRAMES = 420;
/** When the other memories start to fade (the "last places Alzheimer's reaches" moment). */
export const FADE_AT = 190;

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
  const back = 0;

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
    const k = f / 70;
    camera.position.copy(v(22 - 8 * k, eye.y - 12, 172 - 26 * k));
    camera.lookAt(v(-2, eye.y - 17, 0));
  } else {
    const side = 1 - 2 * back;                                       // swings from his left to his right for the way back
    const orbit = Math.max(0, f - 92) * 0.02;
    const near = v(54 * side - orbit * side, eye.y - 2, 100 + orbit);
    camera.position.copy(v(14, eye.y - 12, 160).lerp(near, push));
    camera.lookAt(v(-2, eye.y - 24, 0).lerp(v(0, eye.y - 1, 2), push));
  }

  // inside: memories (white) scattered round the skull, and one golden song with a slow ring round it
  const on = interpolate(f, [86, 104], [0, 1], clamp);
  const fade = interpolate(f, [FADE_AT, FADE_AT + 90], [0, 1], clamp);
  const mem = useMemo(() => Array.from({ length: 16 }, (_, i) => {
    const a = i * 2.39996, r = 0.17 + 0.24 * ((i * 7) % 10) / 10;
    return { x: Math.cos(a) * r, y: Math.sin(a) * r * 0.8 + 0.02, z: ((i * 5) % 7) / 7 * 0.2 - 0.1, d: (i * 13) % 16 };
  }), []);
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
          {mem.map((m, i) => {
            const gone = interpolate(fade, [m.d / 22, m.d / 22 + 0.3], [0, 1], clamp);
            const o = on * (1 - gone);
            if (o <= 0.01) return null;
            return (
              <group key={i} position={[m.x - gone * m.x * 0.6, m.y - gone * 0.15, m.z]}>
                <mesh><sphereGeometry args={[0.026, 14, 12]} /><meshBasicMaterial color="#ffffff" transparent opacity={o} depthTest={false} /></mesh>
                <mesh><sphereGeometry args={[0.06, 14, 12]} /><meshBasicMaterial color="#cfe0ff" transparent opacity={0.18 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
              </group>
            );
          })}
          <group position={[0.02, 0.0, 0.05]} visible={on > 0}>
            <mesh scale={1 + 0.12 * Math.sin(f / 6)}><sphereGeometry args={[0.07, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={on} depthTest={false} /></mesh>
            <mesh scale={1 + 0.2 * Math.sin(f / 6)}><sphereGeometry args={[0.16, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.22 * on} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
            <mesh rotation={[1.2, f / 40, 0]}><torusGeometry args={[0.13, 0.006, 8, 64]} /><meshBasicMaterial color={GOLD} transparent opacity={on} depthTest={false} /></mesh>
            <mesh rotation={[0.3, -f / 55, 0.9]}><torusGeometry args={[0.15, 0.005, 8, 64]} /><meshBasicMaterial color={GOLD} transparent opacity={0.8 * on} depthTest={false} /></mesh>
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

export const LyricHead: React.FC = () => <Shot mode="head" />;
