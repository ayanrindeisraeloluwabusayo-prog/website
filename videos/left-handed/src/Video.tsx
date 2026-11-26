// "Why are some people left-handed?" (mosquito-style graphics), Full Blend.
// Facts: Papadatou-Pastou et al. (2020); Medland et al. twin studies; Hepper et al. (1991, 2005). See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Dozens, Mix, Pct, Quarter, Ten, Thumbs } from "./lhg";
import { KEY_AT } from "./LeftShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p20";
type G = "blue" | PaperId | "ten" | "pct" | "quarter" | "dozens" | "thumbs" | "mix";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "left3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p20: { journal: "PSYCHOLOGICAL BULLETIN · 2020", title: "Human handedness: A meta-analysis", authors: "Marietta Papadatou-Pastou, Eleni Ntolka, Judith Schmitz et al." },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 20;
export const FRAMES = END + 92;
/** the 3D left hand rises on "chosen" */
const LEAD = KEY_AT - (W[126].at - W[118].at);

const LAYERS: Layer[] = [
  { from: 0, to: 9, pic: "v-pen.mp4" }, { from: 9, to: 19, g: "ten", cues: [14] }, { from: 19, to: 39, pic: "v-leftpen.mp4" }, { from: 39, to: 48, pic: "v-lefty.mp4" },
  { from: 48, to: 55, g: "blue" }, { from: 55, to: 60, g: "p20" }, { from: 60, to: 79, g: "pct", cues: [70] }, { from: 79, to: 86, pic: "v-dna.mp4" },
  { from: 86, to: 103, g: "quarter", cues: [100] }, { from: 103, to: 118, g: "dozens", cues: [108] }, { from: 118, to: 130, clip: "left3d.mp4", start: 118, lead: LEAD },
  { from: 130, to: 146, pic: "v-ultrasound.mp4" }, { from: 146, to: 160, pic: "v-womb.mp4" }, { from: 160, to: 180, g: "thumbs", cues: [164, 177] },
  { from: 180, to: 193, pic: "v-drawing.mp4" }, { from: 193, to: 205, g: "mix", cues: [197, 199] }, { from: 205, to: 213, pic: "v-hands.mp4" },
  { from: 213, to: 999, pic: "v-crowd.mp4" },
];

const BEATS: Beat[] = [
  [0, 3, 3], [4, 8, 5], [9, 11, 11], [16, 18, 18], [19, 22, 22], [23, 30, 28], [31, 36, 35], [37, 38, 38], [41, 43, 43], [44, 47, 47],
  [48, 54, 54], [55, 58, 58], [59, 66, 65], [67, 73, 73], [79, 84, 84], [85, 85, 85], [86, 92, 92], [93, 102, 100], [103, 107, 106],
  [108, 112, 112], [113, 117, 114], [118, 121, 121], [122, 126, 126], [130, 131, 131], [132, 134, 134], [135, 143, 143], [146, 147, 147],
  [148, 152, 152], [155, 159, 159], [160, 167, 164], [168, 172, 172], [173, 179, 179], [180, 185, 185], [186, 192, 192], [193, 199, 199],
  [200, 204, 204], [205, 210, 209], [211, 216, 215], [217, 221, 221],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 9, kind: "flash" }, { at: 19, kind: "burn" }, { at: 39, kind: "flash" }, { at: 48, kind: "burn" }, { at: 55, kind: "flash" },
  { at: 60, kind: "burn" }, { at: 79, kind: "flash" }, { at: 86, kind: "burn" }, { at: 103, kind: "flash" }, { at: 118, kind: "glitch" },
  { at: 130, kind: "burn" }, { at: 146, kind: "flash" }, { at: 160, kind: "burn" }, { at: 180, kind: "flash" }, { at: 193, kind: "burn" },
  { at: 205, kind: "flash" }, { at: 213, kind: "burn" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [14, "pop", 0.2], [43, "chime", 0.2], [55, "paper", 0.3], [70, "chime", 0.2], [100, "pop", 0.2], [108, "riser", 0.15],
  [-(F(118) - LEAD + KEY_AT), "spark", 0.4], [164, "pop", 0.2], [177, "chime", 0.25], [197, "pop", 0.2], [199, "pop", 0.2],
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

export const LeftHanded: React.FC = () => {

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
                {l.g === "ten" ? <Ten from={a} at={F(l.cues![0])} /> : null}
                {l.g === "pct" ? <Pct from={a} at={F(l.cues![0])} /> : null}
                {l.g === "quarter" ? <Quarter from={a} at={F(l.cues![0])} /> : null}
                {l.g === "dozens" ? <Dozens from={a} at={F(l.cues![0])} /> : null}
                {l.g === "thumbs" ? <Thumbs from={a} rightAt={F(l.cues![0])} leftAt={F(l.cues![1])} /> : null}
                {l.g === "mix" ? <Mix from={a} genesAt={F(l.cues![0])} chanceAt={F(l.cues![1])} /> : null}
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
      <Audio src={staticFile("music_ponpon.wav")} volume={(x) => musicLevel(x)} />
      {SFX.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={END + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};
