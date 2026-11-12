// Realistic 3D person for the body shots: "Male_Adult_12" from the Microsoft Rocketbox avatar library
// (MIT licence, github.com/microsoft/Microsoft-Rocketbox). The FBX and textures live in public/avatar.
import React, { useEffect, useMemo, useState } from "react";
import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { RoomEnvironment } from "three/examples/jsm/environments/RoomEnvironment.js";
import { AbsoluteFill, continueRender, delayRender, staticFile, useCurrentFrame, useVideoConfig } from "remotion";
import { ThreeCanvas } from "@remotion/three";
import { useThree } from "@react-three/fiber";
import { BlueStage } from "./motion";

export type Man = { root: THREE.Group; bones: Record<string, THREE.Bone>; meshes: THREE.SkinnedMesh[] };

const tex = (id: string, name: string, srgb: boolean) =>
  new Promise<THREE.Texture | null>((res) => new THREE.TextureLoader().load(staticFile(`avatars/${id}/${name}`), (t) => { t.colorSpace = srgb ? THREE.SRGBColorSpace : THREE.NoColorSpace; t.anisotropy = 8; res(t); }, undefined, () => res(null)));

/** Bone names without spaces or underscores ("Bip01 L Hand" and "Bip01_L_Hand" are the same bone). */
export const key = (n: string) => n.replace(/[^A-Za-z0-9]/g, "");

export const loadMan = async (id = "Male_Adult_12", hasOpacity = false): Promise<Man> => {
  const manager = new THREE.LoadingManager();
  manager.setURLModifier((u) => (/\.tga/i.test(u) ? "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAAASUVORK5CYII=" : u));
  const root = await new FBXLoader(manager).loadAsync(staticFile(`avatars/${id}/man.fbx`));
  const [bc, bn, hc, hn, oc] = await Promise.all([tex(id, "body_color.jpg", true), tex(id, "body_normal.jpg", false), tex(id, "head_color.jpg", true), tex(id, "head_normal.jpg", false), hasOpacity ? tex(id, "opacity_color.png", true) : Promise.resolve(null)]);
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
        if (/opac/i.test(old.name)) return new THREE.MeshStandardMaterial({ name: old.name, map: oc, transparent: true, alphaTest: 0.35, side: THREE.DoubleSide, roughness: 0.75, metalness: 0 });
        return new THREE.MeshStandardMaterial({ name: old.name, map: head ? hc : bc, normalMap: head ? hn : bn, roughness: head ? 0.55 : 0.8, metalness: 0 });
      });
      m.material = Array.isArray(m.material) ? made : made[0];
      m.frustumCulled = false;
    }
  });
  return { root, bones, meshes };
};

export const useMan = (id = "Male_Adult_12", hasOpacity = false) => {
  const [man, setMan] = useState<Man | null>(null);
  const [handle] = useState(() => delayRender("avatar"));
  useEffect(() => { loadMan(id, hasOpacity).then(setMan); }, [id, hasOpacity]);
  return { man, handle };
};

/** Draw the scene once the model is in, then let Remotion take the frame. */
export const Ready: React.FC<{ handle: number }> = ({ handle }) => {
  const { advance } = useThree();
  useEffect(() => { advance(performance.now()); continueRender(handle); }, [advance, handle]);
  return null;
};

/** Studio light: soft reflections from a room environment, film-style tone mapping, key, fill and rim lights. */
export const Studio: React.FC = () => {
  const { gl, scene } = useThree();
  useMemo(() => {
    gl.toneMapping = THREE.ACESFilmicToneMapping;
    gl.toneMappingExposure = 1.05;
    const pm = new THREE.PMREMGenerator(gl);
    scene.environment = pm.fromScene(new RoomEnvironment(), 0.04).texture;
    scene.environmentIntensity = 0.55;
  }, [gl, scene]);
  return (
    <>
      <directionalLight position={[160, 260, 320]} intensity={2.6} color="#fff4e6" />
      <directionalLight position={[-260, 120, 160]} intensity={0.7} color="#bcd0ff" />
      <directionalLight position={[-220, 260, -260]} intensity={2.2} color="#7fa6ff" />
      <directionalLight position={[240, 220, -240]} intensity={1.4} color="#9fbcff" />
    </>
  );
};

export const CAST: [string, boolean][] = [["Male_Adult_01", true], ["Male_Adult_04", true], ["Male_Adult_07", true], ["Male_Adult_11", false], ["Male_Adult_12", false], ["Female_Adult_02", true], ["Female_Adult_07", true], ["Female_Adult_09", true], ["Female_Adult_12", true]];

const aimBone = (bone: THREE.Bone, child: THREE.Bone, dir: THREE.Vector3) => {
  bone.updateWorldMatrix(true, true);
  const a = bone.getWorldPosition(new THREE.Vector3()), b = child.getWorldPosition(new THREE.Vector3());
  const delta = new THREE.Quaternion().setFromUnitVectors(b.sub(a).normalize(), dir.clone().normalize());
  const world = bone.getWorldQuaternion(new THREE.Quaternion()).premultiply(delta);
  bone.quaternion.copy(bone.parent!.getWorldQuaternion(new THREE.Quaternion()).invert().multiply(world));
  bone.updateWorldMatrix(false, true);
};

const CastScene: React.FC<{ man: Man; face: boolean }> = ({ man, face }) => {
  const { camera } = useThree();
  const B = (n: string) => man.bones[key(n)];
  useMemo(() => {
    for (const sd of ["L", "R"]) {
      const s1 = sd === "L" ? 1 : -1;
      aimBone(B(`Bip01 ${sd} UpperArm`), B(`Bip01 ${sd} Forearm`), new THREE.Vector3(0.16 * s1, -1, 0.02));
      aimBone(B(`Bip01 ${sd} Forearm`), B(`Bip01 ${sd} Hand`), new THREE.Vector3(0.06 * s1, -1, 0.22));
    }
    man.root.updateMatrixWorld(true);
  }, [man]);
  const head = B("Bip01 Head").getWorldPosition(new THREE.Vector3());
  if (face) { camera.position.set(22, head.y + 9, 62); camera.lookAt(0, head.y + 8.5, 3); }
  else { camera.position.set(8, head.y - 14, 150); camera.lookAt(0, head.y - 14, 0); }
  return (<><Studio /><primitive object={man.root} /></>);
};

/** Casting sheet: frame 2n is person n waist-up, frame 2n+1 is their face. */
export const Casting: React.FC = () => {
  const f = useCurrentFrame();
  const { width, height } = useVideoConfig();
  const [id, op] = CAST[Math.floor(f / 2) % CAST.length];
  const { man, handle } = useMan(id, op);
  return (
    <AbsoluteFill>
      <BlueStage glowY={52} />
      <ThreeCanvas width={width} height={height} gl={{ alpha: true, antialias: true }} camera={{ fov: 30, near: 1, far: 5000 }}>
        {man ? <><CastScene man={man} face={f % 2 === 1} /><Ready handle={handle} /></> : null}
      </ThreeCanvas>
    </AbsoluteFill>
  );
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
