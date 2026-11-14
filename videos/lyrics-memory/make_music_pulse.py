"""Two original, faster music beds for the lyrics video, written from scratch with numpy (free to use).

  pulse : 125 bpm "mystery trailer" bed: ticking muted-synth 16ths, a deep thump on every beat, a ticking hat,
          dark minor chords underneath, no melody. A riser into the twist, then half a second of silence, then it slams back.
  afro  : 118 bpm groove: kick, a gliding log-drum style bass, shaker 16ths, a 3-2 rim/clave pattern, short chord stabs,
          the same riser and drop.

usage: python3 make_music_pulse.py <pulse|afro> <out.wav> [drop_seconds,...]
"""
import sys
import wave

import numpy as np

SR = 44100
DUR = 64.0
style = sys.argv[1]
out_path = sys.argv[2]
DROPS = [float(x) for x in sys.argv[3].split(",")] if len(sys.argv) > 3 and sys.argv[3] else [7.15]
DROP_LEN = 0.62
BPM = 125 if style == "pulse" else 118
BEAT = 60 / BPM
N = int(SR * DUR)
t = np.arange(N) / SR
rng = np.random.default_rng(11)
L = np.zeros(N)
R = np.zeros(N)


def note(n):
    return 440.0 * 2 ** ((n - 69) / 12)


def add(start, sig, gain=1.0, pan=0.5):
    i0 = int(start * SR)
    if i0 >= N or i0 < 0:
        return
    sig = sig[: N - i0]
    L[i0 : i0 + len(sig)] += sig * gain * (1 - pan) * 2 * 0.5
    R[i0 : i0 + len(sig)] += sig * gain * pan * 2 * 0.5


def seg(length):
    return np.arange(int(length * SR)) / SR


def kick(gain=1.0):
    s = seg(0.45)
    f = 48 + 110 * np.exp(-s * 28)
    ph = 2 * np.pi * np.cumsum(f) / SR
    return np.sin(ph) * np.exp(-s * 7) * gain + rng.normal(0, 1, len(s)) * np.exp(-s * 300) * 0.15


def hat(length=0.05, bright=1.0):
    s = seg(length)
    n = rng.normal(0, 1, len(s))
    n = np.diff(np.concatenate([[0], n]))  # crude high-pass
    return n * np.exp(-s * (90 / bright)) * 0.35


def pluck(freq, length=0.16, cutoff=6):
    """muted synth: a few saw harmonics with a fast decay, so it ticks rather than sings."""
    s = seg(length)
    sig = sum(np.sin(2 * np.pi * freq * h * s) / h * np.exp(-s * cutoff * h) for h in range(1, 7))
    return sig * np.minimum(1, s / 0.003) * np.exp(-s * 18)


def pad(freqs, length):
    s = seg(length)
    e = np.minimum(np.minimum(1, s / 0.8), np.clip((length - s) / 0.8, 0, 1))
    return sum(sum(np.sin(2 * np.pi * f * h * s + rng.uniform(0, 6)) / h**2 for h in range(1, 4)) for f in freqs) * e


# A minor: Am - F - Dm - E (the E gives the "not finished yet" pull)
CH = [[57, 60, 64], [53, 57, 60], [50, 53, 57], [52, 56, 59]]
BAR = BEAT * 4
bars = int(DUR / BAR) + 1

for b in range(bars):
    t0 = b * BAR
    ch = CH[(b // 2) % 4]
    root = ch[0] - 24
    add(t0, pad([note(n) for n in ch], BAR + 0.5), 0.022)
    for k in range(4):  # beats
        tb = t0 + k * BEAT
        if style == "pulse":
            add(tb, kick(0.55 if b >= 1 else 0.0))
        else:
            if k in (0, 2):
                add(tb, kick(0.6))
            if k in (1, 3):
                add(tb, hat(0.12, 0.4), 0.55)  # snare-ish noise on 2 and 4
    for k in range(16):  # sixteenths
        ts = t0 + k * BEAT / 4
        if style == "pulse":
            n = ch[[0, 0, 1, 0, 2, 0, 1, 0][k % 8]]
            acc = 1.0 if k % 4 == 0 else 0.6
            add(ts, pluck(note(n), 0.14), 0.07 * acc, 0.35 if k % 2 else 0.65)
            if k % 2 == 1:
                add(ts, hat(0.03), 0.35)
        else:
            add(ts, hat(0.04, 0.7), 0.28 * (1.0 if k % 2 else 0.6), 0.6)
            if k in (0, 3, 6, 10, 12):  # 3-2 clave
                add(ts, pluck(note(84), 0.05, 30), 0.05, 0.4)
            if k in (2, 7, 10):  # chord stabs on the off-beats
                for n in ch:
                    add(ts, pluck(note(n + 12), 0.12, 9), 0.035)
    # bass
    if style == "pulse":
        for k in range(4):
            s = seg(BEAT * 0.9)
            add(t0 + k * BEAT, np.sin(2 * np.pi * note(root) * s) * np.exp(-s * 5), 0.16)
    else:
        for k, glide in ((0, 0), (1.5, 1), (2.75, 0), (3.5, -1)):
            s = seg(BEAT * 0.8)
            f = note(root + 12 * (k == 3.5)) * 2 ** (glide * (1 - np.exp(-s * 12)) * 2 / 12)
            add(t0 + k * BEAT, np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-s * 6), 0.2)

mix = np.stack([L, R], 1)

# riser into each drop, then silence, then a hit as it slams back in
for d in DROPS:
    rl = 1.6
    s = seg(rl)
    noise = rng.normal(0, 1, len(s))
    noise = np.convolve(noise, np.ones(4) / 4, "same")
    riser = noise * (s / rl) ** 2 * 0.12 + np.sin(2 * np.pi * np.cumsum(300 + 900 * (s / rl) ** 2) / SR) * (s / rl) ** 3 * 0.03
    i0 = int((d - rl) * SR)
    mix[i0 : i0 + len(s), 0] += riser
    mix[i0 : i0 + len(s), 1] += riser
    a, b = int(d * SR), int((d + DROP_LEN) * SR)
    mix[a:b] = 0
    hit = kick(0.9)
    cr = hat(0.5, 4) * 0.8
    mix[b : b + len(hit), 0] += hit
    mix[b : b + len(hit), 1] += hit
    mix[b : b + len(cr), 0] += cr
    mix[b : b + len(cr), 1] += cr

mix /= np.max(np.abs(mix)) / 0.89
fade = np.clip((DUR - t) / 2.5, 0, 1)
mix *= fade[:, None]
with wave.open(out_path, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes((mix * 32767).astype("<i2").tobytes())
print("wrote", out_path, style, BPM, "bpm, drops at", DROPS)
