"""Cut-out puppet sample for the owner's cartoon cast: "The Regular" walks in, stops, then a close-up where he talks
(mouth opens with the voice) and blinks. Everything is drawn from the owner's own cast sheet, no new character art.

usage: python3 puppet_sample.py <body_cut.png> <face_cut.png> <sheet.png> <voice.wav> <voice.words.json> <out.mp4>
"""
import json, math, subprocess, sys, wave
import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageFont

BODY, FACE, SHEET, VOICE, WORDS, OUT = sys.argv[1:7]
W, H, FPS = 1080, 1920, 30
LEAD = 0.4                       # voice starts 0.4 s in
CUT = 3.1                        # cut from the full-body shot to the close-up
font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 58)

# ---------- voice loudness per video frame -> how open the mouth is (4 cartoon shapes)
wf = wave.open(VOICE); sr = wf.getframerate()
y = np.frombuffer(wf.readframes(wf.getnframes()), "<i2").astype(float) / 32768
if wf.getnchannels() > 1: y = y.reshape(-1, wf.getnchannels()).mean(1)
dur = len(y) / sr
N = int((LEAD + dur + 1.4) * FPS)
rms = np.zeros(N)
for i in range(N):
    t = i / FPS - LEAD
    a, b = int(t * sr), int((t + 1 / FPS) * sr)
    if 0 <= a < len(y): rms[i] = np.sqrt((y[a:max(a + 1, b)] ** 2).mean())
ref = np.percentile(rms[rms > 0], 92) if (rms > 0).any() else 1
o = np.clip((rms / ref - 0.12) / 0.75, 0, 1)
sm = np.zeros(N)
for i in range(N): sm[i] = o[i] if o[i] > (sm[i - 1] if i else 0) else 0.55 * (sm[i - 1] if i else 0) + 0.45 * o[i]
mouth = np.round(sm * 3) / 3     # 0, 1/3, 2/3, 1

words = json.load(open(WORDS))

# ---------- background: the sheet's own grey studio, stretched to the frame
sheet = Image.open(SHEET).convert("RGB")
col = np.asarray(sheet.crop((2, 20, 8, 712))).mean(1)
col = np.asarray(Image.fromarray(col.astype("uint8")[:, None, :].repeat(2, 1)).resize((1, H), Image.BICUBIC))[:, 0]
bg_arr = np.repeat(col[:, None, :], W, 1).astype(float)
yy, xx = np.mgrid[0:H, 0:W]
vign = 1 - 0.32 * (((xx - W / 2) / (W * 0.75)) ** 2 + ((yy - H * 0.45) / (H * 0.7)) ** 2)
BG = Image.fromarray(np.clip(bg_arr * vign[..., None], 0, 255).astype("uint8"))
floor = Image.new("L", (W, H), 0); ImageDraw.Draw(floor).ellipse([W / 2 - 330, 1690, W / 2 + 330, 1770], fill=90)
floor = floor.filter(ImageFilter.GaussianBlur(22))

# ---------- the cut-outs, with the shoe logo painted out
body = Image.open(BODY).convert("RGBA")
for box in ((215, 1965, 280, 2020), (370, 1965, 410, 2015)):          # side panels of both shoes
    big = body.crop((box[0] - 20, box[1] - 20, box[2] + 20, box[3] + 20)).filter(ImageFilter.GaussianBlur(7))
    m = Image.new("L", big.size, 0); ImageDraw.Draw(m).ellipse([18, 18, big.width - 18, big.height - 18], fill=255)
    m = m.filter(ImageFilter.GaussianBlur(5))
    patch = body.crop((box[0] - 20, box[1] - 20, box[2] + 20, box[3] + 20)); patch.paste(big, (0, 0), m)
    body.paste(patch, (box[0] - 20, box[1] - 20), body.crop((box[0] - 20, box[1] - 20, box[2] + 20, box[3] + 20)).getchannel("A"))
face = Image.open(FACE).convert("RGBA")

def skin_at(img, x, y):
    return tuple(int(v) for v in np.asarray(img.convert("RGB").crop((x - 4, y - 4, x + 4, y + 4))).reshape(-1, 3).mean(0))

def draw_face(img, mouth_c, mouth_w, eyes, eye_r, k_open, blink, skin):
    img = img.copy(); d = ImageDraw.Draw(img)
    if k_open > 0:
        w = mouth_w * (0.78 + 0.12 * k_open); h = mouth_w * 0.5 * k_open
        cx, cy = mouth_c
        L = Image.new("L", img.size, 0); ImageDraw.Draw(L).ellipse([cx - w / 2, cy - h * 0.35, cx + w / 2, cy + h * 0.65], fill=255)
        layer = Image.new("RGBA", img.size, (70, 18, 24, 255)); ld = ImageDraw.Draw(layer)
        ld.rectangle([cx - w / 2, cy - h * 0.35, cx + w / 2, cy - h * 0.35 + max(3, h * 0.22)], fill=(236, 232, 224, 255))       # top teeth
        ld.ellipse([cx - w * 0.3, cy + h * 0.25, cx + w * 0.3, cy + h * 0.8], fill=(170, 70, 80, 255))                          # tongue
        img.paste(layer, (0, 0), L)
        d.arc([cx - w / 2 - 2, cy - h * 0.35 - 3, cx + w / 2 + 2, cy + h * 0.65 + 3], 0, 360, fill=(150, 70, 65), width=3)
    if blink > 0:
        for (ex, ey) in eyes:
            rx, ry = eye_r
            top = ey - ry; lid = top + 2 * ry * blink
            d.ellipse([ex - rx, top, ex + rx, ey + ry], fill=None)
            m = Image.new("L", img.size, 0); ImageDraw.Draw(m).ellipse([ex - rx, top, ex + rx, ey + ry], fill=255)
            cutm = Image.new("L", img.size, 0); ImageDraw.Draw(cutm).rectangle([ex - rx - 2, top - 2, ex + rx + 2, lid], fill=255)
            m = Image.fromarray(np.minimum(np.asarray(m), np.asarray(cutm)))
            img.paste(Image.new("RGBA", img.size, skin + (255,)), (0, 0), m.filter(ImageFilter.GaussianBlur(1)))
            d.line([(ex - rx * 0.95, lid), (ex + rx * 0.95, lid)], fill=(90, 50, 45), width=4)
    return img

BLINKS = [1.7, 4.4, 6.9, 8.6]
def blink_at(t):
    for b in BLINKS:
        if b <= t < b + 0.16: return 1 - abs((t - b) / 0.08 - 1)
    return 0

body_skin = skin_at(body, 292, 235); face_skin = skin_at(face, 255, 360)
proc = subprocess.Popen(["ffmpeg", "-v", "error", "-y", "-f", "rawvideo", "-pix_fmt", "rgb24", "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-",
                         "-itsoffset", str(LEAD), "-i", VOICE, "-map", "0:v", "-map", "1:a", "-c:v", "libx264", "-crf", "18", "-pix_fmt", "yuv420p",
                         "-af", "apad", "-ar", "48000", "-c:a", "aac", "-b:a", "192k", "-shortest", OUT], stdin=subprocess.PIPE)
for i in range(N):
    t = i / FPS
    frame = BG.copy()
    if t < CUT:
        # walk in from the right with a bouncing step, then stand and breathe
        walk = min(1, t / 1.6); ease = 1 - (1 - walk) ** 2
        x = 1450 - (1450 - W / 2) * ease
        step = math.sin(t / 0.31 * math.pi) if walk < 1 else 0
        bob = -abs(step) * 22; tilt = step * 2.4
        breathe = 1 + 0.006 * math.sin(t * 2.4)
        b = draw_face(body, (296, 386), 70, [(243, 263), (341, 263)], (26, 22), mouth[i], blink_at(t), body_skin)
        s = 0.74 * breathe
        b = b.resize((int(b.width * s), int(b.height * s)), Image.LANCZOS).rotate(tilt, resample=Image.BICUBIC, expand=True, center=(b.width * s / 2, b.height * s))
        sh = Image.new("RGBA", (W, H), (0, 0, 0, 0)); sh.putalpha(floor.point(lambda v: int(v * (0.5 + 0.5 * walk))))
        frame.paste(Image.new("RGB", (W, H), (30, 30, 40)), (int(x - W / 2), 0), sh.getchannel("A"))
        frame.paste(b, (int(x - b.width / 2), int(1735 - b.height + bob)), b)
    else:
        # close-up: slow push in, a gentle head bob while talking
        tc = t - CUT
        talk = mouth[max(0, i - 3):i + 1].mean()
        f2 = draw_face(face, (270, 612), 104, [(167, 425), (330, 415)], (40, 30), mouth[i], blink_at(t), face_skin)
        s = 1.72 * (1 + 0.05 * min(1, tc / 4))
        f2 = f2.resize((int(f2.width * s), int(f2.height * s)), Image.LANCZOS)
        f2 = f2.rotate(1.2 * math.sin(tc * 2.1) + 1.5 * talk, resample=Image.BICUBIC, center=(f2.width / 2, f2.height * 0.8))
        frame.paste(f2, (int(W / 2 - f2.width / 2), int(330 - 10 * talk)), f2)
    # caption: the word being spoken and the ones before it in the same sentence
    tv = t - LEAD; said = [w for w in words if w["start"] <= tv]
    if said and tv < words[-1]["end"] + 0.6:
        k = len(said) - 1; s0 = k
        while s0 > 0 and not said[s0 - 1]["w"].rstrip().endswith((".", "?", "!")) and k - s0 < 3: s0 -= 1
        text = " ".join(w["w"] for w in said[s0:k + 1])
        d = ImageDraw.Draw(frame); tw = d.textlength(text, font=font)
        d.text((W / 2 - tw / 2, 1790), text, font=font, fill=(255, 255, 255), stroke_width=6, stroke_fill=(20, 20, 30))
    proc.stdin.write(frame.tobytes())
proc.stdin.close(); proc.wait()
print("done", OUT, round(N / FPS, 1), "s")
