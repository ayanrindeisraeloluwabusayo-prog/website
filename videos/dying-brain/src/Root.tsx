import { Composition } from "remotion";
import { DyingBrain, FRAMES } from "./Video";
import { GammaShot, WAIT_FRAMES } from "./GammaShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DyingBrain" component={DyingBrain} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="GammaShot" component={GammaShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
