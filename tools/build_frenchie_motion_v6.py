"""Extract eight-frame walk/run cycles; preserve alpha and one character scale."""

from pathlib import Path

from PIL import Image

from build_pixel_companions_v3 import split_sheet
from sprite_contact import main_component_bounds

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/pixel_companions_v6/sheets/dog_french_fawn_motion_sheet.png"
OUTPUT = ROOT / "public/assets/pixel_companions_v6/frames"


def main() -> None:
    crops = []
    for cell in split_sheet(Image.open(SOURCE)):
        bounds = main_component_bounds(cell)
        crops.append(cell.crop(bounds))
    scale = min(210 / max(c.width for c in crops), 190 / max(c.height for c in crops), 1.0)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, crop in enumerate(crops):
        size = (round(crop.width * scale), round(crop.height * scale))
        sprite = crop.resize(size, Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (256, 256))
        # Align actual paws, not faint pixels or neighbouring-cell fragments.
        baseline = 232
        frame.alpha_composite(sprite, ((256 - size[0]) // 2, baseline - size[1]))
        action = "walk" if index < 8 else "run"
        frame.save(OUTPUT / f"dog_french_fawn_{action}_{index % 8}.png", optimize=True)
    print(f"Built 16 motion frames in {OUTPUT}")


if __name__ == "__main__":
    main()
