# Original score + sound effects + mix for "The Boy Who Sounded Like Four Drummers" (own numpy synthesis, no samples).
# 112 bpm everywhere: beat 0 is frame 0, the same grid the cartoon drummers' hands follow (cast.ts beatOf), so every
# on-screen stick hit lands on a drum hit. Sections follow the picture (frames at 30 fps):
#   hook groove, four extra drummers join on "four" (61) and drop on "feet" (148), flash at 172 |
#   street highlife (horn + guitar + claves) | jazz record in Tony's room (swing ride, walking bass, vibes, crackle) |
#   the Cool Cats' highlife, drums drop on "Not drums", the two claves clicks alone, needle-drag stop on "quits" |
#   suspense pad, comic "dun" on the rivals, drum fill on "ready" | Tony's groove | the kid (tick-tock + boing) |
#   feet only (kick + hi-hat foot) | limbs added one by one | whole drum section | Fela's saxophone | full Afrobeat
#   band, horn stab + cheer on "Afrobeat" | the claves motif on vibes | warm groove and the final hit.
import sys
import subprocess
import json
import numpy as np
from dsp import SR, TAU, ns, tt, rng, lp, hp, bp, peq, pan, place, fades, make_ir, convolve_st, integrated, read_wav, write_wav, modal, phase, colored
import instruments as I
import sfx_gen as G

FPS = 30
DUR = 1985 / FPS
BPM = 112
BL = 60 / BPM          # beat length (s)
S16 = BL / 4
N = ns(DUR)
F = lambda f: f / FPS  # frame -> seconds
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

# ---------------------------------------------------------------- the score
T = F
# hook: Tony's groove; four extra drummers join on "four", leave on "feet"; flash swell
afro_kit(0, T(172))
afro_band(0, T(172), 0.55, organ_on=False, gtr2=False)
extra_perc(T(61), T(148), ("conga", "shaker", "cow", "clave"))
put("drums", crash(0.5), T(170), 0.7, 0.2)
# street: highlife from the street band (no kit: a conga instead), quieter
highlife(T(172), T(349), 0.7, drums=False)
for k, t in steps(T(172), T(349)):
    if k % 16 in (0, 3, 8, 11, 12):
        put("perc", conga(240 if k % 16 in (3, 11) else 330, 0.4, slap=k % 16 == 12), human(t), 1.0, 0.35)
# room: the jazz record
jazz_record(T(343), T(498))
# the Cool Cats: highlife with drums; drums drop on "Not drums", everything stops for the two clicks
highlife(T(494), T(567), 1.0, drums=True)
highlife(T(567), T(655), 0.8, drums=False, claves_on=True)
highlife(T(712), T(744), 1.0, drums=True)
# suspense after the quit: low pad, comic "dun-dun" on the rivals, a fill on "ready"
put("band", I.pad([m2f(50), m2f(57), m2f(62)], 4.5, 0.25, rng(41), att=1.2, rel=1.5), T(790), 1.0)
for j, m in enumerate((43, 42)):
    put("lead", horn(m, 0.35 if j == 0 else 0.9, 0.8, "stab"), T(884) + j * 0.38, 1.0, 0.0)
fill(T(938) - 4 * S16)
# Tony's groove under "his secret is independence"
afro_kit(T(938) + 0.0, T(1022))
afro_band(T(938), T(1022), 0.5, organ_on=False)
# the kid: ticking clock and a boing
for k, t in steps(T(1022), T(1090), 2):
    put("perc", clave(0.3, 3100 if (k // 2) % 2 else 2500), t, 1.0, 0.0)
# feet only, then limbs join one by one, then the whole drum section
afro_kit(T(1108), T(1205), kick_on=True, hat_on=False, snare_on=False, toms_on=False, foot_hat=True)
afro_kit(T(1205), T(1236), kick_on=True, hat_on=True, snare_on=False, toms_on=False, foot_hat=True)
afro_kit(T(1236), T(1276), kick_on=True, hat_on=True, snare_on=True, toms_on=False)
afro_kit(T(1276), T(1716))
extra_perc(T(1276), T(1716), ("conga", "shaker", "cow"), 0.8)
afro_band(T(1276), T(1361), 0.5, organ_on=False)
afro_band(T(1361), T(1716), 0.75)
sax_solo(T(1361), T(1478))
horns(T(1478), T(1716), 0.62)
for dm in (0, -12, 7):
    put("lead", horn(74 + dm, 0.9, 0.85, "stab"), T(1543) - 0.02, 1.0, 0.0)
put("drums", crash(0.8), T(1543), 0.9, -0.2)
# callback: the claves motif on vibes, warm pad
for j, (dt, m) in enumerate([(0, 74), (0.27, 74), (1.07, 77), (1.6, 79), (2.14, 81), (2.68, 79), (3.2, 77), (3.75, 74)]):
    put("lead", vib(m, 0.45, 1.8), T(1722) + dt, 1.0, -0.15)
put("band", I.pad([m2f(50), m2f(57), m2f(62), m2f(65)], 4.6, 0.2, rng(43), att=1.0, rel=1.2), T(1716), 1.0)
for c in (T(1764), T(1764) + S16 * 2):
    put("perc", clave(0.5), c, 1.0, 0.0)
# golden finale: the groove returns warm, the final hit after "lived"
afro_kit(T(1860), T(1932), vel=0.85)
afro_band(T(1860), T(1932), 0.65)
extra_perc(T(1860), T(1932), ("shaker", "conga"), 0.7)
fill(T(1932) - 4 * S16)
for dm in (0, -12, 7, 3):
    put("lead", horn(62 + dm + 12, 1.6, 0.8, "horn"), T(1932), 0.8, 0.0)

# needle-drag stop on "quits": everything after the quit word is cut by a fast fade (except the drag itself)
def silence(t0, t1, fade=0.05):
    n0, n1 = ns(t0), ns(t1)
    for k in stems:
        a = stems[k]
        f = ns(fade)
        a[:, max(0, n0 - f):n0] *= np.linspace(1, 0, min(f, n0))
        a[:, n0:n1] = 0
for a, b in [(T(655), T(712)), (T(747), T(784))]:
    silence(a, b, 0.03)

music = sum(stems.values())
music = convolve_st(music, make_ir(0.9, 5)) * 0.18 + music  # small room

# ---------------------------------------------------------------- sound effects (own synthesis)
sfx = np.zeros((2, N))
def sp(x, t, g=1.0, p=0.0):
    place(sfx, pan(x, p) if np.ndim(x) == 1 else x, t, g)
def whoosh(t, dur=0.6, g=0.5):
    sp(G.whoosh(dur, rng(int(t * 100)), peak=0.5), t - dur / 2, g)
def pop(t, g=0.5, f=900):
    tt_ = tt(0.12)
    y = np.sin(phase(f * (1 + 1.5 * np.exp(-tt_ / 0.02)))) * np.exp(-tt_ / 0.04)
    sp(fades(y, 0.0005, 0.02), t, g)
def boing(t, g=0.5):
    tt_ = tt(0.8)
    f = 180 + 120 * np.sin(TAU * 7 * tt_) * np.exp(-tt_ / 0.3) + 60 * np.exp(-tt_ / 0.1)
    sp(np.sin(phase(f)) * np.exp(-tt_ / 0.35), t, g)
def murmur(t0, t1, voices=10, g=0.25):
    d = t1 - t0
    out = np.zeros((2, ns(d)))
    for v in range(voices):
        r = rng(100 + v + int(t0))
        base, scale = (r.uniform(95, 140), 1.0) if v % 2 else (r.uniform(180, 240), 1.15)
        y = lp(G.babble(d, r, base, scale, r.uniform(3.6, 4.8), r.uniform(0.5, 0.75), fmax=3400), 2800, 1) * r.uniform(0.3, 1.0)
        out += pan(y, r.uniform(-0.85, 0.85))
    sp(fades(out, 0.4, 0.6), t0, g)
def cheer(t, g=0.45):
    d = 3.2
    out = np.zeros((2, ns(d)))
    for v in range(20):
        r = rng(300 + v)
        base = r.uniform(105, 160) if v % 2 else r.uniform(180, 250)
        h = G.hurrah(r, base, 1.0 if v % 2 else 1.15)
        place(out, pan(lp(h, 4000, 1) * r.uniform(0.35, 1.0), r.uniform(-0.9, 0.9)), r.uniform(0.05, 0.8))
    tt_ = np.arange(ns(d)) / SR
    out += G.applause(d, rng(5), 30, np.interp(tt_, [0, 0.3, 1.2, 3.2], [0, 1, 0.7, 0])) * 0.8
    sp(fades(out, 0.02, 0.4), t, g)

# hook: four pops as the copies appear, a whoosh as they snap back, a shimmer into the flash
for j in range(4):
    pop(T(58) + j * 0.05, 0.35, 700 + 160 * j)
whoosh(T(147), 0.5, 0.45)
whoosh(T(172), 0.9, 0.35)
# street: traffic, a horn honk, birds, footsteps
murmur(T(172), T(349), 8, 0.12)
sp(G.bird_chirps(T(349) - T(172), rng(6), 0.6), T(172), 0.18)
tt_ = tt(0.5)
honk = fades(bp(np.sign(np.sin(TAU * 410 * tt_)) + np.sign(np.sin(TAU * 520 * tt_)), 300, 2500) * np.minimum(1, tt_ / 0.01), 0.005, 0.05)
sp(honk, T(205), 0.08, 0.6)
sp(honk[: ns(0.25)], T(230), 0.07, 0.6)
for k in range(9):
    sp(G.stroll_step(rng(200 + k), 0.4), T(258) + k * 0.36, 0.25, -0.1)
# room: page flip on "magazine"
tt_ = tt(0.35)
sp(bp(R.standard_normal(len(tt_)), 1500, 7000) * np.sin(np.pi * np.clip(tt_ / 0.3, 0, 1)) ** 2, T(427), 0.25, -0.2)
whoosh(T(349), 0.6, 0.3)
whoosh(T(498), 0.6, 0.3)
# club ambience: murmur under the band shots
murmur(T(498), T(744), 12, 0.13)
murmur(T(778), T(1022), 12, 0.1)
murmur(T(1276), T(1716), 14, 0.16)
# the claves clicks (the clicks themselves, loud and dry)
for c in (T(670), T(691)):
    sp(clave(0.9), c, 0.9, 0.0)
# the drummer quits: needle drag, chair scrape, sticks thrown down, stomps off
tt_ = tt(0.45)
drag = bp(R.standard_normal(len(tt_)), 600, 4000) * np.exp(-tt_ / 0.15) + 0.4 * np.sin(phase(900 * np.exp(-tt_ / 0.12) + 60)) * np.exp(-tt_ / 0.12)
sp(fades(drag, 0.001, 0.05), T(744), 0.45)
tt_ = tt(0.4)
sp(bp(R.standard_normal(len(tt_)), 250, 2200) * np.sin(np.pi * np.clip(tt_ / 0.35, 0, 1)), T(746), 0.25, 0.2)
for j in range(3):
    sp(G.clink(rng(60 + j), 1800 + 300 * j, 0.15, 0.6), T(752) + j * 0.06, 0.3, 0.3)
for k in range(4):
    sp(G.stroll_step(rng(400 + k), 0.2), T(756) + k * 0.32, 0.35, 0.3 + 0.1 * k)
# Tony sits: a soft thump; the spotlight hum on the empty stool
tt_ = tt(0.2)
sp(lp(R.standard_normal(len(tt_)), 300) * np.exp(-tt_ / 0.05), T(830), 0.4)
# kid: pats, rub swish, boing + twinkles
for k in range(6):
    tt_ = tt(0.08)
    sp(lp(R.standard_normal(len(tt_)), 900) * np.exp(-tt_ / 0.02), T(1046) + k * 0.33, 0.35, -0.2)
for k in range(3):
    tt_ = tt(0.4)
    sp(bp(R.standard_normal(len(tt_)), 800, 4000) * np.sin(np.pi * tt_ / 0.4) ** 2, T(1064) + k * 0.45, 0.18, 0.2)
boing(T(1090), 0.45)
for j in range(5):
    sp(vib(96 + (j % 3) * 3, 0.3, 0.6), T(1094) + j * 0.09, 0.4, 0.3 * ((j % 3) - 1))
murmur(T(1022), T(1108), 6, 0.08)
whoosh(T(1022), 0.6, 0.3)
whoosh(T(1108), 0.6, 0.3)
# four lines: rising swish; merge: shimmer
tt_ = tt(1.2)
sp(bp(R.standard_normal(len(tt_)), 2000, 9000) * (tt_ / 1.2) ** 2 * np.exp(-np.maximum(0, tt_ - 1.0) / 0.1), T(1205), 0.18)
for j in range(6):
    sp(vib(86 + j * 2, 0.3, 1.0), T(1272) + j * 0.04, 0.35, 0.3 * (j % 3 - 1))
# Afrobeat: the crowd goes up
cheer(T(1540), 0.5)
whoosh(T(1716), 0.8, 0.3)
whoosh(T(1860), 1.0, 0.3)
# golden end: evening birds and waves
sp(G.bird_chirps(DUR - T(1860), rng(8), 0.5, "blackbird"), T(1860), 0.15)
sp(G.crickets(DUR - T(1716), rng(9), 2), T(1716), 0.05)

# ---------------------------------------------------------------- mix
v, vsr = read_wav(sys.argv[1])
assert vsr == SR
voice = np.zeros((2, N))
voice[:, : min(N, v.shape[1])] = v[:, :N] if v.shape[0] == 2 else np.stack([v[0], v[0]])[:, :N]
words = json.load(open(sys.argv[2]))
# duck the music under speech
duck = np.zeros(N)
for w in words:
    duck[ns(max(0, w["start"] - 0.08)):ns(w["end"] + 0.12)] = 1
k = ns(0.12)
duck = np.convolve(duck, np.ones(k) / k, mode="same")
gain = 10 ** (-7 * duck / 20)

vl = integrated(voice)
voice *= 10 ** ((-16 - vl) / 20)
ml = integrated(music)
music *= 10 ** ((-26 + 3 - ml) / 20)       # music bed at -23 LUFS (+3 dB, the owner's choice) before ducking
music *= gain
sl = integrated(sfx)
sfx *= 10 ** ((-30 - 6 - sl) / 20)         # effects quiet (-6 dB) under the voice
mix = voice + music + sfx
write_wav(sys.argv[3], mix)
write_wav(sys.argv[3].replace(".wav", "_music.wav"), music)
print("voice", round(integrated(voice), 1), "music", round(integrated(music), 1), "sfx", round(integrated(sfx), 1), "mix", round(integrated(mix), 1))
