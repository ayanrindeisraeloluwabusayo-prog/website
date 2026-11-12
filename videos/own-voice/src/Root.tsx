import { Composition } from "remotion";
import { FRAMES, Video } from "./Video";
import { BODY_FRAMES, BodyTest } from "./Body3D";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="OwnVoice" component={Video} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="BodyTest" component={BodyTest} width={1080} height={1920} fps={30} durationInFrames={BODY_FRAMES} />
  </>
);
