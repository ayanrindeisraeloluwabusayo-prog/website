// "Some people can't picture anything in their mind" (mosquito-style graphics), Full Blend.
// Facts: Zeman, Dewar & Della Sala (2015) Cortex; Blake Ross essay (2016); Wicken, Keogh & Pearson (2021) Proc R Soc B. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Essay, Few, Speech, Sphere, Studio, Sweat, Words } from "./apg";
import { KEY_AT } from "./AppleShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p15";
type G = "blue" | PaperId | "studio" | "sphere" | "few" | "speech" | "essay" | "sweat" | "words";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "apple3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p15: { journal: "CORTEX · 2015 · UNIVERSITY OF EXETER", title: "Lives without imagery: Congenital aphantasia", authors: "Adam Zeman, Michaela Dewar & Sergio Della Sala" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D apple breaks apart on "aphantasia" */
const LEAD = KEY_AT - (W[81].at - W[77].at);

const LAYERS: Layer[] = [
  { from: 0, to: 4, pic: "v-eye.mp4" }, { from: 4, to: 18, pic: "v-apples.mp4" }, { from: 18, to: 27, pic: "v-dark.mp4" },
  { from: 27, to: 50, g: "studio", cues: [43] }, { from: 50, to: 63, g: "sphere" }, { from: 63, to: 66, g: "blue" }, { from: 66, to: 77, g: "p15" },
  { from: 77, to: 86, clip: "apple3d.mp4", start: 77, lead: LEAD }, { from: 86, to: 99, g: "few", cues: [90] }, { from: 99, to: 106, pic: "v-thinker.mp4", pos: "50% 30%" },
  { from: 106, to: 117, g: "speech", cues: [111] }, { from: 117, to: 141, g: "essay", cues: [130] }, { from: 141, to: 151, g: "blue" },
  { from: 151, to: 170, pic: "v-forest.mp4" }, { from: 170, to: 194, g: "sweat", cues: [173, 181, 189] }, { from: 194, to: 204, pic: "v-tree.mp4" },
  { from: 204, to: 215, g: "words", cues: [209, 211] }, { from: 215, to: 999, pic: "v-friends.mp4" },
];

const BEATS: Beat[] = [
  [0, 2, 2], [3, 6, 6], [7, 9, 9], [11, 16, 17], [18, 22, 22], [23, 26, 26], [27, 29, 30], [31, 32, 32], [40, 43, 44], [50, 58, 59],
  [60, 62, 62], [63, 67, 67], [68, 69, 69], [70, 75, 76], [77, 80, 80], [81, 81, 81], [86, 90, 92], [99, 105, 105], [106, 108, 108],
  [117, 119, 120], [121, 127, 127], [130, 139, 140], [141, 144, 144], [145, 150, 150], [151, 155, 155], [156, 159, 160], [161, 165, 166],
  [170, 173, 173], [179, 182, 182], [186, 188, 188], [189, 190, 190], [194, 200, 200], [201, 203, 203], [204, 209, 211], [215, 221, 222],
  [223, 226, 226],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 4, kind: "flash" }, { at: 18, kind: "glitch" }, { at: 27, kind: "burn" }, { at: 50, kind: "flash" }, { at: 63, kind: "burn" },
  { at: 66, kind: "flash" }, { at: 77, kind: "burn" }, { at: 86, kind: "glitch" }, { at: 99, kind: "flash" }, { at: 106, kind: "burn" },
  { at: 117, kind: "flash" }, { at: 141, kind: "glitch" }, { at: 151, kind: "burn" }, { at: 170, kind: "flash" }, { at: 194, kind: "burn" },
  { at: 204, kind: "flash" }, { at: 215, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [6, "pop", 0.2], [22, "drop", 0.2], [59, "shiver", 0.2], [66, "paper", 0.3], [-(F(77) - LEAD + KEY_AT), "spark", 0.4],
  [90, "chime", 0.2], [109, "pop", 0.2], [130, "marker", 0.2], [159, "shiver", 0.2], [173, "riser", 0.2], [181, "drop", 0.2], [209, "pop", 0.2], [211, "pop", 0.2],
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
const { musicGain: MUSIC_GAIN = 1 } = getInputProps() as { musicGain?: number };

export const Aphantasia: React.FC = () => {

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
                {l.g === "studio" ? <Studio from={a} emptyAt={F(l.cues![0])} /> : null}
                {l.g === "sphere" ? <Sphere from={a} to={b} /> : null}
                {l.g === "few" ? <Few from={a} litAt={F(l.cues![0])} /> : null}
                {l.g === "speech" ? <Speech from={a} labelAt={F(l.cues![0])} /> : null}
                {l.g === "essay" ? <Essay from={a} typeAt={F(l.cues![0])} /> : null}
                {l.g === "sweat" ? <Sweat from={a} spikeAt={F(l.cues![0])} flatAt={F(l.cues![1])} fearAt={F(l.cues![2])} /> : null}
                {l.g === "words" ? <Words from={a} wordsAt={F(l.cues![0])} factsAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_twinkle.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
