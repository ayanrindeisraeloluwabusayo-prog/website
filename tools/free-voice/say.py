"""Free narration with Kokoro-82M (Apache-2.0) through kokoro-onnx (MIT).
Usage: python -I say.py <model_dir> <out_dir> <speed> "<text>" voice1 voice2 ..."""
import os, sys, time
import numpy as np, soundfile as sf
from kokoro_onnx import Kokoro
mdir, out, speed, text, voices = sys.argv[1], sys.argv[2], float(sys.argv[3]), sys.argv[4], sys.argv[5:]
os.makedirs(out, exist_ok=True)
k = Kokoro(os.path.join(mdir, "kokoro-v1.0.onnx"), os.path.join(mdir, "voices-v1.0.bin"))
for v in voices:
    t0 = time.time()
    lang = "en-gb" if v.startswith("b") else "en-us"
    audio, sr = k.create(text, voice=v, speed=speed, lang=lang)
    sf.write(os.path.join(out, f"{v}.wav"), audio, sr)
    print(v, f"{time.time()-t0:.1f}s", f"{len(audio)/sr:.1f}s audio", flush=True)
