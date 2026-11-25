// "Why you think everybody noticed your mistake" (the spotlight effect) in the blue explainer edit, Full Blend script.
// Facts: Gilovich, Medvec & Savitsky (2000) JPSP 78(2):211-222 (Cornell): wearers expected about half to notice, fewer than a
// quarter did; a proud-shirt rerun gave a similar overestimate. The singer is never named or shown. Thumbnail C is added at mux.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { AllEyes, Detail, Most, Named, Room, Same, Shirt, Twice } from "./spg";
import { WORDS } from "./speech";
import { RING_AT } from "./SpotShot";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p00";
type G = "blue" | PaperId | "alleyes" | "shirt" | "guess" | "actual" | "twice" | "named" | "detail" | "same" | "most";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "spot.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p00: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 2000", title: "The spotlight effect in social judgment", authors: "Thomas Gilovich, Victoria Husted Medvec & Kenneth Savitsky" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...themselves.", on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the second 3D use starts this far in, so the other spotlights switch on at "everyone else" */
const LEAD = RING_AT - (W[202].at - W[193].at);

const LAYERS: Layer[] = [
  { from: 0, to: 8, pic: "v-stairs.mp4" }, { from: 8, to: 12, pic: "v-cringe.mp4" }, { from: 12, to: 25, pic: "v-party.mp4", pos: "50% 35%" },
  { from: 25, to: 32, pic: "v-door.mp4" }, { from: 32, to: 40, g: "alleyes", cues: [37] }, { from: 40, to: 49, g: "p00" },
  { from: 49, to: 55, pic: "v-print.mp4" }, { from: 55, to: 65, g: "shirt", cues: [55] }, { from: 65, to: 74, pic: "v-friends.mp4" },
  { from: 74, to: 89, g: "guess", cues: [83] }, { from: 89, to: 92, g: "blue" }, { from: 92, to: 109, g: "actual", cues: [98] },
  { from: 109, to: 119, g: "twice", cues: [111] }, { from: 119, to: 125, g: "named" }, { from: 125, to: 133, clip: "spot.mp4", start: 125, lead: 0 },
  { from: 133, to: 142, pic: "v-spot.mp4" }, { from: 142, to: 157, g: "detail", cues: [149] }, { from: 157, to: 161, g: "blue" },
  { from: 161, to: 180, g: "same", cues: [171, 179] }, { from: 180, to: 193, pic: "v-crowd.mp4" }, { from: 193, to: 211, clip: "spot.mp4", start: 193, lead: LEAD },
  { from: 211, to: 220, pic: "v-crossing.mp4" }, { from: 220, to: 226, g: "most" }, { from: 226, to: 999, pic: "v-phone.mp4", pos: "50% 30%" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 7, 7], [8, 11, 11], [12, 16, 16], [17, 18, 18], [19, 21, 21], [22, 24, 24], [25, 28, 28], [29, 31, 31],
  [32, 36, 36], [37, 39, 39], [40, 41, 41], [42, 44, 45], [46, 48, 48], [49, 51, 51], [52, 55, 55], [56, 56, 56], [57, 61, 61],
  [62, 64, 62], [65, 69, 69], [70, 73, 73], [74, 76, 76], [77, 80, 80], [81, 83, 83], [84, 88, 87], [89, 91, 91], [92, 97, 97],
  [98, 101, 101], [102, 108, 108], [109, 111, 111], [112, 114, 114], [115, 118, 117], [119, 121, 121], [122, 124, 123],
  [125, 129, 129], [130, 132, 132], [133, 137, 137], [138, 141, 141], [142, 145, 145], [146, 149, 149], [150, 156, 153],
  [157, 160, 160], [161, 164, 164], [165, 171, 171], [172, 175, 179], [180, 182, 182], [183, 187, 186], [188, 192, 189],
  [193, 196, 196], [197, 200, 200], [201, 205, 205], [206, 210, 210], [211, 214, 214], [215, 219, 217], [220, 224, 224],
  [225, 230, 230], [231, 235, 233], [236, 238, 238],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 8, kind: "flash" }, { at: 12, kind: "glitch" }, { at: 25, kind: "burn" }, { at: 32, kind: "flash" }, { at: 40, kind: "burn" },
  { at: 49, kind: "glitch" }, { at: 65, kind: "burn" }, { at: 74, kind: "flash" }, { at: 89, kind: "glitch" }, { at: 109, kind: "flash" },
  { at: 119, kind: "burn" }, { at: 125, kind: "flash" }, { at: 142, kind: "glitch" }, { at: 161, kind: "burn" }, { at: 180, kind: "flash" },
  { at: 193, kind: "flash" }, { at: 211, kind: "burn" }, { at: 220, kind: "glitch" }, { at: 226, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [1, "drop", 0.25], [37, "shiver", 0.3], [40, "paper", 0.3], [55, "drop", 0.3], [83, "chime", 0.25],
  [98, "subdrop", 0.3], [111, "pop", 0.3], [119, "lamp", 0.35], [149, "glitch-a", 0.2], [171, "pop", 0.3], [179, "drop", 0.3],
  [-(F(193) - LEAD + RING_AT), "spark", 0.4], [220, "pop", 0.25],
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
const { musicGain: MUSIC_GAIN = 0.74 } = getInputProps() as { musicGain?: number };

export const SpotlightEffect: React.FC = () => {

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
                {l.g === "alleyes" ? <AllEyes from={a} turnAt={F(l.cues![0])} /> : null}
                {l.g === "shirt" ? <Shirt from={a} stampAt={F(l.cues![0]) + 6} /> : null}
                {l.g === "guess" ? <Room from={a} at={F(l.cues![0])} pct={0.5} label="THE SHIRT-WEARERS GUESSED" /> : null}
                {l.g === "actual" ? <Room from={a} at={F(l.cues![0])} pct={0.22} label="WHO COULD NAME THE SHIRT" prefix="<" /> : null}
                {l.g === "twice" ? <Twice from={a} twiceAt={F(l.cues![0])} /> : null}
                {l.g === "named" ? <Named from={a} /> : null}
                {l.g === "detail" ? <Detail from={a} mistakeAt={F(l.cues![0])} /> : null}
                {l.g === "same" ? <Same from={a} proudAt={F(l.cues![0])} sameAt={F(l.cues![1])} /> : null}
                {l.g === "most" ? <Most from={a} /> : null}
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
