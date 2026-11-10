#!/bin/bash
# renders the 3D film in chunks (software GL), then joins them into public/film.mp4
cd "$(dirname "$0")/.."
for r in "0 399" "400 799" "800 1199" "1200 1599" "1600 1974"; do
  set -- $r
  [ -f out/chunk_$1.mp4 ] || node scripts/render.mjs out/chunk_$1.mp4 $1 $2 1 3 || exit 1
done
printf "file 'chunk_%s.mp4'\n" 0 400 800 1200 1600 > out/chunks.txt
ffmpeg -y -loglevel error -f concat -safe 0 -i out/chunks.txt -c copy public/film.mp4 && echo ALLDONE
