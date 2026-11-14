"""Transcribe audio files with faster-whisper (MIT), with word timings. Usage: python -I hear.py <model> file1 [file2 ...]
Prints the text; with --json writes <file>.words.json: [{"w","start","end"}]."""
import json, subprocess, sys
import numpy as np
from faster_whisper import WhisperModel
args = [a for a in sys.argv[2:] if a != "--json"]
m = WhisperModel(sys.argv[1], device="cpu", compute_type="int8")
for fpath in args:
    pcm = subprocess.run(["ffmpeg", "-v", "error", "-i", fpath, "-ac", "1", "-ar", "16000", "-f", "s16le", "-"], capture_output=True, check=True).stdout
    audio = np.frombuffer(pcm, dtype=np.int16).astype(np.float32) / 32768.0
    segs, _ = m.transcribe(audio, word_timestamps=True, language="en", beam_size=5)
    words = [{"w": w.word.strip(), "start": round(w.start, 3), "end": round(w.end, 3)} for s in segs for w in s.words]
    print(fpath.rsplit("/", 1)[-1], "|", " ".join(x["w"] for x in words), flush=True)
    if "--json" in sys.argv:
        json.dump(words, open(fpath + ".words.json", "w"))
