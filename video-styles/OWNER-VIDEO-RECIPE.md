# The owner's psychology video recipe (Human Nature Explained), as settled in chat up to 25 Nov 2026

Read this with `.claude/skills/blue-explainer-video/SKILL.md` and `video-styles/script-styles.md` before any new video.
Finished examples to copy from: `videos/bedtime-phone`, `videos/feeling-watched`, `videos/spotlight-effect`.

## Order of work (always ask before building)
1. Topic: relatable everyday feeling (school, work, uni, public, home). Use the topic-scout skill (YouTube comments first).
2. Script in **Full Blend**, fact-checked, money in US dollars, Star Proof opens with "Remember when…?". Show it first.
3. 4 thumbnail options in our look (topic words BIG, safe area: centre 1080x1440, right 140 px and bottom 300 px clear).
   The owner picks one (so far always C). Then build.

## Build
- Voice: Kokoro `am_michael`, speed 1.04 (scratchpad `kokoro_run/blend.py`), then `tools/free-voice/tighten.py ... 0.4 0.3`,
  ffmpeg `highpass=f=70,acompressor=threshold=-20dB:ratio=3:attack=5:release=80,loudnorm=I=-16:TP=-1.5:LRA=9`.
  Check words that the tighten step may clip (zero-length words in the words JSON): widen their start and redo.
- Pictures: mostly **Pixabay stock video clips** (`PIXABAY_API_KEY`), cut to 12 s, plus motion graphics on our blue.
  Keep all the motion graphics; stock clips replace most photos.
- One 3D shot per video with our three.js Rocketbox man "A" (glass head, rim shader), never Blender. Land its key moment on
  a word with a `lead` offset. Examples: `WatchedShot.tsx`, `SpotShot.tsx`, `NoveltyShot.tsx`.
- Brand names only as plain text in our fonts; no logos. Real people in studies are never shown.
- Music from `sound-library/` chosen by feel; never default to Slow Spooky; vary tracks. Fit it so a silence "drop" sits just
  before "But here's the twist" and the final hit lands on the end card. Music about 16.6 dB under the voice
  (measure voice vs mix-minus-voice over voiced 0.4 s blocks; adjust MUSIC_GAIN). SFX at x0.4.
- Render: `GL=angle node scripts/render.mjs out/raw.mp4 0 <FRAMES-1> 1 3 <Comp>` (3D shots themselves with `GL=swangle`).
  Run one render at a time, and only `rm -rf /tmp/remotion-webpack-bundle-*` when nothing else is rendering.
- Final: thumbnail baked in as the first 2 frames, audio delayed 67 ms, about 2.6 Mb/s, under 30 MB.
  Send only `final/<name>-FINAL-under-30MB.mp4` and `final/<name>-thumbnail.jpg`. Write CREDITS.md. Log the topic in
  `video-styles/topics-done.md`. Delete `out/raw.mp4` and the wav files afterwards (disk is small).

## Other standing rules
- Keys only through the environment settings, never in chat. `YOUTUBE_API_KEY` and `PIXABAY_API_KEY` live there.
- Free tools only (X/Twitter API is paid; not connected). No PRs unless asked. Commit and push after changes.

## Graphics look (owner's correction, 25 Nov 2026)
- The reference for in-video motion graphics is `videos/mosquito` (and the videos before it). Big words and numbers inside
  graphics use the thin serif (SERIF2), with no 3D extruded edge, no glow and no heavy 900-weight block letters; labels are
  small, spaced capitals; shapes are simple and light, with plenty of empty blue around them.
- The chunky extruded, glowing block letters (the `big()` helper that started in `gta-wait/src/gtg.tsx`) are for
  THUMBNAILS ONLY. They crept into gta-wait, bedtime-phone, feeling-watched, spotlight-effect and deja-vu and made them
  look "off"; never use them inside a video again.
