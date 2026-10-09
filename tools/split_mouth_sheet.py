from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
DEFAULT_SOURCE = ROOT / "assets" / "rabbit" / "mouth_sheet_original.png"
DEFAULT_OUT = ROOT / "assets" / "rabbit"

FRAME_NAMES = [
    "mouth_closed.png",
    "mouth_tiny.png",
    "mouth_medium.png",
    "mouth_wide.png",
    "mouth_closed_loop.png",
]


def looks_like_checkerboard(pixel: tuple[int, int, int]) -> bool:
    # The generated image contains a drawn checkerboard, not real alpha.
    # Keep this predicate intentionally strict; the rabbit fur is also very
    # light, so broad "near white" removal cuts holes into the face.
    return max(pixel) - min(pixel) <= 2 and min(pixel) >= 248


def transparent_flood_fill(frame: Image.Image) -> Image.Image:
    """Remove the generated checkerboard while preserving enclosed white fur."""
    rgb = frame.convert("RGB")
    width, height = rgb.size
    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def push(x: int, y: int) -> None:
        idx = y * width + x
        if visited[idx]:
            return
        if looks_like_checkerboard(rgb.getpixel((x, y))):
            visited[idx] = 1
            queue.append((x, y))

    for x in range(width):
        push(x, 0)
        push(x, height - 1)
    for y in range(height):
        push(0, y)
        push(width - 1, y)

    while queue:
        x, y = queue.popleft()
        if x > 0:
            push(x - 1, y)
        if x < width - 1:
            push(x + 1, y)
        if y > 0:
            push(x, y - 1)
        if y < height - 1:
            push(x, y + 1)

    rgba = rgb.convert("RGBA")
    data = rgba.load()
    for y in range(height):
        for x in range(width):
            idx = y * width + x
            if visited[idx]:
                data[x, y] = (255, 255, 255, 0)
    return rgba


def component_boxes(image: Image.Image) -> list[tuple[int, int, int, int]]:
    alpha = image.getchannel("A")
    width, height = image.size
    visited = bytearray(width * height)
    boxes: list[tuple[int, int, int, int, int]] = []
    pixels = alpha.load()

    for start_y in range(height):
        for start_x in range(width):
            start_idx = start_y * width + start_x
            if visited[start_idx] or pixels[start_x, start_y] == 0:
                continue

            queue: deque[tuple[int, int]] = deque([(start_x, start_y)])
            visited[start_idx] = 1
            left = right = start_x
            top = bottom = start_y
            area = 0

            while queue:
                x, y = queue.popleft()
                area += 1
                left = min(left, x)
                right = max(right, x)
                top = min(top, y)
                bottom = max(bottom, y)

                for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                    if nx < 0 or nx >= width or ny < 0 or ny >= height:
                        continue
                    idx = ny * width + nx
                    if visited[idx] or pixels[nx, ny] == 0:
                        continue
                    visited[idx] = 1
                    queue.append((nx, ny))

            if area > 4000:
                boxes.append((area, left, top, right + 1, bottom + 1))

    largest = sorted(boxes, reverse=True)[: len(FRAME_NAMES)]
    return [(left, top, right, bottom) for _, left, top, right, bottom in sorted(largest, key=lambda box: box[1])]


def parse_args() -> argparse.Namespace:
    parser = argparse.ArgumentParser(description="Split a five-pose rabbit mouth sheet into aligned PNG frames.")
    parser.add_argument("--source", type=Path, default=DEFAULT_SOURCE, help="Input sprite sheet path.")
    parser.add_argument("--out", type=Path, default=DEFAULT_OUT, help="Output directory for aligned frames.")
    return parser.parse_args()


def main() -> None:
    args = parse_args()
    source = args.source.expanduser().resolve()
    output = args.out.expanduser().resolve()
    if not source.is_file():
        raise FileNotFoundError(f"Sprite sheet not found: {source}")

    output.mkdir(parents=True, exist_ok=True)
    sheet = Image.open(source).convert("RGB")
    transparent_sheet = transparent_flood_fill(sheet)
    boxes = component_boxes(transparent_sheet)
    if len(boxes) != len(FRAME_NAMES):
        raise RuntimeError(f"Expected {len(FRAME_NAMES)} rabbits, found {len(boxes)}.")

    padding = 26
    canvas_width = max(right - left for left, _, right, _ in boxes) + padding * 2
    canvas_height = max(bottom - top for _, top, _, bottom in boxes) + padding * 2
    target_center_x = canvas_width // 2
    target_bottom = canvas_height - padding

    for name, box in zip(FRAME_NAMES, boxes):
        left, top, right, bottom = box
        frame = transparent_sheet.crop(box)

        # Keep every mouth frame on the same canvas and align by the feet.
        # This makes the rabbit stay put while only the mouth changes.
        canvas = Image.new("RGBA", (canvas_width, canvas_height), (255, 255, 255, 0))
        paste_x = round(target_center_x - frame.width / 2)
        paste_y = target_bottom - frame.height
        canvas.paste(frame, (paste_x, paste_y), frame)
        canvas.save(output / name)

    # Keep the original sheet around for reference and debugging.
    sheet.save(output / "mouth_sheet_original.png")
    print(f"Wrote {len(FRAME_NAMES)} frames to {output}")


if __name__ == "__main__":
    main()
