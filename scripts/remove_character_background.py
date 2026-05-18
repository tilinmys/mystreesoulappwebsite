from __future__ import annotations

import argparse
from collections import deque
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


def _border_background_lab(lab: np.ndarray, inset: int) -> np.ndarray:
    h, w = lab.shape[:2]
    strips = np.concatenate(
        [
            lab[:inset, :, :].reshape(-1, 3),
            lab[h - inset :, :, :].reshape(-1, 3),
            lab[:, :inset, :].reshape(-1, 3),
            lab[:, w - inset :, :].reshape(-1, 3),
        ],
        axis=0,
    )
    return np.median(strips, axis=0)


def _edge_connected(mask: np.ndarray) -> np.ndarray:
    h, w = mask.shape
    seen = np.zeros((h, w), dtype=np.uint8)
    out = np.zeros((h, w), dtype=np.uint8)
    q: deque[tuple[int, int]] = deque()

    for x in range(w):
        if mask[0, x]:
            q.append((x, 0))
        if mask[h - 1, x]:
            q.append((x, h - 1))
    for y in range(h):
        if mask[y, 0]:
            q.append((0, y))
        if mask[y, w - 1]:
            q.append((w - 1, y))

    while q:
        x, y = q.popleft()
        if seen[y, x] or not mask[y, x]:
            continue
        seen[y, x] = 1
        out[y, x] = 1
        if x > 0:
            q.append((x - 1, y))
        if x + 1 < w:
            q.append((x + 1, y))
        if y > 0:
            q.append((x, y - 1))
        if y + 1 < h:
            q.append((x, y + 1))
    return out


def _largest_foreground(mask: np.ndarray) -> np.ndarray:
    num, labels, stats, _ = cv2.connectedComponentsWithStats(mask.astype(np.uint8), 8)
    if num <= 1:
        return mask.astype(np.uint8)

    h, w = mask.shape
    min_area = max(80, int(h * w * 0.0015))
    areas = stats[1:, cv2.CC_STAT_AREA]
    largest = int(np.argmax(areas)) + 1
    keep = labels == largest

    lx, ly, lw, lh, _ = stats[largest]
    large_box = np.array([lx, ly, lx + lw, ly + lh])
    for idx in range(1, num):
        if idx == largest or stats[idx, cv2.CC_STAT_AREA] < min_area:
            continue
        x, y, ww, hh, _ = stats[idx]
        box = np.array([x, y, x + ww, y + hh])
        separated = (
            box[2] < large_box[0] - 28
            or box[0] > large_box[2] + 28
            or box[3] < large_box[1] - 28
            or box[1] > large_box[3] + 28
        )
        if not separated:
            keep |= labels == idx
    return keep.astype(np.uint8)


def _fill_foreground_holes(mask: np.ndarray) -> np.ndarray:
    inverse = (mask == 0).astype(np.uint8)
    edge_bg = _edge_connected(inverse)
    holes = (inverse == 1) & (edge_bg == 0)
    filled = mask.copy().astype(np.uint8)
    filled[holes] = 1
    return filled


def remove_background(input_path: Path, output_path: Path) -> None:
    pil = Image.open(input_path).convert("RGB")
    rgb = np.array(pil)
    bgr = cv2.cvtColor(rgb, cv2.COLOR_RGB2BGR)
    h, w = rgb.shape[:2]

    lab = cv2.cvtColor(rgb, cv2.COLOR_RGB2LAB).astype(np.float32)
    hsv = cv2.cvtColor(rgb, cv2.COLOR_RGB2HSV)
    bg_lab = _border_background_lab(lab, max(10, min(h, w) // 30))
    bg_dist = np.linalg.norm(lab - bg_lab, axis=2)

    close_bg = bg_dist < 20
    likely_edge_bg = _edge_connected(close_bg)
    probable_bg = _edge_connected(bg_dist < 34)

    mask = np.full((h, w), cv2.GC_PR_FGD, dtype=np.uint8)
    mask[probable_bg == 1] = cv2.GC_PR_BGD
    mask[likely_edge_bg == 1] = cv2.GC_BGD

    sat = hsv[:, :, 1]
    value = hsv[:, :, 2]
    yy, xx = np.mgrid[:h, :w]
    center_x = w * 0.5
    center_y = h * 0.52
    ellipse = ((xx - center_x) / (w * 0.42)) ** 2 + ((yy - center_y) / (h * 0.47)) ** 2 < 1
    protected_fg = ellipse & (bg_dist > 26) & ((sat > 24) | (value < 220))
    mask[protected_fg] = cv2.GC_FGD

    rect_pad_x = max(8, int(w * 0.035))
    rect_pad_y = max(8, int(h * 0.035))
    rect = (rect_pad_x, rect_pad_y, w - rect_pad_x * 2, h - rect_pad_y * 2)
    bg_model = np.zeros((1, 65), np.float64)
    fg_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(bgr, mask, rect, bg_model, fg_model, 7, cv2.GC_INIT_WITH_MASK)

    hard = np.where((mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD), 1, 0).astype(np.uint8)
    hard = _largest_foreground(hard)
    hard = _fill_foreground_holes(hard)
    kernel = cv2.getStructuringElement(cv2.MORPH_ELLIPSE, (5, 5))
    hard = cv2.morphologyEx(hard, cv2.MORPH_CLOSE, kernel, iterations=2)
    hard = cv2.morphologyEx(hard, cv2.MORPH_OPEN, kernel, iterations=1)

    trimap = np.where(hard == 1, 255, 0).astype(np.uint8)
    feathered = cv2.GaussianBlur(trimap, (0, 0), sigmaX=1.25, sigmaY=1.25)
    alpha = np.where(trimap == 255, np.maximum(feathered, 245), feathered)

    rgba = np.dstack([rgb, alpha.astype(np.uint8)])
    output_path.parent.mkdir(parents=True, exist_ok=True)
    Image.fromarray(rgba, "RGBA").save(output_path, "WEBP", lossless=True, quality=100, method=6)


def main() -> None:
    parser = argparse.ArgumentParser(description="Remove flat/soft edge backgrounds from character images.")
    parser.add_argument("inputs", nargs="+", type=Path)
    parser.add_argument("--output-dir", type=Path, default=Path("public/images"))
    parser.add_argument("--suffix", default="-cutout")
    args = parser.parse_args()

    for input_path in args.inputs:
        output_path = args.output_dir / f"{input_path.stem}{args.suffix}.webp"
        remove_background(input_path, output_path)
        print(output_path)


if __name__ == "__main__":
    main()
