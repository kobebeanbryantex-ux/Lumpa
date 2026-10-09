"""Build the supplemental transition-frame library for all companions.

The 4x4 source sheet contains real redrawn poses for entering/leaving actions.
Frames are kept at one scale per character and placed on a 256px transparent
canvas, so the runtime never needs to squash or stretch a whole sprite.
"""

from __future__ import annotations

from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET_DIR = ROOT / "assets" / "pixel_companions_v4" / "transitions"
FRAME_DIR = ROOT / "public" / "assets" / "pixel_companions_v4" / "frames"

FRAME_LAYOUT = (
    ("walk_start", 0), ("walk_start", 1), ("walk_stop", 0), ("walk_stop", 1),
    ("pounce", 0), ("pounce", 1), ("pounce", 2), ("pounce", 3),
    ("jump", 0), ("jump", 1), ("jump", 2), ("land", 0),
    ("wash_start", 0), ("roll_start", 0), ("stretch_start", 0), ("recover", 0),
)


def remove_background(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            is_magenta = (
                r >= 20
                and b >= 20
                and g <= 155
                and r + b >= (2 * g) + 50
                and abs(r - b) <= (max(r, b) * 0.28) + 8
            )
            if a and is_magenta:
                pixels[x, y] = (0, 0, 0, 0)
    return rgba


def split_sheet(sheet: Image.Image) -> list[Image.Image]:
    cells: list[Image.Image] = []
    for row in range(4):
        top = round(row * sheet.height / 4)
        bottom = round((row + 1) * sheet.height / 4)
        for col in range(4):
            left = round(col * sheet.width / 4)
            right = round((col + 1) * sheet.width / 4)
            cells.append(remove_background(sheet.crop((left, top, right, bottom))))
    return cells


def normalize_frames(cells: list[Image.Image]) -> list[Image.Image]:
    sprites: list[Image.Image] = []
    for cell in cells:
        box = cell.getchannel("A").getbbox()
        if box is None:
            raise ValueError("Transition sheet contains an empty cell")
        sprites.append(cell.crop(box))

    max_width = max(sprite.width for sprite in sprites)
    max_height = max(sprite.height for sprite in sprites)
    scale = min(210 / max_width, 190 / max_height, 1.0)

    normalized: list[Image.Image] = []
    for index, sprite in enumerate(sprites):
        width = max(1, round(sprite.width * scale))
        height = max(1, round(sprite.height * scale))
        sprite = sprite.resize((width, height), Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        x = (256 - width) // 2
        # Only the three flight poses float. The take-off and landing poses
        # keep the shared 232px foot line for reliable furniture collision.
        y = (256 - height) // 2 if index in (8, 9, 10) else 232 - height
        frame.alpha_composite(sprite, (x, y))
        normalized.append(frame)
    return normalized


def build_pet(sheet_path: Path) -> int:
    pet_id = sheet_path.stem.removesuffix("_transition_sheet")
    frames = normalize_frames(split_sheet(Image.open(sheet_path)))
    for frame, (action, index) in zip(frames, FRAME_LAYOUT, strict=True):
        frame.save(FRAME_DIR / f"{pet_id}_{action}_{index}.png", optimize=True)
    return len(frames)


def main() -> None:
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    sheets = sorted(SHEET_DIR.glob("*_transition_sheet.png"))
    if len(sheets) != 20:
        raise SystemExit(f"Expected 20 transition sheets, found {len(sheets)}")

    total = 0
    for sheet_path in sheets:
        count = build_pet(sheet_path)
        total += count
        print(f"{sheet_path.stem.removesuffix('_transition_sheet')}: {count} transition frames")
    print(f"Built {total} transition frames in {FRAME_DIR}")


if __name__ == "__main__":
    main()
