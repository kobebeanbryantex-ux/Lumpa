"""Find the character silhouette, ignoring atlas-edge fragments and alpha noise."""

from PIL import Image


def main_component_bounds(image: Image.Image, threshold: int = 160) -> tuple[int, int, int, int]:
    alpha = image.convert("RGBA").getchannel("A")
    width, height = alpha.size
    values = alpha.tobytes()
    visited = bytearray(width * height)
    largest_count = 0
    largest_bounds = None
    for start, value in enumerate(values):
        if visited[start] or value < threshold:
            continue
        visited[start] = 1
        pending = [start]
        count = 0
        left, top, right, bottom = width, height, 0, 0
        while pending:
            current = pending.pop()
            x, y = current % width, current // width
            count += 1
            left, top = min(left, x), min(top, y)
            right, bottom = max(right, x + 1), max(bottom, y + 1)
            for ny in range(max(0, y - 1), min(height, y + 2)):
                for nx in range(max(0, x - 1), min(width, x + 2)):
                    neighbour = ny * width + nx
                    if not visited[neighbour] and values[neighbour] >= threshold:
                        visited[neighbour] = 1
                        pending.append(neighbour)
        if count > largest_count:
            largest_count = count
            largest_bounds = (left, top, right, bottom)
    if largest_bounds is None:
        raise ValueError("Sprite cell has no opaque character silhouette")
    return largest_bounds
