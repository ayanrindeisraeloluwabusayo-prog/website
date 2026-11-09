import { createContext, useContext } from "react";

// Every position and size lives here, so the same components render both video shapes.
// Video panel on the right (sized for 9:16 clips), stats on the left, list in two columns of five.
export type Layout = {
  id: "landscape" | "portrait";
  width: number;
  height: number;
  search: { startX: number; startY: number; dockX: number; dockY: number; w: number; font: number; icon: number; pad: string };
  panel: { x: number; y: number; w: number; h: number; r: number };
  card: { x: number; y: number; w: number; h: number; dir: "row" | "column" | "stack"; cover: number; rank: number; title: number; artist: number; streams: number; gap: number };
  list: { x: number; y: number; cols: 1 | 2; colW: number; colGap: number; rowH: number; rank: number; cover: number; title: number; artist: number; streams: number };
  footnote: { x: number; y: number; size: number };
};

export const LAYOUTS: Record<Layout["id"], Layout> = {
  // 1920 × 1080: the classic YouTube shape. A 9:16 clip uses the full height on the right.
  landscape: {
    id: "landscape",
    width: 1920,
    height: 1080,
    search: { startX: 380, startY: 488, dockX: 72, dockY: 56, w: 1160, font: 36, icon: 44, pad: "26px 36px" },
    panel: { x: 1304, y: 56, w: 544, h: 968, r: 28 },
    card: { x: 72, y: 196, w: 1160, h: 280, dir: "row", cover: 280, rank: 72, title: 66, artist: 38, streams: 58, gap: 44 },
    list: { x: 72, y: 540, cols: 2, colW: 556, colGap: 48, rowH: 90, rank: 38, cover: 60, title: 29, artist: 23, streams: 26 },
    footnote: { x: 72, y: 1030, size: 20 },
  },
  // 1080 × 1920: the owner's diagram, filled edge to edge. Search across the top; the top 10 in one
  // full-height column on the left; on the right the 9:16 video, then the player panel down to the bottom.
  portrait: {
    id: "portrait",
    width: 1080,
    height: 1920,
    search: { startX: 50, startY: 800, dockX: 50, dockY: 44, w: 980, font: 48, icon: 56, pad: "26px 36px" },
    panel: { x: 490, y: 268, w: 540, h: 960, r: 28 },
    list: { x: 50, y: 268, cols: 1, colW: 404, colGap: 0, rowH: 158, rank: 44, cover: 84, title: 33, artist: 25, streams: 27 },
    card: { x: 490, y: 1258, w: 540, h: 590, dir: "stack", cover: 72, rank: 52, title: 46, artist: 30, streams: 62, gap: 0 },
    footnote: { x: 50, y: 1862, size: 20 },
  },
};

export const LayoutCtx = createContext<Layout>(LAYOUTS.landscape);
export const useLayout = () => useContext(LayoutCtx);
