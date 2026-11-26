import { Composition } from "remotion";
import { BirthOrder, FRAMES } from "./Video";
import { BarsShot, WAIT_FRAMES } from "./BarsShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="BirthOrder" component={BirthOrder} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="BarsShot" component={BarsShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
