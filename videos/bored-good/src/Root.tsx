import { Composition } from "remotion";
import { BoredGood, FRAMES } from "./Video";
import { SparkShot, WAIT_FRAMES } from "./SparkShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BoredGood" component={BoredGood} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="SparkShot" component={SparkShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
