"""Blender test shot for the owner's 3D man (Rocketbox Male_Adult_04), following the blender-lighting,
blender-camera-cinematography and blender-rendering skills: three-point area lighting, 85 mm portrait lens with
depth of field, AgX colour, Cycles. Run headless:

  blender -b --python scene.py -- <portrait|glass> <out.png> [scale=0.5] [samples=96] [frame=1] [frames_total=1]

"portrait": the man with real skin shading. "glass": his head as real glass with a glowing gold light inside.
"""
import math, os, sys
import bpy
from mathutils import Matrix, Vector

argv = sys.argv[sys.argv.index("--") + 1:]
MODE, OUT = argv[0], argv[1]
SCALE = float(argv[2]) if len(argv) > 2 else 0.5
SAMPLES = int(argv[3]) if len(argv) > 3 else 96
FRAME = int(argv[4]) if len(argv) > 4 else 1
TOTAL = int(argv[5]) if len(argv) > 5 else 1
t = 0
AV = os.path.join(os.path.dirname(os.path.abspath(__file__)), "..", "bystander-effect", "public", "avatars", "Male_Adult_04")
BLUE = (0.0003, 0.056, 0.87, 1)     # the edit's #0243F1 in linear light
GOLD = (1.0, 0.52, 0.02, 1)          # reads as #F3C21D gold once it glows

bpy.ops.wm.read_factory_settings(use_empty=True)
sc = bpy.context.scene
bpy.ops.import_scene.fbx(filepath=os.path.join(AV, "man.fbx"))
arm = next(o for o in bpy.data.objects if o.type == "ARMATURE")
mesh = next(o for o in bpy.data.objects if o.type == "MESH")

# ---- textures: the FBX points at .tga files that are not shipped; use the jpg/png copies
for m in bpy.data.materials:
    nt = m.node_tree
    for n in [n for n in nt.nodes if n.type == "TEX_IMAGE"]:
        base = os.path.basename(n.image.filepath if n.image else "").lower()
        kind = "normal" if "normal" in base else "specular" if "specular" in base else "color"
        part = "head" if "head" in base else "opacity" if "opacity" in base else "body"
        f = os.path.join(AV, f"{part}_{kind}.{'png' if part == 'opacity' else 'jpg'}")
        if os.path.exists(f):
            n.image = bpy.data.images.load(f, check_existing=True)
            if kind == "normal":
                n.image.colorspace_settings.name = "Non-Color"
        else:
            nt.nodes.remove(n)
    bsdf = next((n for n in nt.nodes if n.type == "BSDF_PRINCIPLED"), None)
    if bsdf:
        bsdf.inputs["Roughness"].default_value = 0.55
        if "head" in m.name:      # a little light under the skin, so the face is not plastic
            bsdf.inputs["Subsurface Weight"].default_value = 0.12
            bsdf.inputs["Subsurface Radius"].default_value = (0.6, 0.25, 0.15)
            bsdf.inputs["Subsurface Scale"].default_value = 0.02
            bsdf.inputs["Roughness"].default_value = 0.48
    if "opacity" in m.name:
        m.blend_method = "HASHED"

# ---- pose: arms down by his sides (first drop the FBX's stored T-pose animation, or it overrides the pose)
arm.animation_data_clear()
bpy.context.view_layer.objects.active = arm
bpy.ops.object.mode_set(mode="POSE")
def swing(bone, child, target):
    """Rotate `bone` about its own joint so the limb (joint to the child's joint) points along `target`."""
    pb, ch = arm.pose.bones[bone], arm.pose.bones[child]
    q = (ch.head - pb.head).normalized().rotation_difference(target.normalized())
    pb.matrix = Matrix.Translation(pb.head) @ q.to_matrix().to_4x4() @ Matrix.Translation(-pb.head) @ pb.matrix
    bpy.context.view_layer.update()
for side in ("L", "R"):
    sgn = 1 if arm.pose.bones[f"Bip01 {side} UpperArm"].head.x > 0 else -1
    # armature space here is in centimetres with Z up and the man facing -Y
    swing(f"Bip01 {side} UpperArm", f"Bip01 {side} Forearm", Vector((0.17 * sgn, 0.02, -1)))
    swing(f"Bip01 {side} Forearm", f"Bip01 {side} Hand", Vector((0.08 * sgn, -0.16, -1)))
bpy.ops.object.mode_set(mode="OBJECT")
bpy.context.view_layer.update()

W = arm.matrix_world
head = W @ arm.pose.bones["Bip01 Head"].head
eyes = (W @ arm.pose.bones["Bip01 LEye"].head + W @ arm.pose.bones["Bip01 REye"].head) / 2
fwd = Vector((eyes.x - head.x, eyes.y - head.y, 0)).normalized()      # which way he faces
right = Vector((-fwd.y, fwd.x, 0))
centre = eyes - fwd * 0.085 + Vector((0, 0, 0.03))
print("eyes", eyes, "facing", fwd)

# ---- backdrop: a blue wall behind him and a floor, lit by its own soft spot so it glows in the middle
def glow_wall(name):
    """A backdrop that ignores the studio lights: deep blue at the edges, brighter blue behind his head."""
    m = bpy.data.materials.new(name); m.use_nodes = True
    nt = m.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); em = nt.nodes.new("ShaderNodeEmission")
    tc = nt.nodes.new("ShaderNodeTexCoord"); gr = nt.nodes.new("ShaderNodeTexGradient"); gr.gradient_type = "SPHERICAL"
    mp = nt.nodes.new("ShaderNodeMapping"); mp.inputs["Scale"].default_value = (0.42, 0.42, 0.42)
    ramp = nt.nodes.new("ShaderNodeValToRGB")
    ramp.color_ramp.elements[0].color = (0.0, 0.006, 0.19, 1)      # edge: #011A8C-ish, darker
    ramp.color_ramp.elements[1].color = (0.0006, 0.07, 0.95, 1)    # centre: the edit's blue
    nt.links.new(tc.outputs["Object"], mp.inputs["Vector"]); nt.links.new(mp.outputs["Vector"], gr.inputs["Vector"])
    nt.links.new(gr.outputs["Fac"], ramp.inputs["Fac"]); nt.links.new(ramp.outputs["Color"], em.inputs["Color"])
    em.inputs["Strength"].default_value = 0.55
    nt.links.new(em.outputs["Emission"], out.inputs["Surface"])
    return m
bpy.ops.mesh.primitive_plane_add(size=30, location=eyes - fwd * 3.2 + Vector((0, 0, 0.05)))
wall = bpy.context.object; wall.name = "BG_Wall"
wall.rotation_euler = (math.radians(90), 0, math.atan2(fwd.y, fwd.x) + math.radians(90))
wall.data.materials.append(glow_wall("MAT_Backdrop"))
wall.visible_shadow = False

def area(name, pos, power, color, size, look=None):
    d = bpy.data.lights.new(name, "AREA"); d.energy = power; d.color = color; d.size = size
    o = bpy.data.objects.new(name, d); sc.collection.objects.link(o); o.location = pos
    o.rotation_euler = ((look or eyes) - pos).to_track_quat("-Z", "Y").to_euler()
    return o
up = Vector((0, 0, 1))
area("LGT_Key_Main", eyes + fwd * 1.5 + right * 1.1 + up * 1.0, 420, (1.0, 0.93, 0.84), 1.3)          # 45 deg up, 35 deg to the side, warm
area("LGT_Fill_Soft", eyes + fwd * 1.6 - right * 1.5 + up * 0.1, 95, (0.78, 0.86, 1.0), 2.2)            # opposite, cool, about 1/4
area("LGT_Rim_Back", eyes - fwd * 1.4 - right * 0.9 + up * 0.9, 520, (0.75, 0.86, 1.0), 0.7)            # edge light from behind
area("LGT_Rim_Warm", eyes - fwd * 1.2 + right * 1.3 + up * 0.5, 180, (1.0, 0.82, 0.6), 0.6)

sc.world = bpy.data.worlds.new("World"); sc.world.use_nodes = True
sc.world.node_tree.nodes["Background"].inputs["Color"].default_value = (0.0, 0.01, 0.06, 1)
sc.world.node_tree.nodes["Background"].inputs["Strength"].default_value = 0.12

# ---- glass head with a light inside (mode "glass")
if MODE == "glass":
    hm = next(m for m in bpy.data.materials if "head" in m.name)
    nt = hm.node_tree; nt.nodes.clear()
    out = nt.nodes.new("ShaderNodeOutputMaterial"); g = nt.nodes.new("ShaderNodeBsdfGlass")
    g.inputs["Color"].default_value = (0.82, 0.9, 1.0, 1); g.inputs["Roughness"].default_value = 0.03; g.inputs["IOR"].default_value = 1.18
    # half clear, half glass: you see straight through to what is inside, but keep the glass highlights and bending
    tr = nt.nodes.new("ShaderNodeBsdfTransparent"); tr.inputs["Color"].default_value = (0.86, 0.93, 1.0, 1)
    mix = nt.nodes.new("ShaderNodeMixShader")
    # more glass towards the edges of every shape (a bright outline round the skull, nose, lips), clearer face-on
    lw = nt.nodes.new("ShaderNodeLayerWeight"); lw.inputs["Blend"].default_value = 0.42
    mr = nt.nodes.new("ShaderNodeMapRange"); mr.inputs["To Min"].default_value = 0.22; mr.inputs["To Max"].default_value = 1.0
    nt.links.new(lw.outputs["Facing"], mr.inputs["Value"]); nt.links.new(mr.outputs["Result"], mix.inputs["Fac"])
    nt.links.new(tr.outputs["BSDF"], mix.inputs[1]); nt.links.new(g.outputs["BSDF"], mix.inputs[2])
    nt.links.new(mix.outputs["Shader"], out.inputs["Surface"])
    for m in bpy.data.materials:
        if "opacity" in m.name:   # hair as dark smoked glass so the head reads as one glass object
            nt2 = m.node_tree; nt2.nodes.clear()
            o2 = nt2.nodes.new("ShaderNodeOutputMaterial"); t = nt2.nodes.new("ShaderNodeBsdfTransparent")
            nt2.links.new(t.outputs["BSDF"], o2.inputs["Surface"])
    # a blue disc inside the collar, so the glass neck shows blue instead of the dark inside of the jacket
    neck = W @ arm.pose.bones["Bip01 Neck"].head
    bpy.ops.mesh.primitive_circle_add(radius=0.085, fill_type="NGON", location=neck - Vector((0, 0, 0.035)))
    plug = bpy.context.object; plug.name = "FX_NeckPlug"
    pm = bpy.data.materials.new("MAT_NeckPlug"); pm.use_nodes = True
    pb_ = pm.node_tree.nodes["Principled BSDF"]; pb_.inputs["Base Color"].default_value = (0, 0, 0, 1)
    pb_.inputs["Emission Color"].default_value = (0.0004, 0.05, 0.75, 1); pb_.inputs["Emission Strength"].default_value = 0.5
    plug.data.materials.append(pm)
    bpy.ops.mesh.primitive_uv_sphere_add(radius=0.026, location=centre, segments=48, ring_count=24)
    orb = bpy.context.object; orb.name = "FX_Orb"; bpy.ops.object.shade_smooth()
    em = bpy.data.materials.new("MAT_Orb"); em.use_nodes = True
    b = em.node_tree.nodes["Principled BSDF"]; b.inputs["Emission Color"].default_value = GOLD; b.inputs["Base Color"].default_value = (0, 0, 0, 1); b.inputs["Emission Strength"].default_value = 1.15
    orb.data.materials.append(em)

# ---- camera: 85 mm portrait lens, three-quarter view, slow dolly in
cd = bpy.data.cameras.new("CAM_Portrait_3Q"); cd.lens = 85; cd.sensor_fit = "VERTICAL"; cd.sensor_height = 36
cam = bpy.data.objects.new("CAM_Portrait_3Q", cd); sc.collection.objects.link(cam); sc.camera = cam
cd.dof.use_dof = True; cd.dof.aperture_fstop = 2.8
def place(frame):
    t = 0 if TOTAL <= 1 else (frame - 1) / (TOTAL - 1)
    ease = t * t * (3 - 2 * t)
    dist = 1.95 - 0.45 * ease
    ang = math.radians(24 - 9 * ease)
    cam.location = eyes + fwd * dist * math.cos(ang) + right * dist * math.sin(ang) + up * 0.02
    aim = eyes + Vector((0, 0, -0.10 + 0.06 * ease))
    cam.rotation_euler = (aim - cam.location).to_track_quat("-Z", "Y").to_euler()
    cd.dof.focus_distance = (eyes - cam.location).length
    if MODE == "glass":   # the light inside breathes
        em.node_tree.nodes["Principled BSDF"].inputs["Emission Strength"].default_value = 1.15 * (1 + 0.2 * math.sin(frame / 5))

# ---- render: Cycles, AgX
sc.render.engine = "CYCLES"; sc.cycles.device = "CPU"
sc.cycles.samples = SAMPLES; sc.cycles.use_adaptive_sampling = True; sc.cycles.adaptive_threshold = 0.02
sc.cycles.use_denoising = False                       # this Blender build ships without the denoiser
sc.cycles.max_bounces = 8; sc.cycles.glossy_bounces = 6; sc.cycles.transmission_bounces = 10; sc.cycles.caustics_refractive = False; sc.cycles.sample_clamp_indirect = 4
sc.render.threads_mode = "AUTO"; sc.render.use_persistent_data = True
sc.view_settings.view_transform = "AgX"; sc.view_settings.look = "AgX - Medium High Contrast"
sc.render.resolution_x = 1080; sc.render.resolution_y = 1920; sc.render.resolution_percentage = int(SCALE * 100)
sc.render.image_settings.file_format = "PNG"
frames = range(1, TOTAL + 1) if FRAME == 0 else [FRAME]      # frame 0 = render the whole move, OUT is then a folder
for fr in frames:
    place(fr)
    sc.render.filepath = os.path.join(OUT, f"f{fr:04d}.png") if FRAME == 0 else OUT
    bpy.ops.render.render(write_still=True)
    print("saved", sc.render.filepath)
