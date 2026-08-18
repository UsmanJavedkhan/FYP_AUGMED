"""DCGAN generators for synthetic chest X-rays (Healthy / TB / Pneumonia).

Each class has its own trained generator checkpoint under
``services/api/models/checkpoints``. The checkpoints are training snapshots
(dicts with a ``generator_state_dict``), so we load that into the matching
architecture below.
"""
from __future__ import annotations

import logging
from dataclasses import dataclass
from pathlib import Path
from uuid import uuid4

import numpy as np
import torch
from PIL import Image
from torch import nn

logger = logging.getLogger(__name__)

LATENT_DIM = 100
OUTPUT_SIZE = 128

_CHECKPOINT_DIR = Path(__file__).resolve().parents[3] / "models" / "checkpoints"

# canonical class -> (checkpoint filename, filename token used in saved images).
# The token must match what the gallery uses to bucket images:
# synthetic-<token>-<hex>.png  (normal->Healthy, tb->Tuberculosis, pneumonia->Pneumonia)
_CLASS_CONFIG: dict[str, tuple[str, str]] = {
    "Healthy": ("Normal_new_gan_checkpoint.pth", "normal"),
    "Tuberculosis": ("TB_new_gan_checkpoint.pth", "tb"),
    "Pneumonia": ("pneumonia_new_gan_checkpoint.pth", "pneumonia"),
}

# accepted aliases for an incoming target_class string
_CLASS_ALIASES = {
    "healthy": "Healthy", "normal": "Healthy",
    "tuberculosis": "Tuberculosis", "tb": "Tuberculosis",
    "pneumonia": "Pneumonia", "pneu": "Pneumonia",
}


class Generator(nn.Module):
    """DCGAN generator matching the *_new_gan_checkpoint.pth weights.

    fc: latent(100) -> 256*8*8, then four stride-2 ConvTranspose blocks
    (8->16->32->64->128) and a final 3x3 Conv to a single channel + Tanh.
    """

    def __init__(self, latent_dim: int = LATENT_DIM) -> None:
        super().__init__()
        flat = 256 * 8 * 8  # 16384

        self.fc = nn.Sequential(
            nn.Linear(latent_dim, flat, bias=False),
            nn.BatchNorm1d(flat),
            nn.ReLU(True),
        )
        self.conv_blocks = nn.Sequential(
            nn.ConvTranspose2d(256, 128, 4, 2, 1, bias=False), nn.BatchNorm2d(128), nn.ReLU(True),
            nn.ConvTranspose2d(128, 64, 4, 2, 1, bias=False),  nn.BatchNorm2d(64),  nn.ReLU(True),
            nn.ConvTranspose2d(64, 32, 4, 2, 1, bias=False),   nn.BatchNorm2d(32),  nn.ReLU(True),
            nn.ConvTranspose2d(32, 16, 4, 2, 1, bias=False),   nn.BatchNorm2d(16),  nn.ReLU(True),
            nn.Conv2d(16, 1, 3, 1, 1),
            nn.Tanh(),
        )

    def forward(self, z: torch.Tensor) -> torch.Tensor:
        x = self.fc(z).view(-1, 256, 8, 8)
        return self.conv_blocks(x)


_models: dict[str, Generator] = {}


def normalise_class(target_class: str) -> str:
    """Map an incoming class string to a canonical key, or raise ValueError."""
    key = _CLASS_ALIASES.get((target_class or "").strip().lower())
    if key is None:
        raise ValueError(
            f"Unsupported target class '{target_class}'. "
            f"Supported: {', '.join(_CLASS_CONFIG)}."
        )
    return key


def _get_model(class_key: str) -> Generator:
    if class_key not in _models:
        filename, _token = _CLASS_CONFIG[class_key]
        path = _CHECKPOINT_DIR / filename
        if not path.exists():
            raise FileNotFoundError(
                f"{class_key} generator checkpoint not found at {path}. "
                "Place the trained weights there before generating."
            )
        logger.info("Loading %s generator from %s", class_key, path)
        # weights_only=False: these are our own trusted training checkpoints
        # (dicts holding generator/discriminator/optimizer state).
        checkpoint = torch.load(path, map_location="cpu", weights_only=False)
        state_dict = (
            checkpoint["generator_state_dict"]
            if isinstance(checkpoint, dict) and "generator_state_dict" in checkpoint
            else checkpoint
        )
        model = Generator()
        model.load_state_dict(state_dict)
        model.eval()
        _models[class_key] = model
        epoch = checkpoint.get("epoch") if isinstance(checkpoint, dict) else "?"
        logger.info("%s generator loaded (epoch %s).", class_key, epoch)
    return _models[class_key]


@dataclass
class SyntheticImage:
    storage_path: Path
    seed: int
    quality_score: float


def generate_xrays(
    target_class: str,
    count: int,
    output_dir: Path,
    *,
    seed: int | None = None,
) -> list[SyntheticImage]:
    """Generate *count* synthetic X-rays for *target_class* as PNGs in *output_dir*.

    Files are named ``synthetic-<token>-<hex>.png`` so the Datasets gallery can
    bucket them by class. ``seed`` makes the run reproducible; when None each
    image draws its own random seed (recorded for later reproduction).
    """
    if count < 1:
        raise ValueError("count must be at least 1")

    class_key = normalise_class(target_class)
    _filename, token = _CLASS_CONFIG[class_key]
    output_dir.mkdir(parents=True, exist_ok=True)
    model = _get_model(class_key)

    if seed is not None:
        generator = torch.Generator().manual_seed(int(seed))
        per_image_seeds = [int(seed) + i for i in range(count)]
        z = torch.randn(count, LATENT_DIM, generator=generator)
    else:
        per_image_seeds = [int(torch.randint(0, 2**31 - 1, (1,)).item()) for _ in range(count)]
        zs = []
        for s in per_image_seeds:
            g = torch.Generator().manual_seed(s)
            zs.append(torch.randn(1, LATENT_DIM, generator=g))
        z = torch.cat(zs, dim=0)

    with torch.no_grad():
        fake = model(z)  # (B, 1, 128, 128), tanh in [-1, 1]

    images = ((fake.clamp(-1.0, 1.0) + 1.0) * 127.5).to(torch.uint8).cpu().numpy()

    results: list[SyntheticImage] = []
    for i, arr in enumerate(images):
        gray = arr[0]
        img = Image.fromarray(gray, mode="L")
        filename = f"synthetic-{token}-{uuid4().hex[:12]}.png"
        path = output_dir / filename
        img.save(path, format="PNG", optimize=True)

        std = float(np.std(gray.astype(np.float32) / 255.0))
        quality = max(0.0, min(1.0, std * 3.0))
        results.append(
            SyntheticImage(storage_path=path, seed=per_image_seeds[i], quality_score=round(quality, 4))
        )

    return results
