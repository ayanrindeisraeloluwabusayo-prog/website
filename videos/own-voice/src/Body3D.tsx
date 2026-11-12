// 3D test shot for the "own voice" video: a stylised person lifts a phone and speaks, the camera pushes in,
// the skin turns to glass, and the sound is seen travelling two ways: through the air (white) and through
// the jawbone (yellow) to the ear. Everything is built from simple shapes in code (no downloaded models).
// Technique notes: video-styles/3d-body-explainer.md.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { BlueStage } from "./motion";
import { Grain, p } from "./kit";
import { Lockup } from "./lockup";
import { ws } from "./type";
import { SANS2 } from "./type";

export const BODY_FRAMES = 210;
const SKIN = "#8a5a3c", SHIRT = "#f2ede2", HAIR = "#16110f", BONE = "#efe7d2", GOLD = "#F3C21D";
const clamp = { extrapolateLeft: "clamp", extrapolateRight: "clamp" } as const;
const ease = (t: number) => t * t * (3 - 2 * t);
const v = (x: number, y: number, z: number) => new THREE.Vector3(x, y, z);

/** A soft glow on the edges of a shape (brighter where the surface turns away from the camera). */
const rimMaterial = (color: string) =>
  new THREE.ShaderMaterial({
    uniforms: { c: { value: new THREE.Color(color) }, k: { value: 0 } },
    vertexShader: "varying vec3 n; varying vec3 e; void main(){ vec4 mv = modelViewMatrix * vec4(position,1.0); n = normalize(normalMatrix * normal); e = normalize(-mv.xyz); gl_Position = projectionMatrix * mv; }",
    fragmentShader: "uniform vec3 c; uniform float k; varying vec3 n; varying vec3 e; void main(){ float f = pow(1.0 - abs(dot(normalize(n), normalize(e))), 2.2); gl_FragColor = vec4(c * f * k, f * k); }",
    transparent: true, blending: THREE.AdditiveBlending, depthWrite: false, side: THREE.FrontSide,
  });

/** A rounded limb between two points. */
const Limb: React.FC<{ a: THREE.Vector3; b: THREE.Vector3; r: number; color: string; opacity?: number }> = ({ a, b, r, color, opacity = 1 }) => {
  const mid = a.clone().add(b).multiplyScalar(0.5);
  const dir = b.clone().sub(a);
  const q = new THREE.Quaternion().setFromUnitVectors(v(0, 1, 0), dir.clone().normalize());
  return (
    <mesh position={mid} quaternion={q}>
      <capsuleGeometry args={[r, dir.length(), 8, 20]} />
      <meshStandardMaterial color={color} roughness={0.75} transparent={opacity < 1} opacity={opacity} />
    </mesh>
  );
};

const AIR = new THREE.CatmullRomCurve3([v(0, -0.36, 0.5), v(0.22, -0.38, 0.86), v(0.66, -0.3, 0.72), v(0.84, -0.16, 0.24), v(0.52, -0.08, 0.0)]);
const BONEPATH = new THREE.CatmullRomCurve3([v(0, -0.4, 0.36), v(0.1, -0.53, 0.37), v(0.3, -0.48, 0.2), v(0.38, -0.3, 0.06), v(0.37, -0.09, 0.0)]);
const JAW = new THREE.CatmullRomCurve3([v(-0.39, -0.1, 0), v(-0.37, -0.42, 0.07), v(-0.2, -0.52, 0.31), v(0, -0.55, 0.38), v(0.2, -0.52, 0.31), v(0.37, -0.42, 0.07), v(0.39, -0.1, 0)]);
const TEETH = new THREE.CatmullRomCurve3([v(-0.2, -0.3, 0.3), v(-0.1, -0.3, 0.4), v(0, -0.3, 0.43), v(0.1, -0.3, 0.4), v(0.2, -0.3, 0.3)]);

const Scene: React.FC = () => {
  const f = useCurrentFrame();
  const { camera } = useThree();

  // timeline
  const lift = ease(interpolate(f, [4, 26], [0, 1], clamp));       // the phone comes up
  const push = ease(interpolate(f, [52, 112], [0, 1], clamp));     // the camera moves in
  const glass = ease(interpolate(f, [70, 104], [0, 1], clamp));    // the skin turns to glass
  const air = interpolate(f, [108, 140], [0, 1], clamp);           // the air path appears
  const bone = interpolate(f, [150, 176], [0, 1], clamp);          // the bone path lights
  const talk = f > 28 ? 0.35 + 0.65 * Math.abs(Math.sin(f * 0.55) * Math.cos(f * 0.21)) : 0;

  // camera: waist-up, then a three-quarter close-up of the head, then a slow drift
  const drift = Math.max(0, f - 112) * 0.0016;
  const from = v(0.25, -0.95, 7.6), to = v(2.5 - drift * 2, 0.15, 3.3 + drift * 2);
  camera.position.copy(from.lerp(to, push));
  const look = v(0, -0.95, 0).lerp(v(0.1, 0.22, 0.1), push);
  camera.lookAt(look);
  (camera as THREE.PerspectiveCamera).fov = 30;
  camera.updateProjectionMatrix();

  const rim = useMemo(() => rimMaterial("#bfe0ff"), []);
  const rimGold = useMemo(() => rimMaterial(GOLD), []);
  rim.uniforms.k.value = 0.25 + 1.5 * glass;
  rimGold.uniforms.k.value = 2.2 * bone * (0.8 + 0.2 * Math.sin(f / 4));

  const skinOp = 1 - 0.88 * glass;
  const skin = <meshStandardMaterial color={glass > 0.5 ? "#9fc4ff" : SKIN} roughness={0.62} transparent={glass > 0} opacity={skinOp} depthWrite={glass < 0.3} />;

  // arm that holds the phone (far side from the close-up camera)
  const hand = v(-0.5, -1.95, 0.6).lerp(v(-0.26, -0.72, 0.62), lift);
  const elbowL = v(-0.86, -1.95, 0.12).lerp(v(-0.9, -1.75, 0.3), lift);
  const jawGeo = useMemo(() => new THREE.TubeGeometry(JAW, 80, 0.045, 14), []);
  const teethGeo = useMemo(() => new THREE.TubeGeometry(TEETH, 40, 0.035, 10), []);
  const boneGeo = useMemo(() => new THREE.TubeGeometry(BONEPATH, 60, 0.06, 12), []);
  const headGeo = useMemo(() => new THREE.LatheGeometry([[0, 0.62], [0.14, 0.61], [0.27, 0.56], [0.38, 0.46], [0.45, 0.3], [0.47, 0.12], [0.465, -0.06], [0.43, -0.24], [0.36, -0.42], [0.26, -0.56], [0.13, -0.64], [0, -0.66]].map(([x, y]) => new THREE.Vector2(x, y)), 64), []);
  const hairGeo = useMemo(() => new THREE.LatheGeometry([[0, 0.62], [0.14, 0.61], [0.27, 0.56], [0.38, 0.46], [0.45, 0.3], [0.47, 0.2]].map(([x, y]) => new THREE.Vector2(x, y)), 64), []);
  const torso = useMemo(() => new THREE.LatheGeometry([[0.0, -0.84], [0.2, -0.9], [0.5, -1.0], [0.72, -1.14], [0.76, -1.4], [0.68, -2.1], [0.64, -3.2]].map(([x, y]) => new THREE.Vector2(x, y)), 48), []);

  const dots = (curve: THREE.CatmullRomCurve3, n: number, on: number, color: string, size: number, speed: number) =>
    Array.from({ length: n }, (_, i) => {
      const t = ((f * speed + i / n) % 1 + 1) % 1;
      if (t > on) return null;
      const pt = curve.getPoint(t);
      const fade = Math.min(1, t * 8, (1 - t) * 8);
      return (
        <group key={i} position={pt}>
          <mesh><sphereGeometry args={[size, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={fade} /></mesh>
          <mesh><sphereGeometry args={[size * 2.1, 12, 12]} /><meshBasicMaterial color={color} transparent opacity={0.16 * fade} blending={THREE.AdditiveBlending} depthWrite={false} /></mesh>
        </group>
      );
    });

  return (
    <>
      <hemisphereLight args={["#dfeaff", "#27408f", 1.15]} />
      <directionalLight position={[3, 4, 5]} intensity={2.1} />
      <directionalLight position={[-4, 2, -3]} intensity={1.4} color="#7fa8ff" />

      {/* skull, seen once the skin is glass */}
      <group visible={glass > 0.02}>
        <mesh position={[0, 0.14, -0.02]} scale={[0.88, 1.0, 1.0]}>
          <sphereGeometry args={[0.42, 48, 36]} />
          <meshStandardMaterial color={BONE} roughness={0.45} emissive={BONE} emissiveIntensity={0.25} transparent opacity={glass} />
        </mesh>
        <mesh position={[0, -0.17, 0.2]} scale={[1, 0.62, 0.8]}>
          <sphereGeometry args={[0.24, 32, 24]} />
          <meshStandardMaterial color={BONE} roughness={0.45} emissive={BONE} emissiveIntensity={0.25} transparent opacity={glass} />
        </mesh>
        {[-1, 1].map((sd) => (
          <mesh key={sd} position={[sd * 0.155, 0.03, 0.335]} scale={[1, 0.9, 0.6]}><sphereGeometry args={[0.095, 20, 16]} /><meshBasicMaterial color="#1a2a66" transparent opacity={glass} /></mesh>
        ))}
        <mesh position={[0, -0.12, 0.385]} scale={[0.7, 1.1, 0.5]}><sphereGeometry args={[0.05, 16, 12]} /><meshBasicMaterial color="#1a2a66" transparent opacity={glass} /></mesh>
        <mesh geometry={jawGeo}><meshStandardMaterial color={BONE} roughness={0.45} emissive={bone > 0 ? GOLD : BONE} emissiveIntensity={0.25 + 1.2 * bone} transparent opacity={glass} /></mesh>
        <mesh geometry={jawGeo} scale={1.0} material={rimGold} />
        <mesh geometry={teethGeo}><meshStandardMaterial color="#ffffff" roughness={0.3} transparent opacity={glass} /></mesh>
        {/* inner ear */}
        <mesh position={[0.37, -0.09, 0]}>
          <sphereGeometry args={[0.055, 16, 16]} />
          <meshBasicMaterial color={bone > 0.6 ? GOLD : "#ffffff"} transparent opacity={glass} />
        </mesh>
        <mesh position={[0.37, -0.09, 0]} scale={1 + 0.5 * Math.max(air, bone) * (0.6 + 0.4 * Math.sin(f / 3))}>
          <sphereGeometry args={[0.13, 16, 16]} />
          <meshBasicMaterial color={bone > 0.6 ? GOLD : "#ffffff"} transparent opacity={0.3 * glass * Math.max(air, bone)} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {/* the sound travelling through the bone */}
        <mesh geometry={boneGeo} visible={bone > 0}>
          <meshBasicMaterial color={GOLD} transparent opacity={0.35 * bone} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
        {dots(BONEPATH, 6, bone > 0 ? 1 : 0, GOLD, 0.026, 0.02).map((d) => (bone > 0 ? d : null))}
      </group>

      {/* head */}
      <mesh geometry={headGeo} scale={[0.92, 1, 1.05]}>{skin}</mesh>
      <mesh geometry={headGeo} scale={[0.93, 1.01, 1.06]} material={rim} />
      <mesh position={[0, -0.13, 0.49]} scale={[0.85, 1.35, 1.15]}><sphereGeometry args={[0.07, 24, 18]} />{skin}</mesh>
      {[-1, 1].map((s) => (
        <group key={s}>
          <mesh position={[s * 0.45, -0.08, -0.03]} scale={[0.35, 1, 0.7]}><sphereGeometry args={[0.115, 24, 18]} />{skin}</mesh>
          <mesh position={[s * 0.17, 0.03, 0.445]} scale={[1, 0.8, 0.5]}><sphereGeometry args={[0.062, 20, 16]} /><meshStandardMaterial color="#f4f1ea" roughness={0.3} transparent opacity={1 - 0.7 * glass} /></mesh>
          <mesh position={[s * 0.17, 0.03, 0.473]}><sphereGeometry args={[0.03, 16, 12]} /><meshStandardMaterial color="#15100d" roughness={0.2} transparent opacity={1 - 0.7 * glass} /></mesh>
          <mesh position={[s * 0.17, 0.14, 0.455]} rotation={[0, 0, s * -0.12]}><boxGeometry args={[0.14, 0.026, 0.03]} /><meshStandardMaterial color={HAIR} transparent opacity={1 - 0.85 * glass} /></mesh>
        </group>
      ))}
      {/* mouth: opens and closes while speaking */}
      <mesh position={[0, -0.37, 0.395]} scale={[1, 0.22 + 0.55 * talk, 0.4]}>
        <sphereGeometry args={[0.1, 24, 18]} />
        <meshStandardMaterial color="#3a1414" roughness={0.6} transparent opacity={1 - 0.5 * glass} />
      </mesh>
      {/* hair: a short cap, tilted back so there is a forehead */}
      <mesh geometry={hairGeo} position={[0, -0.02, -0.03]} rotation={[-0.34, 0, 0]} scale={[0.965, 1.05, 1.1]}>
        <meshStandardMaterial color={HAIR} roughness={0.95} transparent={glass > 0} opacity={1 - 0.92 * glass} depthWrite={glass < 0.3} />
      </mesh>

      {/* neck, shirt, arms */}
      <mesh position={[0, -0.72, -0.02]}><cylinderGeometry args={[0.2, 0.23, 0.5, 32]} />{skin}</mesh>
      <mesh geometry={torso} scale={[1, 1, 0.56]}><meshStandardMaterial color={SHIRT} roughness={0.85} /></mesh>
      <Limb a={v(0.74, -1.22, 0)} b={v(0.86, -2.0, 0.02)} r={0.15} color={SHIRT} />
      <Limb a={v(0.86, -2.0, 0.02)} b={v(0.84, -2.75, 0.14)} r={0.115} color={SKIN} />
      <Limb a={v(-0.74, -1.22, 0)} b={elbowL} r={0.15} color={SHIRT} />
      <Limb a={elbowL} b={hand} r={0.11} color={SKIN} opacity={1 - 0.7 * glass} />
      <mesh position={hand}><sphereGeometry args={[0.13, 20, 16]} /><meshStandardMaterial color={SKIN} roughness={0.62} transparent opacity={1 - 0.7 * glass} /></mesh>
      <group position={hand.clone().add(v(0.1, 0.16, 0.06))} rotation={[-0.25, 0.5, 0.2]}>
        <mesh><boxGeometry args={[0.24, 0.46, 0.03]} /><meshStandardMaterial color="#0e1016" roughness={0.3} transparent opacity={1 - 0.7 * glass} /></mesh>
        <mesh position={[0, 0, 0.017]}><planeGeometry args={[0.21, 0.42]} /><meshBasicMaterial color="#2d66ff" transparent opacity={(0.9 - 0.7 * glass) * (0.75 + 0.25 * Math.sin(f / 3))} /></mesh>
      </group>

      {/* sound leaving the mouth: rings in the air */}
      {f > 28 && [0, 1, 2].map((i) => {
        const t = ((f - 28) / 26 + i / 3) % 1;
        return (
          <mesh key={i} position={[0, -0.37, 0.52 + t * 0.55]} scale={0.3 + t * 1.5}>
            <torusGeometry args={[0.14, 0.008, 8, 48]} />
            <meshBasicMaterial color="#ffffff" transparent opacity={(1 - t) * 0.85 * (1 - 0.6 * air)} />
          </mesh>
        );
      })}
      {/* the sound travelling through the air to the ear */}
      {dots(AIR, 10, air, "#ffffff", 0.022, 0.012)}
    </>
  );
};

export const BodyTest: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const tag: React.CSSProperties = { position: "absolute", fontFamily: SANS2, fontWeight: 800, fontSize: 46, letterSpacing: "0.1em" };
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlueStage glowY={52} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 0.1, far: 50 }}>
        <Scene />
      </ThreeCanvas>
      <div style={{ ...tag, right: 70, top: 1040, color: "#fff", opacity: p(f, 124, 12) }}>AIR</div>
      <div style={{ ...tag, left: 70, top: 1680, color: GOLD, opacity: p(f, 160, 12) }}>BONE</div>
      <Grain amount={0.16} />
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
