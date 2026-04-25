"""OpenCV CLAHE-based chest X-ray image enhancement."""
from __future__ import annotations

import logging
from pathlib import Path

import cv2
import numpy as np

logger = logging.getLogger(__name__)


def enhance_clahe(source: Path, destination: Path) -> None:
    """Apply CLAHE contrast enhancement and light denoising to a CXR image.

    Steps:
      1. Convert to grayscale (if colour).
      2. CLAHE (Contrast Limited Adaptive Histogram Equalization).
      3. Light median blur for noise reduction.
      4. Save as PNG.
    """
    img = cv2.imread(str(source), cv2.IMREAD_GRAYSCALE)
    if img is None:
        from PIL import Image

        pil_img = Image.open(source).convert("L")
        img = np.array(pil_img)

    clahe = cv2.createCLAHE(clipLimit=2.0, tileGridSize=(8, 8))
    enhanced = clahe.apply(img)

    # Light median blur to reduce salt-and-pepper noise.
    enhanced = cv2.medianBlur(enhanced, 3)

    cv2.imwrite(str(destination), enhanced)
    logger.info("CLAHE-enhanced image saved to %s", destination)
