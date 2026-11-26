// "Why you can feel lonely around people" (mosquito-style graphics), Full Blend.
// Facts: US Surgeon General advisory (2023); Wheeler, Reis & Nezlek (1983) JPSP 45:943-953; S. Cacioppo et al. (2016) Cognitive Neuroscience. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Fast, Gap, Half, Log, Many, Meaning, Pull, Smoke } from "./lcg";
import { KEY_AT } from "./GuardShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p16";
type G = "blue" | PaperId | "half" | "smoke" | "many" | "log" | "meaning" | "gap" | "wider" | "fast" | "pull";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "guard3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p16: { journal: "COGNITIVE NEUROSCIENCE · 2016 · UNIVERSITY OF CHICAGO", title: "Loneliness and implicit attention to social threat: A high-performance electrical neuroimaging study", authors: "Stephanie Cacioppo, Munirah Bangee, Stephen Balogh et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D shield closes on "guard" */
const LEAD = KEY_AT - (W[191].at - W[186].at);

const LAYERS: Layer[] = [
  { from: 0, to: 8, pic: "v-party.mp4" }, { from: 8, to: 14, pic: "v-bridge.mp4", pos: "60% 50%" }, { from: 14, to: 24, pic: "v-friends.mp4" },
  { from: 24, to: 32, pic: "v-phone.mp4", pos: "50% 30%" }, { from: 32, to: 49, g: "half", cues: [41] }, { from: 49, to: 56, pic: "v-crossing.mp4" },
  { from: 56, to: 66, pic: "v-cigarette.mp4", pos: "50% 35%" }, { from: 66, to: 71, g: "smoke", cues: [67] }, { from: 71, to: 83, g: "many", cues: [77] },
  { from: 83, to: 103, g: "log", cues: [96, 101] }, { from: 103, to: 121, g: "meaning", cues: [111, 117] }, { from: 121, to: 135, g: "gap", cues: [127, 132] },
  { from: 135, to: 139, g: "blue" }, { from: 139, to: 145, g: "wider", cues: [144] }, { from: 145, to: 155, g: "p16" }, { from: 155, to: 164, pic: "v-neurons.mp4" },
  { from: 164, to: 186, g: "fast", cues: [176, 182] }, { from: 186, to: 195, clip: "guard3d.mp4", start: 186, lead: LEAD }, { from: 195, to: 209, g: "pull", cues: [200] },
  { from: 209, to: 222, pic: "v-walk.mp4" }, { from: 222, to: 229, pic: "v-alone.mp4", pos: "50% 30%" }, { from: 229, to: 999, pic: "v-coffee.mp4", pos: "50% 40%" },
];

const BEATS: Beat[] = [
  [0, 3, 3], [4, 7, 7], [8, 12, 13], [14, 17, 17], [18, 21, 23], [24, 28, 28], [32, 33, 33], [34, 36, 37], [39, 40, 41], [49, 54, 54],
  [55, 60, 61], [62, 67, 68], [71, 74, 74], [75, 77, 78], [83, 85, 85], [86, 93, 93], [94, 96, 97], [103, 104, 104], [109, 111, 111],
  [115, 117, 118], [121, 124, 124], [125, 129, 129], [130, 134, 134], [135, 138, 138], [139, 144, 144], [145, 150, 150], [151, 153, 154],
  [155, 157, 158], [159, 163, 163], [164, 165, 165], [167, 171, 172], [175, 176, 178], [179, 182, 182], [186, 191, 191], [192, 194, 194],
  [195, 200, 201], [202, 208, 208], [209, 214, 214], [215, 219, 219], [222, 227, 227], [229, 232, 232], [233, 235, 235], [236, 237, 238],
  [239, 242, 243],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 8, kind: "flash" }, { at: 14, kind: "burn" }, { at: 24, kind: "flash" }, { at: 32, kind: "glitch" }, { at: 49, kind: "flash" },
  { at: 56, kind: "burn" }, { at: 66, kind: "flash" }, { at: 71, kind: "burn" }, { at: 83, kind: "flash" }, { at: 103, kind: "burn" },
  { at: 121, kind: "flash" }, { at: 135, kind: "glitch" }, { at: 145, kind: "burn" }, { at: 155, kind: "flash" }, { at: 164, kind: "burn" },
  { at: 186, kind: "flash" }, { at: 195, kind: "glitch" }, { at: 209, kind: "burn" }, { at: 222, kind: "flash" }, { at: 229, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [41, "chime", 0.2], [67, "pop", 0.2], [77, "drop", 0.2], [85, "paper", 0.2], [101, "pop", 0.2], [111, "chime", 0.2],
  [127, "pop", 0.2], [132, "pop", 0.2], [144, "riser", 0.2], [145, "paper", 0.3], [176, "spark", 0.25], [-(F(186) - LEAD + KEY_AT), "spark", 0.4],
  [200, "whoosh-film", 0.2],
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
const { musicGain: MUSIC_GAIN = 1.12 } = getInputProps() as { musicGain?: number };

export const LonelyCrowd: React.FC = () => {

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
                {l.g === "half" ? <Half from={a} litAt={F(l.cues![0])} /> : null}
                {l.g === "smoke" ? <Smoke from={a} at={F(l.cues![0])} /> : null}
                {l.g === "many" ? <Many from={a} manyAt={F(l.cues![0])} /> : null}
                {l.g === "log" ? <Log from={a} tenAt={F(l.cues![0])} twoAt={F(l.cues![1])} /> : null}
                {l.g === "meaning" ? <Meaning from={a} meanAt={F(l.cues![0])} manyAt={F(l.cues![1])} /> : null}
                {l.g === "gap" ? <Gap from={a} haveAt={F(l.cues![0])} needAt={F(l.cues![1])} /> : null}
                {l.g === "wider" ? <Gap from={a} haveAt={a - 30} needAt={a - 30} widenAt={F(l.cues![0]) - 10} /> : null}
                {l.g === "fast" ? <Fast from={a} twiceAt={F(l.cues![0])} tenthAt={F(l.cues![1])} /> : null}
                {l.g === "pull" ? <Pull from={a} awayAt={F(l.cues![0])} /> : null}
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
