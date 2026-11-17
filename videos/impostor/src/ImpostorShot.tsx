// 3D shot for the impostor video: the man's head turns to glass with a gold light in it (what he can really do).
//   mode "doubt": a dark ball (the voice that says "they're going to find out") slides in front of the gold
//                 light and covers it; the head's glow turns colder.
//   mode "clear": the dark ball shrinks and drifts away, and the gold light comes back brighter with a ring.
// A picture of the feeling, not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const DOUBT_FRAMES = 215;
export const CLEAR_FRAMES = 150;
/** frame in "doubt" where the dark ball starts moving in; frame in "clear" where it starts to leave */
export const DOUBT_AT = 50, CLEAR_AT = 36;


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

/** a glowing ball: solid core plus two soft additive shells */
const Orb: React.FC<{ pos: [number, number, number]; color: string; r: number; o: number }> = ({ pos, color, r, o }) => (
  <group position={pos} visible={o > 0.01}>
    <mesh><sphereGeometry args={[r, 24, 18]} /><meshBasicMaterial color={color} transparent opacity={o} depthTest={false} /></mesh>
    <mesh><sphereGeometry args={[r * 2.1, 24, 18]} /><meshBasicMaterial color={color} transparent opacity={0.28 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
    <mesh><sphereGeometry args={[r * 3.6, 24, 18]} /><meshBasicMaterial color={color} transparent opacity={0.1 * o} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
  </group>
);

const Scene: React.FC<{ man: Man; mode: "doubt" | "clear" }> = ({ man, mode }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  const clear = mode === "clear";
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

  const push = clear ? 1 : ease(interpolate(f, [0, 26], [0, 1], clamp));
  const glass = clear ? 1 : ease(interpolate(f, [4, 22], [0, 1], clamp));
  // how much the doubt covers the light: 0 = clear, 1 = fully covered
  const cover = clear ? 1 - ease(interpolate(f, [CLEAR_AT, CLEAR_AT + 44], [0, 1], clamp)) : ease(interpolate(f, [DOUBT_AT, DOUBT_AT + 34], [0, 1], clamp));

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
  // warm gold glow on the glass while the light is clear, cold grey-blue once the doubt covers it
  rim.uniforms.c.value.set("#ffe7a8").lerp(new THREE.Color("#8fa6d6"), cover);
  rim.uniforms.k.value = (1.9 - 0.7 * cover) * glass;

  const side = clear ? -1 : 1;
  const orbit = f * 0.025;
  camera.position.copy(v(14 * side, eye.y - 12, 165).lerp(v((52 - orbit) * side, eye.y - 1, 106 + orbit), push));
  camera.lookAt(v(-2, eye.y - 22, 0).lerp(v(0, eye.y - 2, 2), push));

  const on = clear ? 1 : interpolate(f, [14, 28], [0, 1], clamp);
  const pulse = 1 + 0.07 * Math.sin(f / 5);
  const shine = clear ? ease(interpolate(f, [CLEAR_AT + 30, CLEAR_AT + 64], [0, 1], clamp)) : 0;   // brighter than before at the end
  const LIGHT: [number, number, number] = [0.01, 0.04, 0.06];
  // the dark ball comes from behind his head and parks just in front of the light (towards the camera)
  const toCam = camera.position.clone().sub(centre).normalize();
  const park = v(LIGHT[0], LIGHT[1], LIGHT[2]).add(toCam.clone().multiplyScalar(0.11));
  const away = v(-0.34 * side, 0.3, -0.3);
  const dp = away.clone().lerp(park, cover);
  const dr = 0.05 + 0.105 * cover + 0.006 * Math.sin(f / 4) * cover;
  const dOn = clear ? Math.min(1, cover * 1.4 + 0.0) : interpolate(f, [DOUBT_AT - 8, DOUBT_AT + 6], [0, 1], clamp);

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={(0.18 - 0.08 * cover) * glass} depthWrite={false} />
        </mesh>
        <Orb pos={LIGHT} color={GOLD} r={(0.075 + 0.03 * shine) * pulse} o={on * (1 - 0.72 * cover + 0.3 * shine)} />
        <mesh position={LIGHT} rotation={[Math.PI / 2 - 0.4, f / 30, 0]} visible={shine > 0.01}>
          <torusGeometry args={[0.21, 0.006, 8, 96]} />
          <meshBasicMaterial color={GOLD} transparent opacity={shine} depthTest={false} />
        </mesh>
        <mesh position={LIGHT} rotation={[Math.PI / 2 + 0.5, -f / 40, 0.5]} visible={shine > 0.01}>
          <torusGeometry args={[0.27, 0.004, 8, 96]} />
          <meshBasicMaterial color={GOLD} transparent opacity={0.7 * shine} depthTest={false} />
        </mesh>
        {/* the doubt: a dark ball with a thin cold edge, and a few dark specks circling it */}
        <group position={[dp.x, dp.y, dp.z]} visible={dOn > 0.01}>
          <mesh renderOrder={5}><sphereGeometry args={[dr, 40, 30]} /><meshBasicMaterial color="#070818" transparent opacity={0.94 * dOn} depthTest={false} /></mesh>
          <mesh renderOrder={4}><sphereGeometry args={[dr * 1.18, 40, 30]} /><meshBasicMaterial color="#1b1f4a" transparent opacity={0.45 * dOn} depthTest={false} /></mesh>
          {[0, 1, 2, 3, 4].map((i) => {
            const a = f / 14 + i * 1.257;
            return (
              <mesh key={i} renderOrder={6} position={[Math.cos(a) * dr * 1.7, Math.sin(a * 1.3) * dr * 0.7, Math.sin(a) * dr * 1.7]}>
                <sphereGeometry args={[0.012, 12, 10]} /><meshBasicMaterial color="#0b0c22" transparent opacity={0.9 * dOn * cover} depthTest={false} />
              </mesh>
            );
          })}
        </group>
      </group>
    </>
  );
};

const Shot: React.FC<{ mode: "doubt" | "clear" }> = ({ mode }) => {
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

export const ImpostorDoubt: React.FC = () => <Shot mode="doubt" />;
export const ImpostorClear: React.FC = () => <Shot mode="clear" />;
