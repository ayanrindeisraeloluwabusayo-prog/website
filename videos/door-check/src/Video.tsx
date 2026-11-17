// "Why do you check the door is locked, and then feel less sure?" in the blue explainer edit, Full Blend script
// (no star: no famous quote could be verified). Facts: van den Hout & Kindt (2003) and Radomsky, Gilchrist & Dussault
// (2006), both Behaviour Research and Therapy. See SCRIPT.md. 3D man: the current three.js style (the owner's choice).
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Checks, MoreLess, SameAccuracy } from "./graphics11";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p03" | "p06";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "checks" | "same" | "moreless"; cues?: number[] }
  | { from: number; to: number; clip: "lock_sharp.mp4" | "lock_blur.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p03: { journal: "BEHAVIOUR RESEARCH AND THERAPY · 2003", title: "Repeated checking causes memory distrust", authors: "Marcel van den Hout & Merel Kindt" },
  p06: { journal: "BEHAVIOUR RESEARCH AND THERAPY · 2006", title: "Repeated checking really does cause memory distrust", authors: "Radomsky, Gilchrist & Dussault" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...less sure", on the music's final hit */
export const END = 1776;
export const FRAMES = END + 92;
/** frame inside lock_blur.mp4 where the memory starts to blur (set to land on "gone blurry") */
export const BLUR_AT = 122;

const LAYERS: Layer[] = [
  { from: 0, to: 4, pic: "k-lock.jpg", pos: "40% 50%" }, { from: 4, to: 7, pic: "k-walk.jpg" },
  { from: 7, to: 22, clip: "lock_sharp.mp4", start: 7 }, { from: 22, to: 28, pic: "k-knob.jpg", pos: "62% 50%", zoom: [1.0, 1.2] },
  { from: 28, to: 32, pic: "k-walk.jpg", zoom: [1.2, 1.05] }, { from: 32, to: 41, pic: "k-doubt.jpg", pos: "55% 30%" },
  { from: 41, to: 58, g: "p03" }, { from: 58, to: 73, pic: "k-stove.jpg", zoom: [1.0, 1.18] },
  { from: 73, to: 88, g: "checks", cues: [83, 86] }, { from: 88, to: 112, g: "same", cues: [99, 106] },
  { from: 112, to: 142, clip: "lock_blur.mp4", start: 112 }, { from: 142, to: 148, g: "p06" },
  { from: 148, to: 160, pic: "k-kitchen.jpg", pos: "30% 50%" }, { from: 160, to: 172, g: "moreless", cues: [162, 166] },
  { from: 172, to: 180, pic: "k-knob.jpg", pos: "62% 50%", zoom: [1.15, 1.3] }, { from: 180, to: 999, pic: "k-path.jpg", zoom: [1.0, 1.15] },
];

const BEATS: Beat[] = [
  { from: 0, key: [1, 1] }, { from: 4, key: [5, 6] }, { from: 7, key: [8, 9] }, { from: 11, key: [12, 12] }, { from: 17, key: [19, 21] },
  { from: 22, key: [24, 25] }, { from: 26, key: [27, 27] }, { from: 28, key: [31, 31] }, { from: 32, key: [37, 38] },
  { from: 41, key: [43, 43] }, { from: 44, key: [45, 46] }, { from: 47, key: [50, 50] }, { from: 51, key: [53, 53] }, { from: 54, key: [57, 57] },
  { from: 58, key: [61, 62] }, { from: 63, key: [67, 68] }, { from: 69, key: [71, 72] }, { from: 73, key: [77, 79] }, { from: 80, key: [81, 81] },
  { from: 83, key: [83, 85] }, { from: 86, key: [86, 87] }, { from: 88, key: [89, 90] }, { from: 91, key: [93, 93] }, { from: 96, key: [97, 97] },
  { from: 98, key: [99, 101] }, { from: 105, key: [106, 107] }, { from: 112, key: [115, 115] }, { from: 116, key: [119, 119] },
  { from: 121, key: [123, 123] }, { from: 124, key: [126, 127] }, { from: 128, key: [130, 130] }, { from: 131, key: [132, 133] },
  { from: 134, key: [135, 136] }, { from: 137, key: [139, 139] }, { from: 142, key: [143, 144] }, { from: 146, key: [146, 147] },
  { from: 148, key: [153, 154] }, { from: 155, key: [157, 158] }, { from: 160, key: [164, 164] }, { from: 165, key: [168, 168] },
  { from: 172, key: [174, 175] }, { from: 176, key: [179, 179] }, { from: 180, key: [181, 182] }, { from: 183, key: [184, 185] },
  { from: 186, key: [189, 189] }, { from: 190, key: [194, 195] },
];

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 17, kind: "flash" }, { at: 41, kind: "burn" }, { at: 73, kind: "glitch" }, { at: 112, kind: "flash" },
  { at: 142, kind: "burn" }, { at: 172, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [17, "subdrop", 0.4], [41, "paper", 0.3], [81, "pop", 0.2], [83, "pop", 0.2], [86, "pop", 0.3], [99, "pop", 0.25], [115, "shiver", 0.3],
  [-(F(112) + BLUR_AT), "glitch-a", 0.3], [142, "paper", 0.3], [162, "riser", 0.2], [175, "chime", 0.3],
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
const { musicGain: MUSIC_GAIN = 0.845 } = getInputProps() as { musicGain?: number };

export const DoorCheck: React.FC = () => {

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
                <Shot src={l.pic} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade={l.grade ?? "contrast(1.06)"} />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "clip" in l ? (
              <Clip src={l.clip} at={F(l.start) - (l.lead ?? 0)} />
            ) : l.g === "p03" || l.g === "p06" ? (
              <>
                <Paper />
                <StudyPage from={a} highlightAt={a + 20} journal={PAPERS[l.g].journal} title={PAPERS[l.g].title} authors={PAPERS[l.g].authors} hlHeight={120} />
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "checks" ? <Checks from={a} againAt={F(l.cues![0])} twentyAt={F(l.cues![1])} /> : null}
                {l.g === "same" ? <SameAccuracy from={a} sameAt={F(l.cues![0])} knewAt={F(l.cues![1])} /> : null}
                {l.g === "moreless" ? <MoreLess from={a} moreAt={F(l.cues![0])} lessAt={F(l.cues![1])} /> : null}
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
        const dark = k === "p03" || k === "p06";
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
      <Audio src={staticFile("music_spooky.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
