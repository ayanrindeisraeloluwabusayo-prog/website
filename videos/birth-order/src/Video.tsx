// "Does being the oldest, middle or youngest child shape you?" (mosquito-style graphics), Full Blend.
// Facts: Rohrer, Egloff & Schmukle (2015) PNAS 112(46):14224-14229. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { AgeNot, Ages, Count, Roles, Tiny, Traits, Years } from "./bog";
import { KEY_AT } from "./BarsShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p15";
type G = "blue" | PaperId | "roles" | "years" | "count" | "traits" | "tiny" | "ages" | "agenot";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "bars3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p15: { journal: "PNAS · 2015 · UNIVERSITIES OF LEIPZIG AND MAINZ", title: "Examining the effects of birth order on personality", authors: "Julia M. Rohrer, Boris Egloff & Stefan C. Schmukle" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D bars even out on "no (real difference)" */
const LEAD = KEY_AT - (W[117].at - W[114].at);

const LAYERS: Layer[] = [
  { from: 0, to: 22, g: "roles", cues: [7, 15] }, { from: 22, to: 26, pic: "v-family.mp4" }, { from: 26, to: 42, pic: "v-meal.mp4" },
  { from: 42, to: 66, g: "years", cues: [57] }, { from: 66, to: 75, g: "p15" }, { from: 75, to: 89, g: "count", cues: [80] },
  { from: 89, to: 98, pic: "v-twokids.mp4", pos: "50% 40%" }, { from: 98, to: 114, g: "traits", cues: [98, 101, 104, 105, 106] },
  { from: 114, to: 120, clip: "bars3d.mp4", start: 114, lead: LEAD }, { from: 120, to: 142, g: "tiny", cues: [127, 135] }, { from: 142, to: 146, g: "blue" },
  { from: 146, to: 156, pic: "v-playground.mp4" }, { from: 156, to: 167, g: "ages", cues: [163] }, { from: 167, to: 177, pic: "v-walk.mp4" },
  { from: 177, to: 186, g: "agenot", cues: [182, 183] }, { from: 186, to: 203, pic: "v-family.mp4", pos: "50% 40%" }, { from: 203, to: 999, pic: "v-dad.mp4", pos: "50% 40%" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 5, 5], [7, 8, 8], [10, 12, 12], [15, 16, 16], [17, 19, 21], [22, 22, 24], [26, 31, 32], [33, 36, 36], [37, 39, 39],
  [42, 45, 45], [46, 47, 47], [50, 53, 54], [55, 57, 58], [59, 62, 62], [66, 68, 68], [69, 71, 71], [72, 74, 74], [75, 80, 81], [83, 88, 88],
  [89, 91, 93], [94, 97, 97], [98, 98, 100], [101, 103, 103], [104, 106, 106], [107, 112, 113], [114, 117, 119], [120, 126, 126],
  [127, 130, 130], [131, 133, 133], [134, 141, 141], [142, 145, 145], [146, 149, 149], [150, 153, 155], [156, 160, 160], [161, 165, 166],
  [167, 170, 170], [171, 173, 173], [174, 176, 176], [177, 178, 178], [179, 182, 182], [183, 185, 185], [186, 190, 190], [191, 195, 196],
  [197, 201, 202], [203, 207, 207], [208, 211, 211],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 22, kind: "flash" }, { at: 26, kind: "burn" }, { at: 42, kind: "flash" }, { at: 66, kind: "burn" }, { at: 75, kind: "flash" },
  { at: 89, kind: "burn" }, { at: 98, kind: "flash" }, { at: 114, kind: "glitch" }, { at: 120, kind: "burn" }, { at: 142, kind: "glitch" },
  { at: 146, kind: "burn" }, { at: 156, kind: "flash" }, { at: 167, kind: "burn" }, { at: 177, kind: "flash" }, { at: 186, kind: "burn" },
  { at: 203, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [7, "pop", 0.2], [15, "pop", 0.2], [42, "riser", 0.15], [57, "marker", 0.2], [66, "paper", 0.3], [80, "chime", 0.2],
  [101, "pop", 0.15], [104, "pop", 0.15], [106, "pop", 0.15], [-(F(114) - LEAD + KEY_AT), "spark", 0.4], [127, "pop", 0.2], [163, "pop", 0.2],
  [182, "chime", 0.2], [183, "drop", 0.2],
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
const { musicGain: MUSIC_GAIN = 0.746 } = getInputProps() as { musicGain?: number };

export const BirthOrder: React.FC = () => {

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
                {l.g === "roles" ? <Roles from={a} midAt={F(l.cues![0])} youngAt={F(l.cues![1])} /> : null}
                {l.g === "years" ? <Years from={a} adlerAt={F(l.cues![0])} /> : null}
                {l.g === "count" ? <Count from={a} numAt={F(l.cues![0])} /> : null}
                {l.g === "traits" ? <Traits from={a} at={l.cues!.map(F)} /> : null}
                {l.g === "tiny" ? <Tiny from={a} firstAt={F(l.cues![0])} selfAt={F(l.cues![1])} /> : null}
                {l.g === "ages" ? <Ages from={a} agesAt={F(l.cues![0])} /> : null}
                {l.g === "agenot" ? <AgeNot from={a} ageAt={F(l.cues![0])} notAt={F(l.cues![1])} /> : null}
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
