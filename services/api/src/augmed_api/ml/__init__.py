"""Real ML pipeline for AugMed chest X-ray analysis.

Modules:
    classifier — TorchXRayVision DenseNet121 inference
    gradcam    — Grad-CAM heatmap generation
    enhance    — OpenCV CLAHE enhancement
    pipeline   — Orchestrator that runs all three steps
"""
