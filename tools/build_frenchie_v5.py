"""Build the fawn Frenchie's refined, fixed-baseline pixel motion frames."""

from pathlib import Path

from PIL import Image

from build_pixel_companions_v3 import split_sheet


ROOT = Path(__file__).resolve().parents[1]
SHEET = ROOT / "assets/pixel_companions_v5/sheets/dog_french_fawn_sheet.png"
OUTPUT = ROOT / "public/assets/pixel_companions_v5/frames"
LAYOUT = (
    ("idle", 0), ("idle", 1), ("idle", 2), ("idle", 3),
    ("walk", 0), ("walk", 1), ("walk", 2), ("walk", 3),
    ("run", 0), ("run", 1), ("run", 2), ("run", 3),
    ("sniff", 0), ("sniff", 1), ("bow", 0), ("greet", 0),
)


def main() -> None:
    if not SHEET.is_file():
        raise SystemExit(f"Missing source sheet: {SHEET}")
    cells = split_sheet(Image.open(SHEET))
    crops = []
    for cell in cells:
        bounds = cell.getchannel("A").getbbox()
        if bounds is None:
            raise SystemExit("Frenchie sheet has an empty cell")
        crops.append(cell.crop(bounds))

    # One scale for the entire sequence prevents the rubber-sheet effect.
    scale = min(210 / max(c.width for c in crops), 190 / max(c.height for c in crops), 1.0)
    OUTPUT.mkdir(parents=True, exist_ok=True)
    for (action, number), crop in zip(LAYOUT, crops, strict=True):
        size = (max(1, round(crop.width * scale)), max(1, round(crop.height * scale)))
        sprite = crop.resize(size, Image.Resampling.NEAREST)
        frame = Image.new("RGBA", (256, 256), (0, 0, 0, 0))
        baseline = 215 if action == "run" and number in (1, 2) else 232
        frame.alpha_composite(sprite, ((256 - size[0]) // 2, baseline - size[1]))
        frame.save(OUTPUT / f"dog_french_fawn_{action}_{number}.png", optimize=True)
    print(f"Built {len(LAYOUT)} fawn Frenchie frames in {OUTPUT}")


if __name__ == "__main__":
    main()
