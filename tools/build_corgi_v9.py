"""Build a grounded, palette-consistent pixel corgi animation from pose art.

Original pose masters stay in assets/pixel_companions_v9/sources. Each frame is
placed onto the same 256x256 canvas without stretching or rotating the pet.
"""

from pathlib import Path

from PIL import Image
from sprite_contact import main_component_bounds


ROOT = Path(__file__).resolve().parents[1]
SOURCES = ROOT / "assets/pixel_companions_v9/sources"
FRAMES = ROOT / "public/assets/pixel_companions_v9/frames"
PET = "dog_corgi_golden"
BASELINE = 232

# All source art is made for one character; these clips choose whole, independent
# poses instead of deforming one PNG. Transition clips reuse the exact outgoing
# and incoming poses to avoid a snap at their boundaries.
ACTION_POSES = {
    "idle": ("stand", "stand", "curious", "stand"),
    "walk": ("run_contact", "run_leap", "run_flight", "run_leap") * 2,
    "run": ("run_contact", "run_flight", "run_leap", "run_flight") * 2,
    "sniff": ("stand", "curious", "sniff", "sniff"),
    "bow": ("stand", "sniff", "bow", "bow"),
    "rest": ("stand", "stand", "curious", "stand"),
    "sit": ("stand", "sit_half", "sit", "sit"),
    "wag": ("sit", "wag", "sit", "wag"),
    "curious": ("stand", "curious", "curious", "stand"),
    "yawn": ("sit", "sit", "yawn", "yawn"),
    "greet": ("curious",),
    "pounce": ("stand", "bow", "bow", "jump"),
    "jump": ("jump", "jump", "jump"),
    "land": ("bow",),
    "wash": ("sniff",),
    "play": ("bow",),
    "roll": ("roll",),
    "stretch": ("bow",),
    "look": ("stand", "curious", "curious", "stand"),
    "sleep": ("sleep", "sleep"),
    "dangle": ("run_flight", "run_leap"),
    "focusing": ("stand", "stand", "curious", "stand"),
}
TRANSITION_POSES = {
    "walk_start": ("stand", "run_contact"),
    "walk_stop": ("run_contact", "stand"),
    "pounce": ("stand", "bow", "bow", "jump"),
    "jump": ("jump", "jump", "jump"),
    "land": ("bow",),
    "wash_start": ("stand",),
    "roll_start": ("bow",),
    "stretch_start": ("stand",),
    "recover": ("stand",),
    "settle": ("run_contact", "bow", "stand", "stand"),
}
for pose_action in ("sniff", "bow", "sit", "wag", "curious", "yawn"):
    TRANSITION_POSES[f"{pose_action}_end"] = ACTION_POSES[pose_action]


def load_pose(path: Path) -> Image.Image:
    with Image.open(path) as source:
        image = source.convert("RGBA")
    image = image.crop(main_component_bounds(image))
    # Cut the model-generated transparent glow; retaining it produced the
    # checkerboard/white-halo artifact reported for earlier companions.
    alpha = image.getchannel("A").point(lambda value: 255 if value >= 160 else 0)
    image.putalpha(alpha)
    return image


def main() -> None:
    names = {pose for poses in (*ACTION_POSES.values(), *TRANSITION_POSES.values()) for pose in poses}
    source = {name: load_pose(SOURCES / f"{name}.png") for name in sorted(names)}
    longest_width = max(image.width for image in source.values())
    tallest = max(image.height for image in source.values())
    scale = min(210 / longest_width, 188 / tallest, 1.0)
    prepared = {}
    for name, image in source.items():
        size = (round(image.width * scale), round(image.height * scale))
        prepared[name] = image.resize(size, Image.Resampling.NEAREST)

    FRAMES.mkdir(parents=True, exist_ok=True)
    written = set()
    for clips in (ACTION_POSES, TRANSITION_POSES):
        for action, poses in clips.items():
            for index, name in enumerate(poses):
                sprite = prepared[name]
                frame = Image.new("RGBA", (256, 256))
                frame.alpha_composite(sprite, ((256 - sprite.width) // 2, BASELINE - sprite.height))
                # Source edge artifacts can be smaller than one final pixel.
                # Keeping a binary alpha makes every frame genuinely transparent.
                alpha = frame.getchannel("A").point(lambda value: 255 if value >= 128 else 0)
                frame.putalpha(alpha)
                output = FRAMES / f"{PET}_{action}_{index}.png"
                frame.save(output, optimize=True)
                assert main_component_bounds(frame)[3] == BASELINE, output
                written.add(output.name)
    print(f"Built {len(written)} corgi frames at a shared {BASELINE}px contact line")


if __name__ == "__main__":
    main()
