// "The dress: blue and black, or white and gold?" (mosquito-style graphics), Full Blend.
// Facts: Lafer-Sousa, Hermann & Conway (2015) Current Biology; Wallisch (2017) Journal of Vision. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Flip, Light, Owls, Split } from "./drg";
import { KEY_AT } from "./LightShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p17";
type G = "blue" | PaperId | "flip" | "real" | "split" | "light" | "owls";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "light3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p17: { journal: "JOURNAL OF VISION · 2017 · NEW YORK UNIVERSITY", title: "Illumination assumptions account for individual differences in the perceptual interpretation of a profoundly ambiguous stimulus in the color domain: 'The dress'", authors: "Pascal Wallisch" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D lights meet on "decide" */
const LEAD = KEY_AT - (W[184].at - W[176].at);

const LAYERS: Layer[] = [
  { from: 0, to: 13, g: "flip" }, { from: 13, to: 25, pic: "v-scroll.mp4" }, { from: 25, to: 55, pic: "v-phone.mp4", pos: "50% 40%" },
  { from: 55, to: 67, pic: "v-argue.mp4" }, { from: 67, to: 77, g: "real" }, { from: 77, to: 86, pic: "v-rack.mp4" }, { from: 86, to: 113, g: "split", cues: [95, 101] },
  { from: 113, to: 134, pic: "v-eye.mp4" }, { from: 134, to: 176, g: "light", cues: [142, 162] }, { from: 176, to: 189, clip: "light3d.mp4", start: 176, lead: LEAD },
  { from: 189, to: 193, pic: "v-night.mp4" }, { from: 193, to: 203, g: "p17" }, { from: 203, to: 233, g: "owls", cues: [203, 219] },
  { from: 233, to: 250, pic: "v-window.mp4" }, { from: 250, to: 999, pic: "v-sunrise.mp4" },
];

const BEATS: Beat[] = [
  [0, 3, 3], [4, 8, 8], [9, 12, 12], [13, 15, 15], [16, 18, 18], [19, 24, 22], [25, 29, 28], [30, 36, 36], [37, 44, 43], [45, 48, 48],
  [49, 51, 51], [55, 56, 56], [61, 62, 62], [67, 69, 69], [70, 72, 72], [77, 85, 85], [86, 89, 88], [90, 92, 92], [95, 95, 95], [101, 101, 101],
  [107, 112, 112], [113, 116, 116], [117, 119, 119], [123, 124, 124], [130, 133, 133], [134, 143, 142], [144, 148, 148], [155, 164, 163],
  [165, 169, 169], [170, 175, 173], [176, 179, 179], [180, 182, 182], [189, 192, 192], [193, 196, 196], [197, 202, 202], [203, 204, 204],
  [211, 218, 216], [219, 220, 220], [229, 232, 232], [233, 236, 236], [237, 240, 240], [241, 249, 249], [250, 256, 256], [260, 264, 263],
  [265, 270, 269],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 13, kind: "flash" }, { at: 25, kind: "burn" }, { at: 55, kind: "flash" }, { at: 67, kind: "glitch" }, { at: 77, kind: "burn" },
  { at: 86, kind: "flash" }, { at: 113, kind: "burn" }, { at: 134, kind: "flash" }, { at: 176, kind: "glitch" }, { at: 189, kind: "burn" },
  { at: 193, kind: "flash" }, { at: 203, kind: "burn" }, { at: 233, kind: "flash" }, { at: 250, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [8, "pop", 0.15], [12, "pop", 0.15], [24, "glitch-a", 0.15], [67, "chime", 0.2], [95, "pop", 0.2], [101, "pop", 0.2],
  [142, "shutter", 0.2], [162, "shutter", 0.2], [-(F(176) - LEAD + KEY_AT), "spark", 0.4], [193, "paper", 0.3], [203, "chime", 0.2], [219, "pop", 0.2],
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

export const TheDress: React.FC = () => {

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
                {l.g === "flip" ? <Flip from={a} /> : null}
                {l.g === "real" ? <Flip from={a} fixed /> : null}
                {l.g === "split" ? <Split from={a} bbAt={F(l.cues![0])} wgAt={F(l.cues![1])} /> : null}
                {l.g === "light" ? <Light from={a} shadowAt={F(l.cues![0])} warmAt={F(l.cues![1])} /> : null}
                {l.g === "owls" ? <Owls from={a} larkAt={F(l.cues![0])} owlAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_ponpon.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
