import { Composition } from "remotion";
import { LockShot } from "./LockShot";
import { BLUR_AT, DoorCheck, FRAMES } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DoorCheck" component={DoorCheck} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="LockSharp" component={LockShot} width={1080} height={1920} fps={30} durationInFrames={125} defaultProps={{ move: 125 }} />
    <Composition id="LockBlur" component={LockShot} width={1080} height={1920} fps={30} durationInFrames={262} defaultProps={{ move: 262, blurAt: BLUR_AT }} />
  </>
);
