import { Composition } from "remotion";
import { PriceShot, WAIT_FRAMES } from "./PriceShot";
import { FRAMES, LeftDigit } from "./Video";

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="LeftDigit" component={LeftDigit} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />
    <Composition id="PriceShot" component={PriceShot} width={1080} height={1920} fps={30} durationInFrames={WAIT_FRAMES} />
  </>
);
