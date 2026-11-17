"""Episode 1 preview, "Two Hours at the Bus Stop": the Regular, cut-out puppet style (pose swaps with a pop, held
poses, one-word captions, flat colour backgrounds), from the owner's pose sheet.
usage: python3 render.py <poses_dir> <voice.wav> <voice.words.json> <sfx_dir> <out.mp4>"""
import json, math, subprocess, sys
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

POSES, VOICE, WORDS, SFX, OUT = sys.argv[1:6]
W, H, FPS = 1080, 1920, 30
FONT = "/usr/share/fonts/opentype/inter/Inter-Black.otf"
cap_font = ImageFont.truetype(FONT, 104); bub_font = ImageFont.truetype(FONT, 66); sign_font = ImageFont.truetype(FONT, 44)
words = json.load(open(WORDS))
script = "He sat at the bus stop for two whole hours. Bus after bus drove right past him. Not one of them stopped. So he started shouting at every driver. Then an old woman walking by looked at him and said: Son, you have to wave your hand. He had been sitting there for two hours, and he never once waved. Sometimes nothing changes, because you never asked.".split()
assert len(script) == len(words), (len(script), len(words))
T = lambda i: words[i]["start"]
END = words[-1]["end"] + 1.2
N = int(END * FPS)

pose = {n: Image.open(f"{POSES}/{n}.png").convert("RGBA") for n in ["point", "shrug", "shout", "laugh", "sit", "walk1", "walk2"]}
SCALE = 2.25
scaled = {n: im.resize((int(im.width * SCALE), int(im.height * SCALE)), Image.LANCZOS) for n, im in pose.items()}

def bg(c1, c2):
    g = np.linspace(0, 1, H)[:, None, None]
    a = (np.array(c1)[None, None, :] * (1 - g) + np.array(c2)[None, None, :] * g).repeat(W, 1)
    img = Image.fromarray(a.astype("uint8")); d = ImageDraw.Draw(img)
    d.rectangle([0, 1690, W, H], fill=tuple(int(v * 0.82) for v in c2))          # floor
    d.line([0, 1690, W, 1690], fill=(25, 25, 35), width=6)
    return img

def bus(color=(250, 196, 40)):
    b = Image.new("RGBA", (980, 470), (0, 0, 0, 0)); d = ImageDraw.Draw(b)
    d.rounded_rectangle([10, 10, 970, 400], 60, fill=color, outline=(25, 25, 35), width=12)
    for x in range(70, 860, 170): d.rounded_rectangle([x, 70, x + 130, 190], 18, fill=(150, 215, 245), outline=(25, 25, 35), width=9)
    d.rounded_rectangle([860, 70, 945, 300], 16, fill=(150, 215, 245), outline=(25, 25, 35), width=9)
    for x in (200, 760): d.ellipse([x - 70, 330, x + 70, 465], fill=(35, 35, 45), outline=(25, 25, 35), width=10); d.ellipse([x - 28, 370, x + 28, 425], fill=(150, 150, 160))
    return b
BUS = bus()

def stop_sign(img):
    d = ImageDraw.Draw(img)
    d.rectangle([110, 700, 132, 1700], fill=(70, 75, 90), outline=(25, 25, 35), width=6)
    d.rounded_rectangle([20, 540, 222, 730], 26, fill=(30, 130, 220), outline=(25, 25, 35), width=10)
    tw = d.textlength("BUS", font=sign_font); d.text((121 - tw / 2, 560), "BUS", font=sign_font, fill="white")
    tw = d.textlength("STOP", font=sign_font); d.text((121 - tw / 2, 630), "STOP", font=sign_font, fill="white")

def clock(img, t):
    d = ImageDraw.Draw(img); cx, cy, r = 860, 380, 120
    d.ellipse([cx - r, cy - r, cx + r, cy + r], fill="white", outline=(25, 25, 35), width=12)
    for k in range(12):
        a = k * math.pi / 6; d.line([cx + 0.8 * r * math.cos(a), cy + 0.8 * r * math.sin(a), cx + 0.92 * r * math.cos(a), cy + 0.92 * r * math.sin(a)], fill=(25, 25, 35), width=6)
    a = t * 9 - math.pi / 2; d.line([cx, cy, cx + 0.8 * r * math.cos(a), cy + 0.8 * r * math.sin(a)], fill=(25, 25, 35), width=10)
    a = t * 0.75 - math.pi / 2; d.line([cx, cy, cx + 0.5 * r * math.cos(a), cy + 0.5 * r * math.sin(a)], fill=(220, 50, 50), width=14)

def anger(img, x, y, f):
    d = ImageDraw.Draw(img); s = 1 + 0.15 * math.sin(f * 1.3)
    for k, (dx, dy) in enumerate([(-1, -1), (1, -1), (-1, 1), (1, 1)]):
        d.arc([x + dx * 28 * s - 30, y + dy * 28 * s - 30, x + dx * 28 * s + 30, y + dy * 28 * s + 30], 180 if dx < 0 else 270 if dy < 0 else 0, 270 if dx < 0 else 360 if dy < 0 else 90, fill=(225, 30, 40), width=14) if False else None
        d.line([x + dx * 20 * s, y + dy * 70 * s, x + dx * 20 * s, y + dy * 24 * s], fill=(225, 30, 40), width=20)
        d.line([x + dx * 70 * s, y + dy * 20 * s, x + dx * 24 * s, y + dy * 20 * s], fill=(225, 30, 40), width=20)

def bubble(img, text, k):
    if k <= 0: return
    lines = ["Son, you have to", "wave your hand."]
    d = ImageDraw.Draw(img); w = 860; h = 260; x0 = (W - w) / 2; y0 = 150 + (1 - k) * 40
    d.rounded_rectangle([x0, y0, x0 + w, y0 + h], 60, fill="white", outline=(25, 25, 35), width=12)
    d.polygon([(x0 + w - 220, y0 + h - 6), (x0 + w - 90, y0 + h - 6), (x0 + w + 10, y0 + h + 120)], fill="white")
    d.line([(x0 + w - 220, y0 + h - 2), (x0 + w + 10, y0 + h + 120), (x0 + w - 90, y0 + h - 2)], fill=(25, 25, 35), width=12)
    for i, ln in enumerate(lines):
        tw = d.textlength(ln, font=bub_font); d.text((W / 2 - tw / 2, y0 + 45 + i * 88), ln, font=bub_font, fill=(25, 25, 35))

# shots: (start word, pose, background colours, x, extras)
SHOTS = [
    (0, "sit", ((64, 200, 190), (40, 150, 150)), 600, {"sign": 1, "clock": 1}),
    (10, "sit", ((64, 200, 190), (40, 150, 150)), 600, {"sign": 1, "bus": [T(10), T(13)]}),
    (17, "shrug", ((252, 210, 70), (230, 170, 40)), 540, {}),
    (22, "shout", ((236, 80, 70), (190, 50, 50)), 540, {"anger": 1, "shake": 1}),
    (26, "point", ((245, 130, 60), (210, 95, 40)), 640, {"bus_away": T(26)}),
    (29, "shrug", ((150, 110, 220), (110, 80, 180)), 540, {}),
    (40, "shrug", ((150, 110, 220), (110, 80, 180)), 540, {"zoom": 1.7, "bubble": 1, "dy": 560}),
    (47, "laugh", ((90, 200, 110), (60, 160, 85)), 470, {}),
    (60, "walk", ((255, 160, 90), (240, 110, 80)), None, {}),
]
starts = [T(s[0]) - 0.04 for s in SHOTS] + [END]
FLOOR = 1700

proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                         "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p", OUT + ".video.mp4"], stdin=subprocess.PIPE)
bgs = {}
sfx = [(0.0, "pop")]
for k in range(1, len(SHOTS)): sfx.append((starts[k], "pop"))
for i in range(N):
    t = i / FPS
    k = max(j for j in range(len(SHOTS)) if starts[j] <= t)
    w0, pname, cols, x, ex = SHOTS[k]; ts = t - starts[k]; dur = starts[k + 1] - starts[k]
    key = cols
    if key not in bgs: bgs[key] = bg(*cols)
    frame = bgs[key].copy()
    if ex.get("sign"): stop_sign(frame)
    if ex.get("clock"): clock(frame, ts)
    for bt in ex.get("bus", []):           # buses roar past behind him
        u = (t - bt) / 1.0
        if -0.1 < u < 1.1: frame.paste(BUS, (int(1200 - u * 2300), 1250), BUS)
    if "bus_away" in ex:
        u = (t - ex["bus_away"]) / 1.6
        if u < 1.2: frame.paste(BUS, (int(-150 - u * 1400), 1250), BUS)
    # the character: pose swap with a pop (squash and stretch), held, breathing in small steps
    if pname == "walk":
        step = int(ts * FPS / 7) % 2; img = scaled["walk1" if step == 0 else "walk2"]
        x = int(120 + ts / max(1, dur) * 1150); bob = -10 if (int(ts * FPS) % 7) < 2 else 0
        frame.paste(img, (int(x - img.width / 2), FLOOR - img.height + 18 + bob), img)
    else:
        img = scaled[pname]
        p = min(1, ts / 0.2); e = 1 - (1 - p) ** 3
        sx, sy = 1 + 0.07 * (1 - e) * math.cos(p * 9), 1 - 0.07 * (1 - e) * math.cos(p * 9)
        breath = 1 + 0.006 * math.sin(int(ts * 15) / 15 * 4)
        if abs(sx - 1) > 0.002 or abs(breath - 1) > 0.001:
            img = img.resize((int(img.width * sx), int(img.height * sy * breath)), Image.BILINEAR)
        sh = (math.sin(i * 2.7) * 9 if ex.get("shake") and int(ts * 12) % 3 != 0 else 0)
        frame.paste(img, (int(x - img.width / 2 + sh), FLOOR - img.height + 18 + ex.get("dy", 0)), img)
        if ex.get("anger"): anger(frame, x + 230, FLOOR - img.height + 110, i)
    # camera: slow push in on every shot, a bigger one for the close-up
    z = ex.get("zoom", 1.0) * (1 + 0.035 * min(1, ts / max(1, dur)))
    if z > 1.001:
        cw, ch = W / z, H / z
        cy = 1040 if ex.get("zoom") else H / 2
        top = min(max(0, cy - ch / 2), H - ch)
        frame = frame.crop((int(W / 2 - cw / 2), int(top), int(W / 2 + cw / 2), int(top + ch))).resize((W, H), Image.BILINEAR)
    if ex.get("bubble"): bubble(frame, "", min(1, ts / 0.25))
    # caption: one word at a time (hidden while the speech bubble is up)
    if not ex.get("bubble"):
        cur = [j for j in range(len(words)) if words[j]["start"] <= t]
        if cur and t < words[-1]["end"] + 0.4:
            wtxt = script[cur[-1]].strip(".,:?!").upper() if False else script[cur[-1]].strip(".,:")
            age = t - words[cur[-1]]["start"]; s = 1 + 0.18 * max(0, 1 - age / 0.12)
            d = ImageDraw.Draw(frame); f = ImageFont.truetype(FONT, int(104 * s)) if s > 1.01 else cap_font
            tw = d.textlength(wtxt, font=f); d.text((W / 2 - tw / 2, 300 - (s - 1) * 50), wtxt, font=f, fill="white", stroke_width=10, stroke_fill=(20, 20, 28))
    proc.stdin.write(frame.convert("RGB").tobytes())
proc.stdin.close(); proc.wait()

# sound: the voice, plus a pop on every pose change and a whoosh for each bus
sfx += [(b - 0.15, "whoosh") for b in SHOTS[1][4]["bus"]] + [(SHOTS[4][4]["bus_away"], "whoosh")]
inputs = ["-i", VOICE]; filt = []; labels = ["[1:a]"]
for j, (at, name) in enumerate(sfx):
    inputs += ["-i", f"{SFX}/{name}.wav"]; vol = 0.18 if name == "pop" else 0.3
    filt.append(f"[{j + 2}:a]volume={vol},adelay={int(max(0, at) * 1000)}|{int(max(0, at) * 1000)}[s{j}]"); labels.append(f"[s{j}]")
filt.append("".join(labels) + f"amix=inputs={len(labels)}:normalize=0:duration=first,apad,atrim=0:{END:.2f},loudnorm=I=-14:TP=-1.5:LRA=11[a]")
subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", OUT + ".video.mp4"] + inputs + ["-filter_complex", ";".join(filt),
                "-map", "0:v", "-map", "[a]", "-c:v", "copy", "-c:a", "aac", "-b:a", "192k", "-shortest", OUT], check=True)
print("done", OUT, round(END, 1), "s")
