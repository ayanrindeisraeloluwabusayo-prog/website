# Free AI video clips on Kaggle (Wan 2.1)

`wan-free-clips.ipynb` makes portrait 480x832 clips (~5 s) from text prompts with Wan 2.1 T2V 1.3B (Apache-2.0,
commercial use allowed) on Kaggle's free GPU (about 30 h a week).

Manual run: kaggle.com -> Create -> New Notebook -> File -> Import Notebook -> this file. Settings: GPU T4 x2, Internet on.
Run All. Download `clips.zip` from Output.

Hands-free run (later): needs a Kaggle API key saved through the environment's credential form and www.kaggle.com
allowed in the session network; then the notebook can be pushed and its output fetched with the Kaggle API.
