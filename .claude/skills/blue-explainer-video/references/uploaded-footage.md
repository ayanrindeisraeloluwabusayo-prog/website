# When the owner uploads a video

## What kind of video is it?
- **Someone talking** (the most common case, like the reference videos): their speech drives the words
  on screen. Keep their voice as the main audio track.
- **Footage with no speech** (b-roll, a performance): treat it as pictures for the matching scenes. Write
  a script for the words on screen with the owner.

## Getting the words and their timing
The words have to appear exactly when they're spoken, so you need each word's start time.
1. **ElevenLabs Scribe** (best, used by the `video-use` skill): needs `ELEVENLABS_API_KEY`. Ask the owner
   for it through the environment's credential form (`request_credential` for host `api.elevenlabs.io`,
   header `xi-api-key`), never in chat. Then follow the `video-use` skill's transcription helper.
2. **No key:** ask the owner for the script, find the phrase boundaries by looking at the audio's
   loudness (`ffmpeg -af silencedetect=n=-35dB:d=0.25`), and spread the words across each phrase. Tell the
   owner the timing is approximate.

Convert word times to frames (`Math.round(seconds * 30)`) and pass them to `ws()` or as explicit
`{ w, at }` words.

## Building the edit around a speaker
- Cut the speaker shot in with `<OffthreadVideo src={staticFile("media/talk.mp4")} />` inside a `Shot`-like
  wrapper (or `Shot video`). Keep it **static**. To punch in, cut to a tighter crop; never zoom while live.
- The speaker is on screen about **half** the time: the hook line is often a picture, the evidence and
  explanation are cut-aways, and the conclusion comes back to the speaker.
- Cut away on the phrase where a picture or graphic explains better (rules in `scene-rules.md`), and come
  back to the speaker on personal or connecting lines ("and that's why…").
- Words stay at chest height on the speaker shot (about 45-60 % down the frame), never at the bottom like
  normal subtitles.
- Optional blue wash on the speaker shot: `duo="blue"` with `grade="contrast(1.1)"`.
- The music bed sits under the voice at about 0.15-0.25. Effects stay quieter than the voice.
- Crop horizontal footage to 9:16 around the face: `crop=ih*9/16:ih:<x>:0`.
