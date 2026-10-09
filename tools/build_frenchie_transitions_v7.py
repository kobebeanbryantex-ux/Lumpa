"""Build side-view settling, sniff, bow and rest frames at one fixed scale."""

from pathlib import Path

from PIL import Image

from build_pixel_companions_v3 import split_sheet
from sprite_contact import main_component_bounds

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "assets/pixel_companions_v7/sheets/dog_french_fawn_transition_sheet.png"
OUTPUT = ROOT / "public/assets/pixel_companions_v7/frames"


def main() -> None:
    crops = []
    for cell in split_sheet(Image.open(SOURCE)):
        bounds = main_component_bounds(cell)
        crops.append(cell.crop(bounds))
    scale = min(210 / max(c.width for c in crops), 190 / max(c.height for c in crops), 1.0)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for index, crop in enumerate(crops):
        size = (round(crop.width * scale), round(crop.height * scale))
        frame = Image.new("RGBA", (256, 256))
        frame.alpha_composite(crop.resize(size, Image.Resampling.NEAREST), ((256 - size[0]) // 2, 232 - size[1]))
        action = ("settle", "sniff", "bow", "rest")[index // 4]
        frame.save(OUTPUT / f"dog_french_fawn_{action}_{index % 4}.png", optimize=True)
    print(f"Built 16 side-view transition frames in {OUTPUT}")


if __name__ == "__main__":
    main()
