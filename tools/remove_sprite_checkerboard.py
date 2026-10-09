"""Remove the baked checkerboard from generated sprite frames."""
from collections import deque
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
FOLDER = ROOT / "assets" / "pixel_actions_v2"


def is_background(pixel):
    r, g, b, _ = pixel
    return max(pixel[:3]) - min(pixel[:3]) <= 12 and min(pixel[:3]) >= 145


def clean(path):
    image = Image.open(path).convert("RGBA")
    pixels = image.load()
    width, height = image.size
    queue = deque()
    visited = bytearray(width * height)
    for x in range(width):
        queue.extend(((x, 0), (x, height - 1)))
    for y in range(height):
        queue.extend(((0, y), (width - 1, y)))
    while queue:
        x, y = queue.popleft()
        index = y * width + x
        if visited[index] or not is_background(pixels[x, y]):
            continue
        visited[index] = 1
        pixels[x, y] = (0, 0, 0, 0)
        if x > 0: queue.append((x - 1, y))
        if x + 1 < width: queue.append((x + 1, y))
        if y > 0: queue.append((x, y - 1))
        if y + 1 < height: queue.append((x, y + 1))
    image.save(path)


for file in FOLDER.glob("*.png"):
    clean(file)
