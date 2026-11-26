// "Why we forget our dreams" (mosquito-style graphics), Full Blend.
// Facts: Eichenlaub, Ruby et al. (Lyon, 2013-14); Izawa et al. (2019) Science 365:1308-1313. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Cells, Gone, Night, NoSave, Purpose, Recallers, SwitchOff } from "./fdg";
import { KEY_AT } from "./DreamShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p13" | "p19";
type G = "blue" | PaperId | "gone" | "nosave" | "night" | "night2" | "recallers" | "purpose" | "cells" | "switchoff";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "dream3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p13: { journal: "CEREBRAL CORTEX · 2014", title: "Brain reactivity differentiates subjects with high and low dream recall frequencies", authors: "Jean-Baptiste Eichenlaub, Olivier Bertrand, Dominique Morlet & Perrine Ruby" },
  p19: { journal: "SCIENCE · 2019", title: "REM sleep-active MCH neurons are involved in forgetting hippocampus-dependent memories", authors: "Shuntaro Izawa, Akihiro Yamanaka, Thomas S. Kilduff et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the dreams start drifting out of his head on "swept" */
const LEAD = KEY_AT - (W[195].at - W[191].at);
const LAYERS: Layer[] = [
  { from: 0, to: 10, pic: "v-waking.mp4", pos: "50% 40%" }, { from: 10, to: 15, pic: "v-dreambed.mp4" }, { from: 15, to: 23, g: "gone", cues: [22] },
  { from: 23, to: 39, pic: "v-breakfast.mp4" }, { from: 39, to: 42, g: "blue" }, { from: 42, to: 51, g: "nosave" },
  { from: 51, to: 68, g: "night", cues: [60] }, { from: 68, to: 74, g: "p13" }, { from: 74, to: 91, g: "recallers", cues: [77, 86] },
  { from: 91, to: 103, g: "night2", cues: [99] }, { from: 103, to: 113, pic: "v-sleeping.mp4" }, { from: 113, to: 123, pic: "v-alarm.mp4" },
  { from: 123, to: 127, g: "blue" }, { from: 127, to: 132, g: "purpose" }, { from: 132, to: 147, g: "p19" },
  { from: 147, to: 162, g: "cells", cues: [161] }, { from: 162, to: 176, g: "switchoff", cues: [168, 174] },
  { from: 176, to: 191, pic: "v-bluebed.mp4" }, { from: 191, to: 199, clip: "dream3d.mp4", start: 191, lead: LEAD }, { from: 199, to: 211, pic: "v-morning.mp4" }, { from: 211, to: 999, pic: "v-writing.mp4" },
];

const BEATS: Beat[] = [
[0, 4, 5], [6, 9, 8], [10, 14, 13], [15, 19, 19], [20, 22, 22], [23, 26, 26], [27, 33, 33], [34, 38, 37], [39, 41, 41], [42, 44, 44], [45, 50, 48], [51, 54, 54], [55, 59, 60], [61, 63, 63], [64, 67, 67], [68, 69, 69], [70, 73, 72], [74, 82, 82], [83, 90, 90], [91, 95, 94], [96, 102, 100], [103, 106, 106], [107, 112, 109], [113, 115, 115], [116, 122, 120], [123, 126, 126], [127, 131, 131], [132, 133, 133], [134, 140, 136], [141, 147, 147], [148, 154, 153], [155, 161, 161], [162, 168, 168], [169, 171, 171], [172, 175, 174], [176, 179, 179], [180, 184, 184], [185, 190, 187], [191, 198, 195], [199, 204, 203], [205, 206, 206], [207, 210, 208], [211, 214, 214], [215, 218, 218], [219, 223, 220]
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 10, kind: "flash" }, { at: 15, kind: "glitch" }, { at: 23, kind: "burn" }, { at: 39, kind: "glitch" }, { at: 42, kind: "flash" },
  { at: 51, kind: "burn" }, { at: 68, kind: "burn" }, { at: 74, kind: "flash" }, { at: 91, kind: "glitch" }, { at: 103, kind: "burn" },
  { at: 113, kind: "flash" }, { at: 127, kind: "flash" }, { at: 132, kind: "burn" }, { at: 147, kind: "flash" }, { at: 162, kind: "glitch" },
  { at: 176, kind: "flash" }, { at: 191, kind: "flash" }, { at: 199, kind: "burn" }, { at: 211, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [22, "subdrop", 0.25], [42, "glitch-a", 0.15], [60, "chime", 0.2], [68, "paper", 0.3], [77, "pop", 0.2], [86, "pop", 0.2],
  [99, "pop", 0.2], [113, "lamp", 0.25], [127, "drop", 0.3], [132, "paper", 0.3], [161, "chime", 0.25], [168, "pop", 0.25], [174, "spark", 0.3],
  [-(F(191) - LEAD + KEY_AT), "whoosh", 0.3],
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
const { musicGain: MUSIC_GAIN = 0.74 } = getInputProps() as { musicGain?: number };

export const ForgetDreams: React.FC = () => {

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
                {l.g === "gone" ? <Gone from={a} goneAt={F(l.cues![0])} /> : null}
                {l.g === "nosave" ? <NoSave from={a} /> : null}
                {l.g === "night" ? <Night from={a} wakeAt={F(l.cues![0])} /> : null}
                {l.g === "night2" ? <Night from={a} wakeAt={F(l.cues![0])} double /> : null}
                {l.g === "recallers" ? <Recallers highAt={F(l.cues![0])} lowAt={F(l.cues![1])} /> : null}
                {l.g === "purpose" ? <Purpose from={a} /> : null}
                {l.g === "cells" ? <Cells from={a} forgetAt={F(l.cues![0])} /> : null}
                {l.g === "switchoff" ? <SwitchOff offAt={F(l.cues![0])} moreAt={F(l.cues![1])} /> : null}
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
