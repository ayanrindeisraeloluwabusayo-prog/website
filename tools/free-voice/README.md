# Free voice tools (replace ElevenLabs when credits run out)

- **Narration: Kokoro-82M** (Apache-2.0, github.com/hexgrad/kokoro) through **kokoro-onnx** (MIT,
  github.com/thewh1teagle/kokoro-onnx). Free for commercial use, runs on CPU in about 3 s per sentence.
  `python -I say.py <model_dir> <out_dir> <speed> "<text>" am_michael bm_george ...`
  Model files (not in git, 350 MB): kokoro-v1.0.onnx and voices-v1.0.bin from the kokoro-onnx GitHub release
  `model-files-v1.0`. Needs `pip install kokoro-onnx soundfile` and `espeak-ng`.
- **Transcription with word timings: faster-whisper** (MIT, github.com/SYSTRAN/faster-whisper), replaces Scribe.
  `python -I hear.py small.en file.wav [--json]` (writes file.wav.words.json for on-screen word timing).

Samples: videos/voice-samples/kokoro/ (all read the test line word-perfect when checked with Whisper).
