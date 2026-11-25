import { Composition } from "remotion";
import { ConfShot, WAIT_FRAMES } from "./ConfShot";
import { DunningKruger, FRAMES } from "./Video";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="DunningKruger" component={DunningKruger} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="ConfShot" component={ConfShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
