import { Composition } from "remotion";
import { SlowMotion, FRAMES } from "./Video";
import { SlowShot, WAIT_FRAMES } from "./SlowShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SlowMotion" component={SlowMotion} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="SlowShot" component={SlowShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
