"""One frame per shot from a render, in a single sheet to look at.
Usage: python3 frame_sheet.py video.mp4 out.png 40 95 140 ...   (frame numbers, 30 fps)"""
import subprocess, sys, tempfile, os
from PIL import Image, ImageDraw

video, out, frames = sys.argv[1], sys.argv[2], [int(x) for x in sys.argv[3:]]
tmp = tempfile.mkdtemp()
W, H, C = 270, 480, 9
tiles = []
for fr in frames:
    path = os.path.join(tmp, f"{fr}.png")
    subprocess.run(["ffmpeg", "-v", "error", "-y", "-i", video, "-vf", f"select=eq(n\\,{fr}),scale={W}:{H}", "-frames:v", "1", path], check=True)
    tiles.append((fr, Image.open(path).convert("RGB")))
rows = (len(tiles) + C - 1) // C
sheet = Image.new("RGB", (C * (W + 6), rows * (H + 22)), "white")
d = ImageDraw.Draw(sheet)
for i, (fr, im) in enumerate(tiles):
    x, y = (i % C) * (W + 6), (i // C) * (H + 22)
    sheet.paste(im, (x, y))
    d.text((x + 4, y + H + 4), f"frame {fr}  {fr / 30:.1f}s", fill="black")
sheet.save(out)
print(out)
