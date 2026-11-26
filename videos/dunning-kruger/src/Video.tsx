// "Why the least skilled feel the most confident" (mosquito-style graphics), Full Blend.
// Facts: McArthur Wheeler (1995); Kruger & Dunning (1999) JPSP 77(6):1121-1134. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Flip, Ink, Named, Percentile, Rate, SameSkill } from "./dkg";
import { KEY_AT } from "./ConfShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p99";
type G = "blue" | PaperId | "ink" | "rate" | "percentile" | "sameskill" | "named" | "flip";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "conf3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p99: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1999", title: "Unskilled and unaware of it", authors: "Justin Kruger & David Dunning" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D confidence bar shoots up on "confident" */
const LEAD = KEY_AT - (W[182].at - W[179].at);
const LAYERS: Layer[] = [
  { from: 0, to: 15, pic: "v-city.mp4" }, { from: 15, to: 27, pic: "v-lemons.mp4" }, { from: 27, to: 36, g: "ink" },
  { from: 36, to: 47, pic: "v-camera.mp4" }, { from: 47, to: 52, pic: "v-police.mp4" }, { from: 52, to: 60, pic: "v-teacher.mp4" },
  { from: 60, to: 68, pic: "v-meeting.mp4" }, { from: 68, to: 71, g: "blue" }, { from: 71, to: 84, g: "p99" },
  { from: 84, to: 94, pic: "v-exam.mp4" }, { from: 94, to: 104, g: "rate" }, { from: 104, to: 127, g: "percentile", cues: [113, 120] },
  { from: 127, to: 147, g: "sameskill", cues: [137] }, { from: 147, to: 154, g: "named" }, { from: 154, to: 158, g: "blue" },
  { from: 158, to: 179, g: "flip", cues: [165, 170] }, { from: 179, to: 195, clip: "conf3d.mp4", start: 179, lead: LEAD },
  { from: 195, to: 204, pic: "v-office.mp4" }, { from: 204, to: 999, pic: "v-classroom.mp4" },
];

const BEATS: Beat[] = [
[0, 1, 1], [2, 5, 5], [6, 8, 8], [9, 11, 11], [12, 14, 14], [15, 17, 17], [18, 23, 23], [24, 26, 26], [27, 28, 28], [29, 34, 34], [35, 43, 43], [44, 46, 46], [47, 51, 49], [52, 56, 56], [57, 58, 58], [59, 61, 61], [62, 64, 64], [65, 67, 67], [68, 70, 70], [71, 73, 73], [74, 78, 77], [79, 83, 80], [84, 88, 88], [89, 93, 93], [94, 98, 98], [99, 103, 103], [104, 110, 110], [111, 114, 113], [115, 120, 120], [121, 126, 126], [127, 134, 134], [135, 138, 138], [139, 146, 146], [147, 149, 149], [150, 153, 152], [154, 157, 157], [158, 163, 163], [164, 166, 165], [167, 172, 172], [173, 178, 178], [179, 182, 182], [183, 188, 186], [189, 194, 192], [195, 200, 199], [201, 205, 205], [206, 211, 208]
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 15, kind: "flash" }, { at: 27, kind: "glitch" }, { at: 36, kind: "burn" }, { at: 47, kind: "flash" }, { at: 52, kind: "burn" },
  { at: 60, kind: "flash" }, { at: 68, kind: "glitch" }, { at: 71, kind: "burn" }, { at: 84, kind: "flash" }, { at: 94, kind: "glitch" },
  { at: 104, kind: "flash" }, { at: 127, kind: "burn" }, { at: 147, kind: "flash" }, { at: 158, kind: "burn" }, { at: 179, kind: "flash" },
  { at: 195, kind: "burn" }, { at: 204, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [22, "pop", 0.2], [33, "shiver", 0.25], [46, "shutter", 0.3], [49, "drop", 0.25], [71, "paper", 0.3],
  [113, "pop", 0.25], [120, "chime", 0.25], [137, "pop", 0.2], [147, "riser", 0.2], [165, "drop", 0.25], [-(F(179) - LEAD + KEY_AT), "spark", 0.4],
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
const { musicGain: MUSIC_GAIN = 1.01 } = getInputProps() as { musicGain?: number };

export const DunningKruger: React.FC = () => {

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
                {l.g === "ink" ? <Ink from={a} /> : null}
                {l.g === "rate" ? <Rate from={a} /> : null}
                {l.g === "percentile" ? <Percentile realAt={F(l.cues![0])} guessAt={F(l.cues![1])} /> : null}
                {l.g === "sameskill" ? <SameSkill from={a} sameAt={F(l.cues![0])} /> : null}
                {l.g === "named" ? <Named from={a} /> : null}
                {l.g === "flip" ? <Flip from={a} underAt={F(l.cues![0])} easyAt={F(l.cues![1])} /> : null}
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
