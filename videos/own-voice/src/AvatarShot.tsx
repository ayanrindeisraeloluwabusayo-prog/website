// Realistic 3D test shot: the man lifts his phone and speaks, the camera pushes in, his head turns to glass,
// and the sound is seen travelling through the air (white) and through the jawbone (yellow) to the ear.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { cochleaGeometry, JAW_CURVE, jawGeometry, teeth } from "./anatomy";
import { holdPhone, PERSON, Phone } from "./Grip";
import { restPose } from "./pose";
import { BlueStage } from "./motion";
import { Grain, p } from "./kit";
import { Lockup } from "./lockup";
import { SANS2, ws } from "./type";

export const SHOT_FRAMES = 210;
const BONE = "#efe7d2", GOLD = "#F3C21D";
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

// The inside of the head is built in "head units" (1 unit = 17 cm-ish model units), centred between the ears.

const AIR = new THREE.CatmullRomCurve3([v(0, -0.48, 0.85), v(0.22, -0.5, 1.15), v(0.72, -0.4, 0.9), v(0.92, -0.2, 0.3), v(0.56, -0.08, 0.0)]);
const BONEPATH = new THREE.CatmullRomCurve3([0.5, 0.58, 0.66, 0.74, 0.82, 0.9, 0.97, 1].map((u) => JAW_CURVE.getPoint(u)));
const EAR = v(0.43, -0.08, -0.02);

const Scene: React.FC<{ man: Man }> = ({ man }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];

  const lift = ease(interpolate(f, [4, 28], [0, 1], clamp));
  const push = ease(interpolate(f, [52, 112], [0, 1], clamp));
  const glass = ease(interpolate(f, [80, 102], [0, 1], clamp));
  const air = interpolate(f, [108, 140], [0, 1], clamp);
  const bone = interpolate(f, [150, 176], [0, 1], clamp);
  const talk = f > 30 ? 0.3 + 0.7 * Math.abs(Math.sin(f * 0.55) * Math.cos(f * 0.21)) : 0;

  // pose: he holds the phone (the grip from Grip.tsx), brings it up and speaks
  const rest = useMemo(() => restPose(man), [man]);
  const phone = holdPhone(man, rest, lift, talk);
  // fit the inside of the head to this person's face: eyes at (0, 0.03, 0.5) and lips at y = -0.5 in head units
  const eye = B("Bip01 LEye").getWorldPosition(v(0, 0, 0)).add(B("Bip01 REye").getWorldPosition(v(0, 0, 0))).multiplyScalar(0.5);
  const lip = B("Bip01 MBottomLip").getWorldPosition(v(0, 0, 0));
  const S = (eye.y - lip.y) / 0.53;
  const origin = v(0, eye.y - 0.03 * S, eye.z - 0.5 * S);

  // materials: the head (and hair, eyes, teeth) turns to glass
  const mats = man.meshes[0].material as THREE.MeshStandardMaterial[];
  const head = mats.find((m) => /head/i.test(m.name))!, body = mats.find((m) => /body/i.test(m.name))!;
  head.transparent = glass > 0; head.opacity = 1 - 0.9 * glass; head.depthWrite = glass < 0.3;
  head.color.set(glass > 0.5 ? "#a9c8ff" : "#ffffff");
  body.color.set("#ffffff");
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
  const rimGold = useMemo(() => new THREE.MeshBasicMaterial({ color: GOLD, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }), []);
  rimGold.opacity = 0.45 * bone * (0.8 + 0.2 * Math.sin(f / 4));

  // camera: waist-up, then a three-quarter close-up of the head, then a slow drift
  const drift = Math.max(0, f - 112) * 0.03;
  camera.position.copy(v(5, eye.y - 21, 152).lerp(v(48 - drift, eye.y - 2, 74 + drift), push));
  camera.lookAt(v(0, eye.y - 21, 0).lerp(v(1.5, eye.y - 1.5, 3), push));

  const jawGeo = useMemo(jawGeometry, []);
  const cochGeo = useMemo(cochleaGeometry, []);
  const lower = useMemo(() => teeth(false), []), upper = useMemo(() => teeth(true), []);
  const boneGeo = useMemo(() => new THREE.TubeGeometry(BONEPATH, 60, 0.1, 12), []);
  const boneMat = (extra = 0) => <meshStandardMaterial color={BONE} roughness={0.45} emissive={extra > 0 ? GOLD : BONE} emissiveIntensity={0.22 + 1.2 * extra} transparent opacity={glass} />;

  const ghost = <meshStandardMaterial color={BONE} roughness={0.5} emissive={BONE} emissiveIntensity={0.3} transparent opacity={0.34 * glass} depthWrite={false} />;

  const dots = (curve: THREE.CatmullRomCurve3, n: number, on: number, color: string, size: number, speed: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = ((f * speed + i / n) % 1 + 1) % 1;
      if (t > on) return null;
      const fade = Math.min(1, t * 8, (1 - t) * 8);
      return (
        <group key={i} position={curve.getPoint(t)}>
          <mesh><sphereGeometry args={[size, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={fade} depthTest={false} /></mesh>
          <mesh><sphereGeometry args={[size * 2.2, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={0.18 * fade} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} /></mesh>
        </group>
      );
    });

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />

      <Phone at={phone} opacity={1 - 0.8 * glass} />

      {/* inside the head */}
      <group position={origin} scale={S}>
        <group visible={glass > 0.02}>
          <mesh position={[0, 0.2, -0.1]} scale={[0.9, 0.98, 1.08]}><sphereGeometry args={[0.46, 48, 36]} />{ghost}</mesh>
          <mesh position={[0, -0.3, 0.3]} scale={[1, 0.7, 0.9]}><sphereGeometry args={[0.27, 32, 24]} />{ghost}</mesh>
          {[-1, 1].map((sd) => (
            <mesh key={sd} position={[sd * 0.2, 0.03, 0.3]} scale={[1, 0.9, 0.6]}><sphereGeometry args={[0.11, 20, 16]} /><meshBasicMaterial color="#16245e" transparent opacity={0.5 * glass} /></mesh>
          ))}
          
          <mesh geometry={jawGeo}>{boneMat(bone)}</mesh>
          <mesh geometry={boneGeo} material={rimGold} visible={bone > 0} />
          {[...lower, ...upper].map((t, i) => (
            <mesh key={i} position={t.pos} rotation={[0, t.rot, 0]}>
              <boxGeometry args={[t.w, t.h, 0.035]} />
              <meshStandardMaterial color="#ffffff" roughness={0.25} emissive="#ffffff" emissiveIntensity={0.15} transparent opacity={glass} />
            </mesh>
          ))}
          <mesh geometry={cochGeo} position={EAR.clone().add(v(-0.06, 0.02, 0))}>
            <meshStandardMaterial color={BONE} roughness={0.4} emissive={bone > 0.6 ? GOLD : "#ffffff"} emissiveIntensity={0.3 + 1.6 * Math.max(air, bone)} transparent opacity={glass} depthTest={false} />
          </mesh>
          <mesh position={EAR.clone().add(v(-0.05, 0.02, 0))} scale={1 + 0.5 * Math.max(air, bone) * (0.6 + 0.4 * Math.sin(f / 3))}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshBasicMaterial color={bone > 0.6 ? GOLD : "#ffffff"} transparent opacity={0.28 * glass * Math.max(air, bone)} blending={THREE.AdditiveBlending} depthWrite={false} depthTest={false} />
          </mesh>
          {bone > 0 ? dots(BONEPATH, 6, 1, GOLD, 0.026, 0.02) : null}
        </group>
        {/* sound leaving the mouth */}
        {f > 30 && [0, 1, 2].map((i) => {
          const t = ((f - 30) / 26 + i / 3) % 1;
          return (
            <mesh key={i} position={[0, -0.48, 0.9 + t * 0.6]} scale={0.3 + t * 1.5}>
              <torusGeometry args={[0.14, 0.008, 8, 48]} />
              <meshBasicMaterial color="#ffffff" transparent opacity={(1 - t) * 0.85 * (1 - 0.6 * air)} />
            </mesh>
          );
        })}
        {dots(AIR, 10, air, "#ffffff", 0.022, 0.012)}
      </group>
    </>
  );
};

export const AvatarShot: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  const tag: React.CSSProperties = { position: "absolute", fontFamily: SANS2, fontWeight: 800, fontSize: 46, letterSpacing: "0.1em" };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlueStage glowY={52} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Scene man={man} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
      <div style={{ ...tag, right: 60, top: 930, color: "#fff", opacity: p(f, 124, 12) }}>AIR</div>
      <div style={{ ...tag, left: 70, top: 1560, color: GOLD, opacity: p(f, 160, 12) }}>BONE</div>
      <Grain amount={0.14} />
      <Lockup top={230} until={103} lines={[
        { words: ws("When you", 30, 7), align: "flex-start", indent: 60 },
        { kind: "serif", words: ws("speak,", 44) },
      ]} />
      <Lockup top={230} until={147} lines={[
        { words: ws("it travels through the", 106, 6), align: "flex-start" },
        { kind: "serif", words: ws("air,", 130) },
      ]} />
      <Lockup top={230} lines={[
        { words: ws("and through the", 150, 6), align: "flex-start", indent: 40 },
        { kind: "serif", words: ws("bone.", 168) },
      ]} />
    </AbsoluteFill>
  );
};
