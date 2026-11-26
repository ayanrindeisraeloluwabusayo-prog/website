import { Composition } from "remotion";
import { HaloEffect, FRAMES } from "./Video";
import { HaloShot, WAIT_FRAMES } from "./HaloShot";
import { ThumbA, ThumbB, ThumbC, ThumbD } from "./Thumbs";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="HaloEffect" component={HaloEffect} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="HaloShot" component={HaloShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
    {([["ThumbA", ThumbA], ["ThumbB", ThumbB], ["ThumbC", ThumbC], ["ThumbD", ThumbD]] as const).map(([id, C]) => (
      <Composition key={id} id={id} component={C} width={1080} height={1920} fps={30} durationInFrames={1} />
    ))}
  </>
);
