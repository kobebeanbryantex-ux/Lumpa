"""Slice the authored white-cat companion sheet into runtime PNG animation frames."""
from pathlib import Path
from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets" / "pixel_actions_v2" / "cat_white_companion_sheet_v2.png"
OUTPUT = ROOT / "assets" / "pixel_actions_v2"

# Row-major cells in the generated 4x4 sheet.
NAMES = (
    ("idle_0", "idle_1", "idle_2", "idle_3"),
    ("walk_0", "walk_1", "walk_2", "walk_3"),
    ("pounce_0", "jump_0", "jump_1", "land_0"),
    ("play_0", "play_1", "roll_0", "roll_1"),
)


def main():
    image = Image.open(SOURCE).convert("RGBA")
    cell_width = image.width // 4
    cell_height = image.height // 4
    for row, names in enumerate(NAMES):
        for column, name in enumerate(names):
            left = column * cell_width
            top = row * cell_height
            frame = image.crop((left, top, left + cell_width, top + cell_height))
            frame.save(OUTPUT / f"cat_white_{name}_v2.png")


if __name__ == "__main__":
    main()
