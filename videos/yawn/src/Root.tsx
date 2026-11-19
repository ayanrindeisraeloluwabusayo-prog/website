import { Composition } from "remotion";
import { SpreadShot, SHARE_FRAMES } from "./SpreadShot";
import { FRAMES, Yawn } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Yawn" component={Yawn} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="SpreadShot" component={SpreadShot} width={1080} height={1920} fps={30} durationInFrames={SHARE_FRAMES} />
  </>
);
