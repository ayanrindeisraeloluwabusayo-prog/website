// "The McGurk effect: your eyes change what you hear" (mosquito-style graphics), Full Blend.
// Facts: McGurk & MacDonald (1976) Nature; Basu Mallick, Magnotti & Beauchamp (2015). See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Blink, Fuse, Mix, Range, Yanny } from "./mgg";
import { KEY_AT } from "./MixShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p76";
type G = "blue" | PaperId | "fuse" | "yanny" | "mix" | "blink" | "range";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "mix3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p76: { journal: "NATURE · 1976 · UNIVERSITY OF SURREY", title: "Hearing lips and seeing voices", authors: "Harry McGurk & John MacDonald" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D sight and sound meet on "guess" */
const LEAD = KEY_AT - (W[147].at - W[138].at);

const LAYERS: Layer[] = [
  { from: 0, to: 29, g: "fuse", cues: [10, 24] }, { from: 29, to: 45, g: "yanny", cues: [44, 42] }, { from: 45, to: 54, pic: "v-wave.mp4" },
  { from: 54, to: 62, pic: "v-concert.mp4" }, { from: 62, to: 71, g: "blue" }, { from: 71, to: 100, pic: "v-projector.mp4" }, { from: 100, to: 111, pic: "v-lips.mp4" },
  { from: 111, to: 122, g: "p76" }, { from: 122, to: 129, pic: "v-sea.mp4" }, { from: 129, to: 138, g: "mix", cues: [133] },
  { from: 138, to: 148, clip: "mix3d.mp4", start: 138, lead: LEAD }, { from: 148, to: 165, pic: "v-cafe.mp4" }, { from: 165, to: 175, pic: "v-couple.mp4" },
  { from: 175, to: 188, g: "blink", cues: [175, 182] }, { from: 188, to: 192, g: "blue" }, { from: 192, to: 236, g: "range", cues: [212, 220, 226] },
  { from: 236, to: 999, pic: "v-concert.mp4" },
];

const BEATS: Beat[] = [
  [0, 3, 3], [4, 5, 5], [6, 10, 10], [11, 13, 13], [14, 17, 17], [18, 20, 20], [21, 24, 24], [25, 28, 28], [29, 32, 33], [34, 35, 35],
  [36, 39, 39], [40, 44, 44], [45, 48, 48], [49, 53, 53], [54, 61, 58], [62, 64, 64], [65, 70, 70], [71, 73, 73], [74, 80, 78], [81, 85, 85],
  [86, 90, 90], [91, 99, 98], [100, 104, 104], [105, 110, 108], [111, 112, 112], [113, 116, 116], [117, 121, 120], [122, 128, 128],
  [129, 133, 133], [134, 137, 137], [138, 142, 142], [143, 147, 147], [148, 153, 153], [154, 158, 158], [159, 164, 164], [165, 171, 171],
  [172, 174, 174], [175, 177, 177], [178, 181, 181], [182, 187, 186], [188, 191, 191], [192, 196, 194], [197, 205, 205], [206, 211, 210],
  [212, 216, 215], [217, 219, 219], [220, 221, 221], [226, 229, 228], [230, 235, 234], [236, 240, 240], [244, 249, 248], [250, 254, 253],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 29, kind: "flash" }, { at: 45, kind: "burn" }, { at: 54, kind: "flash" }, { at: 62, kind: "burn" }, { at: 71, kind: "flash" },
  { at: 100, kind: "burn" }, { at: 111, kind: "flash" }, { at: 122, kind: "burn" }, { at: 129, kind: "flash" }, { at: 138, kind: "burn" },
  { at: 148, kind: "flash" }, { at: 165, kind: "burn" }, { at: 175, kind: "flash" }, { at: 188, kind: "glitch" }, { at: 192, kind: "burn" },
  { at: 236, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [10, "pop", 0.2], [24, "chime", 0.25], [42, "pop", 0.15], [44, "pop", 0.15], [111, "paper", 0.3], [133, "pop", 0.2],
  [-(F(138) - LEAD + KEY_AT), "spark", 0.4], [175, "drop", 0.15], [182, "chime", 0.2], [212, "pop", 0.2], [220, "pop", 0.2], [226, "marker", 0.2],
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

export const McGurk: React.FC = () => {

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
                {l.g === "fuse" ? <Fuse from={a} baAt={F(l.cues![0])} daAt={F(l.cues![1])} /> : null}
                {l.g === "yanny" ? <Yanny from={a} laurelAt={F(l.cues![0])} yannyAt={F(l.cues![1])} /> : null}
                {l.g === "mix" ? <Mix from={a} seeAt={F(l.cues![0])} guessAt={b - 10} /> : null}
                {l.g === "blink" ? <Blink closedAt={F(l.cues![0])} openAt={F(l.cues![1])} /> : null}
                {l.g === "range" ? <Range from={a} allAt={F(l.cues![0])} neverAt={F(l.cues![1])} yearAt={F(l.cues![2])} /> : null}
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
