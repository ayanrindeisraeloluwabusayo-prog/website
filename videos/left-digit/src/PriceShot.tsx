// 3D shot for "Why $99.99 feels cheaper": the man's head turns to glass and a price, $9.99, floats inside it. His mind
// reads from the left: the first 9 lights up gold and grows, the rest fades. A picture of the idea, not anatomy.
import React, { useMemo } from "react";
import * as THREE from "three";
import { AbsoluteFill, interpolate, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { key, Man, Ready, Studio, useMan } from "./Avatar";
import { PERSON } from "./Grip";
import { reach, restPose, toRest } from "./pose";
import { BlueStage } from "./motion";

export const WAIT_FRAMES = 205;
/** frames between clock ticks, and the frame of the first tick */
export const TICK = 12;
export const FIRST_TICK = 30;
export const TICKS = Array.from({ length: Math.floor((WAIT_FRAMES - FIRST_TICK) / TICK) }, (_, i) => FIRST_TICK + i * TICK);

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

  // camera: slow push-in on the head while the clock ticks
  const push = ease(interpolate(f, [0, WAIT_FRAMES], [0, 1], clamp));
  camera.position.copy(v(10, eye.y + 2, 210).lerp(v(4, eye.y + 1, 82), push));
  camera.lookAt(v(0, eye.y - 4, 0).lerp(v(0, eye.y + 1, 0), push));

  const on = interpolate(f, [16, 28], [0, 1], clamp);
  const read = interpolate(f, [60, 110], [0, 1], clamp);
  const canvas = useMemo(() => { const c = document.createElement("canvas"); c.width = 1024; c.height = 400; return c; }, []);
  const tex = useMemo(() => new THREE.CanvasTexture(canvas), [canvas]);
  {
    const g = canvas.getContext("2d")!;
    g.clearRect(0, 0, 1024, 400);
    g.textBaseline = "middle"; g.font = "900 260px Arial";
    const parts: [string, number, string][] = [["$", 1 - 0.75 * read, "#ffffff"], ["9", 1, read > 0.2 ? GOLD : "#ffffff"], [".99", 1 - 0.75 * read, "#ffffff"]];
    const widths = parts.map(([t]) => g.measureText(t).width);
    let x = (1024 - widths.reduce((a, b) => a + b, 0)) / 2;
    parts.forEach(([t, o, c], i) => {
      g.globalAlpha = o; g.fillStyle = c;
      if (i === 1 && read > 0.2) { g.shadowColor = GOLD; g.shadowBlur = 40; } else g.shadowBlur = 0;
      g.save(); const sc = i === 1 ? 1 + 0.25 * read : 1; g.translate(x + widths[i] / 2, 200); g.scale(sc, sc); g.fillText(t, -widths[i] / 2, 0); g.restore();
      x += widths[i];
    });
    g.globalAlpha = 1; tex.needsUpdate = true;
  }

  return (
    <>
      <Studio />
      <primitive object={man.root} />
      <primitive object={shell} />
      <group position={centre} scale={S}>
        <mesh scale={[0.9, 0.98, 1.05]}>
          <sphereGeometry args={[0.46, 48, 36]} />
          <meshStandardMaterial color="#efe7d2" roughness={0.5} emissive="#efe7d2" emissiveIntensity={0.3} transparent opacity={0.16 * glass} depthWrite={false} />
        </mesh>
        <mesh position={[0, 0.06, 0.16]}>
          <planeGeometry args={[0.66, 0.26]} />
          <meshBasicMaterial map={tex} transparent opacity={on} depthTest={false} />
        </mesh>
      </group>
    </>
  );
};

export const PriceShot: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan(PERSON[0], PERSON[1]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <BlueStage glowY={50} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Scene man={man} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
