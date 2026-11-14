// "Why do you remember song lyrics from years ago, but not what you read yesterday?" in two versions for the
// owner's comparison: A (punchy lines, calm bed) and B (story flow at the reference narrators' pace, driving bed).
// Same pictures, graphics and 3D shot; each version is laid out against its own word timings.
// Facts: Wallace (1994), J. Exp. Psych.: LMC 20, 1471-1485; Jacobsen et al. (2015), Brain. See SCRIPTS.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { MelodyTrack, Plays, SungSpoken } from "./graphics7";
import { WORDS_A, WORDS_B } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number] }
  | { from: number; to: number; g: "blue" | "paper94" | "paper15" | "melody" | "sungspoken" | "plays"; cues?: number[] }
  | { from: number; to: number; head: number };              // the 3D clip, which started playing at word `head`
type Beat = { from: number; key: [number, number]; note?: string };
type Version = {
  words: Word[]; voice: string; music: string; end: number; frames: number; calm: boolean;
  layers: Layer[]; beats: Beat[]; cuts: { at: number; kind: "burn" | "flash" | "glitch" }[]; sfx: [number, string, number][];
};

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
  lines.push({ kind: "serif", words: key, size: chars > 13 ? 140 : chars > 9 ? 170 : undefined });
  for (let i = 0; i < after.length; i += 5) lines.push({ words: after.slice(i, i + 5), align: "flex-end", indent: 60 });
  return <Lockup top={top} until={until} color={dark ? "#111" : "#fff"} shadow={!dark} lines={lines} />;
};

const Head: React.FC<{ at: number }> = ({ at }) => (
  <AbsoluteFill>
    <Sequence from={at} layout="none">
      <OffthreadVideo src={staticFile("media/lyric3d.mp4")} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
    </Sequence>
  </AbsoluteFill>
);

// Optional music swap for A/B listening tests: --props {"music":"music_pulse.wav","musicGain":1} or {"music":"none"}.
const { music: MUSIC = "", musicGain: MUSIC_GAIN = 1 } = getInputProps() as { music?: string; musicGain?: number };

const Edit: React.FC<{ v: Version }> = ({ v }) => {
  const f = useCurrentFrame();
  const W = v.words, F = (i: number) => (i >= W.length ? v.end : W[i].at);
  const talking = (x: number) => W.some((w, i) => x >= w.at - 4 && x < Math.min(i + 1 < W.length ? W[i + 1].at : w.at + 20, w.at + 20) + 4);
  const musicLevel = (x: number) => {
    let duck = 0;
    for (let d = -6; d <= 6; d += 2) duck += talking(x + d) ? 1 : 0;
    let lv = (v.calm ? 0.32 : 0.3) - 0.16 * (duck / 7);
    if (x < 12) lv *= x / 12;
    if (x > v.end + 5) lv *= Math.max(0, 1 - (x - v.end - 5) / 85);
    return lv;
  };
  const layerAt = (x: number) => v.layers.find((l) => x >= F(l.from) && x < F(l.to));
  const cur = layerAt(f);
  const kindOf = (l?: Layer) => (!l ? "none" : "pic" in l ? "pic" : "head" in l ? "head" : l.g);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />
      {v.layers.map((l, i) => {
        const a = F(l.from), b = F(l.to);
        return (
          <Scene key={i} from={a} to={b}>
            {"pic" in l ? (
              <>
                <Shot src={l.pic} from={a} to={b} pos={l.pos ?? "50% 45%"} zoom={l.zoom ?? (i % 2 ? [1.12, 1.02] : [1.02, 1.12])} grade="contrast(1.06)" />
                <Scrim side="top" strength={0.7} />
              </>
            ) : "head" in l ? (
              <Head at={F(l.head)} />
            ) : l.g === "paper94" || l.g === "paper15" ? (
              <>
                <Paper />
                {l.g === "paper94" ? (
                  <StudyPage from={a} highlightAt={a + 20} journal="JOURNAL OF EXPERIMENTAL PSYCHOLOGY · 1994" title="Memory for music: Effect of melody on recall of text" authors="Wanda T. Wallace" hlHeight={120} />
                ) : (
                  <StudyPage from={a} highlightAt={a + 20} journal="BRAIN · 2015" title="Why musical memory can be preserved in advanced Alzheimer's disease" authors="Jacobsen et al." hlHeight={176} />
                )}
              </>
            ) : (
              <>
                <BlueStage glowY={58} />
                {l.g === "melody" ? <MelodyTrack from={a} dropAt={F(l.cues![0])} rhythmAt={F(l.cues![1])} rhymeAt={F(l.cues![2])} /> : null}
                {l.g === "sungspoken" ? <SungSpoken from={a} repeatAt={F(l.cues![0])} winAt={F(l.cues![1])} /> : null}
                {l.g === "plays" ? <Plays from={a} countAt={F(l.cues![0])} onceAt={F(l.cues![1])} /> : null}
              </>
            )}
          </Scene>
        );
      })}
      <Grain amount={0.15} />

      {/* words: each beat runs until the next beat starts */}
      {v.beats.map((bt, i) => {
        const end = i + 1 < v.beats.length ? v.beats[i + 1].from : W.length;
        const a = F(bt.from), b = F(end);
        const l = layerAt(a + 1);
        const k = kindOf(l);
        const dark = k === "paper94" || k === "paper15";
        return (
          <Scene key={i} from={a} to={b}>
            <BeatText words={W.slice(bt.from, end)} key0={bt.key[0]} key1={bt.key[1]} from={bt.from} top={k === "head" ? 160 : 220} dark={dark} until={b} />
            {bt.note ? (
              <div style={{ position: "absolute", left: 0, right: 0, top: 1720, textAlign: "center", fontFamily: SANS2, fontWeight: 700, fontSize: 30, letterSpacing: "0.12em", color: FLASH }}>{bt.note}</div>
            ) : null}
          </Scene>
        );
      })}
      {kindOf(cur) === "none" && f >= v.end ? null : null}

      {/* end card */}
      <Scene from={v.end} to={v.frames}>
        <BlueField glow={0.5} />
        <EndCard from={v.end + 2} />
        <Grain amount={0.18} />
      </Scene>

      {v.cuts.map((c, i) => (c.kind === "burn" ? <FilmBurn key={i} at={F(c.at) - 5} /> : c.kind === "flash" ? <InvertFlash key={i} at={F(c.at) - 2} /> : <PixelGlitch key={i} at={F(c.at) - 4} />))}

      <Audio src={staticFile(`media/${v.voice}`)} />
      {MUSIC !== "none" && <Audio src={staticFile(MUSIC || v.music)} volume={(x) => musicLevel(x) * MUSIC_GAIN} />}
      {v.sfx.map(([at, src, vol], i) => <Sfx key={i} at={at >= 0 ? F(at) : -at} src={src} volume={vol} />)}
      <Sfx at={v.end + 2} src="pop" volume={0.4} />
    </AbsoluteFill>
  );
};

/** The 3D clip's own timing: memories light up 96 frames in, start fading 190 frames in. */
const HEAD_ON = 96;

// ---------- Version A: punchy ----------
const A: Version = {
  words: WORDS_A, voice: "voice_a.mp3", music: "music_calm.wav", end: 1690, frames: 1780, calm: true,
  layers: [
    { from: 0, to: 10, pic: "l-sing.jpg" }, { from: 10, to: 16, pic: "l-bored.jpg" }, { from: 16, to: 21, pic: "l-tired.jpg" },
    { from: 21, to: 25, pic: "l-headphones.jpg" }, { from: 25, to: 31, pic: "l-singer.jpg" }, { from: 31, to: 35, g: "blue" },
    { from: 35, to: 38, pic: "l-notes.jpg" }, { from: 38, to: 50, g: "paper94" },
    { from: 50, to: 76, g: "sungspoken", cues: [64, 74] }, { from: 76, to: 104, g: "melody", cues: [82, 90, 98] },
    { from: 104, to: 111, pic: "l-radio.jpg" }, { from: 111, to: 128, g: "plays", cues: [114, 121] },
    { from: 128, to: 134, head: 128 }, { from: 134, to: 141, g: "paper15" }, { from: 141, to: 156, head: 128 },
    { from: 156, to: 163, pic: "l-piano.jpg" }, { from: 163, to: 168, pic: "l-stage.jpg" },
    { from: 168, to: 176, pic: "l-dance.jpg" }, { from: 176, to: 999, pic: "l-cassette.jpg" },
  ],
  beats: [
    { from: 0, key: [7, 9] }, { from: 10, key: [15, 15] }, { from: 16, key: [18, 18] }, { from: 21, key: [24, 24] },
    { from: 25, key: [26, 27] }, { from: 31, key: [34, 34] }, { from: 35, key: [37, 37] }, { from: 38, key: [39, 39] },
    { from: 50, key: [53, 53] }, { from: 54, key: [57, 57] }, { from: 58, key: [59, 59] }, { from: 64, key: [71, 72] },
    { from: 73, key: [74, 75] }, { from: 76, key: [81, 81] }, { from: 82, key: [86, 86] }, { from: 89, key: [90, 90] },
    { from: 97, key: [98, 98] }, { from: 104, key: [110, 110] }, { from: 111, key: [115, 116] }, { from: 117, key: [121, 121] },
    { from: 122, key: [127, 127] }, { from: 128, key: [130, 130] }, { from: 134, key: [135, 135] }, { from: 141, key: [143, 143] },
    { from: 148, key: [152, 153] }, { from: 156, key: [161, 162], note: "MANY PEOPLE WITH ALZHEIMER'S" }, { from: 163, key: [165, 165] },
    { from: 168, key: [172, 172] }, { from: 176, key: [180, 180] },
  ],
  cuts: [{ at: 38, kind: "burn" }, { at: 76, kind: "glitch" }, { at: 128, kind: "flash" }, { at: 168, kind: "burn" }],
  sfx: [[38, "paper", 0.3], [53, "pop", 0.25], [74, "spark", 0.35], [82, "spark", 0.25], [114, "riser", 0.25], [121, "pop", 0.3],
    [-(1151 + HEAD_ON), "lamp", 0.35], [134, "paper", 0.3], [148, "subdrop", 0.35], [183, "chime", 0.4]],
};

// ---------- Version B: story flow ----------
const B: Version = {
  words: WORDS_B, voice: "voice_b.mp3", music: "music_drive.wav", end: 1775, frames: 1865, calm: false,
  layers: [
    { from: 0, to: 11, pic: "l-sing.jpg" }, { from: 11, to: 23, pic: "l-singer.jpg" }, { from: 23, to: 33, pic: "l-bored.jpg" },
    { from: 33, to: 40, pic: "l-headphones.jpg" }, { from: 40, to: 45, g: "blue" }, { from: 45, to: 62, g: "paper94" },
    { from: 62, to: 97, g: "sungspoken", cues: [80, 95] }, { from: 97, to: 129, g: "melody", cues: [105, 114, 123] },
    { from: 129, to: 136, pic: "l-radio.jpg" }, { from: 136, to: 155, g: "plays", cues: [139, 145] },
    { from: 155, to: 162, head: 155 }, { from: 162, to: 170, g: "paper15" }, { from: 170, to: 189, head: 155 },
    { from: 189, to: 200, pic: "l-piano.jpg" }, { from: 200, to: 205, pic: "l-stage.jpg" },
    { from: 205, to: 213, pic: "l-dance.jpg" }, { from: 213, to: 999, pic: "l-cassette.jpg" },
  ],
  beats: [
    { from: 0, key: [9, 10] }, { from: 11, key: [15, 15] }, { from: 18, key: [21, 22] }, { from: 23, key: [32, 32] },
    { from: 33, key: [37, 37] }, { from: 40, key: [43, 43] }, { from: 45, key: [47, 47] }, { from: 53, key: [58, 58] },
    { from: 62, key: [70, 70] }, { from: 71, key: [73, 73] }, { from: 80, key: [83, 84] }, { from: 89, key: [95, 96] },
    { from: 97, key: [104, 104] }, { from: 105, key: [110, 110] }, { from: 113, key: [114, 114] }, { from: 121, key: [123, 123] },
    { from: 129, key: [135, 135] }, { from: 136, key: [140, 141] }, { from: 142, key: [146, 148] }, { from: 149, key: [154, 154] },
    { from: 155, key: [158, 158] }, { from: 162, key: [163, 163] }, { from: 170, key: [172, 172] }, { from: 177, key: [184, 185] },
    { from: 189, key: [198, 199], note: "MANY PEOPLE WITH ALZHEIMER'S" }, { from: 200, key: [202, 202] }, { from: 205, key: [209, 209] },
    { from: 213, key: [217, 217] },
  ],
  cuts: [{ at: 45, kind: "burn" }, { at: 97, kind: "glitch" }, { at: 155, kind: "flash" }, { at: 205, kind: "burn" }],
  sfx: [[45, "paper", 0.3], [65, "pop", 0.25], [95, "spark", 0.35], [105, "spark", 0.25], [139, "riser", 0.25], [145, "pop", 0.3],
    [-(1199 + HEAD_ON), "lamp", 0.35], [162, "paper", 0.3], [184, "subdrop", 0.35], [220, "chime", 0.4]],
};

export const FRAMES_A = A.frames, FRAMES_B = B.frames;
export const VideoA: React.FC = () => <Edit v={A} />;
export const VideoB: React.FC = () => <Edit v={B} />;
