// "Why a song gives you chills", 30 s, in the blue serif explainer style, with real imagery.
// Facts: Salimpoor et al., Nature Neuroscience 14, 257-262 (2011), McGill University: dopamine is released
// in the caudate during the anticipation of a musical peak and in the nucleus accumbens at the peak itself.
// Pictures: public domain (Art Institute of Chicago, Wikimedia Commons) and Pixabay (Pixabay Content
// License); see CREDITS.md. Text colour rule: white on pictures and blue, black on paper, blue as an accent.
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BuildCurve, LineHead, Regions, Rising, StippleHead, StudyPage } from "./art";
import { BeforeGraph, BlueStage, Molecule, Panel } from "./motion";
import { BlueField, FilmBurn, Grain, InvertFlash, p, Paper, PixelGlitch } from "./kit";
import { ws } from "./type";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";

export const FRAMES = 900;

/** Music level: steady, dipping briefly under the big hits so they land clearly. */
const DIPS = [258, 313, 420];
const musicLevel = (f: number) => {
  let v = 0.6;
  for (const d of DIPS) {
    const k = f < d - 3 ? 0 : f < d ? (f - d + 3) / 3 : Math.max(0, 1 - (f - d) / 30);
    v = Math.min(v, 0.6 - 0.3 * k);
  }
  return v * Math.min(1, (900 - f) / 20);
};

/** One sound effect from public/sfx2 (made by make_sfx.py), starting at frame `at`. */
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** Four pictures for 2 frames each before landing (the flash-frame montage). */
const FlashMontage: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= 8) return null;
  const pics = ["6A.jpg", "9A.jpg", "1B.jpg", "2A.jpg"];
  const k = Math.floor(f / 2);
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Img src={staticFile(`media/${pics[k]}`)} style={{ width: "100%", height: "100%", objectFit: "cover", filter: k % 2 ? "url(#duo-blue)" : "grayscale(1) contrast(1.2)" }} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. Hook: picture (Rodin's head thrown back), then motion: a head of grain that blows away (0.0-3.4 s) */}
      <Scene from={0} to={102}>
        <Shot src="1B.jpg" from={0} to={50} pos="50% 100%" zoom={[0.98, 1.06]} shiftY={330} fill="rgb(41,92,255)" duo="blue" grade="contrast(1.15)" />
        <Scene from={50} to={102}>
          <BlueStage glowY={55} />
          <StippleHead from={30} y={820} />
        </Scene>
        <Grain amount={0.22} />
        <Lockup
          top={250}
          x={90}
          width={900}
          lines={[
            { words: ws("That", 0), align: "flex-start", indent: 34 },
            { kind: "serif", words: ws("chill", 10), align: "flex-start" },
            { words: ws("down your spine", 26, 8), align: "flex-start", indent: 300 },
          ]}
        />
      </Scene>

      {/* 2. The alchemist: not magic; ink in water: chemistry (3.4-6.8 s) */}
      <Scene from={102} to={204}>
        <Shot src="2A.jpg" from={102} to={146} pos="50% 70%" zoom={[1.05, 1.13]} grade="brightness(0.95) contrast(1.1) saturate(0.9)" />
        <Scene from={0} to={146}>
          <Scrim side="top" strength={0.65} />
        </Scene>
        <Scene from={146} to={204}>
          <BlueStage />
          <Molecule from={148} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup
          top={300}
          lines={[
            { words: ws("isn't magic.", 108, 8) },
            { words: ws("It's", 136), align: "flex-start", indent: 120 },
            { kind: "bold", words: ws("chemistry.", 144) },
          ]}
        />
      </Scene>

      {/* 3. The build: a storm sea, then push into the great wave (6.8-10.4 s) */}
      <Scene from={204} to={312}>
        <Scene from={204} to={258}>
          <BlueStage glowY={65} />
          <Panel from={204} x={50} y={900} w={980} h={720}>
            <div style={{ position: "absolute", left: 40, top: 30, color: "rgba(255,255,255,0.75)", fontFamily: "'Inter Tight', sans-serif", fontSize: 30, letterSpacing: "0.14em" }}>A SONG'S LOUDNESS</div>
          </Panel>
          <BuildCurve from={208} dur={60} color="#ffffff" y={1290} height={460} stroke={5} />
        </Scene>
        <Shot src="3B.jpg" from={258} to={312} pos="30% 40%" zoom={[1.0, 1.35]} grade="contrast(1.05)" />
        <Scene from={258} to={312}>
          <Scrim side="top" strength={0.7} />
          <Vignette amount={0.45} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup
          top={230}
          x={110}
          width={880}
          lines={[
            { words: ws("When a song you love", 208, 6), align: "flex-end" },
            { words: ws("builds toward its", 240, 6), align: "flex-end" },
            { kind: "serif", words: ws("peak,", 262), align: "flex-end" },
          ]}
        />
      </Scene>

      {/* 4. Dopamine: a gold burst, then Whistler's falling sparks (10.4-14.0 s) */}
      <Scene from={312} to={420}>
        <Shot src="firework.mp4" video from={312} to={372} zoom={[1.0, 1.1]} grade="brightness(0.8)" />
        <Scene from={312} to={372}>
          <Scrim side="top" strength={0.8} />
        </Scene>
        <Scene from={372} to={420}>
          <BlueStage glowY={62} />
          <LineHead draw={1} brain={1} y={760} />
          <Rising from={340} />
        </Scene>
        <Vignette amount={0.5} />
        <Grain amount={0.24} />
        <Lockup
          top={250}
          lines={[
            { words: ws("your brain releases", 318, 7), align: "flex-start", indent: 110 },
            { kind: "serif", words: ws("dopamine", 346) },
          ]}
        />
      </Scene>

      {/* 5. Before: a diver hanging in the air, then a drop that hasn't landed (14.0-17.5 s) */}
      <Scene from={420} to={525}>
        <Shot src="5E.jpg" from={420} to={462} pos="50% 50%" zoom={[1.0, 1.1]} grade="contrast(1.1)" />
        <Scene from={420} to={462}>
          <Scrim side="top" strength={0.55} />
        </Scene>
        <Scene from={462} to={525}>
          <BlueStage glowY={65} />
          <Panel from={462} x={50} y={880} w={980} h={820}>
            <span />
          </Panel>
          <BeforeGraph from={466} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup
          top={210}
          x={70}
          width={940}
          lines={[
            { kind: "serif", words: ws("before", 422), align: "flex-start", size: 260 },
            { words: ws("the drop even lands.", 446, 8), align: "flex-start", indent: 230 },
          ]}
        />
      </Scene>

      {/* 6. The study: a brain scan, then the paper with the highlighter (17.5-22.5 s) */}
      <Scene from={525} to={600}>
        <Shot src="6E.jpg" from={525} to={600} pos="55% 50%" zoom={[1.05, 1.15]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup
          top={240}
          lines={[
            { words: ws("In 2011, researchers", 530, 8) },
            { kind: "serif", words: ws("scanned", 556) },
            { words: ws("listeners' brains.", 576, 8), align: "flex-end", indent: 120 },
          ]}
        />
      </Scene>
      <Scene from={600} to={675}>
        <Paper />
        <StudyPage from={600} highlightAt={618} />
        <Grain amount={0.12} />
        <Lockup
          top={300}
          color="#111"
          shadow={false}
          lines={[
            { words: ws("published in", 602, 6), align: "flex-start", indent: 60 },
            { kind: "serif", words: ws("Nature", 614) },
            { words: ws("Neuroscience, 2011", 624, 6), align: "flex-end", indent: 60 },
          ]}
        />
      </Scene>

      {/* 7. Two regions: brain cells firing, then two lamps switching on (22.5-26.5 s) */}
      <Scene from={675} to={795}>
        <Shot src="neurons.mp4" video from={675} to={704} zoom={[1.0, 1.08]} grade="contrast(1.1)" />
        <Scene from={675} to={704}>
          <Scrim side="top" strength={0.6} />
        </Scene>
        <Scene from={704} to={795}>
          <BlueStage glowY={60} />
          <LineHead draw={p(f, 704, 18)} brain={p(f, 712, 14)} />
          <Regions a={721} b={770} />
        </Scene>
        <Grain amount={0.22} />
        <Lockup
          top={240}
          until={738}
          lines={[
            { kind: "serif", words: ws("Anticipation", 682) },
            { words: ws("lit up one region.", 700, 7), align: "flex-end", indent: 50 },
          ]}
        />
        <Lockup
          top={240}
          lines={[
            { words: ws("The", 740), align: "flex-start", indent: 250 },
            { kind: "serif", words: ws("peak,", 746) },
            { words: ws("lit up another.", 764, 6), align: "flex-end", indent: 170 },
          ]}
        />
      </Scene>

      {/* 8. The reward: the Wanderer, then arms up above the clouds (26.5-28.9 s) */}
      <Scene from={795} to={866}>
        <Shot src="8A.jpg" from={795} to={828} pos="50% 30%" zoom={[1.0, 1.06]} grade="contrast(1.05)" />
        <Shot src="8E.jpg" from={828} to={866} pos="50% 50%" zoom={[1.15, 1.05]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.18} />
        <Lockup
          top={260}
          lines={[
            { words: ws("The build-up isn't the wait.", 800, 5) },
            { words: ws("It's the", 828, 5), align: "flex-start", indent: 170 },
            { kind: "serif", words: ws("reward.", 842) },
          ]}
        />
      </Scene>

      {/* 9. Call to action on blue (28.9-30 s) */}
      <Scene from={866} to={900}>
        <BlueField glow={0.5} />
        <Grain amount={0.2} />
        <Lockup
          top={760}
          lines={[
            { words: ws("Follow for more", 868, 3) },
            { kind: "bold", words: ws("music science", 878), size: 118 },
          ]}
        />
      </Scene>

      {/* transitions */}
      <FilmBurn at={97} />
      <InvertFlash at={311} />
      <PixelGlitch at={519} />
      <FlashMontage at={671} />
      <FilmBurn at={790} />

      {/* sound: a soft music bed that dips under the big moments, and effects only where something happens
          (plan in SOUND.md). Whooshes peak 15 frames after they start, so they start 15 frames before the cut. */}
      <Audio src={staticFile("music.wav")} volume={(f) => musicLevel(f)} />
      <Sfx at={0} src="shiver" volume={0.45} />
      <Sfx at={148} src="spark" volume={0.25} />         {/* the molecule starts drawing */}          {/* the chill: cold breath and shimmer */}
      <Sfx at={85} src="whoosh-film" volume={0.55} />    {/* film burn into the alchemist */}
      <Sfx at={201} src="riser" volume={0.4} />          {/* "builds toward its…" climbs, cut dead on the wave */}
      <Sfx at={258} src="wave-hit" volume={0.7} />       {/* the great wave lands */}
      <Sfx at={310} src="glitch-a" volume={0.35} />      {/* invert flash */}
      <Sfx at={313} src="firework" volume={0.6} />       {/* gold burst: dopamine */}
      <Sfx at={420} src="subdrop" volume={0.75} />       {/* "before": the floor drops out */}
      <Sfx at={466} src="paper" volume={0.3} />          {/* the graph panel slides up */}
      <Sfx at={518} src="glitch-b" volume={0.3} />       {/* pixel glitch into the scan */}
      <Sfx at={618} src="marker" volume={0.35} />        {/* highlighter across the study title */}
      <Sfx at={671} src="shutter" volume={0.45} />       {/* one click per flash frame */}
      <Sfx at={721} src="spark" volume={0.4} />          {/* first region lights up */}
      <Sfx at={770} src="lamp" volume={0.45} />          {/* second region switches on */}
      <Sfx at={778} src="whoosh-film" volume={0.45} />   {/* film burn into the reward */}
      <Sfx at={842} src="chime" volume={0.4} />          {/* "reward." rings out */}
      <Sfx at={866} src="pop" volume={0.45} />           {/* end card lands */}
    </AbsoluteFill>
  );
};
