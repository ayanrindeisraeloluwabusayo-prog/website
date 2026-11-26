// "Why being bored is good for you" (mosquito-style graphics), Full Blend.
// Facts: Mann & Cadman (2014) Creativity Research Journal 26(2):165-173; J.K. Rowling on the 1990 train. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Clock, Cups, Ideas, Pen } from "./bgg";
import { KEY_AT } from "./SparkShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p14";
type G = "blue" | PaperId | "clock" | "pen" | "cups" | "compare" | "three";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "spark3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p14: { journal: "CREATIVITY RESEARCH JOURNAL · 2014 · UNIVERSITY OF CENTRAL LANCASHIRE", title: "Does being bored make us more creative?", authors: "Sandi Mann & Rebekah Cadman" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D lights join into a spark on "new (ideas)" */
const LEAD = KEY_AT - (W[195].at - W[188].at);

const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-waiting.mp4" }, { from: 5, to: 10, pic: "v-bored.mp4", pos: "50% 40%" }, { from: 10, to: 16, g: "clock" },
  { from: 16, to: 32, pic: "v-train.mp4" }, { from: 32, to: 43, g: "pen", cues: [39] }, { from: 43, to: 51, pic: "v-rain.mp4" }, { from: 51, to: 58, pic: "v-bulb.mp4" },
  { from: 58, to: 61, g: "blue" }, { from: 61, to: 82, g: "p14" }, { from: 82, to: 101, pic: "v-writing.mp4" }, { from: 101, to: 120, g: "cups" },
  { from: 120, to: 135, g: "compare", cues: [126] }, { from: 135, to: 139, g: "blue" }, { from: 139, to: 172, g: "three", cues: [154, 160] },
  { from: 172, to: 188, pic: "v-sky.mp4" }, { from: 188, to: 199, clip: "spark3d.mp4", start: 188, lead: LEAD }, { from: 199, to: 211, pic: "v-cafe.mp4" },
  { from: 211, to: 221, pic: "v-phone.mp4" }, { from: 221, to: 999, pic: "v-train.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 6, 6], [7, 9, 7], [10, 15, 15], [16, 19, 19], [20, 25, 25], [26, 29, 29], [30, 31, 31], [32, 35, 33],
  [36, 42, 42], [43, 46, 46], [47, 49, 49], [50, 54, 54], [55, 57, 57], [58, 62, 62], [63, 64, 65], [69, 74, 74], [77, 81, 78],
  [82, 88, 88], [89, 93, 93], [94, 95, 95], [96, 100, 100], [101, 102, 102], [103, 110, 110], [111, 119, 119], [120, 122, 122],
  [123, 127, 127], [128, 134, 134], [135, 138, 138], [139, 141, 141], [142, 145, 145], [146, 149, 149], [150, 154, 154], [158, 161, 160],
  [162, 168, 168], [169, 171, 171], [172, 173, 173], [176, 181, 181], [182, 185, 185], [186, 190, 190], [191, 192, 192], [193, 198, 196],
  [199, 200, 200], [201, 203, 202], [204, 210, 208], [211, 214, 214], [215, 220, 218], [221, 226, 225], [227, 228, 228], [232, 236, 236],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 5, kind: "flash" }, { at: 10, kind: "burn" }, { at: 16, kind: "flash" }, { at: 32, kind: "burn" }, { at: 43, kind: "flash" },
  { at: 51, kind: "burn" }, { at: 58, kind: "flash" }, { at: 61, kind: "burn" }, { at: 82, kind: "flash" }, { at: 101, kind: "burn" },
  { at: 120, kind: "flash" }, { at: 135, kind: "glitch" }, { at: 139, kind: "burn" }, { at: 172, kind: "flash" }, { at: 188, kind: "burn" },
  { at: 199, kind: "flash" }, { at: 211, kind: "burn" }, { at: 221, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [10, "lamp", 0.2], [33, "drop", 0.2], [53, "spark", 0.25], [61, "paper", 0.3], [101, "pop", 0.15],
  [126, "chime", 0.2], [154, "pop", 0.2], [160, "chime", 0.25], [-(F(188) - LEAD + KEY_AT), "spark", 0.4], [216, "glitch-a", 0.15],
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

export const BoredGood: React.FC = () => {

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
                {l.g === "clock" ? <Clock from={a} /> : null}
                {l.g === "pen" ? <Pen from={a} satAt={F(l.cues![0])} /> : null}
                {l.g === "cups" ? <Cups from={a} /> : null}
                {l.g === "compare" ? <Ideas from={a} copyAt={F(l.cues![0])} /> : null}
                {l.g === "three" ? <Ideas from={a} copyAt={a + 8} readAt={F(l.cues![1])} /> : null}
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
