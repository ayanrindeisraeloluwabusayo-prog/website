// "Some people have no voice in their head" (mosquito-style graphics), Full Blend.
// Facts: Nedergaard & Lupyan (2024) Psychological Science; Heavey & Hurlburt (2008). See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Chatter, Groups, Quarter, Tests, Ways } from "./ivg";
import { KEY_AT } from "./QuietShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p24";
type G = "blue" | PaperId | "chatter" | "groups" | "tests" | "quarter" | "ways";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "quiet3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p24: { journal: "PSYCHOLOGICAL SCIENCE · 2024 · COPENHAGEN & WISCONSIN", title: "Not everybody has an inner voice: Behavioral consequences of anendophasia", authors: "Johanne S. K. Nedergaard & Gary Lupyan" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D bubbles go silent on "anendophasia" */
const LEAD = KEY_AT - (W[77].at - W[73].at);

const LAYERS: Layer[] = [
  { from: 0, to: 16, pic: "v-walker.mp4" }, { from: 16, to: 26, g: "chatter" }, { from: 26, to: 36, pic: "v-lake.mp4" },
  { from: 36, to: 51, pic: "v-phone.mp4" }, { from: 51, to: 54, g: "blue" }, { from: 54, to: 73, g: "p24" },
  { from: 73, to: 83, clip: "quiet3d.mp4", start: 73, lead: LEAD }, { from: 83, to: 102, g: "groups", cues: [90, 101] },
  { from: 102, to: 127, g: "tests", cues: [106, 117] }, { from: 127, to: 131, g: "blue" }, { from: 131, to: 145, pic: "v-fire.mp4", pos: "50% 40%" },
  { from: 145, to: 164, pic: "v-alarm.mp4" }, { from: 164, to: 176, g: "quarter", cues: [172] }, { from: 176, to: 191, pic: "v-fog.mp4" },
  { from: 191, to: 201, g: "ways", cues: [194, 197, 200] }, { from: 201, to: 999, pic: "v-couple.mp4", pos: "50% 35%" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 6, 6], [7, 10, 13], [14, 15, 15], [16, 18, 18], [19, 21, 22], [23, 25, 25], [26, 30, 30], [31, 33, 33], [34, 35, 35],
  [36, 41, 41], [43, 45, 46], [47, 50, 50], [51, 55, 55], [56, 59, 59], [60, 64, 64], [65, 67, 67], [68, 72, 72], [73, 76, 76], [77, 77, 77],
  [78, 82, 82], [83, 84, 84], [85, 90, 90], [95, 101, 101], [102, 106, 106], [107, 114, 114], [115, 117, 117], [118, 126, 126], [127, 130, 130],
  [131, 136, 136], [137, 141, 141], [142, 144, 144], [145, 149, 149], [150, 154, 153], [155, 163, 161], [164, 165, 165], [166, 172, 172],
  [173, 175, 175], [176, 181, 181], [182, 183, 183], [184, 188, 186], [189, 190, 190], [191, 194, 192], [195, 200, 200], [201, 203, 203],
  [204, 212, 209], [213, 216, 216],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 16, kind: "flash" }, { at: 26, kind: "glitch" }, { at: 36, kind: "burn" }, { at: 51, kind: "flash" }, { at: 54, kind: "burn" },
  { at: 73, kind: "flash" }, { at: 83, kind: "burn" }, { at: 102, kind: "flash" }, { at: 127, kind: "glitch" }, { at: 131, kind: "burn" },
  { at: 145, kind: "flash" }, { at: 164, kind: "burn" }, { at: 176, kind: "flash" }, { at: 191, kind: "burn" }, { at: 201, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [16, "pop", 0.2], [30, "drop", 0.2], [41, "pop", 0.2], [54, "paper", 0.3], [-(F(73) - LEAD + KEY_AT), "shiver", 0.4],
  [90, "pop", 0.2], [101, "pop", 0.2], [106, "marker", 0.2], [117, "marker", 0.2], [150, "chime", 0.25], [172, "chime", 0.2],
  [194, "pop", 0.15], [197, "pop", 0.15], [200, "pop", 0.15],
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
const { musicGain: MUSIC_GAIN = 0.842 } = getInputProps() as { musicGain?: number };

export const InnerVoice: React.FC = () => {

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
                {l.g === "chatter" ? <Chatter from={a} /> : null}
                {l.g === "groups" ? <Groups from={a} neverAt={F(l.cues![0])} alwaysAt={F(l.cues![1])} /> : null}
                {l.g === "tests" ? <Tests from={a} memAt={F(l.cues![0])} rhymeAt={F(l.cues![1])} /> : null}
                {l.g === "quarter" ? <Quarter from={a} at={F(l.cues![0])} /> : null}
                {l.g === "ways" ? <Ways at={l.cues!.map(F)} /> : null}
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
