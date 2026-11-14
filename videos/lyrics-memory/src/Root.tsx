import { Composition } from "remotion";
import { FRAMES_A, FRAMES_B, VideoA, VideoB } from "./Video";
import { LYRIC_FRAMES, LyricHead } from "./LyricShot";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LyricsA" component={VideoA} width={1080} height={1920} fps={30} durationInFrames={FRAMES_A} />
    <Composition id="LyricsB" component={VideoB} width={1080} height={1920} fps={30} durationInFrames={FRAMES_B} />
    <Composition id="LyricHead" component={LyricHead} width={1080} height={1920} fps={30} durationInFrames={LYRIC_FRAMES} />
  </>
);
