// "Why do you hate your own voice on a voice note?", 56 s, Brian's voice, blue serif explainer style.
// Rule of the edit: a feeling gets a picture, a mechanism gets a motion graphic, a new shot about every 2 s.
// Facts: you hear your own voice through the air and through the bones of your skull, and bone conduction
// adds low frequencies a recording does not capture. Holzman & Rousey, "The voice as a percept", Journal of
// Personality and Social Psychology (1966): "voice confrontation". Hughes & Harrison, Perception 42(9),
// 941-949 (2013): people unknowingly rated their own recorded voice as more attractive than others rated it.
// Pictures: Pixabay (Pixabay Content License); see CREDITS.md.
import { AbsoluteFill, Audio, Sequence, staticFile, useCurrentFrame } from "remotion";
import { LineHead, StudyPage } from "./art";
import { BlueStage, Panel } from "./motion";
import { BlueField, FilmBurn, Grain, InvertFlash, p, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";
import { EndCard } from "./graphics3";
import { EqBars, RatingBars, Ripples, TwoPaths, VoiceNote } from "./graphics4";
import { fr, say, WORDS } from "./speech";

export const FRAMES = 1685;
const END = 1590;

const talking = (f: number) => {
  for (let i = 0; i < WORDS.length; i++) {
    const a = WORDS[i].at, b = i + 1 < WORDS.length ? WORDS[i + 1].at : a + 20;
    if (f >= a - 4 && f < Math.min(b, a + 20) + 4) return true;
  }
  return false;
};
/** Music bed: present in the pauses, tucked under the voice, out at the end. */
const musicLevel = (f: number) => {
  let duck = 0;
  for (let d = -6; d <= 6; d += 2) duck += talking(f + d) ? 1 : 0;
  duck /= 7;
  let v = 0.32 - 0.16 * duck;
  if (f < 12) v *= f / 12;
  if (f > END + 5) v *= Math.max(0, 1 - (f - END - 5) / 85);
  return v;
};

const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.4 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.7} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

export const Video: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. HOOK (pictures): someone with their phone, then hands over the face */}
      <Scene from={0} to={92}>
        <Shot src="v-hook.jpg" from={0} to={51} pos="50% 20%" zoom={[1.1, 1.02]} grade="contrast(1.1) saturate(0.85)" />
        <Shot src="v-cringe.jpg" from={51} to={92} pos="50% 30%" zoom={[1.0, 1.12]} duo="blue" grade="contrast(1.2)" />
        <Scrim side="top" strength={0.75} />
        <Vignette amount={0.45} />
        <Grain amount={0.22} />
        <Lockup top={250} lines={[
          { words: say(0, 3), align: "flex-start" },
          { words: say(4, 6), align: "flex-start", indent: 60 },
          { words: say(7, 8), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(9, 10), size: 190 },
        ]} />
      </Scene>

      {/* 2. "You press play, and a stranger answers. Higher. Thinner." (motion: the voice note) */}
      <Scene from={92} to={231}>
        <BlueStage glowY={62} />
        <VoiceNote from={92} playAt={fr(13)} higherAt={fr(18)} thinnerAt={fr(19)} />
        <Grain amount={0.18} />
        <Lockup top={260} until={fr(18) - 1} lines={[
          { words: say(11, 13), align: "flex-start", indent: 40 },
          { words: say(14, 15), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(16), size: 210 },
          { words: say(17), align: "flex-end", indent: 80 },
        ]} />
        <Lockup top={300} until={fr(19) - 1} lines={[{ kind: "serif", words: say(18) }]} />
        <Lockup top={300} lines={[{ kind: "serif", words: say(19) }]} />
      </Scene>

      {/* 3. "Not you." (picture: hiding the face)  "But it is you." (picture: a face in a mirror) */}
      <Scene from={231} to={311}>
        <Shot src="v-notyou.jpg" from={231} to={268} pos="50% 30%" zoom={[1.02, 1.1]} grade="contrast(1.15)" />
        <Shot src="v-mirror.jpg" from={268} to={311} pos="50% 45%" zoom={[1.15, 1.04]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.22} />
        <Lockup top={280} until={fr(22) - 1} lines={[
          { words: say(20), align: "flex-start", indent: 140 },
          { kind: "serif", words: say(21) },
        ]} />
        <Lockup top={280} lines={[
          { words: say(22, 23), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(24, 25) },
        ]} />
      </Scene>

      {/* 4. "Here's what's happening." (motion: the head draws itself) */}
      <Scene from={311} to={354}>
        <BlueStage glowY={60} />
        <LineHead draw={p(f, 311, 24)} brain={p(f, 322, 14)} />
        <Grain amount={0.2} />
        <Lockup top={250} lines={[
          { words: say(26, 27), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(28), size: 170 },
        ]} />
      </Scene>

      {/* 5. "When you speak, the sound reaches your ears two ways." (pictures: a mouth, then an ear) */}
      <Scene from={354} to={455}>
        <Shot src="v-speak.jpg" from={354} to={396} pos="50% 40%" zoom={[1.02, 1.12]} grade="contrast(1.1)" />
        <Shot src="v-ear.jpg" from={396} to={455} pos="45% 35%" zoom={[1.2, 1.08]} grade="contrast(1.08) saturate(0.85)" />
        <Scrim side="top" strength={0.72} />
        <Grain amount={0.2} />
        <Lockup top={240} until={fr(32) - 1} lines={[
          { words: say(29, 30), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(31) },
        ]} />
        <Lockup top={240} lines={[
          { words: say(32, 34), align: "flex-start" },
          { words: say(35, 36), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(37, 38) },
        ]} />
      </Scene>

      {/* 6. "Through the air, like everyone else hears it." (motion: the white path round the head) */}
      <Scene from={455} to={536}>
        <BlueStage glowY={62} />
        <LineHead />
        <TwoPaths airAt={fr(39)} />
        <Grain amount={0.2} />
        <Lockup top={230} lines={[
          { words: say(39, 40), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(41) },
          { words: say(42, 46), align: "flex-end" },
        ]} />
      </Scene>

      {/* 7. "And through the bones of your skull." (picture: a skull X-ray) */}
      <Scene from={536} to={602}>
        <Shot src="v-skull.jpg" from={536} to={602} pos="88% 50%" zoom={[1.0, 1.1]} duo="blue" grade="contrast(1.2) brightness(1.1)" />
        <Scrim side="top" strength={0.75} />
        <Grain amount={0.22} />
        <Lockup top={240} lines={[
          { words: say(47, 49), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(50) },
          { words: say(51, 53), align: "flex-end", indent: 60 },
        ]} />
      </Scene>

      {/* 8. "Bone carries the deep notes better." (motion: the yellow path through the head) */}
      <Scene from={602} to={684}>
        <BlueStage glowY={62} />
        <LineHead />
        <TwoPaths airAt={560} boneAt={fr(54)} deep={fr(57)} />
        <Grain amount={0.2} />
        <Lockup top={230} lines={[
          { words: say(54, 56), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(57, 58) },
          { words: say(59), align: "flex-end", indent: 80 },
        ]} />
      </Scene>

      {/* 9. "So inside your head," (picture: a singer)  "your voice sounds deeper and richer" (motion: the bars) */}
      <Scene from={684} to={830}>
        <Shot src="v-sing.jpg" from={684} to={726} pos="40% 35%" zoom={[1.02, 1.12]} grade="contrast(1.1)" />
        <Scene from={684} to={726}>
          <Scrim side="top" strength={0.7} />
        </Scene>
        <Scene from={726} to={830}>
          <BlueStage glowY={65} />
          <Panel from={726} x={50} y={880} w={980} h={820}><span /></Panel>
          <EqBars from={730} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup top={240} until={fr(64) - 1} lines={[
          { words: say(60), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(61), size: 200 },
          { words: say(62, 63), align: "flex-end", indent: 80 },
        ]} />
        <Lockup top={220} lines={[
          { words: say(64, 66), align: "flex-start" },
          { kind: "serif", words: say(67), size: 200 },
          { words: say(68, 69), align: "flex-end", indent: 40 },
          { words: say(70, 73), align: "flex-end", indent: 40 },
        ]} />
      </Scene>

      {/* 10. "A recording only catches the air." (picture: a microphone)  "The bass is gone." (motion: bars fall) */}
      <Scene from={830} to={944}>
        <Shot src="v-mic.jpg" from={830} to={899} pos="50% 50%" zoom={[1.02, 1.14]} grade="contrast(1.15) brightness(1.15)" />
        <Scene from={830} to={899}>
          <Scrim side="top" strength={0.7} />
        </Scene>
        <Scene from={899} to={944}>
          <BlueStage glowY={65} />
          <Panel from={700} x={50} y={880} w={980} h={820}><span /></Panel>
          <EqBars from={700} dropAt={fr(83) - 6} />
        </Scene>
        <Grain amount={0.2} />
        <Lockup top={240} until={fr(80) - 1} lines={[
          { words: say(74, 75), align: "flex-start", indent: 40 },
          { words: say(76, 78), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(79) },
        ]} />
        <Lockup top={240} lines={[
          { words: say(80, 82), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(83) },
        ]} />
      </Scene>

      {/* 11. "That shock is so common," (picture)  "psychologists gave it a name back in 1966." (the paper) */}
      <Scene from={944} to={995}>
        <Shot src="v-shock.jpg" from={944} to={995} pos="50% 40%" zoom={[1.0, 1.1]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.22} />
        <Lockup top={240} lines={[
          { words: say(84), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(85) },
          { words: say(86, 88), align: "flex-end", indent: 60 },
        ]} />
      </Scene>
      <Scene from={995} to={1089}>
        <Paper />
        <StudyPage from={995} highlightAt={fr(96)} journal="JOURNAL OF PERSONALITY AND SOCIAL PSYCHOLOGY · 1966" title="The voice as a percept" authors="Holzman & Rousey" hlHeight={64} />
        <Grain amount={0.12} />
        <Lockup top={240} color="#111" shadow={false} lines={[
          { words: say(89), align: "flex-start" },
          { words: say(90, 93), align: "flex-start", indent: 60 },
          { words: say(94, 95), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(96) },
        ]} />
      </Scene>

      {/* 12. "Voice confrontation." (motion: rings pulsing out) */}
      <Scene from={1089} to={1143}>
        <BlueStage glowY={64} />
        <Ripples from={1089} />
        <Grain amount={0.2} />
        <Lockup top={280} lines={[
          { words: say(97), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(98), size: 148 },
        ]} />
      </Scene>

      {/* 13. "And here's the twist." (picture) */}
      <Scene from={1143} to={1184}>
        <Shot src="v-twist.jpg" from={1143} to={1184} pos="50% 30%" zoom={[1.0, 1.12]} grade="contrast(1.05) saturate(0.8)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={220} lines={[
          { words: say(99, 101), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(102) },
        ]} />
      </Scene>

      {/* 14. The 2013 study (paper), "heard their own voice without knowing" (picture: headphones) */}
      <Scene from={1184} to={1247}>
        <Paper />
        <StudyPage from={1184} highlightAt={fr(105) + 8} journal="PERCEPTION · 2013" title="I like my voice better: self-enhancement bias in perceptions of voice attractiveness" authors="Hughes & Harrison" hlHeight={176} />
        <Grain amount={0.12} />
        <Lockup top={260} color="#111" shadow={false} lines={[
          { words: say(103, 104), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(105) },
          { words: say(106), align: "flex-end", indent: 100 },
        ]} />
      </Scene>
      <Scene from={1247} to={1342}>
        <Shot src="v-listen.jpg" from={1247} to={1342} pos="50% 35%" zoom={[1.02, 1.16]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.22} />
        <Lockup top={230} until={fr(112) - 1} lines={[
          { words: say(107, 108), align: "flex-start", indent: 40 },
          { words: say(109, 110), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(111) },
        ]} />
        <Lockup top={230} lines={[
          { words: say(112, 113), align: "flex-start", indent: 40 },
          { words: say(114, 115), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(116) },
        ]} />
      </Scene>

      {/* 15. "They rated it more attractive than anyone else did." (motion: two bars) */}
      <Scene from={1342} to={1429}>
        <BlueStage glowY={65} />
        <Panel from={1342} x={50} y={880} w={980} h={860}><span /></Panel>
        <RatingBars othersAt={1350} ownAt={fr(120)} />
        <Grain amount={0.2} />
        <Lockup top={220} lines={[
          { words: say(117, 120), align: "flex-start" },
          { kind: "serif", words: say(121), size: 190 },
          { words: say(122, 125), align: "flex-end" },
        ]} />
      </Scene>

      {/* 16. "So the voice you hate," (picture)  "is the only one your friends have ever heard." (picture: friends) */}
      <Scene from={1429} to={1536}>
        <Shot src="v-hate.jpg" from={1429} to={1473} pos="50% 25%" zoom={[1.0, 1.1]} duo="blue" grade="contrast(1.15)" />
        <Shot src="v-friends.jpg" from={1473} to={1536} pos="50% 50%" zoom={[1.12, 1.02]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.75} />
        <Grain amount={0.2} />
        <Lockup top={240} until={fr(131) - 1} lines={[
          { words: say(126, 129), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(130) },
        ]} />
        <Lockup top={230} lines={[
          { words: say(131, 132), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(133, 134) },
          { words: say(135, 139), align: "flex-end" },
        ]} />
      </Scene>

      {/* 17. "And they like it just fine." (picture: a hug) */}
      <Scene from={1536} to={END}>
        <Shot src="v-fine.jpg" from={1536} to={END} pos="60% 50%" zoom={[1.0, 1.1]} grade="contrast(1.08)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={250} lines={[
          { words: say(140, 143), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(144, 145) },
        ]} />
      </Scene>

      {/* 18. End card */}
      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {/* transitions: about one stylised cut in four */}
      <FilmBurn at={306} />
      <PixelGlitch at={533} />
      <InvertFlash at={1140} />
      <FilmBurn at={1424} />

      {/* sound: voice on top, a soft original bed under it, effects only where something happens */}
      <Audio src={staticFile("voice/voice.mp3")} />
      <Audio src={staticFile("music.wav")} volume={(x) => musicLevel(x)} />
      <Sfx at={fr(13)} src="pop" volume={0.4} />             {/* play is pressed */}
      <Sfx at={fr(18)} src="glitch-a" volume={0.2} />        {/* the voice turns higher */}
      <Sfx at={fr(19)} src="glitch-b" volume={0.2} />        {/* ...and thinner */}
      <Sfx at={291} src="whoosh-film" volume={0.45} />       {/* film burn into the explanation */}
      <Sfx at={313} src="marker" volume={0.2} />             {/* the head draws itself */}
      <Sfx at={fr(39)} src="whoosh" volume={0.3} />          {/* sound travels through the air */}
      <Sfx at={532} src="glitch-b" volume={0.3} />           {/* pixel glitch into the X-ray */}
      <Sfx at={fr(54)} src="spark" volume={0.35} />          {/* the bone path lights */}
      <Sfx at={fr(57)} src="subdrop" volume={0.45} />        {/* "deep notes" */}
      <Sfx at={728} src="paper" volume={0.25} />             {/* the bars panel rises */}
      <Sfx at={fr(83) - 6} src="drop" volume={0.5} />        {/* the bass falls away */}
      <Sfx at={995} src="paper" volume={0.3} />              {/* the 1966 paper */}
      <Sfx at={fr(96) - 2} src="marker" volume={0.3} />      {/* highlighter */}
      <Sfx at={fr(98)} src="lamp" volume={0.4} />            {/* "confrontation" */}
      <Sfx at={1139} src="glitch-a" volume={0.3} />          {/* invert flash: the twist */}
      <Sfx at={1184} src="paper" volume={0.3} />             {/* the 2013 paper */}
      <Sfx at={fr(105) + 6} src="marker" volume={0.3} />     {/* highlighter */}
      <Sfx at={fr(120)} src="spark" volume={0.35} />         {/* the owner's bar grows taller */}
      <Sfx at={1409} src="whoosh-film" volume={0.4} />       {/* film burn into the ending */}
      <Sfx at={fr(145)} src="chime" volume={0.4} />          {/* "fine." rings out */}
      <Sfx at={END + 2} src="pop" volume={0.4} />            {/* logo lands */}
    </AbsoluteFill>
  );
};
