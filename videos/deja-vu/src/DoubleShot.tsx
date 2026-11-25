// 3D shot for "Your brain spots the match, but it can't find the memory it came from": our man "A" with the glass head.
// At MATCH_AT a gold see-through double of him slides out to one side (the match) and the spark in his head lights;
// at LOST_AT the double fades away and the spark flickers, searching (the memory it came from is gone).
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";

export const DOUBLE_FRAMES = 130;
/** frame (inside the shot) where the double appears: lands on "match" */
export const MATCH_AT = 34;
/** frame where it starts to fade: lands on "can't find" */
export const LOST_AT = 56;

const GOLD = "#F3C21D";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => t * t * (3 - 2 * t);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);
const rimSrc = {
  vertexSkinned: "#include <common>\n#include <skinning_pars_vertex>\nvarying vec3 n; varying vec3 e; void main(){\n#include <beginnormal_vertex>\n#include <skinbase_vertex>\n#include <skinnormal_vertex>\n#include <begin_vertex>\n#include <skinning_vertex>\nvec4 mv = modelViewMatrix * vec4(transformed,1.0); n = normalize(normalMatrix * objectNormal); e = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
  fragment: "uniform vec3 c; uniform float k; uniform float base; varying vec3 n; varying vec3 e; void main(){ float f = pow(1.0 - abs(dot(normalize(n), normalize(e))), 2.0); float a = (f + base) * k; gl_FragColor = vec4(c * a, a); }",
};
const rimMaterial = (color: string, base = 0) =>
  new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) }, k: { value: 0 }, base: { value: base } },
    vertexShader: rimSrc.vertexSkinned, fragmentShader: rimSrc.fragment,
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false,
  });

/** Arms relaxed at the sides (the same pose as the spotlight shot). */
const pose = (man: Man, rest: Record<string, THREE.Quaternion>) => {
  const B = (n: string) => man.bones[key(n)];
  toRest(man, rest);
  man.root.updateMatrixWorld(true);
  for (const sd of ["L", "R"] as const) {
    const hip = B(`Bip01 ${sd} Thigh`).getWorldPosition(v(0, 0, 0));
    const out = hip.x >= B("Bip01 Pelvis").getWorldPosition(v(0, 0, 0)).x ? 1 : -1;
    reach(man, sd, hip.clone().add(v(out * 13, -22, 6)), hip.clone().add(v(out * 40, 0, -60)));
  }
  man.root.updateMatrixWorld(true);
};

const Scene: React.FC<{ man: Man; ghost: Man }> = ({ man, ghost }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  const rest = useMemo(() => restPose(man), [man]);
  const restG = useMemo(() => restPose(ghost), [ghost]);
  pose(man, rest);

  const eye = B("Bip01 LEye").getWorldPosition(v(0, 0, 0)).add(B("Bip01 REye").getWorldPosition(v(0, 0, 0))).multiplyScalar(0.5);
  const lip = B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0));
  const S = (eye.y - lip.y) / 0.53;
  const centre = v(eye.x, eye.y + 0.12 * S, eye.z - 0.62 * S);

  // the glass head (as in the other videos)
  const glass = ease(interpolate(f, [2, 16], [0, 1], clamp));
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

  // the gold double: the same man, every surface drawn as a glowing gold outline
  const gold = useMemo(() => rimMaterial(GOLD, 0.08), []);
  useMemo(() => { for (const m of ghost.meshes) m.material = Array.isArray(m.material) ? m.material.map(() => gold) : gold; }, [ghost, gold]);
  const out = ease(interpolate(f, [MATCH_AT - 4, MATCH_AT + 12], [0, 1], clamp));
  const fade = 1 - ease(interpolate(f, [LOST_AT, LOST_AT + 26], [0, 1], clamp));
  ghost.root.position.set(out * 54, 0, -out * 18);
  ghost.root.rotation.y = -0.18 * out;
  ghost.root.updateMatrixWorld(true);
  pose(ghost, restG);
  gold.uniforms.k.value = 2.2 * out * fade * (0.85 + 0.15 * Math.sin(f * 0.6));

  // the spark in his head: lights on the match, then flickers and dims while it searches
  const spark = interpolate(f, [MATCH_AT - 2, MATCH_AT + 6], [0.25, 1], clamp) * (f > LOST_AT ? 0.45 + 0.35 * Math.abs(Math.sin(f * 0.9)) : 1);

  // camera: a slow push-in on his head and shoulders, wide enough for the double beside him
  const push = ease(interpolate(f, [0, DOUBLE_FRAMES], [0, 1], clamp));
  const cx = eye.x + 27 * ease(interpolate(f, [MATCH_AT - 6, MATCH_AT + 16], [0, 1], clamp));
  camera.position.copy(v(cx, eye.y - 2, 440).lerp(v(cx, eye.y - 2, 380), push));
  camera.lookAt(v(cx, eye.y - 4, 0));
  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <primitive object={ghost.root} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <mesh><sphereGeometry args={[0.1 * spark + 0.02, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={spark} depthTest={false} /></mesh>
        <mesh><sphereGeometry args={[0.32 * spark, 24, 18]} /><meshBasicMaterial color={GOLD} transparent opacity={0.3 * spark} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
      </group>
    </>
  );
};

export const DoubleShot: React.FC = () => {
  const { width, height } = useVideoConfig();
  const a = useMan(PERSON[0], PERSON[1]);
  const b = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill style={{ background: "radial-gradient(circle at 50% 55%, #0b2a9e 0%, #020a3a 55%, #01041a 100%)" }}>
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {a.man && b.man ? <><Scene man={a.man} ghost={b.man} /><Ready handle={a.handle} /><Ready handle={b.handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
