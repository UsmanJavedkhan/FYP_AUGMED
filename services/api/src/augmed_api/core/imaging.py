"""Lightweight imaging utilities for the local AugMed prototype.

These helpers produce the 'enhanced' and 'heatmap' artifacts that accompany
every uploaded chest X-ray in the demo pipeline. They intentionally avoid
heavy ML dependencies (torch, opencv) so the local dev loop stays fast.
The outputs are illustrative placeholders for the real enhancement and
Grad-CAM modules that will replace them later.
"""
from __future__ import annotations

from pathlib import Path

from PIL import Image, ImageDraw, ImageFilter, ImageOps


# A small 5-stop colormap roughly matching the 'jet' style used by Grad-CAM.
_JET_STOPS: list[tuple[float, tuple[int, int, int]]] = [
    (0.0, (0, 0, 128)),
    (0.25, (0, 128, 255)),
    (0.5, (0, 220, 120)),
    (0.75, (255, 200, 0)),
    (1.0, (220, 30, 30)),
]


def _jet(value: float) -> tuple[int, int, int]:
    value = max(0.0, min(1.0, value))
    for i in range(len(_JET_STOPS) - 1):
        a, ca = _JET_STOPS[i]
        b, cb = _JET_STOPS[i + 1]
        if value <= b:
            t = 0.0 if b == a else (value - a) / (b - a)
            return (
                int(ca[0] + (cb[0] - ca[0]) * t),
                int(ca[1] + (cb[1] - ca[1]) * t),
                int(ca[2] + (cb[2] - ca[2]) * t),
            )
    return _JET_STOPS[-1][1]


def enhance_xray(source: Path, destination: Path) -> None:
    """Apply a safe contrast + denoise pass as an 'enhancement' placeholder."""
    with Image.open(source) as image:
        grayscale = ImageOps.grayscale(image)
        equalized = ImageOps.equalize(grayscale)
        autocontrasted = ImageOps.autocontrast(equalized, cutoff=1)
        smoothed = autocontrasted.filter(ImageFilter.MedianFilter(size=3))
        smoothed.convert("RGB").save(destination, format="PNG", optimize=True)


def generate_heatmap(source: Path, destination: Path, *, focus: str = "center") -> None:
    """Create a pseudo Grad-CAM overlay so the UI has something to render.

    The heatmap is deterministic from the image content (grayscale intensity
    around a focus region), so the same file always produces the same overlay.
    """
    with Image.open(source) as image:
        base = ImageOps.grayscale(image).resize((256, 256)).filter(ImageFilter.GaussianBlur(radius=6))

    width, height = base.size
    if focus == "upper":
        cx, cy = width * 0.5, height * 0.32
    elif focus == "lower":
        cx, cy = width * 0.5, height * 0.68
    else:
        cx, cy = width * 0.5, height * 0.5

    max_radius = (width ** 2 + height ** 2) ** 0.5 * 0.55
    overlay = Image.new("RGBA", (width, height), (0, 0, 0, 0))
    pixels = overlay.load()
    base_px = base.load()

    for y in range(height):
        for x in range(width):
            dx = x - cx
            dy = y - cy
            distance = (dx * dx + dy * dy) ** 0.5
            radial = max(0.0, 1.0 - distance / max_radius)
            intensity = (base_px[x, y] / 255.0) * 0.35 + radial * 0.75
            if intensity < 0.18:
                continue
            r, g, b = _jet(min(1.0, intensity))
            alpha = int(min(1.0, intensity) * 205)
            pixels[x, y] = (r, g, b, alpha)

    overlay = overlay.filter(ImageFilter.GaussianBlur(radius=4))
    resized_base = Image.open(source).convert("RGBA").resize((width, height))
    composed = Image.alpha_composite(resized_base, overlay)
    composed.convert("RGB").save(destination, format="PNG", optimize=True)


def write_placeholder_xray(destination: Path, label: str) -> None:
    """Write a stylised placeholder chest X-ray for demo cases."""
    size = (512, 512)
    image = Image.new("RGB", size, (12, 14, 22))
    draw = ImageDraw.Draw(image)

    # Soft thoracic silhouette
    draw.ellipse((96, 80, 416, 460), fill=(40, 44, 58))
    draw.ellipse((130, 130, 250, 380), fill=(18, 22, 32))
    draw.ellipse((262, 130, 382, 380), fill=(18, 22, 32))
    draw.rectangle((240, 120, 272, 380), fill=(52, 58, 74))
    draw.text((24, 24), f"DEMO · {label}", fill=(240, 220, 170))

    image = image.filter(ImageFilter.GaussianBlur(radius=2))
    destination.parent.mkdir(parents=True, exist_ok=True)
    image.save(destination, format="PNG", optimize=True)
