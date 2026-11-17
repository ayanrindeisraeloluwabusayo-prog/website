import { Composition } from "remotion";
import { LOCK_FRAMES, LockShot } from "./LockShot";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LockShot" component={LockShot} width={1080} height={1920} fps={30} durationInFrames={LOCK_FRAMES} />
  </>
);
