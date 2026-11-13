// "Why does the journey back home always feel shorter?", about 67 s, story-paced narration (Brian), blue explainer edit + 3D.
// Feeling = picture, mechanism = graphic, inside the head = 3D. A new shot about every 1.5-2 s to match the faster voice.
// Facts: van de Ven, van Rijswijk & Roy (2011), Psychonomic Bulletin & Review 18(5), 827-832 (the return trip
// effect held on a different road of the same length; explained by violated expectations). Ozawa, Fujii &
// Kouzaki (2015), PLOS ONE (the effect appears when people judge the trip afterwards, not during it).
// Pictures: Pixabay (Pixabay Content License); 3D person: Microsoft Rocketbox (MIT). See CREDITS.md.
import { AbsoluteFill, Audio, OffthreadVideo, Sequence, staticFile, useCurrentFrame } from "remotion";
import { StudyPage } from "./art";
import { BlueStage } from "./motion";
import { BlueField, FilmBurn, Grain, InvertFlash, Paper, PixelGlitch } from "./kit";
import { Lockup } from "./lockup";
import { Filters, Scrim, Shot, Vignette } from "./media";
import { EndCard } from "./graphics3";
import { Hindsight, RoadMap, TimeBars, TwoRoads } from "./graphics5";
import { BACK_AT } from "./TripShot";
import { fr, say, WORDS } from "./speech";

export const FRAMES = 2025;
const END = 1935;
const HEAD_AT = 888;     // the 3D head clip starts on "You see, on the way out"

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

/** Sound effects stay quiet (owner's note: felt, never louder than the voice). */
const Sfx: React.FC<{ at: number; src: string; volume?: number }> = ({ at, src, volume = 0.4 }) => (
  <Sequence from={at} durationInFrames={150} layout="none">
    <Audio src={staticFile(`sfx2/${src}.wav`)} volume={volume * 0.4} />
  </Sequence>
);

const Scene: React.FC<{ from: number; to: number; children: React.ReactNode }> = ({ from, to, children }) => {
  const f = useCurrentFrame();
  return f >= from && f < to ? <AbsoluteFill>{children}</AbsoluteFill> : null;
};

/** A rendered clip that started playing at `at`, shown only between `from` and `to` (so one clip can be cut into). */
const Clip: React.FC<{ src: string; at: number; from: number; to: number }> = ({ src, at, from, to }) => {
  const f = useCurrentFrame();
  if (f < from || f >= to) return null;
  return (
    <AbsoluteFill>
      <Sequence from={at} layout="none">
        <OffthreadVideo src={staticFile(`media/${src}`)} muted style={{ width: "100%", height: "100%", objectFit: "cover" }} />
      </Sequence>
    </AbsoluteFill>
  );
};

export const Video: React.FC = () => {
  return (
    <AbsoluteFill style={{ background: "#000" }}>
      <Filters />

      {/* 1. "You leave home at eight, and the drive feels like it's never going to end." */}
      <Scene from={0} to={113}>
        <Shot src="j-hook.jpg" from={0} to={46} pos="50% 50%" zoom={[1.2, 1.04]} grade="contrast(1.1)" />
        <Shot src="j-jam.jpg" from={46} to={113} pos="55% 50%" zoom={[1.0, 1.14]} grade="contrast(1.08)" />
        <Scrim side="top" strength={0.72} />
        <Vignette amount={0.4} />
        <Grain amount={0.2} />
        <Lockup top={250} until={fr(5) - 1} lines={[{ words: say(0, 2), align: "flex-start", indent: 40 }, { kind: "serif", words: say(3, 4) }]} />
        <Lockup top={250} lines={[{ words: say(5, 10), align: "flex-start" }, { kind: "serif", words: say(11, 14), size: 150 }]} />
      </Scene>

      {/* 2. "Every red light, every slow car, it all drags." */}
      <Scene from={113} to={216}>
        <Shot src="j-tunnel.jpg" from={113} to={179} pos="50% 50%" zoom={[1.0, 1.2]} grade="contrast(1.08)" />
        <Shot src="j-rain.jpg" from={179} to={216} pos="65% 50%" zoom={[1.04, 1.12]} grade="contrast(1.05) saturate(0.85)" />
        <Scrim side="top" strength={0.65} />
        <Grain amount={0.2} />
        <Lockup top={260} until={fr(18) - 1} lines={[{ words: say(15, 16), align: "flex-start", indent: 80 }, { kind: "serif", words: say(17) }]} />
        <Lockup top={260} until={fr(21) - 1} lines={[{ words: say(18, 19), align: "flex-start", indent: 80 }, { kind: "serif", words: say(20) }]} />
        <Lockup top={260} lines={[{ words: say(21, 22), align: "flex-start", indent: 80 }, { kind: "serif", words: say(23), size: 230 }]} />
      </Scene>

      {/* 3. "Then you drive back on the exact same road, and somehow you're home before you even noticed." */}
      <Scene from={216} to={377}>
        <Shot src="j-sunset.jpg" from={216} to={302} pos="50% 50%" zoom={[1.0, 1.16]} grade="contrast(1.05)" />
        <Shot src="j-door.jpg" from={302} to={377} pos="50% 55%" zoom={[1.14, 1.02]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={250} until={fr(33) - 1} lines={[
          { words: say(24, 28), align: "flex-start" },
          { words: say(29, 30), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(31, 32) },
        ]} />
        <Lockup top={250} lines={[
          { words: say(33, 36), align: "flex-start", indent: 40 },
          { words: say(37, 39), align: "flex-start", indent: 160 },
          { kind: "serif", words: say(40) },
        ]} />
      </Scene>

      {/* 4. "Same road, same distance," (motion: the road)  "so what changed?" (picture: a road into fog) */}
      <Scene from={377} to={433}>
        <BlueStage glowY={60} />
        <RoadMap from={377} sameAt={fr(41)} distAt={fr(43)} />
        <Grain amount={0.18} />
        <Lockup top={250} until={fr(43) - 1} lines={[{ words: say(41), align: "flex-start", indent: 120 }, { kind: "serif", words: say(42) }]} />
        <Lockup top={250} lines={[{ words: say(43), align: "flex-start", indent: 120 }, { kind: "serif", words: say(44) }]} />
      </Scene>
      <Scene from={433} to={467}>
        <Shot src="j-fog.jpg" from={433} to={467} pos="50% 50%" zoom={[1.02, 1.14]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={280} lines={[{ words: say(45, 46), align: "flex-start", indent: 100 }, { kind: "serif", words: say(47) }]} />
      </Scene>

      {/* 5. "Most people think it's because you know the way back." (picture: a winding road from above) */}
      <Scene from={467} to={547}>
        <Shot src="j-winding.jpg" from={467} to={547} pos="50% 50%" zoom={[1.22, 1.05]} grade="contrast(1.08)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[
          { words: say(48, 51), align: "flex-start" },
          { words: say(52, 54), align: "flex-start", indent: 80 },
          { words: say(55, 56), align: "flex-start", indent: 160 },
          { kind: "serif", words: say(57) },
        ]} />
      </Scene>

      {/* 6. The 2011 study, on paper */}
      <Scene from={547} to={641}>
        <Paper />
        <StudyPage from={547} highlightAt={fr(70)} journal="PSYCHONOMIC BULLETIN & REVIEW · 2011" title="The return trip effect: Why the return trip often seems to take less time"
          authors="van de Ven, van Rijswijk & Roy" hlHeight={176} />
        <Grain amount={0.12} />
        <Lockup top={240} color="#111" shadow={false} until={fr(61) - 1} lines={[{ words: say(58, 59), align: "flex-start", indent: 80 }, { kind: "serif", words: say(60) }]} />
        <Lockup top={240} color="#111" shadow={false} lines={[
          { words: say(61, 65), align: "flex-start" },
          { words: say(66, 69), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(70) },
        ]} />
      </Scene>

      {/* 7. "They sent people home on a completely different road, same length, and the trip home still felt shorter." */}
      <Scene from={641} to={823}>
        <BlueStage glowY={62} />
        <TwoRoads from={643} secondAt={fr(78)} lengthAt={fr(80)} stampAt={fr(86)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(80) - 1} lines={[
          { words: say(71, 74), align: "flex-start" },
          { words: say(75, 77), align: "flex-start", indent: 100 },
          { kind: "serif", words: say(78, 79) },
        ]} />
        <Lockup top={220} until={fr(82) - 1} lines={[{ kind: "serif", words: say(80, 81) }]} />
        <Lockup top={220} lines={[
          { words: say(82, 85), align: "flex-start", indent: 40 },
          { kind: "serif", words: say(86) },
          { words: say(87, 88), align: "flex-end", indent: 80 },
        ]} />
      </Scene>

      {/* 8. "So it was never about knowing the road." (3D: the man on his phone) */}
      <Scene from={823} to={HEAD_AT}>
        <Clip src="trip3d_look.mp4" at={821} from={823} to={HEAD_AT} />
        <Grain amount={0.14} />
        <Lockup top={1600} lines={[
          { words: say(89, 92), align: "flex-start", indent: 60 },
          { words: say(93, 95), align: "flex-start", indent: 140 },
          { kind: "serif", words: say(96) },
        ]} />
      </Scene>

      {/* 9. THE TRICK (3D): his head turns to glass; the brain's clock and the expected / actual bars */}
      <Scene from={HEAD_AT} to={1363}>
        <Clip src="trip3d_head.mp4" at={HEAD_AT} from={HEAD_AT} to={1046} />
        <Shot src="j-cheated.jpg" from={1046} to={1096} pos="50% 50%" zoom={[1.0, 1.12]} grade="contrast(1.12) saturate(0.8)" />
        <Scene from={1046} to={1096}>
          <Scrim side="top" strength={0.6} />
        </Scene>
        <Clip src="trip3d_head.mp4" at={HEAD_AT} from={1096} to={1363} />
        <TimeBars from={HEAD_AT + 94} expAt={fr(109)} actAt={fr(114)} backAt={HEAD_AT + BACK_AT} backExpAt={fr(131)} backActAt={fr(137)} gapAt={fr(146)} until={1046} />
        <TimeBars from={1096} expAt={0} actAt={0} backAt={1096} backExpAt={fr(131)} backActAt={fr(137)} gapAt={fr(146)} />
        <Grain amount={0.14} />
        <Lockup top={170} until={fr(103) - 1} lines={[{ words: say(97, 98), align: "flex-start", indent: 80 }, { words: say(99, 101), align: "flex-start", indent: 160 }, { kind: "serif", words: say(102) }]} />
        <Lockup top={170} until={fr(111) - 1} lines={[
          { words: say(103, 106), align: "flex-start" },
          { words: say(107, 108), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(109, 110) },
        ]} />
        <Lockup top={170} until={fr(116) - 1} lines={[{ words: say(111, 114), align: "flex-start", indent: 60 }, { kind: "serif", words: say(115) }]} />
        <Lockup top={240} until={fr(121) - 1} lines={[{ words: say(116, 119), align: "flex-start", indent: 60 }, { kind: "serif", words: say(120), size: 220 }]} />
        <Lockup top={170} until={fr(131) - 1} lines={[
          { words: say(121, 125), align: "flex-start" },
          { words: say(126, 129), align: "flex-start", indent: 120 },
          { kind: "serif", words: say(130) },
        ]} />
        <Lockup top={170} until={fr(137) - 1} lines={[{ kind: "serif", words: say(131, 132) }, { words: say(133, 136), align: "flex-end", indent: 60 }]} />
        <Lockup top={170} until={fr(146) - 1} lines={[{ words: say(137, 144), align: "flex-start" }, { kind: "serif", words: say(145) }]} />
        <Lockup top={170} lines={[{ words: say(146, 149), align: "flex-start", indent: 40 }, { words: say(150, 152), align: "flex-start", indent: 160 }]} />
      </Scene>

      {/* 10. "normal feels fast." (picture: rushing light trails) */}
      <Scene from={1363} to={1404}>
        <Shot src="j-streaks.jpg" from={1363} to={1404} pos="50% 60%" zoom={[1.0, 1.4]} grade="contrast(1.12) saturate(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(153, 154), align: "flex-start", indent: 80 }, { kind: "serif", words: say(155), size: 260 }]} />
      </Scene>

      {/* 11. "Now here's the weird part." (picture: a giant clock) */}
      <Scene from={1404} to={1444}>
        <Shot src="j-clock.jpg" from={1404} to={1444} pos="70% 50%" zoom={[1.0, 1.14]} grade="contrast(1.1)" />
        <Scrim side="top" strength={0.6} />
        <Grain amount={0.2} />
        <Lockup top={240} lines={[{ words: say(156, 158), align: "flex-start", indent: 80 }, { kind: "serif", words: say(159, 160), size: 200 }]} />
      </Scene>

      {/* 12. The 2015 study, then the hindsight bars */}
      <Scene from={1444} to={1553}>
        <Paper />
        <StudyPage from={1444} highlightAt={fr(164)} journal="PLOS ONE · 2015" title="The return trip is felt shorter only postdictively"
          authors="Ozawa, Fujii & Kouzaki" hlHeight={120} />
        <Grain amount={0.12} />
        <Lockup top={240} color="#111" shadow={false} lines={[
          { words: say(161, 162), align: "flex-start", indent: 60 },
          { words: say(163, 164), align: "flex-start" },
          { words: say(165, 168), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(169) },
        ]} />
      </Scene>
      <Scene from={1553} to={1717}>
        <BlueStage glowY={58} />
        <Hindsight from={1553} sameAt={fr(181)} afterAt={fr(189)} />
        <Grain amount={0.18} />
        <Lockup top={220} until={fr(177) - 1} lines={[{ words: say(170, 172), align: "flex-start", indent: 40 }, { kind: "serif", words: say(173, 176) }]} />
        <Lockup top={220} until={fr(184) - 1} lines={[{ words: say(177, 180), align: "flex-start", indent: 80 }, { kind: "serif", words: say(181, 183) }]} />
        <Lockup top={220} lines={[
          { words: say(184), align: "flex-start", indent: 80 },
          { kind: "serif", words: say(185) },
          { words: say(186, 189), align: "flex-end" },
        ]} />
      </Scene>

      {/* 13. "when you're home and you look back." (picture: old photographs) */}
      <Scene from={1717} to={1768}>
        <Shot src="j-photos.jpg" from={1717} to={1768} pos="50% 50%" zoom={[1.05, 1.16]} grade="contrast(1.05) sepia(0.2)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[{ words: say(190, 194), align: "flex-start", indent: 60 }, { kind: "serif", words: say(195, 196) }]} />
      </Scene>

      {/* 14. "Which means the trip home was never actually shorter." (picture: the road at dusk) */}
      <Scene from={1768} to={1854}>
        <Shot src="j-sunset.jpg" from={1768} to={1854} pos="50% 30%" zoom={[1.16, 1.02]} grade="contrast(1.05) saturate(0.9)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.2} />
        <Lockup top={260} lines={[
          { words: say(197, 201), align: "flex-start", indent: 40 },
          { words: say(202, 204), align: "flex-start", indent: 140 },
          { kind: "serif", words: say(205) },
        ]} />
      </Scene>

      {/* 15. "Your memory just tells the story that way." (picture: arriving home, a hug) */}
      <Scene from={1854} to={END}>
        <Shot src="j-hug.jpg" from={1854} to={END} pos="60% 45%" zoom={[1.0, 1.1]} grade="contrast(1.05)" />
        <Scrim side="top" strength={0.7} />
        <Grain amount={0.18} />
        <Lockup top={250} lines={[
          { words: say(206), align: "flex-start", indent: 60 },
          { kind: "serif", words: say(207), size: 220 },
          { words: say(208, 213), align: "flex-end", indent: 40 },
        ]} />
      </Scene>

      {/* 16. End card */}
      <Scene from={END} to={FRAMES}>
        <BlueField glow={0.5} />
        <EndCard from={END + 2} />
        <Grain amount={0.18} />
      </Scene>

      {/* transitions */}
      <FilmBurn at={462} />
      <PixelGlitch at={883} />
      <InvertFlash at={1402} />
      <FilmBurn at={1763} />

      {/* sound: the voice on top, a driving bed underneath, quiet effects only where something happens */}
      <Audio src={staticFile("voice/voice.mp3")} />
      <Audio src={staticFile("music_drive.wav")} volume={(x) => musicLevel(x)} />
      <Sfx at={fr(17)} src="pop" volume={0.25} />            {/* red light */}
      <Sfx at={287} src="whoosh" volume={0.35} />            {/* into the front door */}
      <Sfx at={fr(40)} src="shutter" volume={0.4} />         {/* "noticed." */}
      <Sfx at={fr(43) + 4} src="whoosh" volume={0.3} />      {/* the fast trip back along the road */}
      <Sfx at={447} src="whoosh-film" volume={0.35} />       {/* film burn */}
      <Sfx at={547} src="paper" volume={0.35} />             {/* the 2011 study */}
      <Sfx at={fr(70) - 2} src="marker" volume={0.3} />
      <Sfx at={fr(78)} src="spark" volume={0.3} />           {/* the new road draws */}
      <Sfx at={fr(86)} src="drop" volume={0.45} />           {/* STILL SHORTER stamp */}
      <Sfx at={882} src="glitch-b" volume={0.3} />
      <Sfx at={HEAD_AT + 90} src="lamp" volume={0.35} />     {/* the clock lights up inside his head */}
      <Sfx at={fr(115)} src="glitch-a" volume={0.2} />       {/* ACTUAL runs past EXPECTED */}
      <Sfx at={fr(120)} src="subdrop" volume={0.45} />       {/* "cheated." */}
      <Sfx at={fr(127)} src="riser" volume={0.3} />          {/* bracing for the worst */}
      <Sfx at={1348} src="whoosh" volume={0.35} />           {/* "normal feels fast" */}
      <Sfx at={1401} src="glitch-a" volume={0.3} />          {/* invert flash: the weird part */}
      <Sfx at={1444} src="paper" volume={0.3} />             {/* the 2015 study */}
      <Sfx at={fr(164) - 2} src="marker" volume={0.3} />
      <Sfx at={fr(189)} src="spark" volume={0.35} />         {/* the way back shrinks in hindsight */}
      <Sfx at={1748} src="whoosh-film" volume={0.35} />      {/* film burn */}
      <Sfx at={fr(213)} src="chime" volume={0.4} />          {/* "that way." */}
      <Sfx at={END + 2} src="pop" volume={0.4} />            {/* logo lands */}
    </AbsoluteFill>
  );
};
