"""Chest X-ray classifier using TorchXRayVision DenseNet121.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

import numpy as np
import torch
import torchxrayvision as xrv
from PIL import Image

from augmed_api.ml.tb_discriminator import classify_3class

logger = logging.getLogger(__name__)

_model: xrv.models.DenseNet | None = None


@dataclass
class ClassificationResult:
    label: str  # "Healthy" | "Pneumonia" | "Tuberculosis"
    confidence: float
    raw_scores: dict[str, float]
    model_name: str = "TorchXRayVision DenseNet121"
    model_version: str = "densenet121-res224-all"


def _get_model() -> xrv.models.DenseNet:
    global _model
    if _model is None:
        logger.info("Loading TorchXRayVision DenseNet121 weights …")
        _model = xrv.models.DenseNet(weights="densenet121-res224-all")
        _model.eval()
        logger.info("Model loaded — %d pathology outputs.", len(_model.pathologies))
    return _model


def get_model() -> xrv.models.DenseNet:
    """Public accessor for the loaded model (used by gradcam)."""
    return _get_model()


def preprocess_image(path: Path) -> torch.Tensor:
    """Load a CXR image and return the (1, 1, 224, 224) tensor TorchXRV expects."""
    img = Image.open(path).convert("L")
    img_np = np.array(img, dtype=np.float32)

    # Normalize to [0, 1] then to [-1024, 1024] as TorchXRV expects HU-like range.
    img_np = img_np / 255.0
    img_np = (img_np - 0.5) * 2048.0

    # Resize to 224x224 using xrv utility.
    img_np = img_np[np.newaxis, ...]  # (1, H, W)
    transform = xrv.datasets.XRayCenterCrop()
    img_np = transform(img_np)
    resizer = xrv.datasets.XRayResizer(224)
    img_np = resizer(img_np)

    tensor = torch.from_numpy(img_np).unsqueeze(0)  # (1, 1, 224, 224)
    return tensor


def classify(path: Path) -> ClassificationResult:
    """Run inference on a chest X-ray image and return a simplified label."""
    model = _get_model()
    tensor = preprocess_image(path)

    with torch.no_grad():
        logits = model(tensor)
        probs = torch.sigmoid(logits).squeeze().numpy()

    raw_scores = {p: float(round(probs[i], 4)) for i, p in enumerate(model.pathologies)}

    # Use the trained 3-class logistic regression on the pathology scores.
    label, confidence = classify_3class(raw_scores, list(model.pathologies))

    return ClassificationResult(
        label=label,
        confidence=round(confidence, 4),
        raw_scores=raw_scores,
    )
