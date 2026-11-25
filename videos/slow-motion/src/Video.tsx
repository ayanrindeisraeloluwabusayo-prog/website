// "Why time slows down in an accident" in the blue explainer edit (mosquito-style graphics), Full Blend script.
// Facts: Eagleman's childhood fall (NPR 2010); Stetson, Fiesta & Eagleman (2007) PLoS ONE 2(12): e1295. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Chrono, Estimate, Forever, Longer, Never, OneTen, Pause, Readable, Roof } from "./smg";
import { KEY_AT } from "./SlowShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p07";
type G = "blue" | PaperId | "pause" | "oneten" | "forever" | "roof" | "estimate" | "chrono" | "readable" | "never" | "longer";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "slow3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p07: { journal: "PLOS ONE · 2007", title: "Does time really slow down during a frightening event?", authors: "Chess Stetson, Matthew P. Fiesta & David M. Eagleman" },
};
const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D shot starts this far in, so the snapshots pour into his head on "extra" */
const LEAD = KEY_AT - (W[189].at - W[180].at);
const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-traffic.mp4" }, { from: 5, to: 11, pic: "v-shards.mp4" }, { from: 11, to: 20, pic: "v-ink.mp4" },
  { from: 20, to: 29, g: "pause" }, { from: 29, to: 40, g: "oneten", cues: [39] }, { from: 40, to: 50, pic: "v-boy.mp4" },
  { from: 50, to: 62, pic: "v-construction.mp4" }, { from: 62, to: 69, g: "forever" }, { from: 69, to: 84, g: "roof", cues: [80] },
  { from: 84, to: 87, g: "blue" }, { from: 87, to: 94, g: "p07" }, { from: 94, to: 108, pic: "v-droptower.mp4" },
  { from: 108, to: 134, g: "estimate", cues: [112, 124] }, { from: 134, to: 138, g: "blue" }, { from: 138, to: 152, g: "chrono" },
  { from: 152, to: 172, g: "readable", cues: [171] }, { from: 172, to: 180, g: "never", cues: [178] },
  { from: 180, to: 191, clip: "slow3d.mp4", start: 180, lead: LEAD }, { from: 191, to: 208, g: "longer", cues: [206] },
  { from: 208, to: 216, pic: "v-neurons.mp4" }, { from: 216, to: 223, pic: "v-sky.mp4" }, { from: 223, to: 999, pic: "v-highway.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 2], [3, 4, 4], [5, 6, 7], [8, 10, 10], [11, 14, 14], [15, 18, 19], [20, 23, 23], [24, 28, 28], [29, 33, 33], [34, 36, 36],
  [37, 39, 39], [40, 44, 44], [45, 48, 48], [49, 53, 53], [54, 56, 56], [57, 61, 61], [62, 68, 68], [69, 72, 72], [73, 79, 79],
  [80, 83, 83], [84, 86, 86], [87, 88, 88], [89, 93, 92], [94, 97, 97], [98, 100, 100], [101, 104, 103], [105, 107, 107],
  [108, 113, 113], [114, 116, 116], [117, 119, 119], [120, 125, 125], [126, 133, 133], [134, 137, 137], [138, 140, 140],
  [141, 145, 145], [146, 151, 151], [152, 157, 157], [158, 166, 166], [167, 170, 170], [171, 172, 172], [173, 176, 176],
  [177, 179, 178], [180, 182, 182], [183, 187, 187], [188, 190, 190], [191, 196, 196], [197, 199, 199], [200, 207, 207],
  [208, 211, 210], [212, 216, 216], [217, 222, 221], [223, 227, 227], [228, 231, 231], [232, 234, 234], [235, 241, 237],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 5, kind: "flash" }, { at: 11, kind: "burn" }, { at: 20, kind: "glitch" }, { at: 29, kind: "flash" }, { at: 40, kind: "burn" },
  { at: 50, kind: "flash" }, { at: 62, kind: "glitch" }, { at: 69, kind: "flash" }, { at: 84, kind: "glitch" }, { at: 87, kind: "burn" },
  { at: 94, kind: "flash" }, { at: 108, kind: "burn" }, { at: 138, kind: "glitch" }, { at: 152, kind: "flash" }, { at: 172, kind: "glitch" },
  { at: 180, kind: "flash" }, { at: 191, kind: "burn" }, { at: 208, kind: "flash" }, { at: 216, kind: "burn" }, { at: 223, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [6, "glitch-a", 0.15], [20, "subdrop", 0.25], [39, "pop", 0.25], [50, "whoosh", 0.2], [72, "drop", 0.25],
  [80, "pop", 0.25], [87, "paper", 0.3], [96, "riser", 0.2], [112, "pop", 0.2], [124, "chime", 0.25], [138, "glitch-b", 0.2],
  [171, "drop", 0.3], [178, "chime", 0.25], [-(F(180) - LEAD + KEY_AT), "spark", 0.4], [206, "pop", 0.25],
];

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

const Sfx: React.FC<{ at: number; src: string; volume: number }> = ({ at, src, volume }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.4} />
  </Sequence>
);

/** Words of one beat as a lockup: lead-in words on short lines, the key word(s) big in the serif, the rest after. */
const BeatText: React.FC<{ words: Word[]; key0: number; key1: number; from: number; top: number; dark: boolean; until: number }> = ({ words, key0, key1, from, top, dark, until }) => {
  const before = words.slice(0, key0 - from), key = words.slice(key0 - from, key1 - from + 1), after = words.slice(key1 - from + 1);
  const lines: { kind?: "serif"; words: Word[]; align?: "flex-start" | "flex-end"; indent?: number; size?: number }[] = [];
  for (let i = 0; i < before.length; i += 4) lines.push({ words: before.slice(i, i + 4), align: "flex-start", indent: (i / 4) % 2 ? 140 : 40 });
  const chars = key.map((w) => w.w).join(" ").length;
  lines.push({ kind: "serif", words: key, size: chars > 18 ? 118 : chars > 13 ? 140 : chars > 9 ? 170 : undefined });
  for (let i = 0; i < after.length; i += 5) lines.push({ words: after.slice(i, i + 5), align: "flex-end", indent: 60 });
  return <Lockup top={top} until={until} color={dark ? "#111" : "#fff"} shadow={!dark} lines={lines} />;
};

const Clip: React.FC<{ src: string; at: number }> = ({ src, at }) => (
  <AbsoluteFill>
    <Sequence from={at} layout="none">
      <OffthreadVideo src={staticFile(`media/${src}`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
  </AbsoluteFill>
);

// music level: "musicGain" input prop lets a listening test override it
const { musicGain: MUSIC_GAIN = 0.85 } = getInputProps() as { musicGain?: number };

export const SlowMotion: React.FC = () => {

  const talking = (x: number) => W.some((w, i) => x >= w.at - 4 && x < Math.min(i + 1 < W.length ? W[i + 1].at : w.at + 20, w.at + 20) + 4);
  const musicLevel = (x: number) => {
    let duck = 0;
    for (let d = -6; d <= 6; d += 2) duck += talking(x + d) ? 1 : 0;
    let lv = 0.3 - 0.08 * (duck / 7);   // gentle ducking: the owner wants to hear the track under the voice
    if (x < 6) lv *= x / 6;
    if (x > END + 40) lv *= Math.max(0, 1 - (x - END - 40) / 50);
    return lv * MUSIC_GAIN;
  };
  const layerAt = (x: number) => LAYERS.find((l) => x >= F(l.from) && x < F(l.to));
  const kindOf = (l?: Layer) => (!l ? "none" : "pic" in l ? "pic" : "clip" in l ? "clip" : l.g);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />
      {LAYERS.map((l, i) => {
        const a = F(l.from), b = F(l.to);
        return (
          <Scene key={i} from={a} to={b}>
            {"pic" in l ? (
              <>
                <Shot src={l.pic} video={l.pic.endsWith(".mp4")} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade={l.grade ?? "contrast(1.06)"} />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start) - (l.lead ?? 0)} />
            ) : l.g in PAPERS ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g as PaperId].journal} title={PAPERS[l.g as PaperId].title} authors={PAPERS[l.g as PaperId].authors} hlHeight={120} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "pause" ? <Pause from={a} /> : null}
                {l.g === "oneten" ? <OneTen from={a} tenAt={F(l.cues![0])} /> : null}
                {l.g === "forever" ? <Forever from={a} to={b} /> : null}
                {l.g === "roof" ? <Roof from={a} lessAt={F(l.cues![0])} /> : null}
                {l.g === "estimate" ? <Estimate from={a} threeAt={F(l.cues![0])} thirdAt={F(l.cues![1])} /> : null}
                {l.g === "chrono" ? <Chrono from={a} /> : null}
                {l.g === "readable" ? <Readable from={a} cantAt={F(l.cues![0])} /> : null}
                {l.g === "never" ? <Never from={a} memoryAt={F(l.cues![0])} /> : null}
                {l.g === "longer" ? <Longer from={a} longerAt={F(l.cues![0])} /> : null}
              </>
            )}
          </Scene>
        );
      })}
      <Grain amount={0.15} />

      {BEATS.map((bt, i) => {
        const end = i + 1 < BEATS.length ? BEATS[i + 1].from : W.length;
        const a = F(bt.from), b = Math.min(F(end), END);
        const k = kindOf(layerAt(a + 1));
        const dark = k in PAPERS;
        return (
          <Scene key={i} from={a} to={b}>
            <BeatText words={W.slice(bt.from, end)} key0={bt.key[0]} key1={bt.key[1]} from={bt.from} top={k === "clip" ? 150 : 220} dark={dark} until={b} />
            {bt.note ? <div style={{ position: "absolute", left: 0, right: 0, top: 1720, textAlign: "center", fontFamily: SANS2, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: FLASH }}>{bt.note}</div> : null}
          </Scene>
        );
      })}

      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {CUTS.map((c, i) => (c.kind === "burn" ? <FilmBurn key={i} at={F(c.at) - 5} /> : c.kind === "flash" ? <InvertFlash key={i} at={F(c.at) - 2} /> : <PixelGlitch key={i} at={F(c.at) - 4} />))}

      <Audio src={staticFile("media/voice.mp3")} />
      <Audio src={staticFile("music_spooky_sounds.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
