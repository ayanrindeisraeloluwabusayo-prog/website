// "People would rather shock themselves than sit alone with their thoughts" (mosquito-style graphics), Full Blend.
// Facts: Wilson et al. (2014) Science 345:75-77. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Battery, Count, Enjoy, Minute, Pay, Pressed, Room, Something, Stopwatch } from "./atg";
import { KEY_AT } from "./ZapShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p14";
type G = "blue" | PaperId | "stopwatch" | "battery" | "room" | "enjoy" | "pay" | "pressed" | "count" | "something" | "minute";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "zap3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p14: { journal: "SCIENCE · 2014", title: "Just think: The challenges of the disengaged mind", authors: "Timothy D. Wilson, David A. Reinhard, Erin C. Westgate et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D bolt strikes on "press" */
const LEAD = KEY_AT - (W[162].at - W[160].at);
const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-waiting.mp4", pos: "50% 40%" }, { from: 5, to: 12, pic: "v-emptyroom.mp4" }, { from: 12, to: 17, pic: "v-thinker.mp4" },
  { from: 17, to: 25, g: "stopwatch" }, { from: 25, to: 33, g: "battery", cues: [29] }, { from: 33, to: 40, pic: "v-corridor.mp4" },
  { from: 40, to: 52, g: "p14" }, { from: 52, to: 74, g: "room", cues: [60, 67] }, { from: 74, to: 87, g: "enjoy", cues: [77, 84] },
  { from: 87, to: 93, pic: "v-clock.mp4" }, { from: 93, to: 96, g: "blue" }, { from: 96, to: 119, g: "pay", cues: [105, 112] },
  { from: 119, to: 134, pic: "v-button.mp4" }, { from: 134, to: 147, g: "pressed", cues: [134, 140] }, { from: 147, to: 156, g: "count", cues: [154] },
  { from: 156, to: 160, g: "blue" }, { from: 160, to: 168, clip: "zap3d.mp4", start: 160, lead: LEAD }, { from: 168, to: 187, g: "something", cues: [175] },
  { from: 187, to: 196, pic: "v-scroll.mp4" }, { from: 196, to: 205, pic: "v-phone.mp4" }, { from: 205, to: 214, pic: "v-emptyroom.mp4" },
  { from: 214, to: 999, g: "minute" },
];

const BEATS: Beat[] = [
[0, 3, 4], [5, 6, 6], [7, 8, 8], [9, 11, 11], [12, 16, 16], [17, 21, 21], [22, 24, 24], [25, 29, 29], [30, 33, 33], [34, 39, 39], [40, 42, 42], [43, 47, 47], [48, 51, 51], [52, 54, 54], [55, 58, 58], [59, 63, 63], [64, 67, 68], [69, 73, 73], [74, 78, 78], [79, 86, 84], [87, 92, 92], [93, 95, 95], [96, 98, 98], [99, 106, 105], [107, 112, 112], [113, 118, 118], [119, 123, 123], [124, 129, 129], [130, 133, 132], [134, 138, 138], [139, 143, 143], [144, 146, 146], [147, 150, 149], [151, 155, 154], [156, 159, 159], [160, 163, 162], [164, 167, 167], [168, 173, 173], [174, 179, 179], [180, 182, 182], [183, 186, 184], [187, 192, 192], [193, 196, 196], [197, 204, 204], [205, 207, 207], [208, 213, 213], [214, 217, 217], [218, 220, 220], [221, 222, 222], [223, 224, 224], [225, 229, 229]
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 5, kind: "flash" }, { at: 12, kind: "burn" }, { at: 17, kind: "glitch" }, { at: 25, kind: "flash" }, { at: 33, kind: "burn" },
  { at: 40, kind: "burn" }, { at: 52, kind: "flash" }, { at: 74, kind: "glitch" }, { at: 87, kind: "burn" }, { at: 93, kind: "glitch" },
  { at: 96, kind: "flash" }, { at: 119, kind: "burn" }, { at: 134, kind: "flash" }, { at: 147, kind: "glitch" }, { at: 160, kind: "flash" },
  { at: 168, kind: "burn" }, { at: 187, kind: "flash" }, { at: 196, kind: "glitch" }, { at: 205, kind: "burn" }, { at: 214, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [17, "pop", 0.2], [29, "subdrop", 0.25], [40, "paper", 0.3], [60, "pop", 0.2], [77, "pop", 0.2], [84, "pop", 0.2],
  [105, "spark", 0.3], [112, "chime", 0.2], [129, "riser", 0.2], [134, "pop", 0.25], [140, "pop", 0.25], [154, "drop", 0.3],
  [-(F(160) - LEAD + KEY_AT), "spark", 0.45], [175, "pop", 0.25], [214, "chime", 0.2],
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
const { musicGain: MUSIC_GAIN = 1.15 } = getInputProps() as { musicGain?: number };

export const AloneThoughts: React.FC = () => {

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
                {l.g === "stopwatch" ? <Stopwatch from={a} /> : null}
                {l.g === "battery" ? <Battery from={a} deadAt={F(l.cues![0])} /> : null}
                {l.g === "room" ? <Room from={a} minAt={F(l.cues![0])} thinkAt={F(l.cues![1])} /> : null}
                {l.g === "enjoy" ? <Enjoy enjoyAt={F(l.cues![0])} focusAt={F(l.cues![1])} /> : null}
                {l.g === "pay" ? <Pay shockAt={F(l.cues![0])} payAt={F(l.cues![1])} /> : null}
                {l.g === "pressed" ? <Pressed menAt={F(l.cues![0])} womenAt={F(l.cues![1])} /> : null}
                {l.g === "count" ? <Count from={a} doneAt={F(l.cues![0])} /> : null}
                {l.g === "something" ? <Something from={a} tipAt={F(l.cues![0])} /> : null}
                {l.g === "minute" ? <Minute from={a} to={b} /> : null}
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
