import { Composition } from "remotion";
import { FRAMES, Video } from "./Video";

export const RemotionRoot: React.FC = () => <Composition id="Tems" component={Video} width={1080} height={1920} fps={30} durationInFrames={FRAMES} />;
