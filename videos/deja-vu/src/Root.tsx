import { Composition } from "remotion";
import { DejaVu, FRAMES } from "./Video";
import { DoubleShot, DOUBLE_FRAMES } from "./DoubleShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DejaVu" component={DejaVu} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="DoubleShot" component={DoubleShot} width={1080} height={1920} fps={30} durationInFrames={DOUBLE_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
