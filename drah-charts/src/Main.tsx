import { AbsoluteFill, useCurrentFrame } from "remotion";
import type { MainProps } from "./schema";
import { buildTimeline } from "./timeline";
import { LAYOUTS, LayoutCtx, type Layout } from "./layout";
import { SearchBar } from "./SearchBar";
import { VideoPanel } from "./VideoPanel";
import { NowPlaying } from "./NowPlaying";
import { NowPlayingStack } from "./NowPlayingStack";
import { RankingList } from "./RankingList";
import { AccentCtx, C, FONT, p01 } from "./ui";

// Applies the form's Design settings on top of the designed layout.
const withDesign = (base: Layout, d: MainProps["design"]): Layout => {
  const k = d.listTextScale;
  return {
    ...base,
    search: { ...base.search, font: d.searchTextSize, icon: Math.round(d.searchTextSize * 1.15) },
    list: { ...base.list, rank: base.list.rank * k, title: base.list.title * k, artist: base.list.artist * k, streams: base.list.streams * k },
  };
};

const Main: React.FC<MainProps & { layout: Layout }> = ({ layout: base, ...props }) => {
  const layout = withDesign(base, props.design);
  const frame = useCurrentFrame();
  // The timeline normally comes from calculateMetadata (real clip lengths); this is only a fallback.
  const tl = props.timeline ?? buildTimeline(props, {});
  const F = layout.footnote;

  return (
    <LayoutCtx.Provider value={layout}>
      <AccentCtx.Provider value={props.accent}>
        <AbsoluteFill style={{ backgroundColor: C.bg, fontFamily: FONT, color: C.text }}>
          <VideoPanel songs={props.songs} tl={tl} volume={props.videoVolume} />
          {layout.card.dir === "stack" ? <NowPlayingStack songs={props.songs} tl={tl} /> : <NowPlaying songs={props.songs} tl={tl} />}
          <RankingList songs={props.songs} tl={tl} motion={props.design.rowMotion ?? "none"} />
          <SearchBar topic={props.topic} tl={tl} />
          <div style={{ position: "absolute", left: F.x, top: F.y, fontSize: F.size, color: C.note, opacity: p01(frame, tl.listStart + 20, 14) }}>{props.footnote}</div>
        </AbsoluteFill>
      </AccentCtx.Provider>
    </LayoutCtx.Provider>
  );
};

export const Landscape: React.FC<MainProps> = (p) => <Main {...p} layout={LAYOUTS.landscape} />;
export const Portrait: React.FC<MainProps> = (p) => <Main {...p} layout={LAYOUTS.portrait} />;
