// Realistic 3D person for the body shots: "Male_Adult_12" from the Microsoft Rocketbox avatar library
// (MIT licence, github.com/microsoft/Microsoft-Rocketbox). The FBX and textures live in public/avatar.
import React, { useEffect, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { BlueStage } from "./motion";

export type Man = { root: THREE.Group; bones: Record<string, THREE.Bone>; meshes: THREE.SkinnedMesh[] };

const tex = (name: string, srgb: boolean) =>
  new Promise<THREE.Texture>((res, rej) => new THREE.TextureLoader().load(staticFile(`avatar/${name}`), (t) => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; res(t); }, undefined, rej));

/** Bone names without spaces or underscores ("Bip01 L Hand" and "Bip01_L_Hand" are the same bone). */
export const key = (n: string) => n.replace(/[^A-Za-z0-9]/g, "");

export const loadMan = async (): Promise<Man> => {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((u) => (/\.tga/i.test(u) ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" : u));
  const root = await new FBXLoader(manager).loadAsync(staticFile("avatar/man.fbx"));
  const [bc, bn, hc, hn] = await Promise.all([tex("body_color.jpg", true), tex("body_normal.jpg", false), tex("head_color.jpg", true), tex("head_normal.jpg", false)]);
  const bones: Record<string, THREE.Bone> = {};
  const meshes: THREE.SkinnedMesh[] = [];
  root.traverse((o) => {
    if ((o as THREE.Bone).isBone) bones[key(o.name)] = o as THREE.Bone;
    const m = o as THREE.SkinnedMesh;
    if (m.isMesh) {
      meshes.push(m);
      const mats = Array.isArray(m.material) ? m.material : [m.material];
      const made = mats.map((old) => {
        const head = /head/i.test(old.name);
        return new THREE.MeshStandardMaterial({ name: old.name, map: head ? hc : bc, normalMap: head ? hn : bn, roughness: head ? 0.6 : 0.8, metalness: 0 });
      });
      m.material = Array.isArray(m.material) ? made : made[0];
      m.frustumCulled = false;
    }
  });
  return { root, bones, meshes };
};

export const useMan = () => {
  const [man, setMan] = useState<Man | null>(null);
  const [handle] = useState(() => delayRender("avatar"));
  useEffect(() => { loadMan().then(setMan); }, []);
  return { man, handle };
};

/** Draw the scene once the model is in, then let Remotion take the frame. */
export const Ready: React.FC<{ handle: number }> = ({ handle }) => {
  const { advance } = useThree();
  useEffect(() => { advance(performance.now()); continueRender(handle); }, [advance, handle]);
  return null;
};

const Look: React.FC<{ man: Man }> = ({ man }) => {
  const f = useCurrentFrame();
  const { camera } = useThree();
  const views: [number[], number[]][] = [[[0, 100, 420], [0, 100, 0]], [[0, 165, 110], [0, 165, 0]], [[90, 165, 70], [0, 165, 0]]];
  const [pos, look] = views[Math.min(views.length - 1, Math.floor(f / 10))];
  camera.position.set(pos[0], pos[1], pos[2]);
  camera.lookAt(look[0], look[1], look[2]);
  return (
    <>
      <hemisphereLight args={["#ffffff", "#40508a", 1.6]} />
      <directionalLight position={[200, 300, 400]} intensity={2.4} />
      <directionalLight position={[-300, 200, -200]} intensity={1.5} color="#8fb0ff" />
      <primitive object={man.root} />
    </>
  );
};

export const AvatarLook: React.FC = () => {
  const { width, height } = useVideoConfig();
  const { man, handle } = useMan();
  return (
    <AbsoluteFill>
      <BlueStage glowY={52} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><Look man={man} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
};
