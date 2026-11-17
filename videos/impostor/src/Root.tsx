import { Composition } from "remotion";
import { CLEAR_FRAMES, DOUBT_FRAMES, ImpostorClear, ImpostorDoubt } from "./ImpostorShot";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="ImpostorDoubt" component={ImpostorDoubt} width={1080} height={1920} fps={30} durationInFrames={DOUBT_FRAMES} />
    <Composition id="ImpostorClear" component={ImpostorClear} width={1080} height={1920} fps={30} durationInFrames={CLEAR_FRAMES} />
  </>
);
