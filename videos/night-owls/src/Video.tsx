// "Study shows people who stay up late are smarter" (mosquito-style graphics), Full Blend.
// Facts: Imperial College London, BMJ Public Health (2024); Kanazawa & Perina (2009). See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Bedtime, Count, Link, Saying, Scores, Sweet } from "./owg";
import { KEY_AT } from "./OwlShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p09";
type G = "blue" | PaperId | "saying" | "count" | "scores" | "bedtime" | "sweet" | "link";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "owl3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p09: { journal: "PERSONALITY AND INDIVIDUAL DIFFERENCES · 2009", title: "Why night owls are more intelligent", authors: "Satoshi Kanazawa & Kaja Perina" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D brain lights up on "higher" */
const LEAD = KEY_AT - (W[86].at - W[82].at);

const LAYERS: Layer[] = [
  { from: 0, to: 11, pic: "v-city.mp4" }, { from: 11, to: 23, pic: "v-moon.mp4" }, { from: 23, to: 41, g: "saying", cues: [38] },
  { from: 41, to: 46, pic: "v-clock.mp4" }, { from: 46, to: 54, pic: "v-stars.mp4" }, { from: 54, to: 65, g: "count", cues: [58] },
  { from: 65, to: 74, pic: "v-crowd.mp4" }, { from: 74, to: 82, pic: "v-puzzle.mp4" }, { from: 82, to: 90, clip: "owl3d.mp4", start: 82, lead: LEAD },
  { from: 90, to: 105, g: "scores", cues: [95, 100, 90] }, { from: 105, to: 113, g: "blue" }, { from: 113, to: 120, g: "p09" },
  { from: 120, to: 128, pic: "v-phone.mp4" }, { from: 128, to: 147, g: "bedtime", cues: [139, 134] }, { from: 147, to: 151, g: "blue" },
  { from: 151, to: 158, pic: "v-question.mp4" }, { from: 158, to: 169, pic: "v-sleep.mp4" }, { from: 169, to: 188, g: "sweet", cues: [172, 177] },
  { from: 188, to: 207, g: "link", cues: [198, 204] }, { from: 207, to: 216, pic: "v-moon.mp4" }, { from: 216, to: 223, pic: "v-bed.mp4" },
  { from: 223, to: 999, pic: "v-sunrise.mp4" },
];

const BEATS: Beat[] = [
  [0, 0, 0], [5, 5, 5], [6, 7, 7], [11, 14, 14], [16, 16, 16], [21, 21, 21], [23, 23, 23], [28, 28, 28], [31, 31, 31], [36, 37, 37], [38, 38, 38], [41, 44, 44], [46, 47, 47], [48, 51, 51], [53, 53, 53], [54, 58, 58], [59, 59, 59], [64, 64, 64], [65, 69, 69], [70, 70, 70], [74, 75, 75], [78, 78, 78], [82, 85, 85], [87, 89, 89], [90, 90, 90], [95, 95, 95], [97, 100, 100], [102, 103, 103], [105, 105, 105], [108, 109, 109], [113, 114, 114], [115, 119, 119], [120, 123, 123], [125, 126, 126], [128, 128, 128], [133, 134, 134], [135, 135, 135], [139, 139, 139], [144, 146, 146], [147, 148, 148], [151, 151, 151], [156, 157, 157], [158, 161, 161], [163, 164, 164], [168, 168, 168], [169, 169, 169], [174, 174, 174], [176, 177, 177], [180, 180, 180], [182, 182, 182], [187, 187, 187], [188, 189, 189], [193, 196, 196], [198, 198, 198], [199, 201, 201], [204, 206, 206], [207, 209, 209], [212, 212, 212], [213, 213, 213], [216, 217, 217], [221, 222, 222], [223, 224, 224], [228, 229, 229],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 11, kind: "flash" }, { at: 23, kind: "burn" }, { at: 41, kind: "flash" }, { at: 46, kind: "burn" }, { at: 54, kind: "flash" }, { at: 65, kind: "burn" }, { at: 74, kind: "flash" }, { at: 82, kind: "burn" }, { at: 90, kind: "flash" }, { at: 105, kind: "burn" }, { at: 113, kind: "flash" }, { at: 120, kind: "burn" }, { at: 128, kind: "flash" }, { at: 147, kind: "glitch" }, { at: 151, kind: "flash" }, { at: 158, kind: "burn" }, { at: 169, kind: "flash" }, { at: 188, kind: "burn" }, { at: 207, kind: "flash" }, { at: 216, kind: "burn" }, { at: 223, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [38, "pop", 0.2], [58, "riser", 0.15], [-(F(82) - LEAD + KEY_AT), "spark", 0.4], [90, "pop", 0.2], [95, "pop", 0.2],
  [100, "pop", 0.2], [113, "paper", 0.3], [134, "chime", 0.2], [139, "pop", 0.2], [172, "drop", 0.15], [177, "drop", 0.15], [204, "marker", 0.2],
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
const { musicGain: MUSIC_GAIN = 0.600 } = getInputProps() as { musicGain?: number };

export const NightOwls: React.FC = () => {

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
                {l.g === "saying" ? <Saying from={a} checkAt={F(l.cues![0])} /> : null}
                {l.g === "count" ? <Count from={a} at={F(l.cues![0])} /> : null}
                {l.g === "scores" ? <Scores from={a} at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} /> : null}
                {l.g === "bedtime" ? <Bedtime from={a} lowAt={F(l.cues![0])} highAt={F(l.cues![1])} /> : null}
                {l.g === "sweet" ? <Sweet from={a} lowAt={F(l.cues![0])} highAt={F(l.cues![1])} /> : null}
                {l.g === "link" ? <Link from={a} eduAt={F(l.cues![0])} smallAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_slow_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
