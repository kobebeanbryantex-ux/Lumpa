"""Build daily Frenchie poses with a shared scale and grounded contact line."""

from pathlib import Path
from PIL import Image
from build_pixel_companions_v3 import split_sheet
from sprite_contact import main_component_bounds

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/pixel_companions_v8/sheets/dog_french_fawn_daily_sheet.png"
OUTPUT = ROOT / "public/assets/pixel_companions_v8/frames"


def main():
    crops = [cell.crop(main_component_bounds(cell)) for cell in split_sheet(Image.open(SOURCE))]
    scale = min(210 / max(c.width for c in crops), 190 / max(c.height for c in crops), 1.0)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, crop in enumerate(crops):
        size = (round(crop.width * scale), round(crop.height * scale))
        frame = Image.new("RGBA", (256, 256))
        frame.alpha_composite(crop.resize(size, Image.Resampling.NEAREST), ((256 - size[0]) // 2, 232 - size[1]))
        action = ("sit", "wag", "curious", "yawn")[index // 4]
        frame.save(OUTPUT / f"dog_french_fawn_{action}_{index % 4}.png", optimize=True)
    print(f"Built 16 daily action frames in {OUTPUT}")


if __name__ == "__main__":
    main()
