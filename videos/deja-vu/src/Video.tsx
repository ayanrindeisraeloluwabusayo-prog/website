// "Déjà vu: I've lived this moment before" in the blue explainer edit, Full Blend script.
// Facts: Brown (two in three; most common 15-25); Cleary & Claxton (2018) Psychological Science 29:635-644; Urquhart,
// O'Connor et al. (St Andrews) fMRI. The Matrix only as quoted text. Thumbnail C is added at mux. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { BrainMap, Cat, Guess, MemGlitch, Replay, Rooms, Trinity, Turn, TwoThirds } from "./dvg";
import { WORDS } from "./speech";
import { CHECK_AT, SNAP_AT } from "./DejaShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p18";
type G = "blue" | PaperId | "replay" | "cat" | "trinity" | "memglitch" | "twothirds" | "rooms" | "turn" | "guess" | "brainmap";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "deja.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p18: { journal: "PSYCHOLOGICAL SCIENCE · 2018", title: "Déjà vu: An illusion of prediction", authors: "Anne M. Cleary & Alexander B. Claxton" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...its job.", on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** first 3D use: the ghost room locks on "familiar"; second: his head lights on "checking" */
const LEAD1 = SNAP_AT - (W[144].at - W[140].at);
const LEAD2 = CHECK_AT + 28 - (W[228].at - W[220].at);

const LAYERS: Layer[] = [
  { from: 0, to: 9, pic: "v-walk.mp4", pos: "50% 30%" }, { from: 9, to: 12, pic: "v-talk.mp4", pos: "50% 30%" }, { from: 12, to: 22, pic: "d-7266131.jpg", pos: "45% 50%" },
  { from: 22, to: 33, g: "replay" }, { from: 33, to: 47, g: "cat", cues: [46] }, { from: 47, to: 59, g: "trinity" },
  { from: 59, to: 68, pic: "v-kaleido.mp4" }, { from: 68, to: 74, g: "memglitch" }, { from: 74, to: 86, g: "twothirds", cues: [77] },
  { from: 86, to: 94, pic: "v-young.mp4", pos: "60% 30%" }, { from: 94, to: 97, g: "blue" }, { from: 97, to: 113, g: "p18" },
  { from: 113, to: 133, g: "rooms", cues: [121, 129] }, { from: 133, to: 140, pic: "v-door.mp4" },
  { from: 140, to: 148, clip: "deja.mp4", start: 140, lead: LEAD1 }, { from: 148, to: 153, pic: "v-darkdoor.mp4" }, { from: 153, to: 157, g: "blue" },
  { from: 157, to: 175, g: "turn", cues: [167] }, { from: 175, to: 186, g: "guess", cues: [180] }, { from: 186, to: 197, pic: "v-scan.mp4" },
  { from: 197, to: 212, g: "brainmap", cues: [202, 209] }, { from: 212, to: 220, pic: "v-neurons.mp4" },
  { from: 220, to: 230, clip: "deja.mp4", start: 220, lead: LEAD2 }, { from: 230, to: 236, pic: "v-street.mp4" }, { from: 236, to: 999, pic: "v-magnify.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 8, 8], [9, 11, 11], [12, 13, 13], [14, 17, 17], [18, 21, 21], [22, 24, 24], [25, 27, 27],
  [28, 32, 32], [33, 37, 37], [38, 43, 43], [44, 46, 46], [47, 52, 52], [53, 55, 55], [56, 58, 58], [59, 63, 63], [64, 67, 67],
  [68, 70, 70], [71, 73, 73], [74, 77, 77], [78, 82, 82], [83, 86, 86], [87, 93, 93], [94, 96, 96], [97, 98, 98], [99, 100, 100],
  [101, 104, 104], [105, 106, 106], [107, 109, 109], [110, 112, 112], [113, 117, 117], [118, 121, 121], [122, 128, 127],
  [129, 132, 132], [133, 137, 137], [138, 139, 139], [140, 141, 141], [142, 145, 145], [146, 148, 148], [149, 152, 152],
  [153, 156, 156], [157, 159, 159], [160, 163, 163], [164, 168, 167], [169, 174, 174], [175, 176, 176], [177, 179, 179],
  [180, 185, 185], [186, 190, 190], [191, 196, 196], [197, 200, 200], [201, 203, 202], [204, 207, 207], [208, 211, 211],
  [212, 214, 214], [215, 219, 218], [220, 223, 223], [224, 226, 226], [227, 229, 228], [230, 233, 233], [234, 235, 235],
  [236, 239, 239], [240, 244, 240],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 9, kind: "flash" }, { at: 12, kind: "glitch" }, { at: 22, kind: "glitch" }, { at: 33, kind: "burn" }, { at: 47, kind: "glitch" },
  { at: 59, kind: "glitch" }, { at: 68, kind: "glitch" }, { at: 74, kind: "flash" }, { at: 86, kind: "burn" }, { at: 94, kind: "glitch" },
  { at: 97, kind: "burn" }, { at: 113, kind: "flash" }, { at: 133, kind: "burn" }, { at: 140, kind: "flash" }, { at: 157, kind: "glitch" },
  { at: 175, kind: "flash" }, { at: 186, kind: "burn" }, { at: 197, kind: "flash" }, { at: 212, kind: "glitch" }, { at: 220, kind: "flash" },
  { at: 230, kind: "burn" }, { at: 236, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [22, "riser", 0.2], [35, "whoosh", 0.2], [46, "pop", 0.3], [47, "glitch-a", 0.25], [59, "glitch-b", 0.25],
  [68, "glitch-a", 0.2], [77, "chime", 0.25], [97, "paper", 0.3], [121, "pop", 0.25], [129, "subdrop", 0.25], [-(F(140) - LEAD1 + SNAP_AT), "spark", 0.4],
  [167, "riser", 0.2], [180, "drop", 0.3], [202, "pop", 0.2], [209, "chime", 0.3], [-(F(220) - LEAD2 + CHECK_AT + 28), "spark", 0.4],
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
const { musicGain: MUSIC_GAIN = 1.13 } = getInputProps() as { musicGain?: number };

export const DejaVu: React.FC = () => {

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
                {l.g === "replay" ? <Replay from={a} /> : null}
                {l.g === "cat" ? <Cat from={a} twiceAt={F(l.cues![0])} /> : null}
                {l.g === "trinity" ? <Trinity from={a} /> : null}
                {l.g === "memglitch" ? <MemGlitch from={a} /> : null}
                {l.g === "twothirds" ? <TwoThirds from={a} litAt={F(l.cues![0])} /> : null}
                {l.g === "rooms" ? <Rooms from={a} sameAt={F(l.cues![0])} forgetAt={F(l.cues![1])} /> : null}
                {l.g === "turn" ? <Turn from={a} turnAt={F(l.cues![0])} /> : null}
                {l.g === "guess" ? <Guess from={a} guessAt={F(l.cues![0])} /> : null}
                {l.g === "brainmap" ? <BrainMap memAt={F(l.cues![0])} checkAt={F(l.cues![1])} /> : null}
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
