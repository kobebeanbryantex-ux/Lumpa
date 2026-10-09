"""Build transparent, fixed-size animation frames for every desktop companion.

Each input is a 4x4 production sprite sheet.  The script removes the solid
chroma background, keeps a single scale per character (so poses never inflate
or shrink), and aligns grounded poses to one shared foot line.
"""

from __future__ import annotations

from pathlib import Path
from shutil import copyfile

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SHEET_DIR = ROOT / "assets" / "pixel_companions_v3" / "sheets"
FRAME_DIR = ROOT / "public" / "assets" / "pixel_companions_v3" / "frames"

FRAME_LAYOUT = (
    ("idle", 0), ("idle", 1), ("idle", 2), ("idle", 3),
    ("walk", 0), ("walk", 1), ("walk", 2), ("walk", 3),
    ("pounce", 0), ("jump", 0), ("jump", 1), ("land", 0),
    ("wash", 0), ("play", 0), ("roll", 0), ("stretch", 0),
)

ALIASES = {
    "look": (("idle", 0), ("idle", 1), ("idle", 2), ("idle", 3)),
    "sleep": (("idle", 1), ("idle", 3)),
    "dangle": (("jump", 0), ("jump", 1)),
    "focusing": (("idle", 0), ("idle", 1), ("idle", 2), ("idle", 3)),
}


def remove_background(cell: Image.Image) -> Image.Image:
    rgba = cell.convert("RGBA")
    pixels = rgba.load()
    for y in range(rgba.height):
        for x in range(rgba.width):
            r, g, b, a = pixels[x, y]
            # Generated sheets use #FF00FF chroma.  The broader threshold also
            # removes small compression/lighting variations at sprite edges.
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
    crops: list[Image.Image] = []
    boxes: list[tuple[int, int, int, int]] = []
    for cell in cells:
        box = cell.getchannel("A").getbbox()
        if box is None:
            raise ValueError("Sprite sheet contains an empty cell")
        boxes.append(box)
        crops.append(cell.crop(box))

    max_width = max(sprite.width for sprite in crops)
    max_height = max(sprite.height for sprite in crops)
    scale = min(210 / max_width, 190 / max_height, 1.0)

    normalized: list[Image.Image] = []
    for index, sprite in enumerate(crops):
        width = max(1, round(sprite.width * scale))
        height = max(1, round(sprite.height * scale))
        sprite = sprite.resize((width, height), Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        x = (256 - width) // 2
        # The airborne pose remains visibly lifted.  All other poses share an
        # exact baseline so furniture collision and walking stay visually solid.
        y = (256 - height) // 2 if index == 10 else 232 - height
        frame.alpha_composite(sprite, (x, y))
        normalized.append(frame)
    return normalized


def build_pet(sheet_path: Path) -> int:
    pet_id = sheet_path.stem.removesuffix("_sheet")
    sheet = Image.open(sheet_path)
    frames = normalize_frames(split_sheet(sheet))
    written: dict[tuple[str, int], Path] = {}

    for frame, (action, index) in zip(frames, FRAME_LAYOUT, strict=True):
        destination = FRAME_DIR / f"{pet_id}_{action}_{index}.png"
        frame.save(destination, optimize=True)
        written[(action, index)] = destination

    for alias, sources in ALIASES.items():
        for alias_index, source_key in enumerate(sources):
            copyfile(written[source_key], FRAME_DIR / f"{pet_id}_{alias}_{alias_index}.png")

    return len(FRAME_LAYOUT) + sum(len(items) for items in ALIASES.values())


def main() -> None:
    FRAME_DIR.mkdir(parents=True, exist_ok=True)
    sheets = sorted(SHEET_DIR.glob("*_sheet.png"))
    if len(sheets) != 20:
        raise SystemExit(f"Expected 20 companion sheets, found {len(sheets)}")

    total = 0
    for sheet_path in sheets:
        count = build_pet(sheet_path)
        total += count
        print(f"{sheet_path.stem.removesuffix('_sheet')}: {count} frames")
    print(f"Built {total} transparent pixel frames in {FRAME_DIR}")


if __name__ == "__main__":
    main()
