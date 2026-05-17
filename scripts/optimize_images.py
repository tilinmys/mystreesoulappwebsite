from __future__ import annotations

from collections import deque
from pathlib import Path

from PIL import Image


ROOT = Path(__file__).resolve().parents[1]
IMAGE_DIR = ROOT / "public" / "images"

MAX_SIZE_BY_STEM = {
    "bloop-nav": 256,
}

DEFAULT_MAX_SIZE = 512
WEBP_QUALITY = 82
BACKGROUND_DISTANCE = 36


def color_distance(a: tuple[int, int, int], b: tuple[int, int, int]) -> int:
    return abs(a[0] - b[0]) + abs(a[1] - b[1]) + abs(a[2] - b[2])


def remove_edge_background(image: Image.Image) -> Image.Image:
    """Remove a flat edge-connected background without touching interior highlights.

    This is intentionally conservative: it only clears pixels connected to the
    image boundary whose color is close to the median corner color. Existing
    transparent PNGs pass through unchanged.
    """

    rgba = image.convert("RGBA")
    width, height = rgba.size
    alpha = rgba.getchannel("A")

    if alpha.getextrema()[0] == 0:
      return rgba

    pixels = rgba.load()
    corners = [
        pixels[0, 0][:3],
        pixels[width - 1, 0][:3],
        pixels[0, height - 1][:3],
        pixels[width - 1, height - 1][:3],
    ]
    bg = tuple(sorted(channel)[len(channel) // 2] for channel in zip(*corners))

    visited = bytearray(width * height)
    queue: deque[tuple[int, int]] = deque()

    def add(x: int, y: int) -> None:
        index = y * width + x
        if not visited[index]:
            visited[index] = 1
            queue.append((x, y))

    for x in range(width):
        add(x, 0)
        add(x, height - 1)
    for y in range(height):
        add(0, y)
        add(width - 1, y)

    while queue:
        x, y = queue.popleft()
        r, g, b, a = pixels[x, y]
        if a == 0 or color_distance((r, g, b), bg) <= BACKGROUND_DISTANCE:
            pixels[x, y] = (r, g, b, 0)
            for nx, ny in ((x - 1, y), (x + 1, y), (x, y - 1), (x, y + 1)):
                if 0 <= nx < width and 0 <= ny < height:
                    index = ny * width + nx
                    if not visited[index]:
                        visited[index] = 1
                        queue.append((nx, ny))

    return rgba


def resize_for_app(image: Image.Image, max_size: int) -> Image.Image:
    width, height = image.size
    scale = min(1, max_size / max(width, height))
    if scale == 1:
        return image
    return image.resize((round(width * scale), round(height * scale)), Image.Resampling.LANCZOS)


def optimize(path: Path) -> tuple[Path, int, int]:
    image = Image.open(path)
    cleaned = remove_edge_background(image)
    max_size = MAX_SIZE_BY_STEM.get(path.stem, DEFAULT_MAX_SIZE)
    resized = resize_for_app(cleaned, max_size)

    out_path = path.with_suffix(".webp")
    resized.save(out_path, "WEBP", quality=WEBP_QUALITY, method=6, exact=True)
    return out_path, path.stat().st_size, out_path.stat().st_size


def main() -> None:
    candidates = sorted(
        path
        for path in IMAGE_DIR.glob("*.png")
        if path.name.startswith("bloop-") and not path.name.endswith("-original.png")
    )
    candidates.append(IMAGE_DIR / "bloop-original.png")

    seen: set[Path] = set()
    for path in candidates:
        if path in seen or not path.exists():
            continue
        seen.add(path)
        out_path, before, after = optimize(path)
        print(f"{path.name} -> {out_path.name}: {before // 1024}KB -> {after // 1024}KB")


if __name__ == "__main__":
    main()
