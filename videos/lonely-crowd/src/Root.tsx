import { Composition } from "remotion";
import { LonelyCrowd, FRAMES } from "./Video";
import { GuardShot, WAIT_FRAMES } from "./GuardShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LonelyCrowd" component={LonelyCrowd} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="GuardShot" component={GuardShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
