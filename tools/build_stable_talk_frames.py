from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter


ROOT = Path(__file__).resolve().parents[1]
ASSET_DIR = ROOT / "assets" / "rabbit"

SOURCE_FRAMES = [
    "mouth_closed.png",
    "mouth_tiny.png",
    "mouth_medium.png",
    "mouth_wide.png",
    "mouth_closed_loop.png",
]

OUTPUT_FRAMES = [
    "talk_closed.png",
    "talk_tiny.png",
    "talk_medium.png",
    "talk_wide.png",
    "talk_closed_loop.png",
]


def make_mouth_mask(size: tuple[int, int]) -> Image.Image:
    """Limit frame changes to the mouth so the head and body never jump."""
    mask = Image.new("L", size, 0)
    draw = ImageDraw.Draw(mask)

    # Coordinates are tuned for the current rabbit asset canvas: 378 x 670.
    draw.ellipse((145, 348, 230, 430), fill=255)
    draw.rounded_rectangle((155, 365, 220, 432), radius=24, fill=255)

    return mask.filter(ImageFilter.GaussianBlur(2.0))


def main() -> None:
    base = Image.open(ASSET_DIR / "mouth_closed.png").convert("RGBA")
    mask = make_mouth_mask(base.size)

    for source_name, output_name in zip(SOURCE_FRAMES, OUTPUT_FRAMES):
        source = Image.open(ASSET_DIR / source_name).convert("RGBA")
        if source.size != base.size:
            raise RuntimeError(f"{source_name} is {source.size}, expected {base.size}.")

        if source_name == "mouth_closed.png":
            output = base.copy()
        else:
            output = Image.composite(source, base, mask)

        output.save(ASSET_DIR / output_name)

    print(f"Wrote {len(OUTPUT_FRAMES)} stable talk frames to {ASSET_DIR}")


if __name__ == "__main__":
    main()
