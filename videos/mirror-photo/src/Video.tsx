// "Why you look better in the mirror than in photos" (mosquito-style graphics), Full Blend.
// Facts: Mita, Dermer & Knight (1977) JPSP; Ward et al. (2018) JAMA Facial Plast Surg; Epley & Whitchurch (2008) PSPB. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Distance, Morph, Phone, Prints, Uneven } from "./mpg";
import { KEY_AT } from "./SelfieShot";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p77";
type G = "blue" | PaperId | "phone" | "prints" | "uneven" | "distance" | "morph";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: G; cues?: number[] }
  | { from: number; to: number; clip: "selfie3d.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p77: { journal: "JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1977", title: "Reversed facial images and the mere-exposure hypothesis", authors: "Theodore H. Mita, Marshall Dermer & Jeffrey Knight" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after the last word, on the music's final hit */
export const END = W[W.length - 1].at + 30;
export const FRAMES = END + 92;
/** the 3D face is widest on "wider" */
const LEAD = KEY_AT - (W[164].at - W[159].at);

const LAYERS: Layer[] = [
  { from: 0, to: 4, pic: "v-handmirror.mp4", pos: "50% 40%" }, { from: 4, to: 7, pic: "v-bathroom.mp4" }, { from: 7, to: 15, pic: "v-selfie.mp4", pos: "50% 35%" },
  { from: 15, to: 19, pic: "v-lens.mp4" }, { from: 19, to: 40, g: "phone", cues: [24] }, { from: 40, to: 48, pic: "v-couple.mp4" }, { from: 48, to: 51, g: "blue" },
  { from: 51, to: 54, g: "p77" }, { from: 54, to: 88, g: "prints", cues: [57, 68, 75, 84] }, { from: 88, to: 101, pic: "v-boymirror.mp4", pos: "40% 40%" },
  { from: 101, to: 115, g: "uneven", cues: [113] }, { from: 115, to: 126, pic: "v-makeup.mp4" }, { from: 126, to: 130, g: "blue" },
  { from: 130, to: 137, pic: "v-selfie.mp4", pos: "50% 35%" }, { from: 137, to: 159, g: "distance", cues: [152] }, { from: 159, to: 172, clip: "selfie3d.mp4", start: 159, lead: LEAD },
  { from: 172, to: 199, g: "morph", cues: [194] }, { from: 199, to: 215, pic: "v-handmirror.mp4", pos: "50% 40%" }, { from: 215, to: 999, pic: "v-photographer.mp4", pos: "50% 40%" },
];

const BEATS: Beat[] = [
  [0, 3, 3], [4, 6, 6], [7, 11, 11], [12, 14, 14], [15, 18, 17], [19, 21, 21], [22, 24, 24], [25, 28, 28], [29, 33, 33], [34, 39, 37],
  [40, 43, 43], [44, 47, 47], [48, 53, 53], [54, 56, 56], [57, 57, 57], [60, 65, 65], [66, 68, 68], [69, 71, 71], [72, 75, 75], [76, 77, 77],
  [81, 84, 84], [85, 87, 86], [88, 93, 92], [94, 100, 99], [101, 105, 105], [106, 108, 106], [109, 114, 113], [115, 118, 117], [119, 122, 122],
  [126, 129, 129], [130, 133, 133], [137, 141, 141], [142, 143, 143], [144, 148, 148], [149, 153, 152], [154, 159, 159], [160, 164, 164],
  [165, 171, 170], [172, 176, 175], [177, 181, 181], [182, 183, 183], [189, 194, 194], [195, 198, 197], [199, 202, 202], [203, 207, 207],
  [208, 210, 210], [215, 219, 217], [220, 221, 220], [222, 225, 225], [226, 230, 229],
].map(([from, a, b]) => ({ from, key: [Math.min(a, b), Math.max(a, b)] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 4, kind: "flash" }, { at: 7, kind: "burn" }, { at: 15, kind: "glitch" }, { at: 19, kind: "flash" }, { at: 40, kind: "burn" },
  { at: 48, kind: "flash" }, { at: 51, kind: "burn" }, { at: 54, kind: "flash" }, { at: 88, kind: "burn" }, { at: 101, kind: "flash" },
  { at: 115, kind: "burn" }, { at: 126, kind: "glitch" }, { at: 130, kind: "burn" }, { at: 137, kind: "flash" }, { at: 159, kind: "burn" },
  { at: 172, kind: "flash" }, { at: 199, kind: "burn" }, { at: 215, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.3], [9, "shutter", 0.3], [24, "pop", 0.25], [51, "paper", 0.3], [66, "shutter", 0.2], [68, "shutter", 0.2], [75, "chime", 0.2],
  [84, "chime", 0.2], [113, "marker", 0.2], [152, "pop", 0.2], [-(F(159) - LEAD + KEY_AT), "spark", 0.4], [194, "chime", 0.25], [217, "shutter", 0.25],
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

export const MirrorPhoto: React.FC = () => {

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
                {l.g === "phone" ? <Phone from={a} onAt={F(l.cues![0])} /> : null}
                {l.g === "prints" ? <Prints from={a} normalAt={F(l.cues![0])} flipAt={F(l.cues![1])} sheAt={F(l.cues![2])} friendsAt={F(l.cues![3])} /> : null}
                {l.g === "uneven" ? <Uneven from={a} at={F(l.cues![0])} /> : null}
                {l.g === "distance" ? <Distance from={a} footAt={F(l.cues![0])} /> : null}
                {l.g === "morph" ? <Morph from={a} pickAt={F(l.cues![0])} /> : null}
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
