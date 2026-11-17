# Cartoon cast (the owner's visual identity)

`ref/cast-sheet.png`: the owner's character sheet, made by the owner with ChatGPT. One shared body (bald, long neck,
big nose, thin limbs); hair, clothes and face show who each one is: The Regular, The Cool Guy, The Nerd, The Street Guy,
The Stylish, The Intellectual, The Funny One, The Mysterious, plus 8 expressions.

Rules: no brand logos or names anywhere (paint out shoe swooshes and the like; leave shoes plain). No Runway. No Blender
for this cast (the owner chose the cut-out route).

## Cut-out puppet method (`tools/puppet_sample.py`)
- Cut each character out of its picture (background removed by colour, largest shape kept).
- Body moves as one piece: walk-in with a bouncing step, breathing, small tilts.
- Mouth: drawn over the face, opening in 4 steps with the loudness of the voice (lip-sync). Eyes: drawn blinks.
- Captions from the transcriber's word timings, up to 4 words at a time.
- Limits: legs do not really walk and arms do not move. For more poses (pointing, shrugging, walking), make extra
  pictures of the same character in ChatGPT, same style, plain grey background, one character per picture, as large
  as possible (the sample upscales a small crop from the sheet, so it is soft).

`final/cutout-sample.mp4`: first test, The Regular, 9 s.
