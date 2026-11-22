// "Why $99.99 feels cheaper than $100" (the left-digit effect) in the blue explainer edit, Full Blend script.
// Facts: Thomas & Morwitz (2005) JCR 32(1); Thomas, Simon & Kadiyali (2010) Marketing Science 29(1); Anderson & Simester (2003)
// QME 1(1); Lacetera, Pope & Sydnor (2012) AER 102(5); iTunes store 2003 at 99 cents. See SCRIPT.md.
import React from "react";
import { AbsoluteFill, Audio, getInputProps, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, FLASH, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot } from "./media";
import { EndCard } from "./graphics3";
import { Equals, MallTags, Odometer, Scan, Songs, Tags, Tests } from "./ldg";
import { WORDS } from "./speech";
import { SANS2 } from "./type";

type Word = { w: string; at: number };
type PaperId = "p05" | "p10" | "p03" | "p12";
type Layer =
  | { from: number; to: number; pic: string; pos?: string; zoom?: [number, number]; grade?: string }
  | { from: number; to: number; g: "blue" | PaperId | "tags" | "stamp" | "songs" | "scan" | "mall" | "tests" | "odo" | "equals"; cues?: number[] }
  | { from: number; to: number; clip: "price.mp4"; start: number; lead?: number };
type Beat = { from: number; key: [number, number]; note?: string };

const PAPERS: Record<PaperId, { journal: string; title: string; authors: string }> = {
  p05: { journal: "JOURNAL OF CONSUMER RESEARCH · 2005", title: "Penny wise and pound foolish: the left-digit effect in price cognition", authors: "Manoj Thomas & Vicki Morwitz" },
  p10: { journal: "MARKETING SCIENCE · 2010", title: "The price precision effect", authors: "Manoj Thomas, Daniel H. Simon & Vrinda Kadiyali" },
  p03: { journal: "QUANTITATIVE MARKETING AND ECONOMICS · 2003", title: "Effects of $9 price endings on retail sales", authors: "Eric T. Anderson & Duncan I. Simester" },
  p12: { journal: "AMERICAN ECONOMIC REVIEW · 2012", title: "Heuristic thinking and limited attention in the car market", authors: "Nicola Lacetera, Devin G. Pope & Justin R. Sydnor" },
};

const W = WORDS;
const F = (i: number) => (i >= W.length ? END : W[i].at);
/** the end card arrives right after "...a hundred dollars", on the music's final hit */
export const END = 3165;
export const FRAMES = END + 92;
const SHOT_AT = 81;

const LAYERS: Layer[] = [
  { from: 0, to: 4, pic: "v-mall.mp4" }, { from: 4, to: 17, g: "tags", cues: [7, 12] }, { from: 17, to: 26, pic: "v-shoes.mp4" },
  { from: 26, to: 31, g: "stamp", cues: [27] }, { from: 31, to: 42, pic: "v-music.mp4" }, { from: 42, to: 57, g: "songs", cues: [48, 52] },
  { from: 57, to: 67, g: "blue" }, { from: 67, to: SHOT_AT, g: "p05" }, { from: SHOT_AT, to: 105, clip: "price.mp4", start: SHOT_AT },
  { from: 105, to: 116, g: "scan", cues: [107, 115] }, { from: 116, to: 131, pic: "v-mall2.mp4" }, { from: 131, to: 145, g: "mall" },
  { from: 145, to: 157, g: "p10" }, { from: 157, to: 172, pic: "v-clothes.mp4" }, { from: 172, to: 180, pic: "v-cart.mp4" },
  { from: 180, to: 196, g: "p03" }, { from: 196, to: 206, g: "tests", cues: [197, 200, 203] }, { from: 206, to: 210, g: "blue" },
  { from: 210, to: 217, pic: "v-dealer.mp4", pos: "50% 30%" }, { from: 217, to: 229, g: "p12" }, { from: 229, to: 243, pic: "v-road.mp4" },
  { from: 243, to: 253, g: "odo", cues: [248] }, { from: 253, to: 264, pic: "v-cash.mp4" }, { from: 264, to: 270, pic: "v-headph.mp4" },
  { from: 270, to: 276, pic: "v-carts.mp4" }, { from: 276, to: 291, pic: "v-dollars.mp4" }, { from: 291, to: 999, g: "equals" },
];

const BEATS: Beat[] = [
  [0, 3, 3], [4, 7, 7], [8, 10, 11], [12, 15, 16], [17, 18, 18], [19, 25, 25], [26, 28, 29], [30, 30, 30], [31, 33, 34], [35, 37, 37], [38, 41, 41],
  [42, 44, 44], [45, 48, 49], [50, 55, 56], [57, 58, 58], [59, 65, 66], [67, 69, 69], [70, 72, 76], [77, 80, 80], [81, 83, 83], [84, 87, 89],
  [90, 92, 92], [93, 97, 98], [99, 104, 104], [105, 107, 107], [108, 113, 113], [114, 115, 115], [116, 123, 123], [124, 129, 130],
  [131, 134, 134], [135, 139, 140], [141, 144, 144], [145, 147, 147], [148, 152, 152], [153, 156, 156], [157, 161, 161], [162, 165, 165],
  [166, 171, 171], [172, 176, 176], [177, 179, 179], [180, 183, 184], [185, 187, 189], [190, 194, 194], [195, 198, 198], [199, 205, 205],
  [206, 209, 209], [210, 215, 216], [217, 218, 218], [219, 225, 225], [226, 228, 228], [229, 234, 234], [235, 238, 238], [239, 242, 242],
  [243, 246, 246], [247, 248, 248], [249, 252, 252], [253, 257, 257], [258, 262, 263], [264, 266, 266], [267, 268, 268], [269, 272, 272],
  [273, 275, 275], [276, 279, 279], [280, 284, 284], [285, 287, 287], [288, 290, 290], [291, 292, 292], [293, 296, 296],
].map(([from, a, b]) => ({ from, key: [a, b] as [number, number] }));

const CUTS: { at: number; kind: "burn" | "flash" | "glitch" }[] = [
  { at: 4, kind: "flash" }, { at: 31, kind: "burn" }, { at: 57, kind: "flash" }, { at: 67, kind: "burn" }, { at: SHOT_AT, kind: "flash" },
  { at: 105, kind: "glitch" }, { at: 131, kind: "flash" }, { at: 145, kind: "burn" }, { at: 180, kind: "burn" }, { at: 206, kind: "glitch" },
  { at: 217, kind: "burn" }, { at: 243, kind: "flash" }, { at: 291, kind: "flash" },
];

// [word index, or -frame for an exact frame], sound, volume (all sounds are played at 0.4x)
const SFX: [number, string, number][] = [
  [0, "whoosh-film", 0.25], [7, "pop", 0.25], [12, "pop", 0.25], [27, "glitch-a", 0.3], [48, "marker", 0.3], [52, "pop", 0.2],
  [67, "paper", 0.3], [-(F(SHOT_AT) + 60), "spark", 0.3], [107, "spark", 0.3], [131, "pop", 0.25], [145, "paper", 0.3], [180, "paper", 0.3],
  [197, "chime", 0.2], [200, "chime", 0.2], [203, "chime", 0.25], [217, "paper", 0.3], [248, "subdrop", 0.35], [291, "chime", 0.3],
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
const { musicGain: MUSIC_GAIN = 0.63 } = getInputProps() as { musicGain?: number };

export const LeftDigit: React.FC = () => {

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
                {l.g === "tags" ? <Tags from={a} at1={F(l.cues![0])} at2={F(l.cues![1])} /> : null}
                {l.g === "stamp" ? <Tags from={a - 200} at1={a - 200} at2={a - 200} stampAt={F(l.cues![0])} /> : null}
                {l.g === "songs" ? <Songs from={a} crossAt={F(l.cues![0])} rowsAt={F(l.cues![1])} /> : null}
                {l.g === "scan" ? <Scan from={a} nineAt={F(l.cues![0])} tenAt={F(l.cues![1])} /> : null}
                {l.g === "mall" ? <MallTags from={a} /> : null}
                {l.g === "tests" ? <Tests at={[F(l.cues![0]), F(l.cues![1]), F(l.cues![2])]} /> : null}
                {l.g === "odo" ? <Odometer from={a} crossAt={F(l.cues![0])} /> : null}
                {l.g === "equals" ? <Equals from={a} /> : null}
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
