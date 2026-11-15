"""Shorten pauses longer than MAX to KEEP seconds using Whisper word timings, never next to a number word
(Whisper times spoken numbers early, so cutting there clips them). Usage: python -I tighten.py in.wav in.wav.words.json out.wav [max] [keep]"""
import json, re, sys
import numpy as np, soundfile as sf
src, wj, out = sys.argv[1:4]
MAX = float(sys.argv[4]) if len(sys.argv) > 4 else 0.25
KEEP = float(sys.argv[5]) if len(sys.argv) > 5 else 0.16
y, sr = sf.read(src)
W = json.load(open(wj))
num = lambda w: bool(re.search(r"\d", w))
keep, pos, cut = [], 0, 0.0
for a, b in zip(W, W[1:]):
    gap = b["start"] - a["end"]
    if gap > MAX and not num(a["w"]) and not num(b["w"]):
        s = a["end"] + KEEP / 2
        e = b["start"] - KEEP / 2
        keep.append(y[int(pos * sr):int(s * sr)])
        pos = e
        cut += e - s
keep.append(y[int(pos * sr):])
f = int(0.008 * sr)
for i in range(1, len(keep)):  # tiny fades at joins
    if len(keep[i - 1]) > f and len(keep[i]) > f:
        keep[i - 1][-f:] *= np.linspace(1, 0, f)[:, None] if keep[i - 1].ndim > 1 else np.linspace(1, 0, f)
        keep[i][:f] *= np.linspace(0, 1, f)[:, None] if keep[i].ndim > 1 else np.linspace(0, 1, f)
sf.write(out, np.concatenate(keep), sr)
print(f"cut {cut:.2f}s -> {len(np.concatenate(keep))/sr:.1f}s")
