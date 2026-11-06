import { CalculateMetadataFunction, Composition } from "remotion";
import { Landscape, Portrait } from "./Main";
import { MotionPreview } from "./MotionPreview";
import { LAYOUTS } from "./layout";
import { rankingSchema, type MainProps } from "./schema";
import { buildTimeline, FPS, measureClips } from "./timeline";
import ranking from "./ranking.json";

// Before every preview and render: measure each clip, then build the schedule from the real lengths.
const calculateMetadata: CalculateMetadataFunction<MainProps> = async ({ props }) => {
  const clipFrames = await measureClips(props);
  const timeline = buildTimeline(props, clipFrames);
  return { durationInFrames: timeline.total, props: { ...props, timeline } };
};

const shared = {
  schema: rankingSchema,
  defaultProps: ranking as MainProps,
  calculateMetadata,
  durationInFrames: 2400,
  fps: FPS,
};

// Same data, same timing, two shapes. Render whichever you need.
export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="RankingLandscape" component={Landscape} width={LAYOUTS.landscape.width} height={LAYOUTS.landscape.height} {...shared} />
    <Composition id="RankingPortrait" component={Portrait} width={LAYOUTS.portrait.width} height={LAYOUTS.portrait.height} {...shared} />
    {/* Preview only: compare the list-row motion styles. */}
    <Composition id="MotionPreview" component={MotionPreview} width={1920} height={1080} fps={FPS} durationInFrames={300} schema={rankingSchema} defaultProps={ranking as MainProps} />
  </>
);
