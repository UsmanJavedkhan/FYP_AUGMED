"""Orchestrator that runs the full ML pipeline: classify, enhance, grad-cam.

Falls back to the Pillow-based placeholders when ML deps are unavailable,
so the app still boots and works in pure-demo mode.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path

logger = logging.getLogger(__name__)

_ML_AVAILABLE: bool | None = None


def _check_ml() -> bool:
    global _ML_AVAILABLE
    if _ML_AVAILABLE is None:
        try:
            import torch  # noqa: F401
            import torchxrayvision  # noqa: F401

            _ML_AVAILABLE = True
            logger.info("ML pipeline available (torch + torchxrayvision loaded).")
        except ImportError:
            _ML_AVAILABLE = False
            logger.warning("ML deps not installed — using Pillow placeholder pipeline.")
    return _ML_AVAILABLE


@dataclass
class PipelineResult:
    label: str
    confidence: float
    model_name: str
    model_version: str
    enhanced_technique: str
    heatmap_method: str


def run(
    source: Path,
    enhanced_dest: Path,
    heatmap_dest: Path,
    *,
    filename: str = "",
) -> PipelineResult:
    """Run the full inference + enhancement + heatmap pipeline on *source*.

    Returns metadata about the results. The actual image artifacts are written
    to *enhanced_dest* and *heatmap_dest*.
    """
    if _check_ml():
        return _run_real(source, enhanced_dest, heatmap_dest)
    return _run_placeholder(source, enhanced_dest, heatmap_dest, filename=filename)


def _run_real(source: Path, enhanced_dest: Path, heatmap_dest: Path) -> PipelineResult:
    from augmed_api.ml.classifier import classify
    from augmed_api.ml.enhance import enhance_clahe
    from augmed_api.ml.gradcam import generate_gradcam

    result = classify(source)
    enhance_clahe(source, enhanced_dest)
    generate_gradcam(source, heatmap_dest)

    return PipelineResult(
        label=result.label,
        confidence=result.confidence,
        model_name=result.model_name,
        model_version=result.model_version,
        enhanced_technique="CLAHE+median",
        heatmap_method="GradCAM-DenseNet121",
    )


def _run_placeholder(
    source: Path,
    enhanced_dest: Path,
    heatmap_dest: Path,
    *,
    filename: str = "",
) -> PipelineResult:
    from augmed_api.core.imaging import enhance_xray, generate_heatmap

    # Reuse the old filename-based heuristic for the placeholder label.
    lowered = filename.lower()
    if "tb" in lowered or "tuberculosis" in lowered:
        label, confidence, focus = "Tuberculosis", 0.88, "upper"
    elif "pneu" in lowered:
        label, confidence, focus = "Pneumonia", 0.91, "lower"
    else:
        label, confidence, focus = "Healthy", 0.74, "center"

    enhance_xray(source, enhanced_dest)
    generate_heatmap(source, heatmap_dest, focus=focus)

    return PipelineResult(
        label=label,
        confidence=confidence,
        model_name="AugMed Baseline",
        model_version="0.1-demo",
        enhanced_technique="equalize+autocontrast+median",
        heatmap_method="grad-cam-demo",
    )
