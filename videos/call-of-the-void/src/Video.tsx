// "Why do you get a sudden urge to jump when you stand somewhere high?" (the call of the void) in the blue explainer
// edit, story flow. Pictures carry the feeling, motion graphics the facts, the real study page the proof, the 3D man
// the inside of the head. Fact: Hames, Ribeiro, Smith & Joiner (2012), Journal of Affective Disorders. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { HalfCount, WrongGuess } from "./graphics9";
import { ALARM_AT, GOLD_AT, PULL_AT, THINK_AT } from "./VoidShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number] }
  | { from: number; to: number; g: "blue" | "paper" | "half" | "guess"; cues?: number[] }
  | { from: number; to: number; clip: "void_alarm.mp4" | "void_saved.mp4"; start: number };
type Beat = { from: number; key: [number, number]; note?: string };

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...the urge to live", on the music's final hit */
export const END = 1712;
export const FRAMES = END + 92;

const LAYERS: Layer[] = [
  { from: 0, to: 7, pic: "v-balcony.jpg", pos: "45% 50%" }, { from: 7, to: 17, pic: "v-streets.jpg", pos: "70% 50%" },
  { from: 17, to: 18, pic: "v-stairwell.jpg", zoom: [1.0, 1.3] }, { from: 18, to: 27, pic: "v-calm.jpg", pos: "62% 50%" },
  { from: 27, to: 38, pic: "v-night.jpg", pos: "72% 50%" }, { from: 38, to: 45, pic: "v-paris.jpg" },
  { from: 45, to: 50, pic: "v-void.jpg", zoom: [1.0, 1.18] }, { from: 50, to: 56, pic: "v-windows.jpg" },
  { from: 56, to: 64, g: "paper" }, { from: 64, to: 82, g: "half", cues: [76] },
  { from: 82, to: 88, pic: "v-spiral.jpg", zoom: [1.0, 1.25] }, { from: 88, to: 95, g: "blue" },
  { from: 95, to: 134, clip: "void_alarm.mp4", start: 95 }, { from: 134, to: 155, g: "guess", cues: [137, 145, 149] },
  { from: 155, to: 163, pic: "v-bench.jpg", pos: "80% 50%" }, { from: 163, to: 174, clip: "void_saved.mp4", start: 163 },
  { from: 174, to: 999, pic: "v-terrace.jpg", pos: "32% 50%", zoom: [1.0, 1.12] },
];

const BEATS: Beat[] = [
  { from: 0, key: [4, 4] }, { from: 5, key: [5, 6] }, { from: 7, key: [10, 10] }, { from: 11, key: [12, 12] }, { from: 17, key: [17, 17] },
  { from: 18, key: [22, 22] }, { from: 23, key: [26, 26] }, { from: 27, key: [29, 30] }, { from: 31, key: [31, 32] }, { from: 33, key: [37, 37] },
  { from: 38, key: [39, 39] }, { from: 45, key: [46, 49], note: "FRENCH: L'APPEL DU VIDE" }, { from: 50, key: [54, 55] },
  { from: 56, key: [57, 57] }, { from: 58, key: [60, 61] }, { from: 64, key: [69, 70] }, { from: 71, key: [75, 75] },
  { from: 76, key: [76, 77] }, { from: 78, key: [81, 81] }, { from: 82, key: [86, 87] }, { from: 88, key: [90, 90] },
  { from: 95, key: [99, 99] }, { from: 100, key: [100, 100] }, { from: 103, key: [105, 106] }, { from: 107, key: [110, 110] },
  { from: 114, key: [116, 116] }, { from: 117, key: [121, 122] }, { from: 123, key: [124, 125] }, { from: 126, key: [129, 129] },
  { from: 130, key: [132, 133] }, { from: 134, key: [136, 136] }, { from: 137, key: [141, 142] }, { from: 143, key: [145, 146] },
  { from: 147, key: [148, 148] }, { from: 149, key: [154, 154] }, { from: 155, key: [158, 158] }, { from: 159, key: [162, 162] },
  { from: 163, key: [166, 166] }, { from: 167, key: [167, 167] }, { from: 168, key: [172, 172] }, { from: 174, key: [175, 177] },
  { from: 178, key: [183, 183] },
];

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 17, kind: "flash" }, { at: 56, kind: "burn" }, { at: 64, kind: "glitch" }, { at: 95, kind: "flash" },
  { at: 134, kind: "glitch" }, { at: 163, kind: "burn" }, { at: 174, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [17, "subdrop", 0.4], [56, "paper", 0.3], [76, "pop", 0.3], [-(F(95) + ALARM_AT), "spark", 0.35], [-(F(95) + PULL_AT - 3), "whoosh", 0.3],
  [-(F(95) + THINK_AT), "lamp", 0.3], [137, "pop", 0.25], [145, "glitch-a", 0.3], [149, "marker", 0.25], [-(F(163) + GOLD_AT), "chime", 0.35],
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
  lines.push({ kind: "serif", words: key, size: chars > 13 ? 140 : chars > 9 ? 170 : undefined });
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
const { musicGain: MUSIC_GAIN = 0.745 } = getInputProps() as { musicGain?: number };

export const VoidVideo: React.FC = () => {

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
                <Shot src={l.pic} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade="contrast(1.06)" />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start)} />
            ) : l.g === "paper" ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal="JOURNAL OF AFFECTIVE DISORDERS · 2012" title="An urge to jump affirms the urge to live: An empirical examination of the high place phenomenon" authors="Hames, Ribeiro, Smith & Joiner" hlHeight={176} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "half" ? <HalfCount from={a} halfAt={F(l.cues![0])} /> : null}
                {l.g === "guess" ? <WrongGuess from={a} askAt={F(l.cues![0])} wrongAt={F(l.cues![1])} decideAt={F(l.cues![2])} /> : null}
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
        const dark = k === "paper";
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
      <Audio src={staticFile("music_twinkle_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
