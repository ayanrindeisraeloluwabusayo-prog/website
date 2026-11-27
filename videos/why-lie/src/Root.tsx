import { Composition } from "remotion";
import { WhyLie, FRAMES } from "./Video";
import { NoseShot, WAIT_FRAMES } from "./NoseShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="WhyLie" component={WhyLie} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="NoseShot" component={NoseShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
