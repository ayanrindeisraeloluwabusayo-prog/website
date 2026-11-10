# Original score + sound effects + mix for "The Lazy Wife's Garri" (own numpy synthesis, no samples). Instruments and
# the step sequencer come from the first short; the score below follows this film's beats.
import sys
import subprocess
import json
import numpy as np
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, peq, pan, place, fades, make_ir, convolve_st, integrated, read_wav, write_wav, modal, phase, colored
import instruments as I
import sfx_gen as G

FPS = 30
# optional 4th argument: a retime file (old time -> new time anchors) when the picture has been stretched to a slower voice
RETIME = json.load(open(sys.argv[4]))["anchors"] if len(sys.argv) > 4 else None
DUR = RETIME[-1][1] if RETIME else 1975 / FPS
BPM = 112
BL = 60 / BPM          # beat length (s)
S16 = BL / 4
N = ns(DUR)
F = (lambda f: float(np.interp(f / FPS, [p[0] for p in RETIME], [p[1] for p in RETIME]))) if RETIME else (lambda f: f / FPS)  # (original) frame -> seconds
R = rng(7)
m2f = I.m2f

# ---------------------------------------------------------------- instruments
_cache = {}
def cached(key, fn):
    if key not in _cache:
        _cache[key] = fn()
    return _cache[key]

def kick(vel=0.9):
    def mk():
        t = tt(0.45)
        f = 48 + 85 * np.exp(-t / 0.028)
        y = np.sin(phase(f)) * np.exp(-t / 0.22) + 0.25 * hp(R.standard_normal(len(t)), 1500) * np.exp(-t / 0.002)
        return fades(y, 0.0003, 0.05)
    return cached("kick", mk) * vel

def hat(vel=0.5, open_=False):
    def mk():
        d = 0.32 if open_ else 0.06
        t = tt(d)
        r = rng(3)
        y = hp(r.standard_normal(len(t)), 7000, 2) * np.exp(-t / (0.11 if open_ else 0.018))
        for fq in (3340, 4570, 6120, 7950):
            y += 0.12 * np.sign(np.sin(TAU * fq * t)) * np.exp(-t / (0.08 if open_ else 0.015))
        return fades(hp(y, 5000), 0.0002, 0.02)
    return cached(("hat", open_), mk) * vel

def snare(vel=0.7):
    v = round(vel, 1)
    return cached(("sn", v), lambda: I.snare(v, rng(11), dur=0.25, tune=1.25, snappy=0.7))

def tom(f, vel=0.8):
    def mk():
        t = tt(0.5)
        fr = f * (1 + 0.12 * np.exp(-t / 0.02))
        y = np.sin(phase(fr)) * np.exp(-t / 0.16) + 0.4 * np.sin(phase(fr * 1.52)) * np.exp(-t / 0.07)
        y += 0.2 * bp(rng(5).standard_normal(len(t)), 300, 3000) * np.exp(-t / 0.006)
        return fades(y, 0.0003, 0.05)
    return cached(("tom", f), mk) * vel

def conga(f, vel=0.7, slap=False):
    def mk():
        t = tt(0.35)
        y = modal(0.35, [(f, 1.0, 0.16), (f * 1.58, 0.35, 0.06), (f * 2.3, 0.15, 0.03)], rng(int(f)))
        if slap:
            y += 0.6 * bp(rng(9).standard_normal(len(t)), 800, 5000) * np.exp(-t / 0.012)
        return fades(y, 0.0003, 0.03)
    return cached(("cg", f, slap), mk) * vel

def shaker(vel=0.3):
    def mk():
        t = tt(0.12)
        return bp(rng(13).standard_normal(len(t)), 3000, 9000) * np.sin(np.pi * np.clip(t / 0.09, 0, 1)) ** 2
    return cached("shk", mk) * vel

def cowbell(vel=0.4):
    def mk():
        t = tt(0.25)
        y = (np.sign(np.sin(TAU * 562 * t)) + 0.7 * np.sign(np.sin(TAU * 845 * t))) * np.exp(-t / 0.07)
        return fades(bp(y, 500, 3500), 0.0003, 0.02)
    return cached("cow", mk) * vel

def clave(vel=0.6, f=2450.0):
    def mk():
        t = tt(0.12)
        y = modal(0.12, [(f, 1.0, 0.035), (f * 2.7, 0.25, 0.012)], rng(17))
        y += 0.3 * hp(rng(18).standard_normal(len(t)), 3000) * np.exp(-t / 0.0015)
        return fades(y, 0.0001, 0.01)
    return cached(("clv", f), mk) * vel

def bass(m, dur, vel=0.8):
    def mk():
        f = m2f(m)
        t = tt(dur + 0.08)
        saw = 2 * ((f * t) % 1) - 1
        y = lp(saw, 600, 2) * 0.6 + np.sin(TAU * f * t) * 0.8
        env = np.minimum(1, t / 0.006) * np.exp(-t / 0.5) * (t < dur) + (t >= dur) * np.exp(-(t - dur) / 0.02) * np.exp(-dur / 0.5)
        return fades(y * env, 0.001, 0.02)
    return cached(("bs", m, round(dur, 3)), mk) * vel

def chop(ms, vel=0.5, dur=0.13):
    def mk():
        y = sum(I.pluck(m2f(m), 0.6, rng(m), dur=dur + 0.05, bright=0.85, pos=0.12) for m in ms)
        t = tt(len(y) / SR)
        return fades(hp(y, 250) * np.exp(-t / (dur * 0.6)), 0.0005, 0.02)
    return cached(("ch", tuple(ms), dur), mk) * vel

def gtr(m, vel=0.5, dur=0.4):
    return cached(("gt", m, dur), lambda: hp(I.pluck(m2f(m), 0.7, rng(m + 100), dur=dur, bright=0.7, pos=0.15), 200)) * vel

def organ(ms, dur, vel=0.4):
    def mk():
        t = tt(dur + 0.1)
        y = np.zeros_like(t)
        for m in ms:
            f = m2f(m)
            for h, a in ((1, 1.0), (2, 0.6), (3, 0.35), (4, 0.2), (6, 0.08)):
                y += a * np.sin(TAU * f * h * t + h)
        y *= 1 - 0.18 * (0.5 + 0.5 * np.sin(TAU * 6.3 * t))
        env = np.minimum(1, t / 0.01) * np.clip((dur + 0.1 - t) / 0.1, 0, 1)
        return fades(lp(y * env, 3500), 0.002, 0.03) / len(ms)
    return cached(("org", tuple(ms), round(dur, 3)), mk) * vel

def horn(m, dur, vel=0.7, kind="horn"):
    return cached(("hn", m, round(dur, 3), kind, round(vel, 2)), lambda: I.brass(m2f(m), dur, vel, rng(m + 7), kind=kind))

def sax(m, dur, vel=0.6):
    """reedy sax: brass core with a buzzy odd-harmonic edge and breath"""
    def mk():
        y = I.brass(m2f(m), dur, vel, rng(m + 31), kind="soft", scoop=-35)
        t = tt(len(y) / SR)
        f = m2f(m) * (1 + 0.004 * np.sin(TAU * 5.5 * t))
        reed = np.tanh(2.5 * np.sin(phase(f))) * np.minimum(1, t / 0.04) * np.clip((dur + 0.05 - t) / 0.06, 0, 1)
        y = y + 0.25 * bp(reed, 300, 3500) + 0.03 * bp(rng(m).standard_normal(len(t)), 1500, 6000) * np.minimum(1, t / 0.05)
        return fades(y, 0.002, 0.03)
    return cached(("sx", m, round(dur, 3), round(vel, 2)), mk)

def vib(m, vel=0.5, dur=1.6):
    return cached(("vb", m, dur, round(vel, 2)), lambda: I.vibes(m2f(m), vel, rng(m + 50), dur=dur))

def ride(vel=0.35):
    return cached(("ride", round(vel, 2)), lambda: hp(I.cymbal(vel, rng(21), dur=0.9, bright=0.6), 2500) * 0.7)

def crash(vel=0.6):
    return cached(("crash", round(vel, 2)), lambda: I.cymbal(vel, rng(23), dur=2.4))

# ---------------------------------------------------------------- stems
stems = {k: np.zeros((2, N)) for k in ("drums", "perc", "band", "lead", "record")}
def put(stem, x, t, g=1.0, p=0.0):
    if t < 0 or t >= DUR:
        return
    place(stems[stem], pan(np.asarray(x) * g, p) if np.ndim(x) == 1 else np.asarray(x) * g, t)

def human(t, s=0.004):
    return t + R.normal(0, s)

def steps(t0, t1, every=1):
    """sixteenth-note steps (index, time) from t0 to t1"""
    k0 = int(np.ceil(t0 / S16 - 1e-9))
    k = k0
    while k * S16 < t1 - 1e-9:
        if (k - k0) % every == 0:
            yield k, k * S16
        k += 1

# Afrobeat kit (Tony): hi-hat 16ths with open hats, ghosted snare, kick on a broken pattern, toms on the turn
KICK_P = {0, 6, 10}
SNARE_P = {4: 0.75, 12: 0.85, 7: 0.25, 14: 0.3, 15: 0.2}
OPEN_P = {6, 14}
def afro_kit(t0, t1, kick_on=True, hat_on=True, snare_on=True, toms_on=True, foot_hat=False, vel=1.0):
    for k, t in steps(t0, t1):
        s = k % 16
        bar = (k // 16) % 4
        if hat_on:
            put("drums", hat((0.45 if s % 2 == 0 else 0.28) * vel, s in OPEN_P), human(t), 1.0, -0.25)
        if foot_hat and s in (4, 12):
            put("drums", hat(0.35 * vel), human(t), 0.8, -0.25)
        if kick_on and s in KICK_P:
            put("drums", kick(0.9 * vel), human(t, 0.002), 1.0, 0.0)
        if snare_on and s in SNARE_P:
            put("drums", snare(SNARE_P[s] * vel), human(t), 0.8, 0.1)
        if toms_on and bar == 3 and s in (9, 11, 13):
            put("drums", tom({9: 165, 11: 130, 13: 98}[s], 0.7 * vel), human(t), 0.9, {9: -0.2, 11: 0.1, 13: 0.35}[s])

def extra_perc(t0, t1, layers=("conga", "shaker", "cow"), vel=1.0):
    for k, t in steps(t0, t1):
        s = k % 16
        if "conga" in layers and s in (2, 3, 7, 10, 11, 14):
            put("perc", conga(220 if s in (3, 11) else 320, 0.55 * vel, slap=s in (7, 14)), human(t), 1.0, 0.45)
        if "shaker" in layers:
            put("perc", shaker((0.35 if s % 2 else 0.22) * vel), human(t), 1.0, -0.5)
        if "cow" in layers and s in (0, 3, 6, 10, 12):
            put("perc", cowbell(0.4 * vel), human(t), 1.0, 0.3)
        if "clave" in layers and s in (0, 3, 6, 10, 12):
            put("perc", clave(0.4 * vel), human(t), 1.0, -0.35)

# D dorian two-bar bass riff (step in 32, midi, length in steps)
BASS_RIFF = [(0, 38, 2), (3, 38, 1), (6, 45, 2), (8, 41, 1), (10, 43, 2), (14, 45, 2), (16, 38, 2), (20, 48, 2), (23, 45, 1), (26, 43, 2), (28, 41, 1), (30, 40, 2)]
def afro_band(t0, t1, vel=1.0, organ_on=True, gtr2=True):
    bar2 = 32 * S16
    b0 = int(np.floor(t0 / bar2))
    for b in range(b0, int(np.ceil(t1 / bar2)) + 1):
        base = b * bar2
        for st, m, ln in BASS_RIFF:
            t = base + st * S16
            if t0 <= t < t1:
                put("band", bass(m, ln * S16 * 0.9, 0.8 * vel), human(t), 1.0, 0.0)
        for k in range(32):
            t = base + k * S16
            if not (t0 <= t < t1):
                continue
            if k % 4 == 2:  # rhythm guitar chops on the off-beats
                put("band", chop([62, 65, 69] if (k // 8) % 2 == 0 else [60, 64, 67], 0.45 * vel), human(t), 1.0, 0.4)
            if gtr2 and k % 2 == 1:  # tenor guitar pattern
                put("band", gtr([69, 72, 74, 72, 69, 67, 69, 72][(k // 2) % 8], 0.32 * vel, 0.25), human(t), 1.0, -0.4)
        if organ_on:
            for k, ch in ((0, [62, 65, 69, 72]), (16, [60, 64, 67, 70])):
                t = base + k * S16
                if t0 <= t < t1:
                    put("band", organ(ch, 14 * S16, 0.5 * vel), t, 1.0, -0.1)

HORN_RIFF = [(0, 74, 2), (2, 74, 1), (3, 77, 2), (6, 79, 2), (8, 81, 3), (12, 79, 1), (13, 77, 1), (14, 74, 2), (18, 72, 2), (20, 74, 4), (26, 77, 2), (28, 76, 4)]
def horns(t0, t1, vel=0.7, kind="horn", octave=0):
    bar2 = 32 * S16
    for b in range(int(np.floor(t0 / bar2)), int(np.ceil(t1 / bar2)) + 1):
        for st, m, ln in HORN_RIFF:
            t = b * bar2 + st * S16
            if t0 <= t < t1:
                for dm, g, p in ((0, 1.0, -0.2), (-12, 0.6, 0.25)):
                    put("lead", horn(m + dm + octave, ln * S16 * 0.92, vel, kind), human(t, 0.006), g, p)

SAX_LINE = [(0, 74, 3), (3, 77, 1), (4, 79, 4), (10, 81, 2), (12, 84, 4), (18, 81, 2), (20, 79, 2), (22, 77, 2), (24, 79, 6), (32, 74, 2), (34, 72, 2), (36, 74, 8),
            (48, 81, 2), (50, 79, 2), (52, 77, 4), (58, 74, 2), (60, 72, 4)]
def sax_solo(t0, t1, vel=0.6):
    for st, m, ln in SAX_LINE:
        t = t0 + st * S16
        if t < t1:
            put("lead", sax(m - 12, ln * S16 * 0.95, vel), human(t, 0.008), 1.0, 0.15)

# highlife in G: arpeggiated guitar, horn tune, claves on the bell pattern
HL_CH = [[55, 59, 62, 67], [60, 64, 67, 72], [62, 66, 69, 74], [55, 59, 62, 67]]
HL_TUNE = [(0, 71, 2), (2, 74, 2), (4, 76, 4), (8, 74, 2), (10, 71, 2), (12, 69, 4), (16, 72, 2), (18, 76, 2), (20, 79, 4), (24, 78, 2), (26, 76, 2), (28, 74, 4)]
def highlife(t0, t1, vel=1.0, drums=True, tune=True, claves_on=True, drum_vel=1.0):
    bar = 16 * S16
    for b in range(int(np.floor(t0 / bar)), int(np.ceil(t1 / bar)) + 1):
        ch = HL_CH[b % 4]
        for k in range(16):
            t = b * bar + k * S16
            if not (t0 <= t < t1):
                continue
            if k % 2 == 0:
                put("band", gtr(ch[(k // 2) % 4] + 12, 0.38 * vel, 0.45), human(t), 1.0, -0.3)
            if k in (0, 6, 8, 14):
                put("band", bass(ch[0] - 24 + (7 if k in (6, 14) else 0), 2 * S16 * 0.9, 0.7 * vel), human(t), 1.0, 0.0)
            if claves_on and k in (0, 3, 6, 10, 12):
                put("perc", clave(0.45 * vel), human(t), 1.0, 0.3)
            if drums:
                if k % 2 == 0:
                    put("drums", hat(0.3 * drum_vel), human(t), 1.0, -0.2)
                if k in (0, 8):
                    put("drums", kick(0.7 * drum_vel), human(t), 1.0, 0.0)
                if k in (4, 12):
                    put("drums", snare(0.5 * drum_vel), human(t), 1.0, 0.1)
        if tune and b % 2 == 0:
            for st, m, ln in HL_TUNE:
                t = b * bar + st * S16
                if t0 <= t < t1:
                    put("lead", horn(m - 12, ln * S16 * 0.9, 0.55 * vel, "soft"), human(t, 0.006), 1.0, 0.2)

def jazz_record(t0, t1):
    """a swing record heard in the room: ride, walking bass, vibes; band-limited + crackle"""
    st = np.zeros((2, N))
    walk = [43, 47, 50, 52, 53, 52, 50, 47, 45, 48, 52, 55, 53, 50, 48, 45]
    k = int(np.ceil(t0 / BL))
    while k * BL < t1:
        t = k * BL
        place(st, pan(bass(walk[k % 16], BL * 0.85, 0.6), 0.0), t)
        place(st, pan(ride(0.3), 0.2), t)
        if k % 2 == 1:
            place(st, pan(ride(0.22), 0.2), t + BL * 2 / 3)
            place(st, pan(snare(0.2), 0.0) * 0.4, t + BL * 2 / 3)
        if k % 4 == 0:
            for j, m in enumerate([67, 71, 74, 78][: 2 + (k // 4) % 3]):
                place(st, pan(vib(m + 12, 0.35, 1.2), -0.2), t + j * BL * 2 / 3)
        k += 1
    st = bp(st, 180, 4200, 2)
    n0, n1 = ns(t0), ns(t1)
    cr = np.zeros(n1 - n0)
    idx = R.integers(0, n1 - n0, int((t1 - t0) * 40))
    cr[idx] = R.uniform(-0.5, 0.5, len(idx))
    cr = hp(cr, 1500) + 0.01 * bp(R.standard_normal(n1 - n0), 2000, 6000)
    st[:, n0:n1] += cr * 0.35
    env = np.zeros(N)
    env[n0:n1] = 1.0
    env = np.convolve(env, np.ones(ns(0.08)) / ns(0.08), mode="same")
    stems["record"] += st * env

def fill(t, vel=1.0):
    for j, (f, p) in enumerate([(200, -0.3), (165, -0.1), (130, 0.15), (98, 0.35)]):
        put("drums", tom(f, 0.8 * vel), t + j * S16, 1.0, p)
    put("drums", kick(1.0), t + 4 * S16)
    put("drums", crash(0.7 * vel), t + 4 * S16, 0.8, 0.3)


# ---------------------------------------------------------------- the score ("The Lazy Wife's Garri")
T = F
G_CH = [[55, 59, 62, 67], [60, 64, 67, 72], [62, 66, 69, 74], [55, 59, 62, 67]]
def lilt(t0, t1, vel=1.0, perc=True, slow=False):
    """light highlife in G: arpeggio guitar, bass, shaker and a soft conga"""
    bar = 16 * S16
    for b in range(int(np.floor(t0 / bar)), int(np.ceil(t1 / bar)) + 1):
        ch = G_CH[b % 4]
        for k in range(16):
            t = b * bar + k * S16
            if not (t0 <= t < t1):
                continue
            if k % (4 if slow else 2) == 0:
                put("band", gtr(ch[(k // 2) % 4] + 12, 0.4 * vel, 0.5 if not slow else 0.9), human(t), 1.0, -0.3)
            if k in (0, 6, 8, 14) and not slow or (slow and k == 0):
                put("band", bass(ch[0] - 24 + (7 if k in (6, 14) else 0), 2 * S16 * 0.9, 0.7 * vel), human(t), 1.0, 0.0)
            if perc:
                put("perc", shaker((0.3 if k % 2 else 0.2) * vel), human(t), 1.0, -0.5)
                if k in (3, 7, 10, 14):
                    put("perc", conga(230 if k in (3, 10) else 320, 0.45 * vel, slap=k == 14), human(t), 1.0, 0.4)
                if k in (0, 3, 6, 10, 12):
                    put("perc", clave(0.3 * vel), human(t), 1.0, 0.25)

def tune(t0, notes, vel=0.5, inst="horn"):
    for st, m, ln in notes:
        t = t0 + st * S16
        if inst == "horn":
            put("lead", horn(m, ln * S16 * 0.9, vel, "soft"), human(t, 0.006), 1.0, 0.15)
        else:
            put("lead", vib(m, vel, max(0.8, ln * S16 * 1.5)), human(t, 0.004), 1.0, -0.15)

def drone(t0, t1, ms, vel=0.25):
    put("band", I.pad([m2f(m) for m in ms], t1 - t0, vel, rng(int(t0 * 10)), att=1.0, rel=1.2), t0, 1.0)

HAPPY = [(0, 71, 2), (2, 74, 2), (4, 76, 4), (8, 74, 2), (10, 71, 2), (12, 69, 4), (16, 72, 2), (18, 76, 2), (20, 79, 4), (24, 78, 2), (26, 76, 2), (28, 74, 4)]
# hook: a question mark. Two soft drum knocks and a ticking clave; three wood ticks as three days flick past
for k, t in steps(T(0), T(86), 4):
    put("perc", clave(0.25, 2100), t, 1.0, 0.2)
for t, f in ((T(4), 110), (T(30), 98), (T(56), 82)):
    put("drums", tom(f, 0.6), t, 1.0, 0.0)
for d in range(3):
    put("perc", clave(0.6, 1700 + 250 * d), T(88 + d * 12), 1.0, 0.0)
    put("lead", vib(79 + 2 * d, 0.4, 0.8), T(88 + d * 12), 1.0, 0.0)
# the compound and the market: garri is money
lilt(T(123), T(284))
tune(T(133), HAPPY[:6], 0.45)
tune(T(201), HAPPY, 0.45)
# grate, press and fry: the groove gets busy
lilt(T(284), T(423), 1.1)
extra_perc(T(284), T(372), ("cow", "conga"), 0.7)
tune(T(372), HAPPY[6:], 0.5)
# hers? everything drops to a single vibraphone
for j, (dt, m) in enumerate([(0, 67), (0.75, 62), (1.5, 59), (2.2, 55)]):
    put("lead", vib(m, 0.4, 1.6), T(425) + dt, 1.0, -0.1)
# mother-in-law: tiptoe bass, then her line lands in silence, a muted "wah-wah" after it
for k, t in steps(T(516), T(560), 4):
    put("band", bass(43 + (3 if (k // 4) % 2 else 0), 0.16, 0.6), t, 1.0, 0.0)
    put("band", gtr(67 + (3 if (k // 4) % 2 else 0), 0.3, 0.2), t + S16 * 2, 1.0, -0.3)
for j, m in enumerate((58, 57)):
    put("lead", horn(m, 0.3 if j == 0 else 0.7, 0.7, "stab"), T(614) + j * 0.33, 0.9, 0.0)
# market day: they sell out
lilt(T(628), T(683), 1.1)
extra_perc(T(628), T(683), ("cow",), 0.6)
# day three: one slow guitar, alone; the sour face gets a falling horn
lilt(T(683), T(749), 0.7, perc=False, slow=True)
for j, m in enumerate((62, 60, 58)):
    put("lead", horn(m, 0.22 if j < 2 else 0.6, 0.6, "soft"), T(760) + j * 0.2, 0.9, 0.0)
lilt(T(781), T(809), 1.0)
# the whole compound agrees: a roll up to "lazy", one low hit, then nothing
for i, (tt_, v) in enumerate(I.snare_roll(T(812), T(855), 0.15, 0.6, rng(3), rate=20)):
    put("drums", tom(110, v * 0.6), tt_, 1.0, 0.0)
put("drums", kick(1.0), T(857)); put("lead", horn(43, 0.8, 0.8, "stab"), T(857), 0.9); put("lead", horn(50, 0.8, 0.7, "stab"), T(857), 0.6)
# the drought: a held, empty fifth; slow drum knocks for "One month. Two."; the rushing builds on shakers and congas
drone(T(878), T(1180), [38, 45, 50], 0.3)
for t in (T(913), T(929), T(950), T(983), T(1022)):
    put("drums", tom(82, 0.7), t, 1.0, 0.0)
for k, t in steps(T(1070), T(1123), 4):
    put("band", bass(38, 0.2, 0.5), t, 1.0, 0.0)
for k, t in steps(T(1123), T(1177)):
    put("perc", shaker(0.4), t, 1.0, -0.5)
    if k % 2 == 0:
        put("perc", conga(300 if k % 4 else 220, 0.6, slap=k % 8 == 6), t, 1.0, 0.4)
    if k % 4 == 0:
        put("drums", kick(0.7), t)
# the legs: a slow heartbeat under a minor drone; the stool: one low hit
drone(T(1177), T(1385), [38, 41, 45], 0.32)
for k in range(int((T(1380) - T(1177)) / 0.9)):
    t = T(1177) + k * 0.9
    put("drums", kick(0.55), t); put("drums", kick(0.35), t + 0.22)
for t, m in ((T(1213), 62), (T(1263), 65), (T(1334), 57)):
    put("lead", vib(m, 0.4, 1.4), t, 1.0, 0.1)
put("lead", horn(41, 1.0, 0.75, "stab"), T(1352), 0.9)
# you see: a curious plucked pattern; a dark note on "cyanide"
PL = [62, 65, 69, 65, 62, 69, 72, 69]
for k, t in steps(T(1380), T(1685), 2):
    put("band", gtr(PL[(k // 2) % 8] + (0 if t < T(1619) else -2), 0.3, 0.3), human(t), 1.0, -0.2 + 0.4 * ((k // 2) % 2))
    if (k // 2) % 4 == 0:
        put("band", bass(38, 0.3, 0.5), t, 1.0, 0.0)
put("lead", horn(38, 1.2, 0.7, "soft"), T(1439), 1.0); put("lead", horn(44, 1.2, 0.6, "soft"), T(1439), 0.8)
put("lead", horn(37, 1.2, 0.7, "soft"), T(1647), 1.0)
# 1981: a still, sad chord and four bare notes
drone(T(1685), T(1825), [45, 52, 57, 60], 0.3)
for j, m in enumerate((69, 67, 64, 60)):
    put("lead", vib(m, 0.4, 2.0), T(1700) + j * 0.95, 1.0, -0.1)
# the only safe garri: the tune comes home, slow and warm, and ends on the last word
lilt(T(1821), T(1932), 0.85, perc=False, slow=True)
tune(T(1826), [(0, 71, 4), (4, 74, 4), (8, 76, 6), (16, 74, 4), (20, 72, 4), (24, 71, 8)], 0.45, "vib")
for m in (55, 62, 67, 71, 74):
    put("lead", vib(m, 0.5, 2.6), T(1932) + 0.03 * (m - 55) / 4, 1.0, 0.0)
put("band", bass(31, 1.6, 0.8), T(1932))

# hard stops (silence carries the jokes)
def silence(t0, t1, fade=0.05):
    n0, n1 = ns(t0), ns(t1)
    for k in stems:
        a = stems[k]
        f = ns(fade)
        a[:, max(0, n0 - f):n0] *= np.linspace(1, 0, min(f, n0))
        a[:, n0:n1] = 0
silence(T(562), T(612), 0.05)

music = sum(stems.values())
music = convolve_st(music, make_ir(0.9, 5)) * 0.18 + music

# ---------------------------------------------------------------- sound effects (own synthesis)
sfx = np.zeros((2, N))
def sp(x, t, g=1.0, p=0.0):
    if 0 <= t < DUR:
        place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, g)
def nz(d): return R.standard_normal(ns(d))
def whoosh(t, dur=0.5, g=0.3):
    sp(G.whoosh(dur, rng(int(t * 100)), peak=0.5), t - dur / 2, g)
def thud(t, g=0.5, f=70):
    x = tt(0.3); sp(np.sin(phase(f * (1 + 0.8 * np.exp(-x / 0.02)))) * np.exp(-x / 0.08) + 0.3 * lp(nz(0.3), 400) * np.exp(-x / 0.03), t, g)
def creak(t, g=0.3, d=0.35, f0=320):
    x = tt(d); f = f0 * (1 + 0.5 * x / d); y = np.sign(np.sin(phase(f))) * np.sin(np.pi * x / d) ** 2
    sp(bp(y, 400, 2600) * (0.6 + 0.4 * np.sin(TAU * 31 * x)), t, g)
def rasp(t0, t1, rate=3.2, g=0.22, p=0.2):
    d = t1 - t0; x = tt(d)
    env = (0.5 + 0.5 * np.sign(np.sin(TAU * rate * x))) * (0.6 + 0.4 * np.sin(TAU * rate * 2 * x) ** 2)
    sp(fades(bp(nz(d), 1800, 6500) * env, 0.02, 0.05), t0, g, p)
def sizzle(t0, t1, g=0.15, p=-0.2):
    d = t1 - t0; y = hp(nz(d), 4500) * (0.7 + 0.3 * np.sin(TAU * 7 * tt(d)))
    idx = R.integers(0, len(y), int(d * 30)); y[idx] += R.uniform(-3, 3, len(idx))
    sp(fades(hp(y, 3000), 0.05, 0.1), t0, g, p)
def clink(t, g=0.3, p=0.0, f=None):
    sp(G.clink(rng(int(t * 1000)), f or R.uniform(3200, 4800), 0.14, 0.8), t, g, p)
def coins_s(t, n=5, g=0.28):
    for i in range(n): clink(t + i * 5 / 30 + 0.55, g, 0.2 * (i % 3 - 1))
def murmur(t0, t1, voices=10, g=0.2, bright=2800):
    d = t1 - t0; out = np.zeros((2, ns(d)))
    for v in range(voices):
        r = rng(100 + v + int(t0)); base, scale = (r.uniform(95, 140), 1.0) if v % 2 else (r.uniform(180, 240), 1.15)
        out += pan(lp(G.babble(d, r, base, scale, r.uniform(3.6, 4.8), r.uniform(0.5, 0.75), fmax=3400), bright, 1) * r.uniform(0.3, 1.0), r.uniform(-0.85, 0.85))
    sp(fades(out, 0.3, 0.4), t0, g)
def laugh(t0, d, voices=6, g=0.3):
    """a little crowd laugh: each voice a falling run of quick 'ha' syllables"""
    out = np.zeros((2, ns(d)))
    for v in range(voices):
        r = rng(500 + v + int(t0 * 10)); base = r.uniform(120, 170) if v % 2 else r.uniform(210, 300)
        t = r.uniform(0, 0.25); k = 0
        while t < d - 0.2:
            n = ns(0.11); x = np.arange(n) / SR
            f = base * (1.25 - 0.05 * k) * (1 + 0.1 * np.exp(-x / 0.03))
            ha = np.sin(phase(f)) + 0.5 * np.sin(phase(2 * f)) + 0.3 * np.sin(phase(3 * f))
            ha = bp(ha, 300, 2600) * np.sin(np.pi * x / 0.11) ** 1.5 + 0.2 * hp(r.standard_normal(n), 2000) * np.exp(-x / 0.02)
            place(out, pan(ha * (1 - 0.06 * k) * r.uniform(0.6, 1.0), r.uniform(-0.8, 0.8)), t)
            t += r.uniform(0.15, 0.2); k += 1
            if k > 7: k = 0; t += r.uniform(0.2, 0.5)
    sp(fades(out, 0.02, 0.2), t0, g)
def wind(t0, t1, g=0.12):
    sp(G.breeze(t1 - t0, rng(int(t0)), 1.2), t0, g)
def drip(t, g=0.3):
    x = tt(0.12); sp(np.sin(phase(900 + 1400 * np.exp(-x / 0.02))) * np.exp(-x / 0.03), t, g, -0.1)
def hiss(t0, t1, g=0.07):
    d = t1 - t0; sp(fades(bp(nz(d), 2500, 7000) * (0.6 + 0.4 * np.sin(TAU * 0.8 * tt(d)) ** 2), 0.2, 0.3), t0, g)
def crackle(t0, t1, g=0.2):
    d = t1 - t0; y = np.zeros(ns(d)); idx = R.integers(0, len(y), int(d * 14)); y[idx] = R.uniform(-1, 1, len(idx))
    sp(bp(y, 800, 6000) + 0.05 * lp(nz(d), 500), t0, g, -0.2)

# hook: rope creak, the stone, three days (a bird, then crickets, three times)
creak(T(8), 0.25, 0.3, 500); creak(T(22), 0.22, 0.25, 560)
thud(T(57), 0.6, 60)
sp(G.bird_chirps(T(86), rng(4), 0.5), 0, 0.12)
for d in range(3):
    whoosh(T(88 + d * 12), 0.3, 0.2)
whoosh(T(123), 0.5, 0.25)
# compound life: chickens are too much; birds, a murmur, coins
sp(G.bird_chirps(T(284) - T(123), rng(6), 0.6), T(123), 0.12)
murmur(T(123), T(201), 5, 0.07)
coins_s(T(176) - 0.55, 6)
murmur(T(201), T(284), 10, 0.16); coins_s(T(246) - 0.55, 6)
# grate, press, fry
murmur(T(284), T(372), 5, 0.07)
rasp(T(304), T(321)); creak(T(321), 0.35, 0.3, 240); thud(T(326), 0.3, 90); sizzle(T(331), T(372))
whoosh(T(306), 0.25, 0.18); whoosh(T(320), 0.25, 0.18); whoosh(T(331), 0.25, 0.18)
sp(G.crickets(T(516) - T(423), rng(9), 2), T(423), 0.05)
thud(T(495), 0.35, 60)
# mother-in-law's line: laughter after it
laugh(T(604), 0.95, 6, 0.3)
murmur(T(628), T(683), 12, 0.2); coins_s(T(634) - 0.55, 8)
creak(T(655), 0.2, 0.2, 700)
wind(T(683), T(781), 0.1); sp(G.crickets(T(781) - T(700), rng(11), 2), T(700), 0.04)
coins_s(T(783) - 0.55, 6)
laugh(T(815), 1.3, 8, 0.28); murmur(T(809), T(857), 8, 0.12)
# the drought: wind, the ground cracking, dry stalks
wind(T(878), T(1180), 0.16)
for t in (T(913), T(921), T(929), T(936)):
    x = tt(0.25); sp(bp(nz(0.25), 700, 5000) * np.exp(-x / 0.03) * (1 + np.sign(np.sin(TAU * 60 * x))), t, 0.25, R.uniform(-0.4, 0.4))
creak(T(952), 0.2, 0.4, 200)
for i in range(6): clink(T(1076) + i * 0.3, 0.12, 0.3 * (i % 3 - 1), 2400)
sp(G.crickets(T(1123) - T(1104), rng(12), 3), T(1104), 0.1); crackle(T(1104), T(1123))
rasp(T(1123), T(1140), 7.5, 0.25); sizzle(T(1140), T(1157), 0.2); crackle(T(1123), T(1177), 0.12)
whoosh(T(1123), 0.25, 0.2); whoosh(T(1140), 0.25, 0.2); whoosh(T(1157), 0.25, 0.2)
# the legs
for k in range(5): thud(T(1180) + k * 0.42, 0.22, 110); 
creak(T(1213), 0.4, 0.35, 180); creak(T(1229), 0.4, 0.3, 160)
creak(T(1263), 0.25, 0.2, 420); creak(T(1275), 0.25, 0.2, 460)
creak(T(1320), 0.3, 0.3, 200); thud(T(1334), 0.5, 65); creak(T(1342), 0.3, 0.3, 190); thud(T(1356), 0.55, 60)
# the explanation: knife, hiss of the wisps, grating, drips
thud(T(1403), 0.4, 160); clink(T(1403), 0.2, 0, 2600)
hiss(T(1414), T(1619), 0.06); rasp(T(1469), T(1500), 2.6, 0.2)
whoosh(T(1469), 0.3, 0.2)
for d in range(3): whoosh(T(1500 + d * 20), 0.3, 0.15)
for k in range(9): drip(T(1562) + k * 0.2 + R.uniform(0, 0.04), 0.3)
wind(T(1619), T(1690), 0.14); hiss(T(1619), T(1685), 0.1)
# 1981
x = tt(0.4); sp(bp(nz(0.4), 1500, 7000) * np.sin(np.pi * np.clip(x / 0.35, 0, 1)) ** 2, T(1683), 0.2)
wind(T(1700), T(1825), 0.14)
# the ending: evening birds, bowls
sp(G.bird_chirps(DUR - T(1821), rng(8), 0.5, "blackbird"), T(1821), 0.12)
for i in range(7): clink(T(1898) + i * 0.33, 0.14, 0.3 * (i % 3 - 1), 2300 + 200 * (i % 3))

# ---------------------------------------------------------------- mix
v, vsr = read_wav(sys.argv[1])
assert vsr == SR
voice = np.zeros((2, N))
vv = v if v.shape[0] == 2 else np.stack([v[0], v[0]])
voice[:, : min(N, vv.shape[1])] = vv[:, :N]
words = json.load(open(sys.argv[2]))
duck = np.zeros(N)
for w in words:
    duck[ns(max(0, w["start"] - 0.08)):ns(w["end"] + 0.12)] = 1
k = ns(0.12)
duck = np.convolve(duck, np.ones(k) / k, mode="same")
gain = 10 ** (-7 * duck / 20)
voice *= 10 ** ((-16 - integrated(voice)) / 20)
music *= 10 ** ((-26 + 3 - integrated(music)) / 20)   # music +3 dB (the owner's choice), ducked under speech
music *= gain
sfx *= 10 ** ((-30 - 6 - integrated(sfx)) / 20)       # effects -6 dB
mix = voice + music + sfx
write_wav(sys.argv[3], mix)
print("voice", round(integrated(voice), 1), "music", round(integrated(music), 1), "sfx", round(integrated(sfx), 1), "mix", round(integrated(mix), 1))
