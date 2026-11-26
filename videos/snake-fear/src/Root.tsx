import { Composition } from "remotion";
import { SnakeFear, FRAMES } from "./Video";
import { AlertShot, WAIT_FRAMES } from "./AlertShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="SnakeFear" component={SnakeFear} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="AlertShot" component={AlertShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
