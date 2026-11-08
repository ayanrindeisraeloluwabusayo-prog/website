// 30-second style test: "Why a song gives you chills", in the blue serif explainer style.
// Facts: Salimpoor et al., Nature Neuroscience 14, 257-262 (2011), McGill University: dopamine is released
// in the caudate during the anticipation of a musical peak and in the nucleus accumbens at the peak itself.
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { BuildCurve, LineHead, Regions, Rising, StippleHead, StudyPage } from "./art";
import { BIG, BLUE, BlueField, Drift, FilmBurn, FLASH, Grain, InvertFlash, p, Paper, PixelGlitch } from "./kit";
import { SERIF2, ws } from "./type";
import { Lockup } from "./lockup";

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

/** Four 2-frame flashes before landing (the flash-frame montage). */
const FlashMontage: React.FC<{ at: number }> = ({ at }) => {
  const f = useCurrentFrame() - at;
  if (f < 0 || f >= 8) return null;
  const k = Math.floor(f / 2);
  if (k === 0) return <AbsoluteFill style={{ background: FLASH, justifyContent: "center", alignItems: "center", fontFamily: SERIF2, fontSize: BIG * 1.6, color: "#111" }}>?</AbsoluteFill>;
  if (k === 1) return <AbsoluteFill style={{ background: "#111", filter: "invert(1)" }}><StippleHead from={-200} scale={1.1} y={600} /></AbsoluteFill>;
  if (k === 2) return <AbsoluteFill style={{ background: BLUE, justifyContent: "center", alignItems: "center" }}><div style={{ width: 520, height: 520, borderRadius: "50%", border: "6px solid #fff" }} /></AbsoluteFill>;
  return <AbsoluteFill><Paper /><BuildCurve from={-100} dur={1} y={960} height={700} stroke={10} /></AbsoluteFill>;
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: BLUE }}>
      {/* 1. Hook: a head of grain that blows away (0.0-3.4 s) */}
      <Scene from={0} to={102}>
        <Drift from={0} to={102} amount={0.05}>
          <BlueField glow={0.4} />
          <StippleHead from={0} y={760} />
        </Drift>
        <Grain amount={0.2} />
        <Lockup
          top={300}
          x={90}
          width={900}
          lines={[
            { words: ws("That", 0), align: "flex-start", indent: 34 },
            { kind: "serif", words: ws("chill", 10), align: "flex-start" },
            { words: ws("down your spine", 26, 8), align: "flex-start", indent: 300 },
          ]}
        />
      </Scene>

      {/* 2. Paper: it's chemistry (3.4-6.8 s) */}
      <Scene from={102} to={204}>
        <Drift from={102} to={204} amount={0.04}>
          <Paper />
          <BuildCurve from={110} dur={90} y={1300} height={300} />
        </Drift>
        <Grain amount={0.12} />
        <Lockup
          top={560}
          color={BLUE}
          lines={[
            { words: ws("isn't magic.", 108, 8) },
            { words: ws("It's", 136), align: "flex-start", indent: 120 },
            { kind: "bold", words: ws("chemistry.", 144) },
          ]}
        />
      </Scene>

      {/* 3. Blue duotone diagram: the build (6.8-10.4 s) */}
      <Scene from={204} to={312}>
        <Drift from={204} to={312} amount={0.05}>
          <BlueField crumple glow={0.6} />
          <LineHead draw={p(f, 206, 30)} brain={p(f, 226, 20)} />
          <BuildCurve from={232} dur={78} color="#ffffff" y={1640} height={220} stroke={4} />
        </Drift>
        <Grain amount={0.22} />
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

      {/* 4. Dopamine rising (10.4-14.0 s) */}
      <Scene from={312} to={420}>
        <Drift from={312} to={420} amount={0.06}>
          <AbsoluteFill style={{ background: "radial-gradient(ellipse 70% 55% at 50% 55%, #0a2fb8 0%, #04104f 70%, #020822 100%)" }} />
          <Rising from={312} />
        </Drift>
        <Grain amount={0.22} />
        <Lockup
          top={760}
          lines={[
            { words: ws("your brain releases", 318, 7), align: "flex-start", indent: 110 },
            { kind: "serif", words: ws("dopamine", 346) },
          ]}
        />
      </Scene>

      {/* 5. Push to the peak: before (14.0-17.5 s) */}
      <Scene from={420} to={525}>
        <Paper />
        <BuildCurve from={-200} dur={1} y={1300} height={760} stroke={12} zoom={1 + 0.7 * p(f, 420, 100)} />
        <Grain amount={0.12} />
        <Lockup
          top={210}
          x={70}
          width={940}
          color={BLUE}
          lines={[
            { kind: "serif", words: ws("before", 422), align: "flex-start", size: 260 },
            { words: ws("the drop even lands.", 446, 8), align: "flex-start", indent: 230 },
          ]}
        />
      </Scene>

      {/* 6. The study, highlighted (17.5-22.5 s) */}
      <Scene from={525} to={675}>
        <Drift from={525} to={675} amount={0.04}>
          <Paper />
          <StudyPage from={528} highlightAt={606} />
        </Drift>
        <Grain amount={0.12} />
        <Lockup
          top={240}
          color={BLUE}
          lines={[
            { words: ws("In 2011, researchers", 530, 8) },
            { kind: "serif", words: ws("scanned", 556) },
            { words: ws("listeners' brains.", 576, 8), align: "flex-end", indent: 120 },
          ]}
        />
      </Scene>

      {/* 7. Two regions (22.5-26.5 s) */}
      <Scene from={675} to={795}>
        <Drift from={675} to={795} amount={0.04}>
          <BlueField crumple glow={0.5} />
          <LineHead draw={1} brain={1} />
          <Regions a={690} b={748} />
        </Drift>
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

      {/* 8. Paper: the payoff (26.5-28.9 s) */}
      <Scene from={795} to={866}>
        <Drift from={795} to={866} amount={0.05}>
          <Paper />
          <BuildCurve from={-100} dur={1} y={1380} height={260} />
        </Drift>
        <Grain amount={0.12} />
        <Lockup
          top={600}
          color={BLUE}
          lines={[
            { words: ws("The build-up isn't the wait.", 800, 5) },
            { words: ws("It's the", 828, 5), align: "flex-start", indent: 170 },
            { kind: "serif", words: ws("reward.", 842) },
          ]}
        />
      </Scene>

      {/* 9. Call to action (28.9-30 s) */}
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

      {/* sound: a soft bed under everything, hits on the stylised transitions */}
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
