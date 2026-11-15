# Sound library

Music the owner sends to use under their videos. The owner chooses which sound goes with which video.

| File | What it is | Used in |
|---|---|---|
| `spooky-sounds.mp3` | Eerie looping melody, ~86 bpm, 89.8 s. Two loud beeps at ~56.5-58 s (skip them), a big low hit at 85.8 s (good for an end card). | Lyrics-memory Version B (`videos/lyrics-memory/public/music_spooky.wav`) |

## How a track gets fitted to a video
1. Find the beat (librosa) and the loud moments (spectrogram).
2. Cut on beats only: keep the start, jump to a later beat where the melody matches best, 40 ms crossfade, so the ending hit lands on the end card.
3. One "drop" (music stops for a beat) on the video's twist line, back in on the next beat.
4. Gentle EQ dip at 2.5 kHz so the voice cuts through; the edit ducks the music whenever the narrator talks.
5. Music sits about 14 dB under the voice; sound effects stay at their normal (quiet) level.
