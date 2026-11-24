// "Why mosquitoes bite you and not the person next to you" in the blue explainer edit, Full Blend script.
// Facts: Bill Gates at TED 2009; Lindsay et al. (2000) The Lancet 355; De Obaldia et al. (2022) Cell 185. See SCRIPT.md.
// 3D man: the current three.js style (the owner's choice). The thumbnail (Thumbs.tsx, option A) is added as the first
// frames when the final file is muxed, so every platform shows it as the cover.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Acids, Bites, Breath, Defence, Gambia, Jar, Myth, Tournament } from "./mqg";
import { WORDS } from "./speech";
import { SWARM_AT } from "./MagnetShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p00" | "p22";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "bites" | "jar" | "breath" | "gambia" | "myth" | "tourn" | "acids" | "defence"; cues?: number[] }
  | { from: number; to: number; clip: "magnet.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p00: { journal: "THE LANCET · 2000", title: "Effect of pregnancy on exposure to malaria mosquitoes", authors: "Steven W. Lindsay et al." },
  p22: { journal: "CELL · 2022", title: "Differential mosquito attraction to humans is associated with skin-derived carboxylic acid levels", authors: "Maria Elena De Obaldia, Leslie B. Vosshall et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...made their choice", on the music's final hit */
export const END = 2512;
export const FRAMES = END + 92;
const SHOT_AT = 208;

const LAYERS: Layer[] = [
  { from: 0, to: 12, pic: "v-fire.mp4" }, { from: 12, to: 19, g: "bites", cues: [14, 18] }, { from: 19, to: 32, pic: "v-stage.mp4" },
  { from: 32, to: 43, g: "jar", cues: [32, 36] }, { from: 43, to: 61, pic: "v-crowd.mp4" }, { from: 61, to: 71, pic: "v-cartoon.mp4" },
  { from: 71, to: 92, g: "breath" }, { from: 92, to: 99, pic: "v-preg.mp4", pos: "50% 40%" }, { from: 99, to: 106, g: "p00" },
  { from: 106, to: 132, g: "gambia", cues: [109, 122, 131] }, { from: 132, to: 136, g: "blue" }, { from: 136, to: 144, g: "myth", cues: [140, 143] },
  { from: 144, to: 150, g: "p22" }, { from: 150, to: 171, g: "tourn" }, { from: 171, to: 192, g: "acids", cues: [187] },
  { from: 192, to: 203, pic: "v-mosq.mp4" }, { from: 203, to: SHOT_AT, pic: "v-itch.mp4" }, { from: SHOT_AT, to: 223, clip: "magnet.mp4", start: SHOT_AT },
  { from: 223, to: 234, g: "defence", cues: [224, 225] }, { from: 234, to: 999, pic: "v-mosq.mp4", zoom: [1.2, 1.05] },
];

const BEATS: Beat[] = [
  [0, 2, 2], [3, 5, 5], [6, 7, 7], [8, 9, 9], [10, 11, 11], [12, 15, 14], [16, 18, 18], [19, 21, 22], [23, 25, 25], [26, 31, 28],
  [32, 34, 34], [35, 37, 37], [38, 42, 42], [43, 47, 47], [48, 52, 51], [53, 60, 59], [61, 66, 66], [67, 70, 70], [71, 76, 76],
  [77, 80, 80], [81, 85, 85], [86, 91, 91], [92, 98, 98], [99, 103, 101], [104, 107, 106], [108, 109, 109], [110, 113, 113], [114, 116, 116],
  [117, 120, 118], [121, 124, 122], [125, 131, 131], [132, 135, 135], [136, 140, 140], [141, 143, 143], [144, 146, 145], [147, 149, 148],
  [150, 156, 156], [157, 159, 159], [160, 165, 163], [166, 170, 170], [171, 173, 173], [174, 180, 180], [181, 183, 183], [184, 188, 188],
  [189, 191, 191], [192, 196, 194], [197, 202, 200], [203, 207, 207], [208, 215, 215], [216, 219, 219], [220, 222, 222], [223, 224, 224],
  [225, 228, 228], [229, 233, 233], [234, 237, 235], [238, 240, 240],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 12, kind: "flash" }, { at: 19, kind: "burn" }, { at: 71, kind: "glitch" }, { at: 99, kind: "burn" }, { at: 132, kind: "glitch" },
  { at: 144, kind: "burn" }, { at: 171, kind: "flash" }, { at: SHOT_AT, kind: "flash" }, { at: 223, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "buzz", 0.35], [14, "pop", 0.2], [18, "chime", 0.15], [32, "pop", 0.3], [36, "buzz", 0.45], [61, "buzz", 0.25], [99, "paper", 0.3],
  [109, "pop", 0.25], [140, "glitch-a", 0.3], [143, "chime", 0.25], [144, "paper", 0.3], [153, "buzz", 0.25], [187, "chime", 0.25],
  [-(F(SHOT_AT) + SWARM_AT), "buzz", 0.45], [224, "pop", 0.25], [225, "pop", 0.25], [237, "buzz", 0.3],
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
const { musicGain: MUSIC_GAIN = 0.68 } = getInputProps() as { musicGain?: number };

export const Mosquito: React.FC = () => {

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
                {l.g === "bites" ? <Bites from={a} youAt={F(l.cues![0])} themAt={F(l.cues![1])} /> : null}
                {l.g === "jar" ? <Jar openAt={F(l.cues![0])} flyAt={F(l.cues![1])} /> : null}
                {l.g === "breath" ? <Breath from={a} /> : null}
                {l.g === "gambia" ? <Gambia barsAt={F(l.cues![0])} airAt={F(l.cues![1])} warmAt={F(l.cues![2])} /> : null}
                {l.g === "myth" ? <Myth strikeAt={F(l.cues![0])} skinAt={F(l.cues![1])} /> : null}
                {l.g === "tourn" ? <Tournament from={a} /> : null}
                {l.g === "acids" ? <Acids from={a} magnetAt={F(l.cues![0])} /> : null}
                {l.g === "defence" ? <Defence sprayAt={F(l.cues![0])} netAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
