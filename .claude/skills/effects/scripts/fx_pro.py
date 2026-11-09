# Pro effects for this project (written for the owner, not part of the original 51-effect pack).
# Loaded by fx.py (see the "fx_pro.py" line next to the fx_private loader), so they use its helpers:
# c.img (float RGB frame), c.m (person mask 0..1), c.fx/c.fy/c.fw (face centre and width), c.lt (seconds
# into the effect), e.d (effect length), e.o (options), cached(), font(), text_img(), place(), comp().
#
#   vertigo        dolly zoom: you stay put while the room behind you stretches away
#   stage-world    the room becomes a concert (clip or photos, switching on cue words), with stage beams,
#                  haze, coloured rim light on you and a flash on every switch; optional heat + embers
#   paper-cutout   you become a paper sticker on a paper backdrop, held up by two strings that snap
#   ascii-me       the frame dissolves into a grid of letters spelling your words, then resolves back
#   credits-roll   the shot shrinks into a cinema window while film end credits roll underneath

_PRO_VIDEO = {}


def _cover(img_rgb, W, H):
    """Scale-and-crop an image (uint8 RGB) to fill W x H."""
    h, w = img_rgb.shape[:2]; s = max(W / w, H / h)
    r = cv2.resize(img_rgb, (int(w * s + 0.5), int(h * s + 0.5)), interpolation=cv2.INTER_AREA if s < 1 else cv2.INTER_CUBIC)
    y0, x0 = (r.shape[0] - H) // 2, (r.shape[1] - W) // 2
    return r[y0:y0 + H, x0:x0 + W]


def _clean_bg(c, e, key='inp'):
    """The room without the person: fill the person area by inpainting a small copy (good on walls/ceilings)."""
    sw, sh = 270, int(270 * c.H / c.W)
    small = cv2.resize((c.img * 255).astype(np.uint8), (sw, sh), interpolation=cv2.INTER_AREA)
    ms = cv2.resize(c.m, (sw, sh)) > 0.25
    ms = cv2.dilate(ms.astype(np.uint8), cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (13, 13)))
    fill = cv2.inpaint(cv2.cvtColor(small, cv2.COLOR_RGB2BGR), ms, 6, cv2.INPAINT_TELEA)
    fill = cv2.cvtColor(fill, cv2.COLOR_BGR2RGB).astype(np.float32) / 255
    fill = cv2.GaussianBlur(cv2.resize(fill, (c.W, c.H), interpolation=cv2.INTER_CUBIC), (0, 0), 4)
    soft = cv2.GaussianBlur(cv2.dilate(c.m, np.ones((15, 15), np.uint8)), (0, 0), 6)[..., None]
    return c.img * (1 - soft) + fill * soft


def _zoom(img, s, cx, cy, W, H):
    M = np.float32([[s, 0, cx - s * cx], [0, s, cy - s * cy]])
    return cv2.warpAffine(img, M, (W, H), flags=cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)


@effect('vertigo', 'dolly zoom: you stay the same size while the room behind you stretches away')
def fx_vertigo(c, e):
    k = ramp(c, e, 0.12, 0.18)
    p = ease_inout(c.lt / e.d)
    s = 1 + (float(e.o.get('zoom', 1.55)) - 1) * p          # background scale (the stretch)
    speed = abs(ease_inout(c.lt / e.d + 0.02) - ease_inout(c.lt / e.d - 0.02)) / 0.04
    bg = _clean_bg(c, e)
    cx, cy = c.fx, c.fy
    acc = _zoom(bg, s, cx, cy, c.W, c.H)
    if speed > 0.05:                                         # zoom streaks while it moves
        for d_ in (0.012, 0.024, 0.036):
            acc = acc + _zoom(bg, s * (1 + d_ * speed), cx, cy, c.W, c.H)
        acc = acc / 4
    lum = (acc @ np.float32([0.299, 0.587, 0.114]))[..., None]
    acc = lum + (acc - lum) * 0.55                           # the room loses colour, you keep yours
    acc = acc * np.float32([0.86, 0.92, 1.04])
    m = c.m[..., None]
    person = c.img * (1 + 0.06 * p)
    out = acc * (1 - m) + np.clip(person, 0, 1) * m
    c.img = c.img * (1 - k) + out * k
    face_cam(c, 1 + 0.08 * p * k, 0.40)
    vignette(c, 0.4 * k)


def _beams(c, e, t, k, cols):
    """Volumetric stage beams from the top of the frame, at low resolution, returned full size."""
    sw, sh = 180, int(180 * c.H / c.W)
    yy, xx = np.mgrid[0:sh, 0:sw].astype(np.float32)
    out = np.zeros((sh, sw, 3), np.float32)
    for j, (ox, col, ph) in enumerate(cols):
        ang = math.radians(90 + 22 * math.sin(t * 1.3 + ph))
        dx, dy = xx - ox * sw, yy + sh * 0.02
        th = np.arctan2(dy, dx)
        w = 0.07 + 0.02 * j
        b = np.exp(-((th - ang) / w) ** 2) * np.clip(1 - np.hypot(dx, dy) / (sh * 1.15), 0, 1) ** 1.3
        out += b[..., None] * np.float32(col)
    out = cv2.GaussianBlur(out, (0, 0), 2)
    return cv2.resize(out, (c.W, c.H), interpolation=cv2.INTER_CUBIC) * k


def _video_frame(path, t, W, H):
    st = _PRO_VIDEO.get(path)
    if st is None:
        cap = cv2.VideoCapture(path); st = _PRO_VIDEO[path] = {'cap': cap, 'n': cap.get(cv2.CAP_PROP_FRAME_COUNT), 'fps': cap.get(cv2.CAP_PROP_FPS) or 30, 'last': -9, 'img': None}
    want = int(t * st['fps']) % max(1, int(st['n']))
    if want != st['last']:
        if want != st['last'] + 1: st['cap'].set(cv2.CAP_PROP_POS_FRAMES, want)
        ok, fr = st['cap'].read()
        if ok: st['img'] = _cover(cv2.cvtColor(fr, cv2.COLOR_BGR2RGB), W, H)
        st['last'] = want
    return st['img']


@effect('stage-world', 'the room becomes a concert that switches venue on your words, stage beams and coloured light on you')
def fx_stage_world(c, e):
    k = ramp(c, e, 0.1, 0.15)
    # scenes: "src@start_seconds|src@start|…" (start = seconds into the effect); src = image or video path
    scenes = []
    for part in e.o['scenes'].split('|'):
        src, at = part.rsplit('@', 1); scenes.append((float(at), src))
    cur = max([s for s in scenes if s[0] <= c.lt] or [scenes[0]], key=lambda s: s[0])
    at, src = cur; lt = c.lt - at
    if src.lower().endswith(('.mp4', '.mov', '.webm')):
        bg = _video_frame(src, lt, c.W, c.H)
    else:
        bg = cached(e, ('img', src), lambda: _cover(np.asarray(Image.open(src).convert('RGB')), c.W, c.H))
    bg = bg.astype(np.float32) / 255
    push = 1.06 + 0.05 * clamp(lt / 1.6)                     # each venue drifts slowly in
    bg = _zoom(bg, push, c.W / 2, c.H * 0.45, c.W, c.H)
    bg = cv2.GaussianBlur(bg, (0, 0), 2.2)                   # depth of field: the crowd is behind you
    hue = cur[0] * 1.7
    cols = [(0.15, (0.9, 0.35, 1.0), hue), (0.5, (0.35, 0.6, 1.0), hue + 2), (0.85, (1.0, 0.3, 0.7), hue + 4)]
    heat_at = float(e.o.get('heat', 1e9))
    heat = clamp((c.lt - heat_at) / 0.35)
    if heat > 0:
        cols = [(x, tuple(np.array(col) * (1 - heat) + np.array((1.0, 0.45, 0.12)) * heat), ph) for x, col, ph in cols]
        bg = bg * (1 - 0.35 * heat) + bg * np.float32([1.25, 0.75, 0.45]) * 0.35 * heat
        if heat > 0.01:                                      # heat haze on the background
            sh_, sw_ = c.H, c.W
            yy = np.arange(sh_, dtype=np.float32)[:, None]
            dx = (np.sin(yy / 23 + c.lt * 9) * 5 * heat).astype(np.float32)
            mapx = np.tile(np.arange(sw_, dtype=np.float32), (sh_, 1)) + dx
            mapy = np.tile(yy, (1, sw_)).astype(np.float32)
            bg = cv2.remap(bg, mapx, mapy, cv2.INTER_LINEAR, borderMode=cv2.BORDER_REFLECT)
    beams = _beams(c, e, c.t, 1.0, cols)
    bg = 1 - (1 - np.clip(bg, 0, 1)) * (1 - np.clip(beams * 0.9, 0, 1))       # screen
    # light you like the stage: darker body, coloured rim from the sides
    m = c.m
    edge = np.clip(m - cv2.erode(m, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (31, 31))), 0, 1)
    edge = cv2.GaussianBlur(edge, (0, 0), 6)[..., None]
    side = np.linspace(0, 1, c.W, dtype=np.float32)[None, :, None]
    c1, c2 = np.float32(cols[0][1]), np.float32(cols[2][1])
    rimcol = c1 * (1 - side) + c2 * side
    person = c.img * (0.78 + 0.1 * np.float32([1.0, 0.95, 1.05]))
    person = np.clip(person + edge * rimcol * 0.85, 0, 1)
    m3 = m[..., None]
    out = bg * (1 - m3) + person * m3
    out = 1 - (1 - out) * (1 - np.clip(beams * 0.12, 0, 1))  # a little haze in front of you too
    if heat > 0:                                             # embers rising
        rng = cached(e, 'embers', lambda: np.random.default_rng(7).random((90, 4)).astype(np.float32))
        sw, sh = 270, int(270 * c.H / c.W)
        lay = np.zeros((sh, sw), np.float32)
        tt = c.lt - heat_at
        for x0, y0, sp, sz in rng:
            y = (y0 * sh * 1.2 - tt * (30 + 60 * sp)) % (sh * 1.2) - sh * 0.1
            x = x0 * sw + 6 * math.sin(tt * 3 + y0 * 20)
            cv2.circle(lay, (int(x), int(y)), 1 + int(sz * 1.6), 1.0, -1, cv2.LINE_AA)
        lay = cv2.GaussianBlur(lay, (0, 0), 0.9)
        lay = cv2.resize(lay, (c.W, c.H), interpolation=cv2.INTER_CUBIC)[..., None]
        out = np.clip(out + lay * np.float32([1.0, 0.55, 0.15]) * 1.4 * heat, 0, 1)
    # a short flash on every venue switch
    for a, _ in scenes[1:]:
        if 0 <= c.lt - a < 0.12:
            out = np.clip(out + (1 - (c.lt - a) / 0.12) * 0.55, 0, 1)
    c.img = c.img * (1 - k) + out * k
    vignette(c, 0.35 * k)


def _paper(c):
    rng = np.random.default_rng(11)
    base = np.ones((c.H, c.W, 3), np.float32) * np.float32([0.95, 0.92, 0.85])
    n = cv2.resize(rng.random((c.H // 6, c.W // 6)).astype(np.float32), (c.W, c.H), interpolation=cv2.INTER_CUBIC)
    fib = cv2.GaussianBlur(rng.random((c.H, c.W)).astype(np.float32), (0, 0), 0.8)
    return np.clip(base * (0.94 + 0.06 * n[..., None]) - (fib[..., None] - 0.5) * 0.05, 0, 1)


@effect('paper-cutout', 'you become a paper sticker on a paper backdrop, held by two strings that snap')
def fx_paper_cutout(c, e):
    k = ease_out(c.lt / 0.25) * clamp((e.d - c.lt) / 0.2)
    paper = cached(e, 'paper', lambda: _paper(c))
    m = c.m
    hard = (m > 0.45).astype(np.uint8)
    border = int(c.W * 0.018)
    out_m = cv2.dilate(hard, cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (2 * border + 1, 2 * border + 1))).astype(np.float32)
    out_m = cv2.GaussianBlur(out_m, (0, 0), 1.2)
    # print look on the person: fewer tones, a touch of halftone grain
    p = c.img.copy()
    p = np.round(p * 7) / 7 * 0.5 + p * 0.5
    sticker = np.ones_like(c.img) * (1 - m[..., None]) + p * m[..., None]          # white border around you
    alpha = out_m
    # wobble and settle: the sticker slaps on, small rotation
    ang = -4 * (1 - ease_back(c.lt / 0.45)) + 1.5 * math.sin(c.lt * 2.2)
    sc = 0.9 + 0.05 * ease_back(c.lt / 0.45)
    M = cv2.getRotationMatrix2D((c.fx, c.fy + c.fw), ang, sc)
    st = cv2.warpAffine(sticker, M, (c.W, c.H), flags=cv2.INTER_LINEAR, borderValue=(1, 1, 1))
    al = cv2.warpAffine(alpha, M, (c.W, c.H), flags=cv2.INTER_LINEAR, borderValue=0)
    sh = cv2.GaussianBlur(al, (0, 0), 16)
    sh = np.roll(np.roll(sh, int(c.W * 0.018), 1), int(c.W * 0.03), 0)
    out = paper * (1 - 0.32 * sh[..., None])
    # strings from the top corners to the shoulders; they snap at `snap` seconds and fall away
    snap = float(e.o.get('snap', 1e9))
    lay = np.zeros((c.H, c.W, 4), np.float32)
    rows = np.where((al > 0.5).sum(1) > 0)[0]
    top = rows[0] if len(rows) else int(c.H * 0.2)
    ry = int(min(c.H - 1, top + c.fw * 0.45))
    xs = np.where(al[ry] > 0.5)[0]
    if len(xs): anchors = [(xs[0] + 6, ry), (xs[-1] - 6, ry)]
    else: anchors = [(c.fx - c.fw * 0.6, ry), (c.fx + c.fw * 0.6, ry)]
    corners = [(c.W * 0.22, -10), (c.W * 0.78, -10)]
    lay_u8 = np.zeros((c.H, c.W, 4), np.uint8)
    for (ax, ay), (cx_, cy_) in zip(anchors, corners):
        if c.lt < snap:
            pts = [(int(cx_ + (ax - cx_) * u), int(cy_ + (ay - cy_) * u + 30 * math.sin(math.pi * u))) for u in np.linspace(0, 1, 30)]
            cv2.polylines(lay_u8, [np.array(pts)], False, (200, 40, 56, 255), 7, cv2.LINE_AA)
        else:
            tt = c.lt - snap; g = 2600 * tt * tt
            mid = 0.5
            up = [(int(cx_ + (ax - cx_) * u * (1 - 0.6 * clamp(tt / 0.3))), int(cy_ + (ay - cy_) * u + 20 * math.sin(math.pi * u))) for u in np.linspace(0, mid, 15)]
            dn = [(int(cx_ + (ax - cx_) * u + (u - mid) * 120 * tt * np.sign(cx_ - c.W / 2)), int(cy_ + (ay - cy_) * u + g * (u - mid) * 2 + 400 * tt * (u - mid))) for u in np.linspace(mid, 1, 15)]
            up = up if tt < 0.5 else []
            for pts in [p_ for p_ in (up, dn) if len(p_)]:
                cv2.polylines(lay_u8, [np.array(pts)], False, (200, 40, 56, 255), 7, cv2.LINE_AA)
            if tt < 0.18:                                       # a little snap spark
                for sx, sy in ([up[-1]] if up else []) + [dn[0]]:
                    cv2.circle(lay_u8, (sx, sy), int(14 + 60 * tt), (220, 40, 56, int(255 * (1 - tt / 0.18))), 3, cv2.LINE_AA)
    L = lay_u8.astype(np.float32) / 255
    a = L[..., 3:4]
    out = out * (1 - a) + L[..., :3] * a
    a2 = al[..., None]
    out = out * (1 - a2) + st * a2
    # a hand-written note at the top
    if e.o.get('text'):
        note = cached(e, 'note', lambda: text_img(e.o['text'], c.W * 0.075, 'hand', (200, 40, 56)))
        tmp = c.img; c.img = out; place(c, note, c.W * 0.5, c.H * 0.085, 1, -3, clamp((c.lt - 0.2) / 0.2)); out = c.img; c.img = tmp
    c.img = c.img * (1 - k) + out * k


@effect('ascii-me', 'the frame dissolves into a grid of letters spelling your words, then resolves back')
def fx_ascii_me(c, e):
    cs = int(e.o.get('cell', 15))
    word = ''.join(ch for ch in e.o.get('text', 'TALENT CONSISTENT ').upper())
    rows, cols = c.H // cs, c.W // cs

    def atlas():
        chars = sorted(set(word))
        f = font('mono', cs * 0.95)
        tiles = {}
        for ch in chars:
            im = Image.new('L', (cs, cs), 0); d = ImageDraw.Draw(im)
            d.text((cs / 2, cs / 2), ch, font=f, fill=255, anchor='mm')
            tiles[ch] = np.asarray(im, np.float32) / 255
        seq = np.array([[tiles[word[(r * 7 + cc) % len(word)]] for cc in range(cols)] for r in range(rows)], np.float32)
        return seq.transpose(0, 2, 1, 3).reshape(rows * cs, cols * cs)
    glyphs = cached(e, 'atlas', atlas)
    small = cv2.resize(c.img, (cols, rows), interpolation=cv2.INTER_AREA)
    msm = cv2.resize(c.m, (cols, rows), interpolation=cv2.INTER_AREA)
    lum = small @ np.float32([0.299, 0.587, 0.114])
    lum = np.clip((lum - lum.min()) / (np.ptp(lum) + 1e-6), 0, 1) ** 0.9
    hl = float(e.o.get('hl', 1e9))
    glow = clamp((c.lt - hl) / 0.3) if c.lt >= hl else 0
    pcol = np.float32([1.0, 0.95, 0.82]) * (1 - glow) + np.float32([1.0, 0.82, 0.25]) * glow
    bcol = np.float32([0.2, 0.42, 1.0])
    real = np.clip(small * 1.7, 0, 1)
    colr = msm[..., None] * (real * 0.55 + pcol * 0.45) + (1 - msm[..., None]) * bcol * 0.75
    inten = np.clip(lum ** 0.75 * (0.35 + 0.95 * msm) * 1.35, 0, 1)
    big_i = np.kron(inten, np.ones((cs, cs), np.float32))
    big_c = np.repeat(np.repeat(colr, cs, 0), cs, 1)
    art = np.zeros_like(c.img)
    h_, w_ = rows * cs, cols * cs
    art[:h_, :w_] = (glyphs * big_i)[..., None] * big_c
    art = np.clip(art * 1.25 + cv2.GaussianBlur(art, (0, 0), 7) * 0.9, 0, 1) + np.float32([0.01, 0.015, 0.05])
    # a scan line sweeps the frame into letters, and back out at the end
    tin, tout = clamp(c.lt / 0.45), clamp((e.d - c.lt) / 0.45)
    yy = np.linspace(0, 1, c.H, dtype=np.float32)[:, None, None]
    w_in = np.clip((tin * 1.2 - yy) / 0.2, 0, 1)
    w_out = np.clip((tout * 1.2 - (1 - yy)) / 0.2, 0, 1)
    k = np.minimum(w_in, w_out)
    c.img = c.img * (1 - k) + art * k
    for edge_t, flip in ((tin, False), (tout, True)):
        if 0 < edge_t < 1:
            y = int(((1 - (edge_t * 1.2 - 0.1)) if flip else (edge_t * 1.2 - 0.1)) * c.H)
            if 0 <= y < c.H:
                y0, y1 = max(0, y - 3), min(c.H, y + 3)
                c.img[y0:y1] = np.clip(c.img[y0:y1] + np.float32([0.4, 0.6, 1.0]), 0, 1)


@effect('credits-roll', 'the shot shrinks into a cinema window while film end credits roll underneath')
def fx_credits_roll(c, e):
    k = ease_inout(c.lt / 0.6)
    lines = e.o.get('text', 'TALENT::BURNA BOY|CONSISTENCY::BURNA BOY').split('|')
    head = e.o.get('title', 'STARRING')
    end = e.o.get('finale', '')

    def block():
        w = int(c.W * 0.86); f_role = font('didonei', int(c.W * 0.05)); f_name = font('didoneb', int(c.W * 0.05))
        f_head = font('mono', int(c.W * 0.028)); f_end = font('didonei', int(c.W * 0.075))
        lh = int(c.W * 0.1); h = lh * (len(lines) + 4) + (lh * 2 if end else 0)
        im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); d = ImageDraw.Draw(im)
        d.text((w / 2, lh * 0.6), head, font=f_head, fill=(200, 190, 170, 255), anchor='mm')
        y = lh * 1.8
        for ln in lines:
            role, _, name = ln.partition('::')
            d.text((w * 0.47, y), role, font=f_role, fill=(225, 215, 195, 255), anchor='rm')
            d.text((w * 0.53, y), name, font=f_name, fill=(255, 255, 255, 255), anchor='lm')
            y += lh
        if end:
            d.text((w / 2, y + lh * 1.2), end, font=f_end, fill=(255, 216, 74, 255), anchor='mm')
        return im
    blk = cached(e, 'blk', block)
    # the cinema window: a 2.2:1 crop of the shot around your face
    win_w = int(c.W * (1 - 0.1 * k)); win_h = int(win_w / (2.2 * k + (c.W / c.H) * (1 - k)))
    win_h = min(win_h, c.H)
    src_h = int(c.W / (win_w / win_h)); src_h = min(src_h, c.H)
    y0 = int(clamp(c.fy - src_h * 0.42, 0, c.H - src_h))
    crop = c.img[y0:y0 + src_h]
    shot = cv2.resize(crop, (win_w, win_h), interpolation=cv2.INTER_AREA)
    lum = (shot @ np.float32([0.299, 0.587, 0.114]))[..., None]
    shot = np.clip(lum + (shot - lum) * (1 - 0.35 * k), 0, 1) * np.float32([1.03, 1.0, 0.94])
    out = np.zeros_like(c.img) + np.float32([0.02, 0.02, 0.025])
    top = int(c.H * 0.5 - win_h / 2 - (c.H * 0.5 - win_h / 2 - c.H * 0.11) * k)
    x0 = (c.W - win_w) // 2
    out[top:top + win_h, x0:x0 + win_w] = shot
    # credits roll up from the bottom of the frame, only in the dark area under the window
    roll = ease_inout(clamp((c.lt - 0.4) / max(0.5, e.d - 0.9)))
    area_top = top + win_h + int(c.H * 0.04)
    y_end = c.H * 0.93 - blk.height
    y = c.H + (y_end - c.H) * roll
    lay = np.zeros_like(c.img); tmp = c.img; c.img = lay
    comp(c, blk, (c.W - blk.width) / 2, y, alpha=clamp((c.lt - 0.3) / 0.3))
    lay = c.img; c.img = tmp
    rows_ = np.arange(c.H, dtype=np.float32)[:, None, None]
    fade = np.clip((rows_ - area_top) / (c.H * 0.06), 0, 1)
    c.img = np.clip(out + lay * fade, 0, 1)
