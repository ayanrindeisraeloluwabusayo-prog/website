// "What happens to your brain when you go for a walk" (mosquito-style graphics), Full Blend.
// Facts: Oppezzo & Schwartz (2014); Erickson et al. (2011) PNAS; Bratman et al. (2015) PNAS; Darwin's Sandwalk. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Flints, Nature, Sixty, Treadmill, Uses, Years } from "./wkg";
import { KEY_AT } from "./GrowShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p14";
type G = "blue" | PaperId | "flints" | "uses" | "sixty" | "years" | "treadmill" | "nature";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "grow3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p14: { journal: "J. EXP. PSYCHOLOGY: LEARNING, MEMORY & COGNITION · 2014 · STANFORD", title: "Give your ideas some legs: The positive effect of walking on creative thinking", authors: "Marily Oppezzo & Daniel L. Schwartz" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D memory centre grows on "grew" */
const LEAD = KEY_AT - (W[137].at - W[133].at);

const LAYERS: Layer[] = [
  { from: 0, to: 5, pic: "v-desk.mp4" }, { from: 5, to: 12, pic: "v-street.mp4" }, { from: 12, to: 17, pic: "v-city.mp4" }, { from: 17, to: 21, pic: "v-bulb.mp4" },
  { from: 21, to: 38, pic: "v-path.mp4" }, { from: 38, to: 58, g: "flints", cues: [46] }, { from: 58, to: 66, g: "blue" }, { from: 66, to: 75, g: "p14" },
  { from: 75, to: 91, g: "uses", cues: [86, 89] }, { from: 91, to: 103, g: "sixty", cues: [101] }, { from: 103, to: 112, pic: "v-feet.mp4" },
  { from: 112, to: 133, pic: "v-elders.mp4" }, { from: 133, to: 148, clip: "grow3d.mp4", start: 133, lead: LEAD }, { from: 148, to: 158, g: "years", cues: [150] },
  { from: 158, to: 162, g: "blue" }, { from: 162, to: 181, g: "treadmill", cues: [177] }, { from: 181, to: 193, pic: "v-forest.mp4" },
  { from: 193, to: 215, g: "nature", cues: [199, 211] }, { from: 215, to: 224, pic: "v-screen.mp4" }, { from: 224, to: 999, pic: "v-trail.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [2, 4, 4], [5, 7, 7], [8, 11, 11], [12, 16, 16], [17, 20, 20], [21, 24, 24], [25, 28, 28], [29, 31, 31], [32, 34, 34],
  [35, 37, 36], [38, 41, 41], [42, 44, 44], [45, 46, 46], [51, 55, 55], [58, 60, 60], [61, 65, 63], [66, 67, 67], [68, 71, 71], [72, 74, 74],
  [75, 82, 82], [83, 85, 85], [86, 87, 87], [88, 90, 90], [91, 93, 93], [94, 98, 98], [99, 102, 101], [103, 107, 107], [108, 109, 109],
  [110, 111, 111], [112, 118, 118], [119, 123, 123], [124, 129, 128], [130, 136, 136], [137, 139, 139], [140, 143, 142], [144, 147, 146],
  [148, 151, 150], [152, 157, 157], [158, 161, 161], [162, 165, 165], [166, 172, 172], [173, 176, 176], [177, 180, 179], [181, 186, 184],
  [187, 192, 192], [193, 197, 196], [198, 200, 200], [204, 208, 207], [209, 214, 211], [215, 218, 218], [219, 220, 220], [224, 227, 226],
  [228, 230, 230], [231, 237, 234],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 5, kind: "flash" }, { at: 12, kind: "burn" }, { at: 17, kind: "flash" }, { at: 21, kind: "burn" }, { at: 38, kind: "flash" },
  { at: 58, kind: "burn" }, { at: 66, kind: "flash" }, { at: 75, kind: "burn" }, { at: 91, kind: "flash" }, { at: 103, kind: "burn" },
  { at: 112, kind: "flash" }, { at: 133, kind: "burn" }, { at: 148, kind: "flash" }, { at: 158, kind: "glitch" }, { at: 162, kind: "burn" },
  { at: 181, kind: "flash" }, { at: 193, kind: "burn" }, { at: 215, kind: "flash" }, { at: 224, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [19, "spark", 0.25], [46, "pop", 0.2], [66, "paper", 0.3], [87, "pop", 0.2], [90, "pop", 0.2], [101, "chime", 0.25],
  [-(F(133) - LEAD + KEY_AT), "spark", 0.4], [150, "riser", 0.2], [177, "marker", 0.2], [199, "chime", 0.2], [211, "drop", 0.2], [228, "whoosh", 0.2],
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

export const WalkBrain: React.FC = () => {

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
                {l.g === "flints" ? <Flints from={a} knockAt={F(l.cues![0])} /> : null}
                {l.g === "uses" ? <Uses from={a} sitAt={F(l.cues![0])} walkAt={F(l.cues![1])} /> : null}
                {l.g === "sixty" ? <Sixty from={a} at={F(l.cues![0])} /> : null}
                {l.g === "years" ? <Years from={a} at={F(l.cues![0])} /> : null}
                {l.g === "treadmill" ? <Treadmill from={a} wallAt={F(l.cues![0])} /> : null}
                {l.g === "nature" ? <Nature from={a} natureAt={F(l.cues![0])} cityAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_twinkle.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
