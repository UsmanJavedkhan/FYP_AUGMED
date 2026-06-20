"""Grad-CAM heatmap generation for the TorchXRayVision DenseNet121 model."""
from __future__ import annotations

import logging
from pathlib import Path

import cv2
import numpy as np
import torch
from pytorch_grad_cam import GradCAM
from pytorch_grad_cam.utils.image import show_cam_on_image

from augmed_api.ml.classifier import get_model, preprocess_image

logger = logging.getLogger(__name__)


def generate_gradcam(source: Path, destination: Path) -> None:
    """Generate a Grad-CAM heatmap overlay and save it as a PNG.

    """
    model = get_model()
    tensor = preprocess_image(source)

    # Target layer: last block in the DenseNet features.
    target_layer = model.features.denseblock4  # type: ignore[attr-defined]

    # Find the class with the highest activation to explain.
    with torch.no_grad():
        logits = model(tensor)
        probs = torch.sigmoid(logits).squeeze()
        target_idx = int(probs.argmax())

    class _Target:
        def __init__(self, category: int):
            self.category = category

        def __call__(self, model_output: torch.Tensor) -> torch.Tensor:
            if model_output.dim() == 1:
                return model_output[self.category]
            return model_output[:, self.category]

    cam = GradCAM(model=model, target_layers=[target_layer])
    grayscale_cam = cam(input_tensor=tensor, targets=[_Target(target_idx)])
    grayscale_cam = grayscale_cam[0]  # (224, 224)

    # Build the overlay on the original image at its native resolution.
    original = cv2.imread(str(source), cv2.IMREAD_COLOR)
    if original is None:
        # Fallback: read via PIL and convert.
        from PIL import Image

        pil_img = Image.open(source).convert("RGB")
        original = np.array(pil_img)[:, :, ::-1]  # RGB → BGR

    h, w = original.shape[:2]
    cam_resized = cv2.resize(grayscale_cam, (w, h))

    # Normalize original to [0, 1] float for the overlay function.
    original_rgb = cv2.cvtColor(original, cv2.COLOR_BGR2RGB).astype(np.float32) / 255.0
    overlay = show_cam_on_image(original_rgb, cam_resized, use_rgb=True)

    cv2.imwrite(str(destination), cv2.cvtColor(overlay, cv2.COLOR_RGB2BGR))
    logger.info("Grad-CAM heatmap saved to %s", destination)
