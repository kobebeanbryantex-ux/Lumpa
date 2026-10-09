"""Turn 4x4 companion redesign sheets into transparent runtime animation frames."""
from collections import deque
from pathlib import Path
from PIL import Image

ROOT = Path(__file__).resolve().parents[1]
SHEETS = ROOT / "assets" / "companion_redesign" / "sheets"
OUTPUT = ROOT / "assets" / "companion_redesign" / "frames"
OUTPUT.mkdir(parents=True, exist_ok=True)

ROWS = (
    ("idle_0", "idle_1", "idle_2", "idle_3"),
    ("walk_0", "walk_1", "walk_2", "walk_3"),
    ("pounce_0", "jump_0", "jump_1", "land_0"),
    ("play_0", "play_1", "roll_0", "roll_1"),
)


def background(pixel):
    rgb = pixel[:3]
    return max(rgb) - min(rgb) <= 12 and min(rgb) >= 145


def remove_checkerboard(image):
    image = image.convert("RGBA")
    pixels = image.load()
    width, height = image.size
    todo = deque((x, y) for x in range(width) for y in (0, height - 1))
    todo.extend((x, y) for y in range(height) for x in (0, width - 1))
    visited = bytearray(width * height)
    while todo:
        x, y = todo.popleft()
        index = y * width + x
        if visited[index] or not background(pixels[x, y]):
            continue
        visited[index] = 1
        pixels[x, y] = (0, 0, 0, 0)
        if x: todo.append((x - 1, y))
        if x + 1 < width: todo.append((x + 1, y))
        if y: todo.append((x, y - 1))
        if y + 1 < height: todo.append((x, y + 1))
    return image


for sheet_path in SHEETS.glob("*_sheet.png"):
    pet_id = sheet_path.name.removesuffix("_sheet.png")
    sheet = Image.open(sheet_path).convert("RGBA")
    cell_w, cell_h = sheet.width // 4, sheet.height // 4
    for row, names in enumerate(ROWS):
        for column, name in enumerate(names):
            frame = sheet.crop((column * cell_w, row * cell_h, (column + 1) * cell_w, (row + 1) * cell_h))
            remove_checkerboard(frame).save(OUTPUT / f"{pet_id}_{name}.png")
