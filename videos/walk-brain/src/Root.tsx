import { Composition } from "remotion";
import { WalkBrain, FRAMES } from "./Video";
import { GrowShot, WAIT_FRAMES } from "./GrowShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WalkBrain" component={WalkBrain} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="GrowShot" component={GrowShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
