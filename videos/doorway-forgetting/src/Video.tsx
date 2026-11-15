// "Why do you walk into a room and forget why you went?" in the blue explainer edit, Version B style (story flow).
// Pictures carry the feeling, motion graphics the facts, the real study pages the proof, the 3D man the inside of the head.
// Facts: Radvansky & Copeland (2006) Memory & Cognition; Radvansky, Krawietz & Tamplin (2011) QJEP;
// McFadyen et al. (2021) BMC Psychology. See SCRIPT.md and CREDITS.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { FilmStrip, FullHead, TwoPaths } from "./graphics8";
import { DOOR_BACK, DOOR_FILE } from "./DoorShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p06" | "p11" | "p21";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number] }
  | { from: number; to: number; g: "blue" | PaperId | "paths" | "film" | "full"; cues?: number[] }
  | { from: number; to: number; clip: "door_file.mp4" | "door_back.mp4"; start: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string; hl: number }> = {
  p06: { journal: "MEMORY & COGNITION · 2006", title: "Walking through doorways causes forgetting: Situation models and experienced space", authors: "Gabriel A. Radvansky & David E. Copeland", hl: 176 },
  p11: { journal: "QUARTERLY JOURNAL OF EXPERIMENTAL PSYCHOLOGY · 2011", title: "Walking through doorways causes forgetting: Further explorations", authors: "Radvansky, Krawietz & Tamplin", hl: 176 },
  p21: { journal: "BMC PSYCHOLOGY · 2021", title: "Doorways do not always cause forgetting: a multimodal investigation", authors: "McFadyen et al.", hl: 176 },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...and so does the reason", on the music's final hit */
export const END = 1930;
export const FRAMES = END + 92;

const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "d-kitchen.jpg" }, { from: 5, to: 16, pic: "d-kitchen2.jpg" },
  { from: 16, to: 25, pic: "d-forehead.jpg", pos: "70% 30%" }, { from: 25, to: 28, pic: "d-shrug.jpg", pos: "50% 30%" },
  { from: 28, to: 41, pic: "d-sofa.jpg" }, { from: 41, to: 47, g: "blue" }, { from: 47, to: 50, pic: "d-door.jpg", pos: "60% 50%", zoom: [1.0, 1.18] },
  { from: 50, to: 70, g: "p06" }, { from: 70, to: 99, g: "paths", cues: [76, 82, 91] },
  { from: 99, to: 109, g: "p11" }, { from: 109, to: 111, pic: "d-think.jpg", pos: "40% 30%" },
  { from: 111, to: 128, g: "film", cues: [122, 125] }, { from: 128, to: 153, clip: "door_file.mp4", start: 128 },
  { from: 153, to: 157, pic: "d-hall.jpg", zoom: [1.0, 1.15] }, { from: 157, to: 163, g: "p21" },
  { from: 163, to: 183, g: "full", cues: [166, 180] }, { from: 183, to: 191, pic: "d-beam.jpg", zoom: [1.0, 1.2] },
  { from: 191, to: 999, clip: "door_back.mp4", start: 191 },
];

const BEATS: Beat[] = [
  { from: 0, key: [4, 4] }, { from: 5, key: [14, 15] }, { from: 16, key: [20, 20] }, { from: 21, key: [24, 24] }, { from: 25, key: [27, 27] },
  { from: 28, key: [32, 33] }, { from: 37, key: [40, 40] }, { from: 41, key: [44, 44] }, { from: 47, key: [49, 49] },
  { from: 50, key: [51, 51] }, { from: 52, key: [55, 56] }, { from: 57, key: [60, 60] }, { from: 61, key: [68, 69] },
  { from: 70, key: [75, 75] }, { from: 76, key: [81, 81] }, { from: 82, key: [83, 83] }, { from: 84, key: [85, 85] },
  { from: 86, key: [91, 91] }, { from: 92, key: [96, 98] }, { from: 99, key: [105, 106] }, { from: 107, key: [108, 108] },
  { from: 109, key: [110, 110] }, { from: 111, key: [118, 120] }, { from: 121, key: [125, 125] }, { from: 126, key: [127, 127] },
  { from: 128, key: [130, 130] }, { from: 131, key: [134, 135] }, { from: 136, key: [138, 138] }, { from: 139, key: [142, 142] },
  { from: 143, key: [145, 145] }, { from: 146, key: [150, 150] }, { from: 153, key: [156, 156] }, { from: 157, key: [158, 158] },
  { from: 159, key: [164, 165] }, { from: 166, key: [171, 171] }, { from: 172, key: [174, 174] }, { from: 177, key: [181, 181] },
  { from: 183, key: [187, 187] }, { from: 188, key: [189, 190] }, { from: 191, key: [191, 192] }, { from: 193, key: [195, 195] },
  { from: 196, key: [198, 198] }, { from: 199, key: [199, 200] }, { from: 201, key: [205, 205] },
];

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 47, kind: "flash" }, { at: 50, kind: "burn" }, { at: 70, kind: "glitch" }, { at: 128, kind: "flash" },
  { at: 153, kind: "burn" }, { at: 163, kind: "glitch" }, { at: 191, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [47, "subdrop", 0.4], [50, "paper", 0.3], [76, "whoosh", 0.25], [91, "pop", 0.3], [99, "paper", 0.3], [122, "shutter", 0.35],
  [-(F(128) + DOOR_FILE - 4), "whoosh-film", 0.3], [-(F(128) + 200), "pop", 0.25], [153, "shiver", 0.3], [157, "paper", 0.3],
  [180, "glitch-a", 0.3], [-(F(191) + DOOR_BACK - 4), "whoosh-film", 0.3], [-(F(191) + 70), "chime", 0.35],
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
  lines.push({ kind: "serif", words: key, size: chars > 13 ? 140 : chars > 9 ? 170 : undefined });
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
const { musicGain: MUSIC_GAIN = 0.71 } = getInputProps() as { musicGain?: number };

export const Doorway: React.FC = () => {

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
                <Shot src={l.pic} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade="contrast(1.06)" />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start)} />
            ) : l.g === "p06" || l.g === "p11" || l.g === "p21" ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g].journal} title={PAPERS[l.g].title} authors={PAPERS[l.g].authors} hlHeight={PAPERS[l.g].hl} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "paths" ? <TwoPaths from={a} doorAt={F(l.cues![0])} sameAt={F(l.cues![1])} forgotAt={F(l.cues![2])} /> : null}
                {l.g === "film" ? <FilmStrip from={a} cutAt={F(l.cues![0])} labelAt={F(l.cues![1])} /> : null}
                {l.g === "full" ? <FullHead from={a} fullAt={F(l.cues![0])} wipeAt={F(l.cues![1])} /> : null}
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
        const dark = k === "p06" || k === "p11" || k === "p21";
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
