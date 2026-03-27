from math import sqrt
from pathlib import Path

import cv2
import numpy as np
from PIL import Image


MAX_DIMENSION = 512
SUBJECT_WORKING_DIMENSION = 900
QUALITY = 90
WHITE_DISTANCE_START = 8
WHITE_DISTANCE_END = 58
BLOOP_SOURCE_DIR = Path("images")
BLOOP_TARGET_DIR = Path("images/processed")

ASSETS = [
    {
        "source": Path("public/images/bloop-original.png"),
        "target": Path("public/images/bloop.webp"),
        "remove_white_background": True,
        "extract_subject": False,
    },
    {
        "source": Path("public/images/bloop-welcome-original.png"),
        "target": Path("public/images/bloop-welcome.webp"),
        "remove_white_background": False,
        "extract_subject": False,
    },
    {
        "source": Path("public/images/onboarding-cycle-guide-original.png"),
        "target": Path("public/images/onboarding-cycle-guide.webp"),
        "remove_white_background": False,
        "extract_subject": False,
    },
    {
        "source": Path("public/images/onboarding-cycle-leaf-original.png"),
        "target": Path("public/images/onboarding-cycle-leaf.webp"),
        "remove_white_background": False,
        "extract_subject": False,
    },
    {
        "source": Path("public/images/onboarding-cycle-petals-original.png"),
        "target": Path("public/images/onboarding-cycle-petals.webp"),
        "remove_white_background": False,
        "extract_subject": False,
    },
]

BLOOP_ASSETS = [
    {
        "source": BLOOP_SOURCE_DIR / f"bloopco{index}.png",
        "target": BLOOP_TARGET_DIR / f"bloopco{index}.webp",
        "remove_white_background": False,
        "extract_subject": True,
    }
    for index in range(1, 12)
]


def main() -> None:
    for asset in [*ASSETS, *BLOOP_ASSETS]:
        optimize_asset(
            source=asset["source"],
            target=asset["target"],
            remove_white_background_flag=asset["remove_white_background"],
            extract_subject_flag=asset["extract_subject"],
        )


def optimize_asset(
    *,
    source: Path,
    target: Path,
    remove_white_background_flag: bool,
    extract_subject_flag: bool,
) -> None:
    if not source.exists():
        raise FileNotFoundError(f"Missing source asset: {source}")

    with Image.open(source) as image:
        image = image.convert("RGBA")
        if extract_subject_flag:
            image.thumbnail(
                (SUBJECT_WORKING_DIMENSION, SUBJECT_WORKING_DIMENSION),
                Image.Resampling.LANCZOS,
            )
            image = extract_subject(image)
        else:
            image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)

        image.thumbnail((MAX_DIMENSION, MAX_DIMENSION), Image.Resampling.LANCZOS)
        if remove_white_background_flag:
            image = remove_white_background(image)
        target.parent.mkdir(parents=True, exist_ok=True)
        image.save(target, format="WEBP", lossless=True, quality=QUALITY, method=6)

    print(f"Saved optimized asset to {target}")


def remove_white_background(image: Image.Image) -> Image.Image:
    cleaned_pixels = []

    for red, green, blue, _ in image.getdata():
        distance_from_white = sqrt(
            (255 - red) ** 2 + (255 - green) ** 2 + (255 - blue) ** 2
        )
        alpha_ratio = max(
            0.0,
            min(
                1.0,
                (distance_from_white - WHITE_DISTANCE_START)
                / (WHITE_DISTANCE_END - WHITE_DISTANCE_START),
            ),
        )

        if alpha_ratio <= 0:
            cleaned_pixels.append((0, 0, 0, 0))
            continue

        corrected_red = remove_white_matte(red, alpha_ratio)
        corrected_green = remove_white_matte(green, alpha_ratio)
        corrected_blue = remove_white_matte(blue, alpha_ratio)
        cleaned_pixels.append(
            (
                corrected_red,
                corrected_green,
                corrected_blue,
                int(alpha_ratio * 255),
            )
        )

    transparent_image = Image.new("RGBA", image.size)
    transparent_image.putdata(cleaned_pixels)
    return transparent_image


def remove_white_matte(channel: int, alpha_ratio: float) -> int:
    corrected_value = (channel - (255 * (1 - alpha_ratio))) / alpha_ratio
    return int(max(0, min(255, round(corrected_value))))


def extract_subject(image: Image.Image) -> Image.Image:
    rgba = np.array(image, dtype=np.uint8)
    rgb = cv2.cvtColor(rgba, cv2.COLOR_RGBA2RGB)
    height, width = rgb.shape[:2]
    margin_x = max(24, int(width * 0.06))
    margin_y = max(24, int(height * 0.06))
    rect = (
        margin_x,
        margin_y,
        max(1, width - (margin_x * 2)),
        max(1, height - (margin_y * 2)),
    )

    mask = np.zeros((height, width), np.uint8)
    bgd_model = np.zeros((1, 65), np.float64)
    fgd_model = np.zeros((1, 65), np.float64)
    cv2.grabCut(rgb, mask, rect, bgd_model, fgd_model, 5, cv2.GC_INIT_WITH_RECT)

    foreground_mask = np.where(
        (mask == cv2.GC_FGD) | (mask == cv2.GC_PR_FGD),
        255,
        0,
    ).astype("uint8")

    kernel = np.ones((5, 5), np.uint8)
    foreground_mask = cv2.morphologyEx(foreground_mask, cv2.MORPH_CLOSE, kernel)
    foreground_mask = cv2.morphologyEx(foreground_mask, cv2.MORPH_OPEN, kernel)
    foreground_mask = cv2.GaussianBlur(foreground_mask, (0, 0), sigmaX=1.2, sigmaY=1.2)

    cutout = rgba.copy()
    cutout[:, :, 3] = foreground_mask
    cropped = crop_to_visible_bounds(cutout)
    return Image.fromarray(cropped, mode="RGBA")


def crop_to_visible_bounds(rgba: np.ndarray, padding: int = 24) -> np.ndarray:
    alpha = rgba[:, :, 3]
    visible_points = np.argwhere(alpha > 8)
    if visible_points.size == 0:
        return rgba

    top, left = visible_points.min(axis=0)
    bottom, right = visible_points.max(axis=0)
    top = max(0, top - padding)
    left = max(0, left - padding)
    bottom = min(rgba.shape[0] - 1, bottom + padding)
    right = min(rgba.shape[1] - 1, right + padding)
    return rgba[top : bottom + 1, left : right + 1]


if __name__ == "__main__":
    main()
