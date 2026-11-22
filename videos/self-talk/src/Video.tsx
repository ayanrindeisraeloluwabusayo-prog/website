// "Why talking to yourself is actually smart" in the blue explainer edit, Full Blend script.
// Facts: Malala Yousafzai, TV interview Oct 2013; Lupyan & Swingley (2012) QJEP 65(6); Kross et al. (2014) JPSP 106(2);
// Moser et al. (2017) Scientific Reports 7. See SCRIPT.md. 3D man: the current three.js style (the owner's choice).
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { KeysBubbles, Quote, Results, Search, Voices, Wave } from "./stg";
import { WORDS } from "./speech";
import { SWITCH_AT } from "./SelfShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p12" | "p14" | "p17";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "keys" | "quote" | "search" | "voices" | "results" | "wave"; cues?: number[] }
  | { from: number; to: number; clip: "self.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p12: { journal: "QUARTERLY JOURNAL OF EXPERIMENTAL PSYCHOLOGY · 2012", title: "Self-directed speech affects visual search performance", authors: "Gary Lupyan & Daniel Swingley" },
  p14: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 2014", title: "Self-talk as a regulatory mechanism: How you do it matters", authors: "Ethan Kross et al." },
  p17: { journal: "SCIENTIFIC REPORTS · 2017", title: "Third-person self-talk facilitates emotion regulation without engaging cognitive control", authors: "Jason S. Moser, Ethan Kross et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "You've got this", on the music's final hit */
export const END = 2405;
export const FRAMES = END + 92;
const SHOT_AT = 214;

const LAYERS: Layer[] = [
  { from: 0, to: 9, pic: "v-keys.mp4" }, { from: 9, to: 16, g: "keys", cues: [10, 11, 12] }, { from: 16, to: 21, pic: "v-stage.mp4" },
  { from: 21, to: 29, pic: "v-hands.mp4" }, { from: 29, to: 39, pic: "v-mirror.mp4", pos: "30% 50%" }, { from: 39, to: 50, pic: "v-studio.mp4" },
  { from: 50, to: 63, pic: "v-worried.mp4" }, { from: 63, to: 83, g: "quote", cues: [75] }, { from: 83, to: 90, g: "blue" },
  { from: 90, to: 99, g: "p12" }, { from: 99, to: 121, g: "search", cues: [111, 118] }, { from: 121, to: 131, pic: "v-keys.mp4", zoom: [1.15, 1.0] },
  { from: 131, to: 135, g: "blue" }, { from: 135, to: 141, pic: "v-speaker.mp4" }, { from: 141, to: 150, g: "p14" },
  { from: 150, to: 161, pic: "v-job.mp4" }, { from: 161, to: 175, g: "voices", cues: [169, 171, 174] }, { from: 175, to: 185, g: "results", cues: [176, 179, 182] },
  { from: 185, to: 192, g: "p17" }, { from: 192, to: 201, g: "wave", cues: [197] }, { from: 201, to: SHOT_AT, pic: "v-calm.mp4", pos: "50% 30%" },
  { from: SHOT_AT, to: 228, clip: "self.mp4", start: SHOT_AT }, { from: 228, to: 999, pic: "v-stage.mp4", zoom: [1.15, 1.0] },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 9, 9], [10, 11, 11], [12, 15, 15], [16, 20, 20], [21, 22, 22], [23, 28, 28], [29, 32, 32], [33, 38, 38],
  [39, 41, 42], [43, 47, 47], [48, 49, 49], [50, 57, 57], [58, 59, 59], [60, 63, 63], [64, 67, 67], [68, 70, 70], [71, 75, 75],
  [76, 78, 78], [79, 82, 82], [83, 84, 84], [85, 88, 88], [89, 91, 91], [92, 93, 93], [94, 98, 98], [99, 103, 103], [104, 105, 105],
  [106, 108, 108], [109, 114, 114], [115, 116, 116], [117, 120, 120], [121, 124, 124], [125, 127, 127], [128, 130, 130], [131, 134, 134],
  [135, 140, 140], [141, 142, 142], [143, 145, 145], [146, 149, 149], [150, 153, 153], [154, 159, 160], [161, 165, 165], [166, 169, 169],
  [170, 171, 171], [172, 174, 174], [175, 177, 177], [178, 180, 180], [181, 182, 184], [185, 187, 187], [188, 192, 192], [193, 196, 196],
  [197, 200, 200], [201, 202, 202], [206, 212, 213], [214, 217, 217], [218, 223, 223], [224, 227, 227], [228, 230, 230],
].map(([from, a, b]) => ({ from, key: [a, b] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 9, kind: "flash" }, { at: 39, kind: "burn" }, { at: 63, kind: "burn" }, { at: 83, kind: "flash" }, { at: 90, kind: "burn" },
  { at: 99, kind: "glitch" }, { at: 131, kind: "glitch" }, { at: 141, kind: "burn" }, { at: 161, kind: "flash" }, { at: 185, kind: "burn" },
  { at: SHOT_AT, kind: "flash" }, { at: 228, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.25], [10, "pop", 0.25], [11, "pop", 0.25], [12, "pop", 0.3], [63, "paper", 0.3], [75, "chime", 0.25],
  [90, "paper", 0.3], [111, "pop", 0.3], [118, "spark", 0.3], [141, "paper", 0.3], [169, "pop", 0.25], [171, "pop", 0.25], [174, "glitch-a", 0.25],
  [176, "chime", 0.2], [179, "chime", 0.2], [182, "chime", 0.25], [185, "paper", 0.3], [-(F(SHOT_AT) + SWITCH_AT), "spark", 0.35], [228, "chime", 0.3],
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
const { musicGain: MUSIC_GAIN = 0.63 } = getInputProps() as { musicGain?: number };

export const SelfTalk: React.FC = () => {

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
                {l.g === "keys" ? <KeysBubbles at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} /> : null}
                {l.g === "quote" ? <Quote from={a} nameAt={F(l.cues![0])} /> : null}
                {l.g === "search" ? <Search from={a} sayAt={F(l.cues![0])} foundAt={F(l.cues![1])} /> : null}
                {l.g === "voices" ? <Voices nameAt={F(l.cues![0])} youAt={F(l.cues![1])} iAt={F(l.cues![2])} /> : null}
                {l.g === "results" ? <Results at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} /> : null}
                {l.g === "wave" ? <Wave from={a} calmAt={F(l.cues![0])} /> : null}
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
      <Audio src={staticFile("music_slow_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
