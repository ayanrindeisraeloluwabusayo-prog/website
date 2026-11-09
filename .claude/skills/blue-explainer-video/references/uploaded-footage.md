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

## Learned on the first real edit (Burna Boy, 2026-11-08)
- Getting the file: the owner shares a Google Drive link. Drive must be on the environment's allowed hosts
  (`drive.google.com`, `drive.usercontent.google.com`; now added). The file must be shared as "Anyone
  with the link". If the download comes back as an HTML sign-in page, it's still private. Download with
  `https://drive.usercontent.google.com/download?id=<id>&export=download&confirm=t`.
- Phone footage is often stored sideways with a rotation flag; ffmpeg applies it automatically when you
  re-encode to 1080x1920.
- Transcribe with `POST https://api.elevenlabs.io/v1/speech-to-text` (`model_id=scribe_v1`,
  `timestamps_granularity=word`) on a 16 kHz mono WAV. The key is injected by the proxy.
- Ask before cutting: list the stumbles, repeats and long pauses, and offer "cut just those" (keeps every
  point) or the full take. Cut with ffmpeg trim/atrim plus 15-20 ms audio fades at each joint. Then map
  every word onto the new timeline and generate `src/speech.ts` with a `say(from, to)` helper.
- Jump cuts: put a cut-away or transition over each joint where possible. Inside a speaker shot, punch in
  (a tighter crop from the joint on).
- Clean the voice: highpass 80 Hz, light denoise (`afftdn`), gentle compression. Music bed at about 0.2.
- Put the words where the frame is dark and empty (a dark ceiling above the head), not on a white shirt.
- Real people: name them only if the owner agrees. Use CC-licensed event photos (with credit lines), never
  their music, music videos or performance footage.
