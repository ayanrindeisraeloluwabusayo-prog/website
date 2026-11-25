// "Why you get déjà vu" in the blue explainer edit, Full Blend script (SCRIPT.md).
// Facts: Brown (2003) Psychological Bulletin 129(3):394-413; Cleary et al. (2012) Consciousness and Cognition 21:969-975;
// Cleary & Claxton (2018) Psychological Science 29(4):635-644. The Matrix (1999) is named as plain text only: no logo, no stills.
// Thumbnail C is added at mux.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Cat, Chance, FilmTitle, Freeze, Glitch, Layout, Match, Path, Real, SixTen, Stamp } from "./dvg";
import { WORDS } from "./speech";
import { MATCH_AT } from "./DoubleShot";

type Word = { w: string; at: number };
type PaperId = "p12" | "p18";
type G = "blue" | PaperId | "freeze" | "film" | "cat" | "glitch" | "sixten" | "layout" | "stamp" | "path" | "chance" | "real" | "match";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string; shiftY?: number; fill?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "double.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number] };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string; hl: number }> = {
  p12: { journal: "CONSCIOUSNESS AND COGNITION · 2012", title: "Familiarity from the configuration of objects in 3-dimensional space and its relation to déjà vu: A virtual reality investigation", authors: "Anne M. Cleary et al. · Colorado State University", hl: 120 },
  p18: { journal: "PSYCHOLOGICAL SCIENCE · 2018", title: "Déjà vu: An illusion of prediction", authors: "Anne M. Cleary & Alexander B. Claxton · Colorado State University", hl: 120 },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...before?" */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;

const LAYERS: Layer[] = [
  { from: 0, to: 9, pic: "v-door.mp4", pos: "50% 50%" }, { from: 9, to: 14, pic: "v-laugh.mp4", pos: "50% 40%" }, { from: 14, to: 24, g: "freeze", cues: [18] },
  { from: 24, to: 32, g: "film" }, { from: 32, to: 41, g: "cat", cues: [37] }, { from: 41, to: 55, g: "glitch", cues: [51] },
  { from: 55, to: 71, g: "sixten", cues: [57, 66] }, { from: 71, to: 90, g: "p12" }, { from: 90, to: 108, pic: "v-game.mp4" },
  { from: 108, to: 136, g: "layout", cues: [120, 130, 133] }, { from: 136, to: 143, pic: "v-memory.mp4" }, { from: 143, to: 154, g: "stamp", cues: [152] },
  { from: 154, to: 168, clip: "double.mp4", start: 154, lead: 0 }, { from: 168, to: 180, pic: "v-face.mp4", pos: "50% 40%", shiftY: 330, fill: "#2d3023" }, { from: 180, to: 184, g: "blue" },
  { from: 184, to: 197, pic: "v-path.mp4" }, { from: 197, to: 203, g: "p18" }, { from: 203, to: 218, g: "path", cues: [217] },
  { from: 218, to: 228, g: "chance", cues: [221] }, { from: 228, to: 237, g: "real", cues: [236] }, { from: 237, to: 246, pic: "v-crowd.mp4" },
  { from: 246, to: 255, g: "match", cues: [253] }, { from: 255, to: 264, pic: "v-stare.mp4", pos: "50% 30%", shiftY: 400, fill: "#1c1c1c" }, { from: 264, to: 999, pic: "v-arch.mp4" },
];

// [first word, key word from, key word to]
const BEATS: Beat[] = [
  [0, 7, 8], [9, 10, 10], [11, 13, 13], [14, 17, 17], [18, 23, 23], [24, 27, 27], [32, 40, 40], [41, 42, 42], [45, 46, 47], [50, 51, 51],
  [55, 57, 59], [60, 64, 65], [66, 66, 67], [71, 73, 73], [74, 75, 76], [77, 78, 79], [81, 89, 89], [90, 93, 93], [94, 98, 99], [100, 105, 107],
  [108, 117, 117], [118, 120, 121], [124, 125, 126], [127, 130, 131], [132, 135, 135], [136, 139, 139], [143, 144, 145], [149, 152, 153],
  [154, 158, 158], [159, 164, 164], [168, 175, 175], [176, 178, 178], [180, 183, 183], [184, 184, 185], [191, 195, 196], [197, 198, 198],
  [203, 207, 208], [209, 211, 211], [212, 217, 217], [218, 220, 220], [221, 226, 227], [228, 233, 233], [234, 236, 236], [237, 242, 242],
  [246, 248, 248], [249, 251, 251], [255, 258, 258], [259, 260, 260], [264, 269, 269],
].map(([from, a, b]) => ({ from, key: [a, b] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 9, kind: "flash" }, { at: 14, kind: "glitch" }, { at: 24, kind: "burn" }, { at: 41, kind: "glitch" }, { at: 55, kind: "flash" },
  { at: 71, kind: "burn" }, { at: 90, kind: "flash" }, { at: 108, kind: "burn" }, { at: 136, kind: "glitch" }, { at: 154, kind: "flash" },
  { at: 168, kind: "burn" }, { at: 184, kind: "flash" }, { at: 197, kind: "burn" }, { at: 218, kind: "glitch" }, { at: 237, kind: "glitch" },
  { at: 246, kind: "flash" }, { at: 264, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [17, "drop", 0.3], [18, "shiver", 0.25], [37, "pop", 0.25], [51, "glitch-a", 0.3], [57, "chime", 0.25],
  [71, "paper", 0.3], [130, "pop", 0.25], [133, "pop", 0.25], [152, "drop", 0.3], [-(F(154) + MATCH_AT), "spark", 0.4],
  [197, "paper", 0.3], [217, "whoosh", 0.25], [221, "pop", 0.25], [236, "drop", 0.3], [253, "shiver", 0.25],
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
const { musicGain: MUSIC_GAIN = 0.76, noVoice = false } = getInputProps() as { musicGain?: number; noVoice?: boolean };
/** one beat of silence just before "But here's the twist" */
const DROP: [number, number] = [F(180) - 15, F(183) + 2];

export const DejaVu: React.FC = () => {
  const talking = (x: number) => W.some((w, i) => x >= w.at - 4 && x < Math.min(i + 1 < W.length ? W[i + 1].at : w.at + 20, w.at + 20) + 4);
  const musicLevel = (x: number) => {
    let duck = 0;
    for (let d = -6; d <= 6; d += 2) duck += talking(x + d) ? 1 : 0;
    let lv = 0.3 - 0.08 * (duck / 7);
    if (x < 6) lv *= x / 6;
    if (x >= DROP[0] - 3 && x < DROP[1]) lv *= Math.max(0, Math.min(1, (DROP[0] - x) / 3));
    if (x > END + 50) lv *= Math.max(0, 1 - (x - END - 50) / 40);
    return lv * MUSIC_GAIN;
  };
  const layerAt = (x: number) => LAYERS.find((l) => x >= F(l.from) && x < F(l.to));
  const kindOf = (l?: Layer) => (!l ? "none" : "pic" in l ? "pic" : "clip" in l ? "clip" : l.g);
  const cue = (l: Layer, i: number) => F(("cues" in l && l.cues ? l.cues : [])[i]);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />
      {LAYERS.map((l, i) => {
        const a = F(l.from), b = F(l.to);
        return (
          <Scene key={i} from={a} to={b}>
            {"pic" in l ? (
              <>
                <Shot src={l.pic} video={l.pic.endsWith(".mp4")} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade={l.grade ?? "contrast(1.06)"} shiftY={l.shiftY} fill={l.fill} />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start) - (l.lead ?? 0)} />
            ) : l.g in PAPERS ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g as PaperId].journal} title={PAPERS[l.g as PaperId].title} authors={PAPERS[l.g as PaperId].authors} hlHeight={PAPERS[l.g as PaperId].hl} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "freeze" ? <Freeze from={a} againAt={cue(l, 0)} /> : null}
                {l.g === "film" ? <FilmTitle from={a} /> : null}
                {l.g === "cat" ? <Cat from={a} twiceAt={cue(l, 0)} /> : null}
                {l.g === "glitch" ? <Glitch from={a} at={cue(l, 0)} /> : null}
                {l.g === "sixten" ? <SixTen from={a} at={cue(l, 0)} youngAt={cue(l, 1)} /> : null}
                {l.g === "layout" ? <Layout from={a} likeAt={cue(l, 0)} placesAt={cue(l, 1)} diffAt={cue(l, 2)} /> : null}
                {l.g === "stamp" ? <Stamp from={a} at={cue(l, 0)} /> : null}
                {l.g === "path" ? <Path from={a} turnAt={cue(l, 0)} /> : null}
                {l.g === "chance" ? <Chance from={a} at={cue(l, 0)} /> : null}
                {l.g === "real" ? <Real from={a} wasntAt={cue(l, 0)} /> : null}
                {l.g === "match" ? <Match from={a} nameAt={cue(l, 0)} /> : null}
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
          </Scene>
        );
      })}

      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {CUTS.map((c, i) => (c.kind === "burn" ? <FilmBurn key={i} at={F(c.at) - 5} /> : c.kind === "flash" ? <InvertFlash key={i} at={F(c.at) - 2} /> : <PixelGlitch key={i} at={F(c.at) - 4} />))}

      {noVoice ? null : <Audio src={staticFile("media/voice.mp3")} />}
      <Audio src={staticFile("music_twinkle_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
