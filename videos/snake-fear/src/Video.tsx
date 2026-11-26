// "Are we born scared of snakes and spiders?" (mosquito-style graphics), Full Blend.
// Facts: Hoehl et al. (2017) Frontiers in Psychology; DeLoache & LoBue (2009); Mineka et al. (1984), Cook & Mineka (1989). See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Lane, Learned, Pics, Pupil, Voices } from "./sng";
import { KEY_AT } from "./AlertShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p17";
type G = "blue" | PaperId | "pics" | "pupil" | "voices" | "lane" | "learned";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "alert3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p17: { journal: "FRONTIERS IN PSYCHOLOGY · 2017 · MAX PLANCK INSTITUTE, LEIPZIG", title: "Itsy bitsy spider…: Infants react with increased arousal to spiders and snakes", authors: "Stefanie Hoehl, Kahl Hellmer, Maria Johansson & Gustaf Gredebäck" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D head reacts on "quickly" */
const LEAD = KEY_AT - (W[218].at - W[211].at);

const LAYERS: Layer[] = [
  { from: 0, to: 6, pic: "v-spider.mp4" }, { from: 6, to: 13, pic: "v-web.mp4" }, { from: 13, to: 24, pic: "v-jungle.mp4" }, { from: 24, to: 31, pic: "v-snake.mp4" },
  { from: 31, to: 39, pic: "v-green.mp4" }, { from: 39, to: 48, pic: "v-python.mp4" }, { from: 48, to: 54, g: "blue" }, { from: 54, to: 64, g: "p17" },
  { from: 64, to: 77, g: "pics", cues: [69, 74] }, { from: 77, to: 94, g: "pupil", cues: [81] }, { from: 94, to: 98, g: "blue" },
  { from: 98, to: 110, pic: "v-toddler.mp4", pos: "50% 35%" }, { from: 110, to: 140, g: "voices", cues: [118, 121, 125, 137] }, { from: 140, to: 154, g: "lane", cues: [149] },
  { from: 154, to: 165, pic: "v-macaque.mp4", pos: "50% 40%" }, { from: 165, to: 180, pic: "v-monkey.mp4", pos: "50% 40%" }, { from: 180, to: 201, g: "learned", cues: [183, 192, 196] },
  { from: 201, to: 211, pic: "v-flowers.mp4" }, { from: 211, to: 219, clip: "alert3d.mp4", start: 211, lead: LEAD }, { from: 219, to: 227, pic: "v-web.mp4" },
  { from: 227, to: 999, pic: "v-toddler.mp4", pos: "50% 35%" },
];

const BEATS: Beat[] = [
  [0, 2, 2], [3, 5, 5], [6, 8, 8], [9, 12, 12], [13, 16, 16], [17, 21, 21], [22, 24, 24], [25, 30, 30], [31, 32, 32], [33, 35, 35],
  [39, 41, 41], [42, 42, 42], [48, 53, 51], [54, 55, 55], [56, 63, 63], [64, 66, 66], [67, 71, 71], [72, 76, 74], [77, 81, 81],
  [82, 86, 86], [87, 93, 93], [94, 97, 97], [98, 101, 101], [102, 106, 106], [107, 109, 109], [110, 114, 114], [115, 122, 121],
  [123, 128, 125], [129, 133, 133], [134, 139, 138], [140, 146, 146], [147, 150, 150], [154, 158, 158], [159, 160, 160], [165, 172, 170],
  [173, 179, 179], [180, 185, 185], [186, 194, 194], [195, 196, 196], [201, 206, 206], [207, 210, 210], [211, 218, 218], [219, 224, 224],
  [225, 226, 226], [227, 228, 228],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 6, kind: "flash" }, { at: 13, kind: "burn" }, { at: 24, kind: "glitch" }, { at: 31, kind: "flash" }, { at: 39, kind: "burn" },
  { at: 48, kind: "flash" }, { at: 54, kind: "burn" }, { at: 64, kind: "flash" }, { at: 77, kind: "burn" }, { at: 94, kind: "glitch" },
  { at: 98, kind: "burn" }, { at: 110, kind: "flash" }, { at: 140, kind: "burn" }, { at: 154, kind: "flash" }, { at: 165, kind: "burn" },
  { at: 180, kind: "flash" }, { at: 201, kind: "burn" }, { at: 211, kind: "flash" }, { at: 219, kind: "burn" }, { at: 227, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [8, "shiver", 0.25], [24, "glitch-a", 0.2], [54, "paper", 0.3], [69, "pop", 0.2], [74, "pop", 0.15], [81, "chime", 0.2],
  [121, "shiver", 0.15], [125, "pop", 0.2], [137, "drop", 0.2], [149, "whoosh", 0.25], [183, "pop", 0.2], [196, "drop", 0.2],
  [-(F(211) - LEAD + KEY_AT), "spark", 0.4],
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

export const SnakeFear: React.FC = () => {

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
                {l.g === "pics" ? <Pics from={a} scaryAt={F(l.cues![0])} calmAt={F(l.cues![1])} /> : null}
                {l.g === "pupil" ? <Pupil from={a} at={F(l.cues![0])} /> : null}
                {l.g === "voices" ? <Voices from={a} happyAt={F(l.cues![0])} scaredAt={F(l.cues![1])} longerAt={F(l.cues![2])} noAt={F(l.cues![3])} /> : null}
                {l.g === "lane" ? <Lane from={a} at={F(l.cues![0])} /> : null}
                {l.g === "learned" ? <Learned from={a} snakeAt={F(l.cues![0])} flowerAt={F(l.cues![1])} neverAt={F(l.cues![2])} /> : null}
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
