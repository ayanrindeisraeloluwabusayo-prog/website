import { Composition } from "remotion";
import { SelfShot, WAIT_FRAMES } from "./SelfShot";
import { FRAMES, SelfTalk } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SelfTalk" component={SelfTalk} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="SelfShot" component={SelfShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
  </>
);
