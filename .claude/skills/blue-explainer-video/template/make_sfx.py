"""Sound effects for "Why a song gives you chills", designed from scratch in code (free to use, no samples).

Each effect is built for one moment in the video (see SOUND.md) and written as a 48 kHz stereo WAV to
public/sfx2/. Run:  python3 make_sfx.py
Needs numpy and scipy.
"""
import os
import sys
import wave

import numpy as np
from scipy.signal import butter, fftconvolve, sosfilt

SR = 48000
OUT = os.path.join(os.path.dirname(os.path.abspath(__file__)), "public", "sfx2")
rng = np.random.default_rng(2026)


# ---------- building blocks ----------

def secs(d):
    return np.arange(int(SR * d)) / SR


def white(n):
    return rng.standard_normal(n)


def pink(n):
    """1/f noise via spectral shaping: softer and more natural than white noise."""
    spec = np.fft.rfft(rng.standard_normal(n))
    f = np.fft.rfftfreq(n, 1 / SR)
    f[0] = f[1]
    spec /= np.sqrt(f)
    x = np.fft.irfft(spec, n)
    return x / (np.abs(x).max() + 1e-9)


def filt(x, kind, freq, order=2):
    sos = butter(order, freq, btype=kind, fs=SR, output="sos")
    return sosfilt(sos, x)


def svf_sweep(x, f_curve, q=1.2, mode="bp"):
    """State-variable filter whose cutoff follows f_curve (Hz per sample): the classic whoosh tool."""
    y = np.zeros_like(x)
    low = band = 0.0
    damp = 1.0 / q
    for i in range(len(x)):
        f = 2 * np.sin(np.pi * min(f_curve[i], SR / 6) / SR)
        high = x[i] - low - damp * band
        band += f * high
        low += f * band
        y[i] = band if mode == "bp" else low if mode == "lp" else high
    return y


def env(n, attack, release, curve=2.0, hold=0.0):
    """Attack / hold / exponential-ish release envelope over n samples."""
    t = np.arange(n) / SR
    a = np.clip(t / max(attack, 1e-4), 0, 1) ** 0.7
    r_start = attack + hold
    r = np.clip(1 - (t - r_start) / max(release, 1e-4), 0, 1) ** curve
    return a * np.where(t < r_start, 1, r)


def swell(n, peak_at, rise, fall):
    """Grows to a peak at `peak_at` seconds, then falls away: used so whooshes peak exactly on the cut."""
    t = np.arange(n) / SR
    up = np.clip((t - (peak_at - rise)) / rise, 0, 1) ** 2.2
    down = np.clip(1 - (t - peak_at) / fall, 0, 1) ** 1.6
    return np.where(t <= peak_at, up, down)


def reverb(st, size=1.6, mix=0.25, damp=5000, predelay=0.012):
    """Convolution with a synthetic stereo room tail."""
    n = int(SR * size)
    t = np.arange(n) / SR
    decay = np.exp(-t * 6.9 / size)
    irs = []
    for _ in range(2):
        ir = filt(white(n), "low", damp) * decay
        ir = np.concatenate([np.zeros(int(SR * predelay)), ir])
        irs.append(ir / np.sqrt((ir ** 2).sum()))
    wet = np.stack([fftconvolve(st[:, c], irs[c])[: len(st)] for c in range(2)], axis=1)
    return st * (1 - mix) + wet * mix * 1.4


def stereo(mono, width=0.4, pan=0.0):
    """Mono to stereo with a little width (micro-delay) and a pan (-1 left .. 1 right)."""
    d = int(SR * 0.0007 * width / 0.4)
    l = mono
    r = np.concatenate([np.zeros(d), mono[: len(mono) - d]]) if d else mono
    gl, gr = np.sqrt(0.5 * (1 - pan)), np.sqrt(0.5 * (1 + pan))
    return np.stack([l * gl, r * gr], axis=1) * np.sqrt(2)


def pan_sweep(mono, start=-0.7, end=0.7):
    p = np.linspace(start, end, len(mono))
    return np.stack([mono * np.sqrt(0.5 * (1 - p)), mono * np.sqrt(0.5 * (1 + p))], axis=1) * np.sqrt(2)


def tail(st, seconds):
    return np.concatenate([st, np.zeros((int(SR * seconds), 2))])


def fade(st, fin=0.003, fout=0.03):
    n = len(st)
    e = np.ones(n)
    a, b = int(SR * fin), int(SR * fout)
    if a:
        e[:a] = np.linspace(0, 1, a)
    if b:
        e[-b:] *= np.linspace(1, 0, b)
    return st * e[:, None]


def save(name, st, peak_db=-3.0):
    st = fade(st)
    st = st / (np.abs(st).max() + 1e-9) * 10 ** (peak_db / 20)
    os.makedirs(OUT, exist_ok=True)
    data = (np.clip(st, -1, 1) * 32767).astype("<i2")
    with wave.open(os.path.join(OUT, f"{name}.wav"), "wb") as w:
        w.setnchannels(2)
        w.setsampwidth(2)
        w.setframerate(SR)
        w.writeframes(data.tobytes())
    print(f"{name:14s} {len(st) / SR:5.2f} s")


# ---------- the effects ----------

def shiver():
    """0.0 s, under 'That chill': a cold, airy shimmer, like breath on glass, with a fast tremble."""
    d = 3.2
    t = secs(d)
    n = len(t)
    trem = 0.6 + 0.4 * np.sin(2 * np.pi * (7 + 3 * t / d) * t)
    tones = sum(np.sin(2 * np.pi * f * t + rng.uniform(0, 6)) * g for f, g in [(1760, 1), (1765.5, 0.8), (2637, 0.5), (2645, 0.4), (3520, 0.22)])
    air = filt(pink(n), "band", [2500, 9000]) * 1.6
    breath = filt(pink(n), "band", [300, 1400]) * 0.5
    body = (tones * 0.18 * trem + air * 0.5 + breath) * env(n, 0.9, 2.2, hold=0.2)
    st = stereo(body, width=0.9)
    return reverb(tail(st, 1.2), size=2.8, mix=0.45, damp=7000)


def whoosh(film=False):
    """A transition whoosh. The loudest point lands 0.5 s in, so place it 0.5 s before the cut."""
    d = 1.4
    n = int(SR * d)
    t = secs(d)
    peak = 0.5
    f = np.where(t < peak, 250 + 3800 * (t / peak) ** 2.2, 4050 - 3200 * np.clip((t - peak) / (d - peak), 0, 1) ** 0.7)
    x = svf_sweep(pink(n) * 1.0 + white(n) * 0.15, f, q=1.6)
    x *= swell(n, peak, 0.42, d - peak - 0.05)
    if film:  # projector flutter for the film-burn transitions
        x *= 0.78 + 0.22 * np.sin(2 * np.pi * 24 * t)
        x += filt(white(n), "band", [5000, 11000]) * 0.05 * swell(n, peak, 0.2, 0.4)
    low = filt(pink(n), "low", 160) * swell(n, peak, 0.3, 0.5) * 0.6
    st = pan_sweep(x, -0.75, 0.75) + stereo(low, 0.2)
    return reverb(tail(st, 0.6), size=1.2, mix=0.2)


def riser():
    """6.8 s to 8.6 s: tension building toward the peak, then cut dead (the wave hit takes over)."""
    d = 1.9
    t = secs(d)
    n = len(t)
    k = t / d
    f = 300 + 5200 * k ** 2.5
    noise = svf_sweep(pink(n), f, q=2.2) * (0.15 + k ** 2.4)
    tones = np.zeros(n)
    for base in (110.0, 164.8, 220.0):  # three voices gliding up an octave
        ph = 2 * np.cumsum(np.pi * base * (1 + k ** 1.8)) / SR
        tones += (np.sin(ph) + 0.35 * np.sin(2 * ph) + 0.15 * np.sin(3 * ph)) * (0.1 + 0.9 * k ** 2)
    tones = filt(tones, "low", 1500 + 4000 * 1)
    x = noise * 0.9 + tones * 0.22
    x[-int(SR * 0.004):] *= np.linspace(1, 0, int(SR * 0.004))
    return stereo(x, width=0.9)


def wave_hit():
    """8.6 s, the cut to the great wave: a deep boom with the wash of a breaking wave."""
    d = 2.8
    t = secs(d)
    n = len(t)
    boom = np.sin(2 * np.pi * np.cumsum(32 + 38 * np.exp(-t * 9)) / SR) * env(n, 0.004, 1.6, curve=2.5)
    crack = filt(white(n), "band", [900, 6000]) * env(n, 0.001, 0.09, curve=3)
    wash = filt(pink(n), "low", 2600) * env(n, 0.06, 2.3, curve=1.6) * (0.7 + 0.3 * np.sin(2 * np.pi * 1.3 * t))
    st = stereo(boom * 1.0, 0.1) + stereo(crack * 0.35, 0.6) + pan_sweep(wash * 0.55, -0.3, 0.4)
    return reverb(st, size=2.4, mix=0.3)


def glitch(seed):
    """Digital stutter for the glitch transitions."""
    g = np.random.default_rng(seed)
    d = 0.42
    n = int(SR * d)
    x = np.zeros(n)
    pos = 0
    while pos < n:
        ln = int(SR * g.uniform(0.012, 0.05))
        tt = np.arange(ln) / SR
        kind = g.integers(3)
        if kind == 0:
            seg = np.sign(np.sin(2 * np.pi * g.uniform(180, 1800) * tt))
        elif kind == 1:
            seg = g.standard_normal(ln)
        else:
            seg = np.round(np.sin(2 * np.pi * g.uniform(60, 400) * tt) * 4) / 4
        x[pos: pos + ln] = seg[: n - pos] * g.uniform(0.3, 1)
        pos += ln
    x = np.round(x * 8) / 8  # bit-crush
    x = filt(x, "band", [120, 9000]) * env(n, 0.002, 0.25, hold=0.12)
    st = np.stack([x, np.roll(x, int(SR * 0.006))], axis=1)
    return st


def firework():
    """10.4 s: the gold burst, a soft thump then a spray of crackle that drifts across the stereo field."""
    d = 2.8
    t = secs(d)
    n = len(t)
    thump = np.sin(2 * np.pi * np.cumsum(55 + 70 * np.exp(-t * 20)) / SR) * env(n, 0.003, 0.5, curve=2.5)
    pop = filt(white(n), "band", [400, 3000]) * env(n, 0.001, 0.06, curve=3)
    crackle = np.zeros((n, 2))
    density = 900 * np.exp(-t * 1.2) * (t > 0.08)
    for i in np.nonzero(rng.random(n) < density / SR)[0]:
        ln = int(SR * rng.uniform(0.0015, 0.006))
        if i + ln >= n:
            continue
        burst = rng.standard_normal(ln) * np.exp(-np.arange(ln) / (ln / 4)) * rng.uniform(0.2, 1) * np.exp(-t[i] * 0.9)
        pan = rng.uniform(-0.9, 0.9)
        crackle[i: i + ln, 0] += burst * np.sqrt(0.5 * (1 - pan))
        crackle[i: i + ln, 1] += burst * np.sqrt(0.5 * (1 + pan))
    crackle = np.stack([filt(crackle[:, c], "high", 1800) for c in range(2)], axis=1)
    st = stereo(thump * 0.9, 0.1) + stereo(pop * 0.4, 0.4) + crackle * 1.3
    return reverb(st, size=2.2, mix=0.35, damp=8000)


def subdrop():
    """14.0 s, 'before': the floor drops out. A deep falling sine with a soft click."""
    d = 2.6
    t = secs(d)
    n = len(t)
    f = 28 + 62 * np.exp(-t * 2.4)
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, 2.3, curve=1.8)
    x += 0.25 * np.sin(2 * 2 * np.pi * np.cumsum(f) / SR) * env(n, 0.01, 0.8)
    click = filt(white(n), "band", [1500, 5000]) * env(n, 0.0005, 0.02, curve=3) * 0.3
    st = stereo(x, 0.05) + stereo(click, 0.5)
    return reverb(st, size=2.0, mix=0.18, damp=1500)


def drop():
    """17.2 s: the drop finally lands. A single clean water 'plink' with a little room."""
    d = 0.7
    t = secs(d)
    n = len(t)
    f = 700 * np.exp(np.clip(t / 0.045, 0, 1) * np.log(2.4))  # the bubble's pitch rises
    x = np.sin(2 * np.pi * np.cumsum(f) / SR) * env(n, 0.001, 0.12, curve=2.2)
    x += filt(white(n), "band", [2000, 7000]) * env(n, 0.0005, 0.012, curve=3) * 0.15
    return reverb(tail(stereo(x, 0.3), 0.6), size=1.0, mix=0.35, damp=6000)


def paper():
    """20.0 s: the study page slides in."""
    d = 0.8
    t = secs(d)
    n = len(t)
    x = svf_sweep(white(n) * 0.6 + pink(n), 1800 + 3500 * np.sin(np.pi * t / d), q=0.9)
    x *= swell(n, 0.25, 0.22, 0.5) * (0.8 + 0.2 * rng.random(n))
    return reverb(pan_sweep(x, 0.4, -0.2), size=0.6, mix=0.12)


def marker():
    """20.6 s: the highlighter stroke across the title, a felt tip dragging over paper."""
    d = 0.8
    t = secs(d)
    n = len(t)
    grain = filt(white(n), "band", [2200, 5200]) * (0.6 + 0.4 * filt(np.abs(white(n)), "low", 60))
    squeak = np.sin(2 * np.pi * np.cumsum(2900 + 120 * np.sin(2 * np.pi * 3 * t)) / SR) * 0.06
    x = (grain + squeak) * env(n, 0.03, 0.12, hold=0.6, curve=1)
    return reverb(pan_sweep(x, -0.5, 0.5), size=0.5, mix=0.1)


def shutter():
    """22.4 s: four camera-shutter clicks, one per flash frame (every 2 frames = 67 ms)."""
    d = 0.6
    n = int(SR * d)
    st = np.zeros((n, 2))
    for k in range(4):
        i = int(SR * k * 2 / 30)
        ln = int(SR * 0.05)
        c = np.zeros(ln)
        for off, g in ((0, 1.0), (0.012, 0.6)):  # curtain open, curtain close
            j = int(SR * off)
            m = int(SR * 0.006)
            c[j: j + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / (m / 5)) * g
        c = filt(c, "band", [1200, 8000]) + filt(c, "low", 400) * 2.0
        st[i: i + ln] += stereo(c, 0.3, pan=(-0.3, 0.2, -0.1, 0.3)[k])[: max(0, min(ln, n - i))]
    return reverb(st, size=0.5, mix=0.12)


def spark():
    """22.7 s, 'Anticipation': a small electric crackle as the brain cells fire."""
    d = 0.6
    t = secs(d)
    n = len(t)
    x = np.zeros(n)
    for i in np.nonzero(rng.random(n) < (500 * np.exp(-t * 6)) / SR)[0]:
        ln = int(SR * rng.uniform(0.0008, 0.003))
        if i + ln < n:
            x[i: i + ln] += rng.standard_normal(ln) * rng.uniform(0.3, 1)
    zap = np.sin(2 * np.pi * np.cumsum(1400 + 600 * np.sin(2 * np.pi * 37 * t)) / SR) * env(n, 0.002, 0.15) * 0.25
    x = filt(x, "high", 1500) + zap
    return reverb(stereo(x, 0.8), size=0.9, mix=0.3)


def lamp():
    """24.9 s, 'The peak': a light switch clicks and the filament hums up."""
    d = 1.8
    t = secs(d)
    n = len(t)
    click = np.zeros(n)
    for off, g in ((0.0, 1.0), (0.018, 0.55)):
        i = int(SR * off)
        m = int(SR * 0.004)
        click[i: i + m] += rng.standard_normal(m) * np.exp(-np.arange(m) / (m / 6)) * g
    body = np.sin(2 * np.pi * 2100 * t) * np.exp(-t * 90) * 0.4
    click = filt(click, "band", [900, 7000]) + body
    hum = sum(np.sin(2 * np.pi * f * t) * g for f, g in ((100, 1), (200, 0.5), (300, 0.3), (400, 0.12)))
    hum *= np.clip((t - 0.03) / 0.25, 0, 1) * env(n, 0.001, 1.4, hold=0.3) * 0.12
    buzz = filt(white(n), "band", [3000, 9000]) * (rng.random(n) < 0.002) * 2 * (t > 0.03) * np.exp(-t * 2)
    st = stereo(click, 0.2) + stereo(hum + buzz, 0.5)
    return reverb(st, size=1.1, mix=0.18)


def chime():
    """28.0 s, 'reward': a warm, bright bell that rings out (the payoff)."""
    d = 3.0
    t = secs(d)
    n = len(t)
    x = np.zeros(n)
    for base, g0 in ((659.25, 1.0), (987.77, 0.55)):  # E5 + B5, a clean open fifth
        for ratio, g, dec in ((1, 1, 1.4), (2.0, 0.35, 2.4), (2.76, 0.22, 3.4), (5.4, 0.08, 6), (8.93, 0.03, 9)):
            x += np.sin(2 * np.pi * base * ratio * t + rng.uniform(0, 6)) * g * g0 * np.exp(-t * dec)
    x *= np.clip(t / 0.004, 0, 1)
    shimmer = filt(pink(n), "band", [6000, 12000]) * env(n, 0.3, 1.6) * 0.04
    return reverb(stereo(x * 0.5 + shimmer, 0.7), size=3.0, mix=0.42, damp=9000)


def pop():
    """28.9 s: the end card lands, a soft, rounded UI pop."""
    d = 0.4
    t = secs(d)
    n = len(t)
    x = np.sin(2 * np.pi * np.cumsum(260 + 520 * np.exp(-t * 60)) / SR) * env(n, 0.001, 0.12, curve=2.4)
    x += filt(white(n), "band", [2000, 6000]) * env(n, 0.0005, 0.006, curve=3) * 0.12
    return reverb(stereo(x, 0.3), size=0.6, mix=0.15)


def stamp():
    """A heavy rubber stamp hitting a desk: a low thump, a short slap and a little wood ring."""
    d = 1.2
    t = secs(d)
    n = len(t)
    thump = np.sin(2 * np.pi * np.cumsum(70 + 90 * np.exp(-t * 35)) / SR) * env(n, 0.002, 0.35, curve=2.5)
    slap = filt(white(n), "band", [300, 4000]) * env(n, 0.0008, 0.05, curve=3)
    ring = sum(np.sin(2 * np.pi * f * t) * g for f, g in ((180, 1), (410, 0.5), (720, 0.25))) * np.exp(-t * 14) * 0.25
    return reverb(stereo(thump + slap * 0.6 + ring, 0.2), size=0.9, mix=0.18)


def ticks():
    """A clock ticking fast (4 ticks a second) for 2 seconds, alternating tick and tock."""
    d = 2.0
    n = int(SR * d)
    x = np.zeros(n)
    for k in range(8):
        i = int(SR * k * 0.25)
        m = int(SR * 0.03)
        tt = np.arange(m) / SR
        f0 = 3200 if k % 2 == 0 else 2500
        click = np.sin(2 * np.pi * f0 * tt) * np.exp(-tt * 260) + rng.standard_normal(m) * np.exp(-tt * 500) * 0.4
        x[i: i + m] += click
    x = filt(x, "high", 800)
    return reverb(stereo(x, 0.3), size=0.6, mix=0.15)


def strike():
    """A marker slash across the clock: a fast bright swish ending in a soft tap."""
    d = 0.6
    t = secs(d)
    n = len(t)
    f = 1500 + 6000 * np.clip(t / 0.22, 0, 1) ** 0.8
    x = svf_sweep(white(n), f, q=1.4) * swell(n, 0.18, 0.16, 0.25)
    tap = filt(white(n), "band", [1500, 6000]) * env(n, 0.0005, 0.02, curve=3) * 0.5
    tap = np.roll(tap, int(SR * 0.2))
    return reverb(pan_sweep(x + tap, -0.6, 0.6), size=0.6, mix=0.12)


def lift():
    """Relief: an airy rise that blooms into a soft major chord."""
    d = 2.2
    t = secs(d)
    n = len(t)
    air = svf_sweep(pink(n), 300 + 4500 * np.clip(t / 0.6, 0, 1) ** 1.6, q=1.8) * swell(n, 0.6, 0.55, 1.4)
    chord = sum(np.sin(2 * np.pi * f * t) for f in (523.25, 659.25, 783.99, 1046.5)) * np.clip((t - 0.5) / 0.08, 0, 1) * np.exp(-np.clip(t - 0.5, 0, None) * 2.2)
    x = air * 0.8 + chord * 0.12
    return reverb(stereo(x, 0.8), size=2.2, mix=0.38, damp=8000)


def tap():
    """A soft phone or touchscreen tap."""
    d = 0.25
    t = secs(d)
    n = len(t)
    x = np.sin(2 * np.pi * 1800 * t) * np.exp(-t * 120) * 0.5 + filt(white(n), "band", [2000, 8000]) * env(n, 0.0004, 0.01, curve=3) * 0.4
    x += np.sin(2 * np.pi * 240 * t) * np.exp(-t * 60) * 0.4
    return reverb(stereo(x, 0.2), size=0.4, mix=0.1)


def eerie():
    """An uneasy swell: two detuned tones drifting apart, with breathy air."""
    d = 2.4
    t = secs(d)
    n = len(t)
    a = np.sin(2 * np.pi * 330 * t) + np.sin(2 * np.pi * np.cumsum(330 + 22 * t / d) / SR)
    b = np.sin(2 * np.pi * 495 * t + 0.5) * 0.5 + np.sin(2 * np.pi * np.cumsum(495 - 30 * t / d) / SR) * 0.5
    air = filt(pink(n), "band", [800, 3500]) * 0.6
    x = (a * 0.3 + b * 0.2 + air) * env(n, 0.7, 1.5, hold=0.2)
    return reverb(stereo(x, 0.9), size=2.6, mix=0.45, damp=6000)


if __name__ == "__main__":
    only = set(sys.argv[1:])
    jobs = {
        "shiver": shiver, "whoosh": lambda: whoosh(False), "whoosh-film": lambda: whoosh(True), "riser": riser,
        "wave-hit": wave_hit, "glitch-a": lambda: glitch(3), "glitch-b": lambda: glitch(11), "firework": firework,
        "subdrop": subdrop, "drop": drop, "paper": paper, "marker": marker, "shutter": shutter, "spark": spark,
        "lamp": lamp, "chime": chime, "pop": pop, "stamp": stamp, "ticks": ticks, "strike": strike,
        "lift": lift, "tap": tap, "eerie": eerie,
    }
    for name, fn in jobs.items():
        if not only or name in only:
            save(name, fn())
