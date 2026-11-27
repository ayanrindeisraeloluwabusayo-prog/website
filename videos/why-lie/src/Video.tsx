// "Why people lie, and who does most of it" (mosquito-style graphics), Full Blend.
// Facts: DePaulo et al. (1996) JPSP; Debey et al. (2015) Acta Psychologica; Serota, Levine & Boster (2010) HCR. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Age, Half, None, PerDay, Why } from "./wlg";
import { KEY_AT } from "./NoseShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p96";
type G = "blue" | PaperId | "perday" | "why" | "age" | "none" | "half";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "nose3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p96: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1996", title: "Lying in everyday life", authors: "Bella M. DePaulo, Deborah A. Kashy, Susan E. Kirkendol, Melissa M. Wyer & Jennifer A. Epstein" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D nose has grown on "liars" */
const LEAD = KEY_AT - (W[191].at - W[186].at);

const LAYERS: Layer[] = [
  { from: 0, to: 13, pic: "v-smile.mp4", pos: "50% 30%" }, { from: 13, to: 54, pic: "v-cycling.mp4" }, { from: 54, to: 64, g: "blue" }, { from: 64, to: 80, g: "p96" },
  { from: 80, to: 93, g: "perday", cues: [84, 91] }, { from: 93, to: 111, g: "why", cues: [103, 105, 108] }, { from: 111, to: 124, pic: "v-cafe.mp4" },
  { from: 124, to: 131, pic: "v-teen.mp4", pos: "50% 35%" }, { from: 131, to: 142, g: "age", cues: [131, 137] }, { from: 142, to: 146, g: "blue" },
  { from: 146, to: 152, pic: "v-crowd.mp4" }, { from: 152, to: 173, g: "none", cues: [168] }, { from: 173, to: 186, g: "half", cues: [182] },
  { from: 186, to: 199, clip: "nose3d.mp4", start: 186, lead: LEAD }, { from: 199, to: 214, pic: "v-elders.mp4" }, { from: 214, to: 999, pic: "v-table.mp4" },
];

const BEATS: Beat[] = [
  [0, 4, 4], [5, 7, 7], [8, 9, 9], [10, 12, 12], [13, 16, 16], [17, 21, 21], [22, 23, 23], [24, 32, 32], [33, 36, 36], [37, 41, 41],
  [42, 50, 50], [51, 53, 52], [54, 59, 59], [60, 63, 63], [64, 65, 65], [66, 68, 68], [69, 73, 73], [77, 79, 79], [80, 87, 85], [88, 92, 92],
  [93, 99, 98], [100, 104, 104], [105, 108, 108], [111, 115, 115], [116, 118, 118], [124, 127, 127], [128, 131, 131], [136, 137, 137],
  [142, 145, 145], [146, 151, 148], [152, 158, 158], [159, 161, 161], [168, 172, 172], [173, 178, 174], [179, 182, 182], [186, 191, 191],
  [192, 198, 196], [199, 205, 204], [206, 209, 209], [214, 220, 220], [221, 227, 227],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 13, kind: "flash" }, { at: 54, kind: "burn" }, { at: 64, kind: "flash" }, { at: 80, kind: "burn" }, { at: 93, kind: "flash" },
  { at: 111, kind: "burn" }, { at: 124, kind: "flash" }, { at: 131, kind: "burn" }, { at: 142, kind: "glitch" }, { at: 146, kind: "burn" },
  { at: 152, kind: "flash" }, { at: 173, kind: "burn" }, { at: 186, kind: "flash" }, { at: 199, kind: "burn" }, { at: 214, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [12, "glitch-a", 0.15], [41, "drop", 0.2], [64, "paper", 0.3], [84, "pop", 0.2], [91, "pop", 0.2],
  [103, "pop", 0.15], [105, "pop", 0.15], [108, "chime", 0.2], [131, "riser", 0.15], [168, "chime", 0.2], [182, "marker", 0.25],
  [-(F(186) - LEAD + KEY_AT), "spark", 0.4],
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

export const WhyLie: React.FC = () => {

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
                {l.g === "perday" ? <PerDay from={a} studentsAt={F(l.cues![0])} adultsAt={F(l.cues![1])} /> : null}
                {l.g === "why" ? <Why at={l.cues!.map(F)} /> : null}
                {l.g === "age" ? <Age from={a} peakAt={F(l.cues![0])} dropAt={F(l.cues![1])} /> : null}
                {l.g === "none" ? <None from={a} at={F(l.cues![0])} /> : null}
                {l.g === "half" ? <Half from={a} at={F(l.cues![0])} /> : null}
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
