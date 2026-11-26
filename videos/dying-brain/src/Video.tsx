// "What happens in your brain when you die" (mosquito-style graphics), Full Blend.
// Facts: van Lommel et al. (2001) Lancet; Xu, Borjigin et al. (2023) PNAS; Vrselja et al. (2019) Nature. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Eeg, Nde, Pig } from "./dbg";
import { KEY_AT } from "./GammaShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p23";
type G = "blue" | PaperId | "nde" | "eeg" | "gamma" | "pig";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "gamma3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p23: { journal: "PNAS · 2023 · UNIVERSITY OF MICHIGAN", title: "Surge of neurophysiological coupling and connectivity of gamma oscillations in the dying human brain", authors: "Gang Xu, Temenuzhka Mihaylova, Duan Li, Jimo Borjigin et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D brain lights up on "lit (up)" */
const LEAD = KEY_AT - (W[134].at - W[125].at);

const LAYERS: Layer[] = [
  { from: 0, to: 3, pic: "v-monitor.mp4" }, { from: 3, to: 6, pic: "v-candle.mp4" }, { from: 6, to: 13, pic: "v-room.mp4" }, { from: 13, to: 24, pic: "v-lamp.mp4" },
  { from: 24, to: 38, pic: "v-clouds.mp4" }, { from: 38, to: 51, pic: "v-particles.mp4" }, { from: 51, to: 57, g: "blue" }, { from: 57, to: 83, g: "nde", cues: [73] },
  { from: 83, to: 94, pic: "v-ward.mp4" }, { from: 94, to: 107, g: "p23" }, { from: 107, to: 121, g: "eeg", cues: [119] }, { from: 121, to: 125, g: "blue" },
  { from: 125, to: 136, clip: "gamma3d.mp4", start: 125, lead: LEAD }, { from: 136, to: 156, g: "gamma", cues: [147, 150] }, { from: 156, to: 171, pic: "v-neurons.mp4" },
  { from: 171, to: 179, pic: "v-candle.mp4" }, { from: 179, to: 208, g: "pig", cues: [191, 197, 204] }, { from: 208, to: 217, pic: "v-lamp.mp4" },
  { from: 217, to: 225, pic: "v-particles.mp4" }, { from: 225, to: 999, pic: "v-sunset.mp4" },
];

const BEATS: Beat[] = [
  [0, 2, 2], [3, 5, 5], [6, 12, 11], [13, 16, 16], [17, 20, 19], [21, 23, 23], [24, 27, 27], [28, 32, 32], [33, 37, 37], [38, 42, 42],
  [43, 45, 45], [46, 50, 48], [51, 53, 53], [54, 56, 56], [57, 60, 60], [61, 63, 63], [64, 66, 65], [67, 72, 72], [73, 76, 76], [77, 78, 77],
  [79, 81, 81], [83, 86, 86], [87, 93, 93], [94, 96, 96], [97, 98, 98], [99, 106, 106], [107, 110, 110], [111, 113, 113], [114, 120, 119],
  [121, 124, 124], [125, 128, 126], [129, 132, 132], [133, 135, 134], [136, 141, 140], [142, 144, 144], [147, 147, 147], [148, 155, 155],
  [156, 161, 161], [163, 167, 167], [171, 176, 176], [177, 178, 178], [179, 183, 183], [184, 190, 190], [191, 194, 192], [195, 198, 198],
  [201, 207, 207], [208, 216, 215], [217, 224, 222], [225, 234, 232], [235, 236, 236], [237, 245, 243],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 3, kind: "flash" }, { at: 6, kind: "burn" }, { at: 13, kind: "flash" }, { at: 24, kind: "burn" }, { at: 38, kind: "flash" },
  { at: 51, kind: "burn" }, { at: 57, kind: "flash" }, { at: 83, kind: "burn" }, { at: 94, kind: "flash" }, { at: 107, kind: "burn" },
  { at: 121, kind: "glitch" }, { at: 125, kind: "burn" }, { at: 136, kind: "flash" }, { at: 156, kind: "burn" }, { at: 171, kind: "flash" },
  { at: 179, kind: "burn" }, { at: 208, kind: "flash" }, { at: 217, kind: "burn" }, { at: 225, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [2, "subdrop", 0.25], [20, "lamp", 0.25], [42, "shiver", 0.2], [73, "chime", 0.2], [94, "paper", 0.3],
  [119, "drop", 0.25], [-(F(125) - LEAD + KEY_AT), "spark", 0.45], [147, "riser", 0.2], [191, "marker", 0.2], [197, "pop", 0.2], [204, "drop", 0.2],
  [215, "lamp", 0.2],
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

export const DyingBrain: React.FC = () => {

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
                {l.g === "nde" ? <Nde from={a} litAt={F(l.cues![0])} /> : null}
                {l.g === "eeg" ? <Eeg from={a} offAt={F(l.cues![0])} /> : null}
                {l.g === "gamma" ? <Eeg from={a - 60} offAt={a - 60} surgeAt={F(l.cues![0])} zoneAt={F(l.cues![1])} /> : null}
                {l.g === "pig" ? <Pig from={a} hoursAt={F(l.cues![0])} cellsAt={F(l.cues![1])} noAt={F(l.cues![2])} /> : null}
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
