// "Your phone drains your brain even when it's switched off" (mosquito-style graphics), Full Blend.
// Facts: Ward, Duke, Gneezy & Bos (2017); Ruiz Pardo & Minda (2022); Jobs to Bilton, NYT 2014. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Depend, Mixed, OnOff, Quote, Rooms } from "./pdg";
import { KEY_AT } from "./DrainShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p17";
type G = "blue" | PaperId | "quote" | "rooms" | "onoff" | "depend" | "mixed";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "drain3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p17: { journal: "JOURNAL OF THE ASSOCIATION FOR CONSUMER RESEARCH · 2017 · UT AUSTIN", title: "Brain Drain: the mere presence of one's own smartphone reduces available cognitive capacity", authors: "Adrian F. Ward, Kristen Duke, Ayelet Gneezy & Maarten W. Bos" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D brain lights up on "brain" */
const LEAD = KEY_AT - (W[144].at - W[138].at);

const LAYERS: Layer[] = [
  { from: 0, to: 10, pic: "v-phone.mp4" }, { from: 10, to: 21, pic: "v-desk.mp4" }, { from: 21, to: 37, pic: "v-kid.mp4" },
  { from: 37, to: 51, g: "quote", cues: [41] }, { from: 51, to: 63, pic: "v-hands.mp4" }, { from: 63, to: 71, g: "blue" },
  { from: 71, to: 84, g: "p17" }, { from: 84, to: 93, pic: "v-night.mp4" }, { from: 93, to: 126, g: "rooms", cues: [99, 107, 114, 124] },
  { from: 126, to: 138, g: "onoff", cues: [130] }, { from: 138, to: 151, clip: "drain3d.mp4", start: 138, lead: LEAD }, { from: 151, to: 155, g: "blue" },
  { from: 155, to: 170, g: "depend", cues: [167] }, { from: 170, to: 177, pic: "v-library.mp4" }, { from: 177, to: 194, g: "mixed", cues: [184, 190] },
  { from: 194, to: 202, pic: "v-read.mp4" }, { from: 202, to: 214, pic: "v-phone.mp4" }, { from: 214, to: 999, pic: "v-door.mp4" },
];

const BEATS: Beat[] = [
  [0, 1, 1], [5, 5, 5], [6, 6, 6], [8, 8, 8], [10, 13, 13], [15, 19, 19], [20, 20, 20], [21, 21, 21], [26, 26, 26], [31, 33, 33], [34, 36, 36], [37, 38, 38], [41, 45, 45], [46, 47, 47], [51, 54, 54], [56, 56, 56], [61, 62, 62], [63, 63, 63], [66, 70, 70], [71, 72, 72], [73, 73, 73], [78, 80, 80], [83, 83, 83], [84, 86, 86], [89, 92, 92], [93, 95, 95], [98, 99, 99], [100, 100, 100], [102, 102, 102], [107, 107, 107], [110, 114, 114], [115, 115, 115], [116, 117, 117], [121, 122, 122], [126, 130, 130], [131, 131, 131], [136, 137, 137], [138, 139, 139], [143, 144, 144], [148, 149, 149], [151, 152, 152], [155, 156, 156], [160, 160, 160], [165, 169, 169], [170, 173, 173], [175, 175, 175], [177, 178, 178], [182, 183, 183], [187, 189, 189], [192, 193, 193], [194, 196, 196], [199, 201, 201], [202, 202, 202], [207, 207, 207], [208, 210, 210], [213, 213, 213], [214, 217, 217],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 10, kind: "flash" }, { at: 21, kind: "burn" }, { at: 37, kind: "flash" }, { at: 51, kind: "burn" }, { at: 63, kind: "flash" }, { at: 71, kind: "burn" }, { at: 84, kind: "flash" }, { at: 93, kind: "burn" }, { at: 126, kind: "flash" }, { at: 138, kind: "burn" }, { at: 151, kind: "glitch" }, { at: 155, kind: "burn" }, { at: 170, kind: "flash" }, { at: 177, kind: "burn" }, { at: 194, kind: "flash" }, { at: 202, kind: "burn" }, { at: 214, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [41, "pop", 0.15], [71, "paper", 0.3], [99, "pop", 0.2], [107, "pop", 0.2], [114, "pop", 0.2], [124, "chime", 0.25],
  [130, "pop", 0.2], [-(F(138) - LEAD + KEY_AT), "spark", 0.4], [167, "marker", 0.2], [184, "drop", 0.15], [190, "chime", 0.2], [214, "whoosh", 0.2],
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
const { musicGain: MUSIC_GAIN = 1 } = getInputProps() as { musicGain?: number };

export const PhoneDrain: React.FC = () => {

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
                {l.g === "quote" ? <Quote from={a} secondAt={F(l.cues![0])} /> : null}
                {l.g === "rooms" ? <Rooms from={a} at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} bestAt={F(l.cues![3])} /> : null}
                {l.g === "onoff" ? <OnOff from={a} eqAt={F(l.cues![0])} /> : null}
                {l.g === "depend" ? <Depend from={a} hitAt={F(l.cues![0])} /> : null}
                {l.g === "mixed" ? <Mixed from={a} noAt={F(l.cues![0])} yesAt={F(l.cues![1])} /> : null}
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
