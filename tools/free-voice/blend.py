"""Kokoro with a blended voice. Usage: python -I blend.py <model_dir> <out.wav> <speed> "<text>" voiceA:weight voiceB:weight"""
import os, sys
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
mdir, out, speed, text = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4]
k = Kokoro(os.path.join(mdir, "kokoro-v1.0.onnx"), os.path.join(mdir, "voices-v1.0.bin"))
style = sum(float(w) * k.get_voice_style(v) for v, w in (x.split(":") for x in sys.argv[5:]))
audio, sr = k.create(text, voice=style, speed=speed, lang="en-us")
sf.write(out, audio, sr)
print(out, f"{len(audio)/sr:.1f}s")
