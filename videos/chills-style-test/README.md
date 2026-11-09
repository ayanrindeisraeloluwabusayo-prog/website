# "Why a song gives you chills": 30 s style test

A 30-second vertical video in the **blue serif explainer** style (see `video-styles/blue-serif-explainer.md`),
built with Remotion. Version 2 uses real pictures and clips (public domain art and Pixabay) in `public/media/`,
listed with their licences in `CREDITS.md`; the music bed is composed by `make_music.py`.

## Run it
```bash
npm install
python3 make_music.py public/music.wav     # the music bed (not stored in git)
npx remotion studio                        # preview
npx remotion render StyleTest out/chills-v2.mp4 --codec=h264 --crf=16
# in a cloud session, add: --browser-executable=/opt/pw-browsers/chromium_headless_shell-1243/chrome-headless-shell-linux64/chrome-headless-shell
```

## Where things are
- `src/Video.tsx`: the scenes, words and timings
- `src/lockup.tsx`: measured, collision-free text lockups (small words never touch the big word)
- `src/type.tsx`: fonts (Newsreader for the key word, Inter Tight for small words and statements)
- `src/kit.tsx`: blue field, paper, grain, and the transitions (film burn, invert flash, pixel glitch)
- `src/art.tsx`: stipple head, line head, the build-up curve, rising lights, the study page
- `src/media.tsx`: full-screen shots with a slow push-in, floating photo cards, the blue tint, text shading
- `MOOD-BRIEF.md`, `picture-options.json`: what each scene should feel like, and the picture options

## Next version (agreed with the owner)
- Font colours: white on pictures and blue backgrounds, **black on white/paper**, blue only as an accent.
- Real imagery chosen per scene from a mood brief, with 3-4 options per scene for the owner to pick:
  Art Institute of Chicago and Wikimedia Commons (public-domain paintings, busts, engravings, book pages),
  NASA (public domain), and Pixabay stock video and photos (key in the environment as `PIXABAY_API_KEY`).
  Wikimedia needs a descriptive User-Agent with a contact URL, or it answers 429.
- Prefer public domain; list any credit lines needed (CC BY / BY-SA). No famous film clips.

Sources: Salimpoor et al., Nature Neuroscience 14, 257-262 (2011), McGill University.
