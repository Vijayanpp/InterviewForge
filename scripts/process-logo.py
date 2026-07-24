"""Build InterviewForge logo assets from the latest mark, without the caption."""
from __future__ import annotations

from collections import Counter
from pathlib import Path

from PIL import Image

SRC = Path(
    r"C:\Users\vijayan.pp\.cursor\projects\d-AI-Interview\assets"
    r"\c__Users_vijayan.pp_AppData_Roaming_Cursor_User_workspaceStorage_"
    r"542199ee9b39597fa24ae3177c1c0f28_images_ChatGPT_Image_Jul_23__2026__"
    r"06_05_25_PM-ef755824-b420-4b15-a317-0b63ed2d29ba.png"
)
OUT_DIR = Path(r"D:\AI\Interview\interviewforge\public\images")
OUT = OUT_DIR / "interviewforge-logo.png"
OUT_LIGHT = OUT_DIR / "interviewforge-logo-light.png"
OUT_SOURCE = OUT_DIR / "interviewforge-logo-source.png"


def is_near_white(r: int, g: int, b: int, threshold: int = 245) -> bool:
    return r >= threshold and g >= threshold and b >= threshold


def is_forge_accent(r: int, g: int, b: int) -> bool:
    if r < 120:
        return False
    if r > b + 35 and g >= 25 and b < 140:
        return True
    if r > 180 and g > 140 and b < 120:
        return True
    return False


def is_brand_ink(r: int, g: int, b: int) -> bool:
    if is_forge_accent(r, g, b):
        return False
    return (r + g + b) / 3 < 170


def row_content(im: Image.Image, y: int) -> int:
    px = im.load()
    n = 0
    for x in range(0, im.width, 2):
        r, g, b, _ = px[x, y]
        if not is_near_white(r, g, b):
            n += 1
    return n


def strip_caption(im: Image.Image) -> Image.Image:
    """
    Drop the bottom tagline band (PRACTICE. PREPARE...).
    Uses the *last* whitespace gap in the lower half (between wordmark and caption),
    not the earlier gap between icon and wordmark.
    """
    h = im.height
    gaps: list[tuple[int, int]] = []
    gap_start: int | None = None
    for y in range(int(h * 0.55), h):
        c = row_content(im, y)
        if c < 40:
            if gap_start is None:
                gap_start = y
            continue
        if gap_start is not None and (y - gap_start) >= 8:
            gaps.append((gap_start, y))
        gap_start = None

    if gaps:
        crop_y = gaps[-1][0] + 4
        return im.crop((0, 0, im.width, crop_y))

    return im.crop((0, 0, im.width, int(h * 0.82)))


def make_transparent(im: Image.Image) -> Image.Image:
    im = im.convert("RGBA")
    pixels = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = pixels[x, y]
            if is_near_white(r, g, b):
                pixels[x, y] = (255, 255, 255, 0)
            elif r > 230 and g > 230 and b > 230:
                avg = (r + g + b) / 3
                alpha = int(max(0, min(255, (255 - avg) * 12)))
                pixels[x, y] = (r, g, b, alpha)
    return im


def to_light(im: Image.Image) -> Image.Image:
    im = im.copy().convert("RGBA")
    pixels = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = pixels[x, y]
            if a < 8:
                continue
            if is_brand_ink(r, g, b):
                pixels[x, y] = (248, 250, 252, a)
    return im


def crop_transparent(im: Image.Image, pad: int = 12) -> Image.Image:
    bbox = im.getbbox()
    if not bbox:
        return im
    left, top, right, bottom = bbox
    left = max(0, left - pad)
    top = max(0, top - pad)
    right = min(im.width, right + pad)
    bottom = min(im.height, bottom + pad)
    return im.crop((left, top, right, bottom))


def main() -> None:
    if not SRC.exists():
        raise SystemExit(f"Source logo missing: {SRC}")

    OUT_DIR.mkdir(parents=True, exist_ok=True)
    original = Image.open(SRC).convert("RGBA")
    original.save(OUT_SOURCE, "PNG")
    print("source", OUT_SOURCE, original.size)

    without_caption = strip_caption(original)
    print("after caption strip", without_caption.size)

    transparent = crop_transparent(make_transparent(without_caption))
    transparent.save(OUT, "PNG", optimize=True)
    print("wrote", OUT, transparent.size)

    light = crop_transparent(to_light(transparent))
    light.save(OUT_LIGHT, "PNG", optimize=True)
    print("wrote", OUT_LIGHT, light.size)

    c: Counter[str] = Counter()
    px = transparent.load()
    for y in range(0, transparent.height, 3):
        for x in range(0, transparent.width, 3):
            r, g, b, a = px[x, y]
            if a < 200:
                continue
            if is_forge_accent(r, g, b):
                c["orange"] += 1
            elif (r + g + b) / 3 < 100:
                c["dark"] += 1
            else:
                c["other"] += 1
    print("color mix", dict(c))


if __name__ == "__main__":
    main()
