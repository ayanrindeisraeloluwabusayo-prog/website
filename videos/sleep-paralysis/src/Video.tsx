// "Sleep paralysis: awake but unable to move" (mosquito-style graphics), Full Blend.
// Facts: Sharpless & Barber (2011) Sleep Med Rev; Jalal & Hinton (2013), Jalal et al. (2014). See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Countries, Meta, Rates, Spill, Switch } from "./slg";
import { KEY_AT } from "./AwakeShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p11";
type G = "blue" | PaperId | "switch" | "spill" | "meta" | "rates" | "countries" | "results";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "awake3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p11: { journal: "SLEEP MEDICINE REVIEWS · 2011", title: "Lifetime prevalence rates of sleep paralysis: A systematic review", authors: "Brian A. Sharpless & Jacques P. Barber" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 30;
export const FRAMES = END + 92;
/** the 3D head lights up on "awake" */
const LEAD = KEY_AT - (W[101].at - W[98].at);

const LAYERS: Layer[] = [
  { from: 0, to: 6, pic: "v-bedroom.mp4" }, { from: 6, to: 10, pic: "v-eyes.mp4", pos: "50% 35%" }, { from: 10, to: 17, pic: "v-awake.mp4", pos: "50% 40%" },
  { from: 17, to: 28, pic: "v-shadow.mp4" }, { from: 28, to: 54, pic: "v-window.mp4" }, { from: 54, to: 60, pic: "v-moon.mp4" }, { from: 60, to: 69, g: "blue" },
  { from: 69, to: 87, g: "switch", cues: [74] }, { from: 87, to: 98, pic: "v-sleeper.mp4" }, { from: 98, to: 108, clip: "awake3d.mp4", start: 98, lead: LEAD },
  { from: 108, to: 126, g: "spill", cues: [118, 120, 122] }, { from: 126, to: 130, g: "p11" }, { from: 130, to: 144, g: "meta", cues: [130, 141] },
  { from: 144, to: 165, g: "rates", cues: [145, 156] }, { from: 165, to: 169, g: "blue" }, { from: 169, to: 180, pic: "v-eyes.mp4", pos: "50% 35%" },
  { from: 180, to: 207, g: "countries", cues: [181, 198] }, { from: 207, to: 225, g: "results", cues: [209, 216] },
  { from: 225, to: 239, pic: "v-window.mp4" }, { from: 239, to: 247, pic: "v-bedroom.mp4" }, { from: 247, to: 999, pic: "v-calm.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 2], [3, 5, 5], [6, 9, 9], [10, 13, 13], [14, 16, 16], [17, 21, 21], [22, 27, 25], [28, 31, 31], [32, 34, 34], [35, 40, 40],
  [41, 46, 49], [50, 53, 53], [54, 56, 56], [60, 66, 66], [67, 68, 68], [69, 71, 71], [72, 75, 74], [76, 79, 79], [80, 86, 83],
  [87, 91, 90], [92, 94, 94], [98, 101, 101], [102, 107, 107], [108, 116, 113], [117, 118, 118], [119, 120, 120], [121, 122, 122],
  [126, 128, 127], [129, 133, 133], [134, 137, 136], [138, 141, 141], [144, 145, 145], [149, 155, 155], [156, 157, 157], [158, 164, 164],
  [165, 168, 168], [169, 171, 171], [172, 179, 177], [180, 181, 181], [182, 188, 188], [189, 190, 190], [191, 198, 198], [199, 206, 206],
  [207, 212, 212], [213, 217, 216], [218, 220, 220], [221, 224, 223], [225, 230, 230], [231, 233, 233], [234, 238, 238], [239, 243, 242],
  [244, 246, 246], [247, 248, 248], [249, 253, 253], [254, 255, 254], [256, 259, 259],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 6, kind: "flash" }, { at: 10, kind: "glitch" }, { at: 17, kind: "burn" }, { at: 28, kind: "flash" }, { at: 54, kind: "burn" },
  { at: 60, kind: "flash" }, { at: 69, kind: "burn" }, { at: 87, kind: "flash" }, { at: 98, kind: "glitch" }, { at: 108, kind: "burn" },
  { at: 126, kind: "flash" }, { at: 130, kind: "burn" }, { at: 144, kind: "flash" }, { at: 165, kind: "glitch" }, { at: 169, kind: "burn" },
  { at: 180, kind: "flash" }, { at: 207, kind: "burn" }, { at: 225, kind: "flash" }, { at: 239, kind: "burn" }, { at: 247, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [13, "subdrop", 0.25], [21, "shiver", 0.25], [74, "pop", 0.2], [-(F(98) - LEAD + KEY_AT), "spark", 0.4],
  [118, "shiver", 0.15], [122, "drop", 0.2], [126, "paper", 0.3], [141, "chime", 0.2], [145, "pop", 0.2], [156, "pop", 0.2], [188, "shiver", 0.2],
  [209, "chime", 0.2], [216, "drop", 0.2],
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

export const SleepParalysis: React.FC = () => {

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
                {l.g === "switch" ? <Switch from={a} offAt={F(l.cues![0])} /> : null}
                {l.g === "spill" ? <Spill at={l.cues!.map(F)} /> : null}
                {l.g === "meta" ? <Meta from={a} studiesAt={F(l.cues![0])} peopleAt={F(l.cues![1])} /> : null}
                {l.g === "rates" ? <Rates from={a} allAt={F(l.cues![0])} studentsAt={F(l.cues![1])} /> : null}
                {l.g === "countries" ? <Countries from={a} egyptAt={F(l.cues![0])} denmarkAt={F(l.cues![1])} /> : null}
                {l.g === "results" ? <Countries from={a} egyptAt={a - 30} denmarkAt={a - 30} resultAt={F(l.cues![0])} fearAt={F(l.cues![1])} /> : null}
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
