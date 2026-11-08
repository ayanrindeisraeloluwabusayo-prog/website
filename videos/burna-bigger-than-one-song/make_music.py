"""A soft, original ambient music bed for the style test (30 s): warm pad chords, a quiet sub bass and a
gentle plucked arpeggio. Written from scratch with numpy, so it is free to use."""
import sys
import wave

import numpy as np

SR = 44100
DUR = 37.0
t = np.arange(int(SR * DUR)) / SR
rng = np.random.default_rng(7)


def note(n):  # MIDI note to Hz
    return 440.0 * 2 ** ((n - 69) / 12)


# Am - F - C - G, twice; 3.75 s each
CHORDS = [[57, 60, 64, 69], [53, 57, 60, 65], [48, 55, 60, 64], [55, 59, 62, 67]] * 3
SPAN = 3.75

out = np.zeros((len(t), 2))


def env(start, length, attack, release):
    e = np.zeros(len(t))
    i0, i1 = int(start * SR), min(len(t), int((start + length) * SR))
    seg = np.arange(i1 - i0) / SR
    a = np.clip(seg / attack, 0, 1)
    r = np.clip((length - seg) / release, 0, 1)
    e[i0:i1] = np.minimum(a, r)
    return e


# pad: detuned soft saws (few harmonics), slow attack, overlapping releases
for ci, chord in enumerate(CHORDS):
    start = ci * SPAN
    e = env(start, SPAN + 1.2, 1.4, 1.6)
    for n in chord:
        for det, pan in ((-0.07, 0.3), (0.07, 0.7)):
            f = note(n) * 2 ** (det / 12)
            sig = sum(np.sin(2 * np.pi * f * h * t + rng.uniform(0, 6)) / h**1.6 for h in range(1, 6))
            out[:, 0] += sig * e * (1 - pan) * 0.05
            out[:, 1] += sig * e * pan * 0.05
    # sub bass on the root
    root = note(chord[0] - 12)
    sub = np.sin(2 * np.pi * root * t) * env(start, SPAN + 0.3, 0.3, 0.6) * 0.09
    out[:, 0] += sub
    out[:, 1] += sub

# plucked arpeggio, eighth notes at 64 bpm, entering after the hook
step = 60 / 64 / 2
k = 0
s = 3.4
while s < DUR - 1.5:
    chord = CHORDS[int(s // SPAN) % len(CHORDS)]
    n = chord[[0, 2, 1, 3, 2, 1][k % 6]] + 12
    i0 = int(s * SR)
    seg = np.arange(int(1.4 * SR)) / SR
    pl = (np.sin(2 * np.pi * note(n) * seg) + 0.3 * np.sin(2 * np.pi * note(n) * 2 * seg)) * np.exp(-seg * 4.5) * 0.06
    pl *= np.clip(seg / 0.004, 0, 1)
    i1 = min(len(t), i0 + len(pl))
    pan = 0.35 + 0.3 * ((k % 4) / 3)
    out[i0:i1, 0] += pl[: i1 - i0] * (1 - pan)
    out[i0:i1, 1] += pl[: i1 - i0] * pan
    s += step
    k += 1

# gentle lowpass (one-pole) and a touch of air noise
alpha = 0.18
for ch in range(2):
    y = np.zeros(len(t))
    acc = 0.0
    x = out[:, ch]
    for i in range(0, len(t), 1):
        acc += alpha * (x[i] - acc)
        y[i] = acc
    out[:, ch] = y
out += rng.normal(0, 0.0015, out.shape)

# fades and level
fade = np.minimum(np.clip(t / 0.8, 0, 1), np.clip((DUR - t) / 1.5, 0, 1))
out *= fade[:, None]
out *= 0.5 / np.max(np.abs(out))
pcm = (np.clip(out, -1, 1) * 32767).astype(np.int16)
with wave.open(sys.argv[1], "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print("wrote", sys.argv[1])
