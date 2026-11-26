// "Can you spot a fake smile?" (mosquito-style graphics), Full Blend.
// Facts: Duchenne (1862); Gunnery, Hall & Ruben (2013) J Nonverbal Behav 37:29-41; smile timing studies. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Currents, Muscle, Seven, Smize, Timing } from "./fsg";
import { KEY_AT } from "./EyeShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p13";
type G = "blue" | PaperId | "smize" | "currents" | "muscle" | "seven" | "timing";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "eye3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p13: { journal: "JOURNAL OF NONVERBAL BEHAVIOR · 2013 · NORTHEASTERN UNIVERSITY", title: "The deliberate Duchenne smile: Individual differences in expressive control", authors: "Sarah D. Gunnery, Judith A. Hall & Mollie A. Ruben" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D eye rings light up on "crinkle" */
const LEAD = KEY_AT - (W[156].at - W[150].at);

const LAYERS: Layer[] = [
  { from: 0, to: 4, pic: "v-lips.mp4" }, { from: 4, to: 9, pic: "v-selfie.mp4", pos: "50% 30%" }, { from: 9, to: 16, pic: "v-man.mp4", pos: "50% 30%" },
  { from: 16, to: 29, pic: "v-shoot.mp4" }, { from: 29, to: 39, g: "smize", cues: [31] }, { from: 39, to: 46, g: "blue" },
  { from: 46, to: 61, g: "currents", cues: [49] }, { from: 61, to: 92, g: "muscle", cues: [72, 81, 87] }, { from: 92, to: 118, pic: "v-grandpa.mp4", pos: "50% 30%" },
  { from: 118, to: 122, g: "blue" }, { from: 122, to: 128, pic: "v-field.mp4" }, { from: 128, to: 137, g: "p13" }, { from: 137, to: 150, g: "seven", cues: [145] },
  { from: 150, to: 158, clip: "eye3d.mp4", start: 150, lead: LEAD }, { from: 158, to: 189, g: "timing", cues: [173, 183] },
  { from: 189, to: 202, pic: "v-joy.mp4", pos: "50% 30%" }, { from: 202, to: 208, pic: "v-shoot.mp4" }, { from: 208, to: 999, pic: "v-friends.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 3, 3], [4, 6, 6], [7, 8, 8], [9, 12, 12], [13, 15, 15], [16, 19, 19], [20, 22, 22], [23, 27, 27], [28, 29, 29],
  [30, 34, 34], [35, 38, 38], [39, 45, 45], [46, 48, 48], [49, 50, 50], [51, 53, 53], [54, 60, 57], [61, 66, 66], [67, 68, 68],
  [69, 75, 72], [76, 81, 81], [82, 91, 87], [92, 92, 92], [93, 99, 98], [100, 102, 102], [103, 109, 107], [110, 117, 116],
  [118, 121, 121], [122, 127, 125], [128, 131, 130], [132, 136, 133], [137, 143, 143], [144, 148, 148], [149, 152, 152], [153, 157, 156],
  [158, 164, 164], [165, 170, 170], [171, 175, 175], [176, 180, 180], [181, 185, 185], [186, 188, 187], [189, 194, 194], [195, 201, 199],
  [202, 204, 204], [205, 207, 207], [208, 213, 211], [214, 218, 216],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 4, kind: "flash" }, { at: 9, kind: "glitch" }, { at: 16, kind: "burn" }, { at: 29, kind: "flash" }, { at: 39, kind: "burn" },
  { at: 46, kind: "flash" }, { at: 61, kind: "burn" }, { at: 92, kind: "flash" }, { at: 118, kind: "glitch" }, { at: 122, kind: "burn" },
  { at: 128, kind: "flash" }, { at: 137, kind: "burn" }, { at: 150, kind: "flash" }, { at: 158, kind: "burn" }, { at: 189, kind: "flash" },
  { at: 202, kind: "burn" }, { at: 208, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [15, "glitch-a", 0.15], [29, "shutter", 0.25], [31, "chime", 0.2], [52, "spark", 0.2], [72, "pop", 0.2], [81, "chime", 0.2],
  [128, "paper", 0.3], [145, "pop", 0.2], [-(F(150) - LEAD + KEY_AT), "spark", 0.4], [173, "marker", 0.2], [183, "chime", 0.2], [204, "shutter", 0.2],
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
const { musicGain: MUSIC_GAIN = 0.735 } = getInputProps() as { musicGain?: number };

export const FakeSmile: React.FC = () => {

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
                {l.g === "smize" ? <Smize from={a} at={F(l.cues![0])} /> : null}
                {l.g === "currents" ? <Currents from={a} nameAt={F(l.cues![0])} /> : null}
                {l.g === "muscle" ? <Muscle from={a} muscleAt={F(l.cues![0])} crinkleAt={F(l.cues![1])} purposeAt={F(l.cues![2])} /> : null}
                {l.g === "seven" ? <Seven from={a} at={F(l.cues![0])} /> : null}
                {l.g === "timing" ? <Timing from={a} fakeAt={F(l.cues![0])} realAt={F(l.cues![1])} /> : null}
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
