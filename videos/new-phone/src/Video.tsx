// "Why the new phone stops feeling exciting" (hedonic adaptation) in the blue explainer edit, Full Blend script.
// Facts: first iPhone queues (June 2007); Brickman, Coates & Janoff-Bulman (1978) JPSP 36(8); Nelson, Meyvis & Galak (2009)
// JCR 36. See SCRIPT.md. 3D man: the current three.js style (the owner's choice).
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Curve, Lottery, Meter, TV } from "./npg";
import { WORDS } from "./speech";
import { OFF_AT, ON_AT } from "./NoveltyShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p78" | "p09";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "meter" | "curve" | "saw" | "lottery" | "tv"; cues?: number[] }
  | { from: number; to: number; clip: "novelty.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p78: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1978", title: "Lottery winners and accident victims: Is happiness relative?", authors: "Philip Brickman, Dan Coates & Ronnie Janoff-Bulman" },
  p09: { journal: "JOURNAL OF CONSUMER RESEARCH · 2009", title: "Enhancing the television-viewing experience through commercial interruptions", authors: "Leif D. Nelson, Tom Meyvis & Jeff Galak" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...feel new again", on the music's final hit */
export const END = 2330;
export const FRAMES = END + 92;
/** the second use of the 3D shot starts this far into it, so the screen goes dark on "from it" and the glow returns on "new" */
const LEAD_B = 120;

const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-unbox.mp4" }, { from: 5, to: 9, pic: "v-tap.mp4" }, { from: 9, to: 23, g: "meter", cues: [13, 15] },
  { from: 23, to: 32, pic: "v-queue.mp4" }, { from: 32, to: 46, pic: "v-wait.mp4" }, { from: 46, to: 60, pic: "v-hand.mp4" },
  { from: 60, to: 66, g: "curve" }, { from: 66, to: 74, g: "p78" }, { from: 74, to: 89, pic: "v-money.mp4" },
  { from: 89, to: 99, pic: "v-confetti.mp4" }, { from: 99, to: 122, g: "lottery", cues: [102, 108, 116, 121] },
  { from: 122, to: 133, clip: "novelty.mp4", start: 122 }, { from: 133, to: 137, g: "blue" }, { from: 137, to: 143, pic: "v-beach.mp4" },
  { from: 143, to: 151, g: "p09" }, { from: 151, to: 179, g: "tv", cues: [167, 174] }, { from: 179, to: 188, g: "saw" },
  { from: 188, to: 197, pic: "v-wait.mp4", zoom: [1.15, 1.0] }, { from: 197, to: 204, pic: "v-friends.mp4" }, { from: 204, to: 216, pic: "v-bored.mp4" },
  { from: 216, to: 999, clip: "novelty.mp4", start: 216, lead: LEAD_B },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 6, 6], [7, 8, 8], [9, 10, 10], [11, 14, 14], [15, 17, 17], [18, 22, 22], [23, 25, 27], [28, 31, 31],
  [32, 34, 34], [35, 38, 38], [39, 41, 41], [42, 45, 45], [46, 50, 50], [51, 54, 54], [55, 59, 59], [60, 63, 63], [64, 65, 65],
  [66, 68, 68], [69, 70, 70], [71, 73, 73], [74, 80, 80], [81, 84, 84], [85, 88, 88], [89, 94, 94], [95, 97, 98], [99, 103, 103],
  [104, 108, 108], [109, 111, 112], [113, 117, 117], [118, 121, 121], [122, 125, 125], [126, 128, 128], [129, 132, 132], [133, 136, 136],
  [137, 138, 138], [139, 142, 142], [143, 144, 144], [145, 146, 146], [147, 150, 150], [151, 154, 154], [155, 157, 157], [158, 164, 164],
  [165, 167, 169], [170, 173, 173], [174, 176, 178], [179, 181, 181], [182, 185, 187], [188, 192, 192], [193, 196, 196], [197, 200, 200],
  [201, 203, 203], [204, 207, 208], [209, 212, 212], [213, 214, 215], [216, 218, 218], [219, 222, 223], [224, 225, 226],
].map(([from, a, b]) => ({ from, key: [a, b] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 9, kind: "flash" }, { at: 23, kind: "burn" }, { at: 60, kind: "glitch" }, { at: 66, kind: "burn" }, { at: 99, kind: "flash" },
  { at: 122, kind: "flash" }, { at: 133, kind: "glitch" }, { at: 143, kind: "burn" }, { at: 179, kind: "flash" }, { at: 216, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.25], [13, "chime", 0.2], [15, "subdrop", 0.3], [66, "paper", 0.3], [102, "pop", 0.25], [108, "pop", 0.25],
  [116, "pop", 0.2], [121, "pop", 0.2], [143, "paper", 0.3], [167, "chime", 0.25], [174, "glitch-a", 0.2],
  [-(F(216) - LEAD_B + OFF_AT), "marker", 0.3], [-(F(216) - LEAD_B + ON_AT), "spark", 0.4],
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

export const NewPhone: React.FC = () => {

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
                {l.g === "meter" ? <Meter from={a} fullAt={F(l.cues![0])} dropAt={F(l.cues![1])} /> : null}
                {l.g === "curve" ? <Curve from={a} /> : null}
                {l.g === "saw" ? <Curve from={a} saw /> : null}
                {l.g === "lottery" ? <Lottery sameAt={F(l.cues![0])} lessAt={F(l.cues![1])} jokeAt={F(l.cues![2])} compAt={F(l.cues![3])} /> : null}
                {l.g === "tv" ? <TV from={a} moreAt={F(l.cues![0])} skipAt={F(l.cues![1])} /> : null}
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
