// "Why one insult beats ten compliments" (the negativity bias) in the blue explainer edit, Full Blend script.
// Facts: Jimmy Kimmel Live "Mean Tweets" (since 2012); Baumeister et al. (2001) Review of General Psychology 5(4);
// Kahneman & Tversky (1979, 1992) loss aversion; Gottman's 5:1 ratio. See SCRIPT.md. 3D man: the current three.js style.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Compliments, Count, Money, Scale } from "./ing";
import { WORDS } from "./speech";
import { RED_AT } from "./InsultShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p01" | "p79";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "compl" | "scale" | "ratio" | "money" | "count"; cues?: number[] }
  | { from: number; to: number; clip: "insult.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p01: { journal: "REVIEW OF GENERAL PSYCHOLOGY · 2001", title: "Bad is stronger than good", authors: "Roy F. Baumeister, Ellen Bratslavsky, Catrin Finkenauer & Kathleen D. Vohs" },
  p79: { journal: "ECONOMETRICA · 1979", title: "Prospect theory: an analysis of decision under risk", authors: "Daniel Kahneman & Amos Tversky" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...from you first", on the music's final hit */
export const END = 2445;
export const FRAMES = END + 92;
const SHOT_AT = 131;

const LAYERS: Layer[] = [
  { from: 0, to: 14, g: "compl", cues: [9] }, { from: 14, to: 23, pic: "v-night.mp4" }, { from: 23, to: 32, pic: "v-crowd.mp4" },
  { from: 32, to: 48, pic: "v-phone.mp4" }, { from: 48, to: 54, pic: "v-fans.mp4" }, { from: 54, to: 64, pic: "v-flinch.mp4" },
  { from: 64, to: 74, g: "blue" }, { from: 74, to: 92, g: "p01" }, { from: 92, to: 100, g: "scale", cues: [92] },
  { from: 100, to: 107, pic: "v-cards.mp4" }, { from: 107, to: 113, g: "p79" }, { from: 113, to: 131, g: "money", cues: [115, 125] },
  { from: SHOT_AT, to: 145, clip: "insult.mp4", start: SHOT_AT }, { from: 145, to: 151, pic: "v-tiger.mp4" }, { from: 151, to: 156, pic: "v-forest.mp4" },
  { from: 156, to: 160, g: "blue" }, { from: 160, to: 168, pic: "v-hands.mp4" }, { from: 168, to: 183, pic: "v-hug.mp4" },
  { from: 183, to: 195, g: "ratio", cues: [185] }, { from: 195, to: 207, pic: "v-stressed.mp4" }, { from: 207, to: 214, pic: "v-flinch.mp4", zoom: [1.15, 1.0] },
  { from: 214, to: 220, g: "count" }, { from: 220, to: 999, pic: "v-friends.mp4", zoom: [1.12, 1.0] },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 5, 5], [6, 7, 7], [8, 9, 9], [10, 13, 13], [14, 16, 16], [17, 19, 19], [20, 22, 22], [23, 24, 25], [26, 27, 27],
  [28, 30, 30], [31, 37, 37], [38, 41, 41], [42, 43, 43], [44, 47, 47], [48, 51, 51], [52, 53, 53], [54, 58, 59], [60, 63, 63],
  [64, 65, 65], [66, 70, 70], [71, 73, 72], [74, 76, 76], [77, 78, 78], [79, 84, 84], [85, 86, 86], [87, 91, 91], [92, 92, 92],
  [93, 96, 94], [97, 99, 99], [100, 105, 105], [106, 109, 109], [110, 112, 112], [113, 115, 115], [116, 118, 118], [119, 121, 121],
  [122, 125, 125], [126, 128, 128], [129, 130, 130], [131, 134, 134], [135, 138, 138], [139, 141, 140], [142, 145, 145], [146, 148, 148],
  [149, 150, 150], [151, 155, 154], [156, 159, 159], [160, 163, 163], [164, 167, 167], [168, 170, 170], [171, 174, 172], [175, 178, 178],
  [179, 182, 182], [183, 185, 185], [186, 191, 186], [192, 194, 194], [195, 197, 197], [198, 202, 202], [203, 206, 205], [207, 210, 210],
  [211, 213, 211], [214, 216, 216], [217, 219, 219], [220, 225, 225], [226, 228, 228], [229, 232, 232], [233, 235, 235], [236, 238, 238],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 14, kind: "flash" }, { at: 23, kind: "burn" }, { at: 64, kind: "glitch" }, { at: 74, kind: "burn" }, { at: 92, kind: "flash" },
  { at: 107, kind: "burn" }, { at: SHOT_AT, kind: "flash" }, { at: 156, kind: "glitch" }, { at: 183, kind: "flash" }, { at: 214, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.25], [2, "pop", 0.15], [5, "pop", 0.15], [9, "glitch-a", 0.35], [22, "shiver", 0.25], [63, "subdrop", 0.3],
  [74, "paper", 0.3], [92, "drop", 0.3], [107, "paper", 0.3], [115, "subdrop", 0.3], [125, "chime", 0.2],
  [-(F(SHOT_AT) + RED_AT), "glitch-b", 0.3], [185, "chime", 0.3], [214, "pop", 0.25], [233, "chime", 0.25],
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

export const Insult: React.FC = () => {

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
                {l.g === "compl" ? <Compliments from={a} badAt={F(l.cues![0])} /> : null}
                {l.g === "scale" ? <Scale from={a} at={F(l.cues![0])} /> : null}
                {l.g === "ratio" ? <Scale from={a} at={F(l.cues![0])} ratio /> : null}
                {l.g === "money" ? <Money loseAt={F(l.cues![0])} winAt={F(l.cues![1])} /> : null}
                {l.g === "count" ? <Count from={a} /> : null}
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
