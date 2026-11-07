# Drah Charts

A reusable top-10 music ranking video in the style of a music-streaming app.
Search bar → top 10 list → each song's clip plays from #10 to #1, with the next song shimmering while the current one plays.

Two shapes from the same data:

| Composition | Size | For |
|---|---|---|
| `RankingPortrait` | 1080 × 1920 (9:16) | TikTok, Reels, Shorts, WhatsApp Status (the main design) |
| `RankingLandscape` | 1920 × 1080 (16:9) | YouTube |

Built with [Remotion](https://www.remotion.dev). Free for individuals and teams of up to 3; larger companies need a Remotion licence.

---

## 1. One-time setup

1. Install **Node.js** (version 20 or newer) from nodejs.org.
2. Open a terminal in this folder and run:

```bash
npm install
```

## 2. Make a new video

### a. Add your files

- **Covers:** put square images in `public/covers/` (e.g. `01.png` … `10.png`).
- **Clips:** put videos in `public/videos/` (e.g. `01.mp4` … `10.mp4`). Vertical 9:16 clips fit best; other shapes are fitted automatically over a blurred copy of themselves.

### b. Fill in the details

Either edit **`src/ranking.json`**, or use the visual form (next step). Every field:

| Field | What it does |
|---|---|
| `topic` | The text typed into the search bar |
| `footnote` | Small print at the bottom (sources, date, your handle) |
| `clipSeconds` | How long each song is fully on screen (default 7). A 0.6 s blur-and-fade hand-off is added between songs; a shorter video loops |
| `accent` | The highlight colour, e.g. `"#1ed760"` (green) or `"#539df5"` (blue) |
| `videoVolume` | `1` = full sound, `0.5` = half, `0` = muted |
| `design.searchTextSize` | Size of the search-bar text (default 48) |
| `design.typingFramesPerLetter` | Typing speed: higher is slower (30 frames = 1 second) |
| `design.listTextScale` | List text size: `1` as designed, `1.1` = 10% bigger |
| `design.rowMotion` | How each song sticker moves: `vinyl-cascade` (default), `breathe`, `beat`, `vinyl`, `flip`, `shine`, `cascade`, `float` or `none` |
| `design.saas` | `true` = the SaaS motion design layer (opening headline, the app on a 3D stage with depth, a cursor that operates it, camera push-ins, end card). `false` = the plain chart |
| `design.uiSounds` | Soft interface sounds on clicks, camera moves and the end card (`true`/`false`) |
| `brand.name` / `brand.handle` | Shown on the end card, e.g. "Drah Charts" and "Drahcir_The_Creator" |
| `brand.logo` | Your logo inside `public/`, ideally a see-through PNG, e.g. `"brand/dc-logo.png"` |
| `brand.cta` / `brand.ctaDone` | The end-card button before and after the cursor clicks it, e.g. "Follow" and "Following ✓" |
| `brand.hookTitle` / `brand.hookLine` | The opening headline, e.g. "TOP 10" and "Afrobeats · 2026 so far" |
| `songs[].rank` | 1–10 |
| `songs[].title` / `artist` / `streams` | Shown as written, e.g. `"412.6M"` |
| `songs[].cover` | Path inside `public/`, e.g. `"covers/01.png"` |
| `songs[].video` | Path inside `public/`, e.g. `"videos/01.mp4"` |
| `songs[].clipStart` | Seconds into the video where the clip starts (e.g. `45` to start at the chorus) |

### c. Preview and edit visually

```bash
npm run dev
```

This opens Remotion Studio in your browser. Pick `RankingPortrait`, press play, and use the **Props** panel on the right to edit any field above. Changes preview instantly. The timing rebuilds itself from the real length of each clip.

### d. Render the final video

```bash
npx remotion render RankingPortrait out/my-video.mp4
npx remotion render RankingLandscape out/my-video-youtube.mp4
```

---

## 3. Changing the design further

| What | File |
|---|---|
| Positions and sizes of every area (search bar, list, video panel, player panel) | `src/layout.ts` |
| Colours (background, text, shimmer) and font | `src/ui.tsx` |
| Animation timing (typing pause, list entrance, ending length) | `src/timeline.ts` (`BEATS`) |

## 4. How it works

- `src/timeline.ts` measures every clip, then builds one schedule for the whole video. The list, the video panel and the player panel all read that same schedule, so they can never drift apart.
- Each list row goes through four states: **waiting** (still skeleton) → **loading** (shimmering, while the song before it plays) → **active** (filled, highlighted, its clip playing) → **done** (filled).
- The shimmer is a designed, timed effect. It never depends on real loading or internet.

## 5. Copyright

Facts (titles, artists, stream counts) are fine to show. **Official music videos and song audio are copyrighted** and are detected automatically by YouTube, TikTok and Instagram, which can mute, block or claim the video. Short clips, commentary and the platform's own licensed sounds lower the risk but do not remove it. Do not use any platform's logo or name as if the video were official.

## SaaS motion design layer

With `design.saas` on, the chart is presented the way software companies launch an app:

1. **Opening hook:** a big headline on a dark stage with a soft accent glow.
2. **The app rises in** on a 3D tilt that settles flat, floating over the stage with a long soft shadow.
3. **A cursor operates it:** it clicks the search bar (typing starts), then clicks search (the bar docks).
4. **Camera push-in:** the app grows until it fills the frame, then nudges toward each song as it pops.
5. **Pull-back:** after #1 the app floats on the stage again.
6. **End card:** the logo lands with a ring, the name wipes in, and the cursor clicks the call-to-action button.

Depth comes from layers moving at different rates: a dot grid and glow behind, the app card in the middle, the cursor and end card in front. The code is in `src/Saas.tsx`; timings are `BEATS.intro` and `BEATS.endCard` in `src/timeline.ts`. Interface sounds in `public/sfx/` are from Pixabay (free for commercial use).

