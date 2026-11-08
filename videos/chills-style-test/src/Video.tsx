// "Why a song gives you chills", 30 s, in the blue serif explainer style, with real imagery.
// Facts: Salimpoor et al., Nature Neuroscience 14, 257-262 (2011), McGill University: dopamine is released
// in the caudate during the anticipation of a musical peak and in the nucleus accumbens at the peak itself.
// Pictures: public domain (Art Institute of Chicago, Wikimedia Commons) and Pixabay (Pixabay Content
// License); see CREDITS.md. Text colour rule: white on pictures and blue, black on paper, blue as an accent.
import { AbsoluteFill, Audio, Img, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueField, FilmBurn, Grain, InvertFlash, p, Paper, PixelGlitch } from "./kit";
import { ws } from "./type";
import { Lockup } from "./lockup";
import { Card, Filters, Scrim, Shot, Stage, Vignette } from "./media";

export const FRAMES = 900;

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.6 }) => (
  <Sequence from={at} durationInFrames={90} layout="none">
    <Audio src={staticFile(`sfx/${src}.mp3`)} volume={volume} />
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

/** Two lamps that switch on one after the other: dark at first, then full glow. */
const Lamps: React.FC<{ from: number; on: number }> = ({ from, on }) => {
  const f = useCurrentFrame();
  const k = p(f, on, 8);
  return (
    <AbsoluteFill style={{ filter: `brightness(${0.35 + 0.75 * k}) saturate(${0.6 + 0.5 * k})` }}>
      <Card src="7F.jpg" from={from} to={795} ratio={1280 / 853} width={980} y={1180} tilt={-1.5} />
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. Hook: a head thrown back (blue), then real goosebumps (0.0-3.4 s) */}
      <Scene from={0} to={102}>
        <Shot src="1B.jpg" from={0} to={50} pos="50% 100%" zoom={[0.98, 1.06]} shiftY={330} fill="rgb(41,92,255)" duo="blue" grade="contrast(1.15)" />
        <Scene from={50} to={102}>
          <BlueField glow={0.4} />
          <Card src="1E.jpg" from={50} to={102} ratio={1280 / 960} width={940} y={1250} tilt={2} />
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
        <Shot src="ink.mp4" video from={146} to={204} zoom={[1.0, 1.08]} duo="ink" grade="contrast(1.2)" />
        <Scrim side="top" strength={0.65} />
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
        <Shot src="sea.mp4" video from={204} to={258} zoom={[1.0, 1.06]} grade="brightness(0.9) contrast(1.15) saturate(0.8)" />
        <Shot src="3B.jpg" from={258} to={312} pos="30% 40%" zoom={[1.0, 1.35]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.7} />
        <Vignette amount={0.45} />
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
        <Shot src="firework.mp4" video from={312} to={378} zoom={[1.0, 1.1]} grade="brightness(0.8)" />
        <Shot src="4A.jpg" from={378} to={420} pos="50% 40%" zoom={[1.05, 1.15]} grade="brightness(1.25) contrast(1.15)" />
        <Scrim side="top" strength={0.8} />
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
        <Shot src="5E.jpg" from={420} to={470} pos="50% 50%" zoom={[1.0, 1.1]} grade="contrast(1.1)" />
        <Scene from={470} to={525}>
          <Stage />
          <Card src="5F.jpg" from={470} to={525} ratio={1280 / 786} width={980} y={1250} tilt={-1} grade="grayscale(0.3) contrast(1.1)" />
        </Scene>
        <Scrim side="top" strength={0.55} />
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
        <Shot src="neurons.mp4" video from={675} to={738} zoom={[1.0, 1.08]} grade="contrast(1.1)" />
        <Scene from={738} to={795}>
          <Stage />
          <Lamps from={738} on={748} />
        </Scene>
        <Scrim side="top" strength={0.6} />
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

      {/* sound (placeholder until we plan the sound together): soft bed, hits on the stylised transitions */}
      <Audio src={staticFile("music.wav")} volume={0.75} />
      <Sfx at={95} src="whoosh-cinematic" volume={0.5} />
      <Sfx at={250} src="riser" volume={0.22} />
      <Sfx at={311} src="glitch-2" volume={0.45} />
      <Sfx at={420} src="impact-bass-1" volume={0.55} />
      <Sfx at={518} src="glitch-2" volume={0.4} />
      <Sfx at={670} src="whoosh" volume={0.45} />
      <Sfx at={788} src="whoosh-cinematic" volume={0.45} />
      <Sfx at={866} src="pop" volume={0.5} />
    </AbsoluteFill>
  );
};
