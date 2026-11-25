// "Why you stay up late on your phone even when you're tired" (bedtime procrastination) in the blue explainer edit, Full Blend.
// Facts: Reed Hastings, Netflix Q1 2017 investor interview ("we're competing with sleep"); Kroese et al. (2014) Frontiers in
// Psychology 5:611; Exelmans & Van den Bulck (2017) J Clin Sleep Med 13(8). See SCRIPT.md. "Netflix" only as plain text.
// The thumbnail (Thumbs.tsx, option C) is added as the first frames when the final file is muxed.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Binge, Cool, Day, Earlier, OneMore, Plan, Quote, Revenge, Rival, Survey } from "./bpg";
import { WORDS } from "./speech";
import { ON_AT } from "./NoveltyShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p14" | "p17";
type G = "blue" | PaperId | "onemore" | "rival" | "rivalEnd" | "quote" | "plan" | "survey" | "revenge" | "day" | "binge" | "cool" | "earlier";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "novelty.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p14: { journal: "FRONTIERS IN PSYCHOLOGY · 2014", title: "Bedtime procrastination: introducing a new area of procrastination", authors: "Floor M. Kroese, Denise T. D. De Ridder, Catharine Evers & Marieke A. Adriaanse" },
  p17: { journal: "JOURNAL OF CLINICAL SLEEP MEDICINE · 2017", title: "Binge viewing, sleep, and the role of pre-sleep arousal", authors: "Liese Exelmans & Jan Van den Bulck" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...your bed.", on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D shot starts this far in, so the gold glow flares back on "switched" */
const LEAD = ON_AT - (W[194].at - W[190].at);

const LAYERS: Layer[] = [
  { from: 0, to: 4, pic: "v-bedphone.mp4", pos: "50% 40%" }, { from: 4, to: 8, pic: "v-tired.mp4", pos: "50% 35%" }, { from: 8, to: 15, pic: "v-scroll.mp4" },
  { from: 15, to: 21, g: "onemore" }, { from: 21, to: 35, g: "rival" }, { from: 35, to: 45, g: "quote" }, { from: 45, to: 48, g: "blue" },
  { from: 48, to: 63, g: "p14" }, { from: 63, to: 76, g: "plan", cues: [66] }, { from: 76, to: 101, g: "survey", cues: [88, 98] },
  { from: 101, to: 112, g: "revenge", cues: [109] }, { from: 112, to: 120, pic: "v-office.mp4" }, { from: 120, to: 124, pic: "v-desk.mp4" },
  { from: 124, to: 141, g: "day", cues: [134] }, { from: 141, to: 145, g: "blue" }, { from: 145, to: 153, pic: "v-bedroom.mp4" },
  { from: 153, to: 156, pic: "v-window.mp4" }, { from: 156, to: 167, g: "p17" }, { from: 167, to: 190, g: "binge", cues: [175, 181, 184] },
  { from: 190, to: 200, clip: "novelty.mp4", start: 190, lead: LEAD }, { from: 200, to: 206, g: "cool" }, { from: 206, to: 216, g: "rivalEnd" },
  { from: 216, to: 999, g: "earlier", cues: [220, 226] },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 3, 3], [4, 7, 7], [8, 13, 13], [14, 14, 14], [15, 18, 20], [21, 26, 26], [27, 30, 31], [32, 34, 34], [35, 37, 38],
  [39, 42, 44], [45, 47, 47], [48, 52, 52], [53, 55, 55], [61, 61, 62], [63, 66, 66], [70, 71, 71], [76, 83, 83], [85, 91, 91],
  [92, 94, 94], [97, 99, 100], [101, 107, 107], [109, 109, 109], [112, 116, 116], [120, 122, 122], [124, 125, 126], [131, 134, 134],
  [141, 144, 144], [145, 151, 151], [153, 153, 155], [156, 159, 159], [160, 164, 164], [167, 173, 173], [174, 175, 175], [178, 181, 181],
  [184, 184, 185], [190, 194, 195], [196, 197, 199], [200, 204, 205], [206, 207, 207], [210, 214, 215], [216, 220, 221], [222, 224, 224],
  [225, 228, 228], [229, 229, 231],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 4, kind: "flash" }, { at: 15, kind: "glitch" }, { at: 21, kind: "burn" }, { at: 35, kind: "flash" }, { at: 45, kind: "glitch" },
  { at: 48, kind: "burn" }, { at: 63, kind: "flash" }, { at: 76, kind: "glitch" }, { at: 101, kind: "flash" }, { at: 112, kind: "burn" },
  { at: 124, kind: "glitch" }, { at: 145, kind: "burn" }, { at: 156, kind: "burn" }, { at: 167, kind: "flash" }, { at: 190, kind: "flash" },
  { at: 206, kind: "glitch" }, { at: 216, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [15, "pop", 0.25], [18, "pop", 0.25], [20, "pop", 0.25], [21, "paper", 0.2], [35, "whoosh", 0.25], [44, "drop", 0.35],
  [48, "paper", 0.3], [66, "riser", 0.2], [83, "pop", 0.25], [88, "pop", 0.25], [98, "subdrop", 0.25], [109, "drop", 0.35], [134, "spark", 0.3],
  [156, "paper", 0.3], [175, "pop", 0.25], [181, "pop", 0.25], [184, "chime", 0.2], [-(F(190) - LEAD + ON_AT), "spark", 0.4], [206, "glitch-a", 0.2],
  [220, "whoosh", 0.25], [226, "pop", 0.25],
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
const { musicGain: MUSIC_GAIN = 1.18 } = getInputProps() as { musicGain?: number };

export const BedtimePhone: React.FC = () => {

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
                {l.g === "onemore" ? <OneMore from={a} to={b} /> : null}
                {l.g === "rival" ? <Rival from={a} revealAt={99999} /> : null}
                {l.g === "rivalEnd" ? <Rival from={a} revealAt={a} final /> : null}
                {l.g === "quote" ? <Quote from={a} /> : null}
                {l.g === "plan" ? <Plan from={a} lateAt={F(l.cues![0])} /> : null}
                {l.g === "survey" ? <Survey from={a} linkAt={F(l.cues![0])} sleepAt={F(l.cues![1])} /> : null}
                {l.g === "revenge" ? <Revenge from={a} stampAt={F(l.cues![0])} /> : null}
                {l.g === "day" ? <Day from={a} yoursAt={F(l.cues![0])} /> : null}
                {l.g === "binge" ? <Binge from={a} worseAt={F(l.cues![0])} tiredAt={F(l.cues![1])} tvAt={F(l.cues![2])} /> : null}
                {l.g === "cool" ? <Cool from={a} to={b} /> : null}
                {l.g === "earlier" ? <Earlier from={a} moveAt={F(l.cues![0])} reachAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_twinkle_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
