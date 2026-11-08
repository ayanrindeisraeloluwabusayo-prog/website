"""Make the voiceover with ElevenLabs and get the time of every word, so on-screen words land with the voice.

Usage: python3 voiceover.py "<script text>" <voice_id> <outdir> [model_id]
Writes <outdir>/voice.mp3 and <outdir>/words.json: [{"w": "You're", "start": 0.12, "end": 0.38, "frame": 4}, ...]
(frame = start at 30 fps). The API key is injected by the session's network proxy (saved through the
environment's credential form for api.elevenlabs.io), so no key is read or sent here.
Default model: eleven_multilingual_v2 (steady narration).
"""
import base64, json, os, sys, urllib.request

text, voice, outdir = sys.argv[1], sys.argv[2], sys.argv[3]
model = sys.argv[4] if len(sys.argv) > 4 else "eleven_multilingual_v2"
os.makedirs(outdir, exist_ok=True)
req = urllib.request.Request(
    f"https://api.elevenlabs.io/v1/text-to-speech/{voice}/with-timestamps?output_format=mp3_44100_128",
    data=json.dumps({"text": text, "model_id": model, "voice_settings": {"stability": 0.5, "similarity_boost": 0.75}}).encode(),
    headers={"Content-Type": "application/json"},
)
d = json.loads(urllib.request.urlopen(req, timeout=300).read())
open(os.path.join(outdir, "voice.mp3"), "wb").write(base64.b64decode(d["audio_base64"]))
al = d.get("alignment") or d["normalized_alignment"]
chars, st, en = al["characters"], al["character_start_times_seconds"], al["character_end_times_seconds"]
words, cur = [], None
for c, s, e in zip(chars, st, en):
    if c.isspace():
        if cur: words.append(cur); cur = None
        continue
    if cur is None: cur = {"w": c, "start": s, "end": e}
    else: cur["w"] += c; cur["end"] = e
if cur: words.append(cur)
for w in words:
    w["start"], w["end"], w["frame"] = round(w["start"], 3), round(w["end"], 3), round(w["start"] * 30)
json.dump(words, open(os.path.join(outdir, "words.json"), "w"), indent=1)
print(f"{len(words)} words, {words[-1]['end']:.2f} s ->", os.path.join(outdir, "voice.mp3"))
