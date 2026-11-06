// Display 1: the search bar slides in, types the topic, then docks at the top as the page header.
import { interpolate, useCurrentFrame } from "remotion";
import type { Timeline } from "./schema";
import { useLayout } from "./layout";
import { C, EASE_DRAWER, FONT, p01, SearchIcon } from "./ui";

export const SearchBar: React.FC<{ topic: string; tl: Timeline }> = ({ topic, tl }) => {
  const frame = useCurrentFrame();
  const L = useLayout().search;
  const enter = p01(frame, 0, tl.typeStart, EASE_DRAWER);
  const dock = p01(frame, tl.dockStart, tl.dockEnd - tl.dockStart, EASE_DRAWER);
  const perChar = (tl.typeEnd - tl.typeStart) / Math.max(1, topic.length);
  const typed = Math.max(0, Math.min(topic.length, Math.floor((frame - tl.typeStart) / perChar)));
  const typing = frame >= tl.typeStart && frame < tl.dockStart;
  const caretOn = typing && (typed < topic.length || Math.floor(frame / 15) % 2 === 0);

  return (
    <div
      style={{
        position: "absolute",
        left: interpolate(dock, [0, 1], [L.startX, L.dockX]),
        top: interpolate(dock, [0, 1], [L.startY, L.dockY]),
        width: L.w,
        opacity: enter,
        translate: `0px ${(1 - enter) * 50}px`,
        scale: String(interpolate(enter, [0, 1], [0.96, 1])),
        backgroundColor: "#ffffff",
        borderRadius: 40,
        padding: L.pad,
        display: "flex",
        gap: 24,
        alignItems: "center",
        boxShadow: "rgba(0,0,0,0.5) 0px 8px 24px",
        fontFamily: FONT,
      }}
    >
      <SearchIcon size={L.icon} color="#121212" />
      <div style={{ fontSize: L.font, fontWeight: 700, lineHeight: 1.2, color: "#121212", minHeight: L.font * 1.2 }}>
        {typed === 0 && !typing ? <span style={{ color: C.dim, fontWeight: 500 }}>What do you want to listen to?</span> : topic.slice(0, typed)}
        <span style={{ display: "inline-block", width: 4, height: L.font * 1.1, marginLeft: 4, translate: `0 ${L.font * 0.18}px`, backgroundColor: "#121212", opacity: caretOn ? 1 : 0 }} />
      </div>
    </div>
  );
};
