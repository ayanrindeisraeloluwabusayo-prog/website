// "Why the wait for GTA 6 felt so good" (anticipation) in the blue explainer edit, Full Blend script.
// Facts: GTA 6 trailer (Dec 2023, 90M+ views in 24 h, Guinness record); Schultz, Dayan & Montague (1997) Science 275;
// Nawijn et al. (2010) Applied Research in Quality of Life 5(1). See SCRIPT.md. No Rockstar footage, logo or art.
// The thumbnail (Thumbs.tsx, option B) is added as the first frames when the final file is muxed.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Feed, Holiday, Monkey, Views, WaitGet, Years } from "./gtg";
import { WORDS } from "./speech";
import { ON_AT } from "./NoveltyShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p97" | "p10";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "years" | "feed" | "views" | "monkey" | "waitget" | "holiday"; cues?: number[] }
  | { from: number; to: number; clip: "novelty.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p97: { journal: "SCIENCE · 1997", title: "A neural substrate of prediction and reward", authors: "Wolfram Schultz, Peter Dayan & P. Read Montague" },
  p10: { journal: "APPLIED RESEARCH IN QUALITY OF LIFE · 2010", title: "Vacationers happier, but most not happier after a holiday", authors: "Jeroen Nawijn, Miquelle Marchand, Ruut Veenhoven & Ad Vingerhoets" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...look forward to", on the music's final hit */
export const END = 2202;
export const FRAMES = END + 92;
/** the 3D shot starts this far in, so the gold glow flares back on "Find" */
const LEAD = ON_AT - (W[213].at - W[202].at);

const LAYERS: Layer[] = [
  { from: 0, to: 8, g: "years", cues: [7] }, { from: 8, to: 16, g: "feed", cues: [11, 13, 15] }, { from: 16, to: 23, pic: "v-anime.mp4" },
  { from: 23, to: 34, pic: "v-neon.mp4" }, { from: 34, to: 51, g: "views", cues: [46] }, { from: 51, to: 62, pic: "v-crowd.mp4" },
  { from: 62, to: 70, g: "blue" }, { from: 70, to: 86, g: "p97" }, { from: 86, to: 100, pic: "v-monkey.mp4" },
  { from: 100, to: 120, g: "monkey", cues: [103, 119] }, { from: 120, to: 132, g: "waitget", cues: [128, 131] }, { from: 132, to: 136, g: "blue" },
  { from: 136, to: 145, pic: "v-fireworks.mp4" }, { from: 145, to: 158, g: "p10" }, { from: 158, to: 171, pic: "v-suitcase.mp4" },
  { from: 171, to: 186, g: "holiday", cues: [172, 179] }, { from: 186, to: 195, pic: "v-queue.mp4" }, { from: 195, to: 202, pic: "v-count6.mp4" },
  { from: 202, to: 999, clip: "novelty.mp4", start: 202, lead: LEAD },
];

const BEATS: Beat[] = [
  [0, 2, 2], [3, 7, 7], [8, 11, 11], [12, 13, 13], [14, 15, 15], [16, 17, 17], [18, 22, 19], [23, 28, 29], [30, 33, 32], [34, 39, 39],
  [40, 43, 42], [44, 46, 46], [47, 50, 50], [51, 53, 52], [54, 56, 54], [57, 61, 60], [62, 66, 63], [67, 69, 69], [70, 73, 73],
  [74, 76, 75], [77, 78, 78], [79, 85, 85], [86, 88, 88], [89, 92, 92], [93, 96, 96], [97, 99, 99], [100, 105, 105], [106, 107, 107], [108, 110, 110],
  [111, 113, 113], [114, 119, 119], [120, 123, 122], [124, 128, 128], [129, 131, 131], [132, 135, 135], [136, 140, 140], [141, 144, 143],
  [145, 147, 147], [148, 149, 148], [150, 154, 154], [155, 157, 157], [158, 161, 160], [162, 170, 170], [171, 174, 174], [175, 180, 180],
  [181, 185, 184], [186, 190, 190], [191, 194, 192], [195, 196, 196], [197, 201, 201], [202, 207, 207], [208, 212, 211], [213, 216, 216],
  [217, 220, 219],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 8, kind: "glitch" }, { at: 23, kind: "burn" }, { at: 34, kind: "flash" }, { at: 62, kind: "glitch" }, { at: 70, kind: "burn" },
  { at: 100, kind: "flash" }, { at: 132, kind: "glitch" }, { at: 145, kind: "burn" }, { at: 171, kind: "flash" }, { at: 202, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [7, "chime", 0.25], [11, "pop", 0.25], [13, "pop", 0.25], [15, "pop", 0.25], [34, "riser", 0.25],
  [46, "drop", 0.35], [70, "paper", 0.3], [92, "pop", 0.25], [103, "pop", 0.25], [119, "spark", 0.3], [128, "chime", 0.2],
  [145, "paper", 0.3], [179, "subdrop", 0.25], [-(F(202) - LEAD + ON_AT), "spark", 0.4],
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
const { musicGain: MUSIC_GAIN = 0.85 } = getInputProps() as { musicGain?: number };

export const GtaWait: React.FC = () => {

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
                {l.g === "years" ? <Years from={a} doneAt={F(l.cues![0])} /> : null}
                {l.g === "feed" ? <Feed at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} /> : null}
                {l.g === "views" ? <Views from={a} recordAt={F(l.cues![0])} /> : null}
                {l.g === "monkey" ? <Monkey from={a} laterAt={F(l.cues![0])} signalAt={F(l.cues![1])} /> : null}
                {l.g === "waitget" ? <WaitGet waitAt={F(l.cues![0])} getAt={F(l.cues![1])} /> : null}
                {l.g === "holiday" ? <Holiday beforeAt={a + 4} afterAt={F(l.cues![0])} sameAt={F(l.cues![1])} /> : null}
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
