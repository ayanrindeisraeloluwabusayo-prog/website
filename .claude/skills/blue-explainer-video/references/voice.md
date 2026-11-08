# Voiceover (ElevenLabs)

The owner wants videos **spoken**, not just words on screen. The words still build on screen, now landing
exactly as each word is said.

## Access
- The ElevenLabs key is saved on the "website" environment for `api.elevenlabs.io`, and the network
  proxy adds it to requests. Never ask for the key in chat and never write it to a file.
  - If a call fails with 401 or 403, ask the owner to check the key through the credential form
    (`request_credential`, host `api.elevenlabs.io`, header `xi-api-key`).
- Plan: free tier, 10,000 characters a month at the start. A 30 s script is about 400-500 characters.
  Check what's left with `GET https://api.elevenlabs.io/v1/user/subscription` before a big job.
- **Licence:** ElevenLabs' free plan requires crediting ElevenLabs and doesn't allow commercial use. If
  the owner will monetise a video, they need a paid plan. Add "Voice: ElevenLabs" to CREDITS.md.

## Choosing the voice
- The owner chooses. The first time, send 4-6 short samples of the same line
  (`POST /v1/text-to-speech/<voice_id>`, model `eleven_multilingual_v2`), named `1-George.mp3` and so on.
- Save the chosen voice (name and id) in `voice-choice.md` at `videos/` level, and reuse it for every
  video unless the owner asks for a change.
- Voices on the account: `GET /v1/voices`. Good explainer voices:
  - George (warm British storyteller), `JBFqnCBsd6RMkjVDRZzb`
  - Brian (deep, comforting), `nPczCjzI2devNBz1zQrb`
  - Eric (smooth, trustworthy), `cjVigY5qzO86Huf0OWal`
  - Alice (clear British educator), `Xb7hH8MSUJpSbSDYk0k2`
  - Sarah (reassuring), `EXAVITQu4vr4xnSDxMaL`
  - Lily (velvety British), `pFZP5JQG7iQjIQuC4Bku`

## Making the edit with a voice
1. Write the script for the ear. Short sentences. About 75-85 words fills 30 s at a natural pace.
2. `python3 scripts/voiceover.py "<script>" <voice_id> public/voice` writes `public/voice/voice.mp3`
   and `public/voice/words.json`, with every word's start time and frame.
3. **Timing comes from the voice.** Build each lockup from the real frames:
   `words: [{ w: "You're", at: 0 }, { w: "not", at: 9 }]`. Read them from words.json. Don't guess with
   `ws()`. Put shot changes on phrase boundaries (the gap after a full stop or comma).
4. Set `FRAMES` to the voice's end plus about 1 s for the end card. Check the length with
   `ffprobe voice.mp3`. If it runs long, tighten the script, don't speed the voice up.
5. Mix:
   - voice at 1.0, with `<Audio src={staticFile("voice/voice.mp3")} />` at frame 0
   - music bed down to about 0.18-0.25, dipping to about 0.12 under the voice
   - effects at about 70 % of their silent-video volumes
   - no whoosh or riser peaking on top of a key word: put them in the gaps between phrases
   - normalise the final mix to -14 LUFS as usual
6. Listen for problems the voice can cause: a mispronounced name (spell it the way it sounds, e.g.
   "Hersh-field"), or a pause in the wrong place (rewrite the punctuation).
