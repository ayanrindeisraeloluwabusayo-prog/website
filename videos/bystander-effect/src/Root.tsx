import { Composition } from "remotion";
import { SHARE_FRAMES, ShareShot } from "./ShareShot";
import { Bystander, FRAMES } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Bystander" component={Bystander} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="ShareShot" component={ShareShot} width={1080} height={1920} fps={30} durationInFrames={SHARE_FRAMES} />
  </>
);
