# Blender test shot

A test of rendering the owner's 3D man (Rocketbox Male_Adult_04) in Blender instead of three.js, following the
`blender-lighting`, `blender-camera-cinematography`, `blender-rendering` and `blender-materials` skills.

    blender -b --python scene.py -- portrait out/portrait.png 1 96          # one still, full size, 96 samples
    blender -b --python scene.py -- glass out/glass.png 1 96 48 48          # glass head, last frame of a 48-frame move
    blender -b --python scene.py -- glass out/clip 0.667 48 0 48            # the whole 48-frame move as PNGs

What the scene does: imports the FBX and re-links its textures, drops the stored T-pose animation and swings the arms
down, lights him with a warm key, a cool fill and two rim lights (area lights), puts an unlit deep-blue glow wall
behind him, and films him with an 85 mm lens at f/2.8 that slowly pushes in. "glass" swaps the head for real glass
(clearer face-on, more glass at the edges) with a gold glowing ball inside.
