"""DCGAN generator for synthetic *normal* chest X-rays.

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
INIT_CHANNELS = 256
INIT_SPATIAL = 8
OUTPUT_SIZE = 128

CHECKPOINT_PATH = (
    Path(__file__).resolve().parents[3] / "models" / "checkpoints" / "normal_xray_generator.pt"
)


class Generator(nn.Module):
    """Mirrors the layer indices saved in the checkpoint state_dict."""

    def __init__(self, latent_dim: int = LATENT_DIM) -> None:
        super().__init__()
        flat = INIT_CHANNELS * INIT_SPATIAL * INIT_SPATIAL  # 256 * 8 * 8 = 16384

        self.fc = nn.Sequential(
            nn.Linear(latent_dim, flat, bias=False),
            nn.BatchNorm1d(flat),
            nn.LeakyReLU(0.2, inplace=True),
        )

        self.conv_blocks = nn.Sequential(
            nn.ConvTranspose2d(256, 128, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(128),
            nn.LeakyReLU(0.2, inplace=True),
            nn.ConvTranspose2d(128, 64, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(64),
            nn.LeakyReLU(0.2, inplace=True),
            nn.ConvTranspose2d(64, 32, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(32),
            nn.LeakyReLU(0.2, inplace=True),
            nn.ConvTranspose2d(32, 16, kernel_size=4, stride=2, padding=1, bias=False),
            nn.BatchNorm2d(16),
            nn.LeakyReLU(0.2, inplace=True),
            # Final block uses stride=1 (per the training notebook). With
            # kernel=4, stride=1, padding=1 the spatial size grows by ~2,
            # so we crop back to OUTPUT_SIZE in forward().
            nn.ConvTranspose2d(16, 1, kernel_size=4, stride=1, padding=1, bias=True),
            nn.Tanh(),
        )

    def forward(self, z: torch.Tensor) -> torch.Tensor:
        x = self.fc(z)
        x = x.view(-1, INIT_CHANNELS, INIT_SPATIAL, INIT_SPATIAL)
        x = self.conv_blocks(x)
        return x[:, :, :OUTPUT_SIZE, :OUTPUT_SIZE]


_model: Generator | None = None


def _get_model() -> Generator:
    global _model
    if _model is None:
        if not CHECKPOINT_PATH.exists():
            raise FileNotFoundError(
                f"Generator checkpoint not found at {CHECKPOINT_PATH}. "
                "Place the trained weights there before calling generate()."
            )
        logger.info("Loading normal-xray generator weights from %s", CHECKPOINT_PATH)
        model = Generator()
        state_dict = torch.load(CHECKPOINT_PATH, map_location="cpu", weights_only=True)
        model.load_state_dict(state_dict)
        model.eval()
        _model = model
        logger.info("Generator loaded (%d parameters).", sum(p.numel() for p in model.parameters()))
    return _model


@dataclass
class SyntheticImage:
    storage_path: Path
    seed: int
    quality_score: float


def generate_normal_xrays(
    count: int,
    output_dir: Path,
    *,
    seed: int | None = None,
) -> list[SyntheticImage]:
    """Generate *count* synthetic normal chest X-rays as PNG files in *output_dir*.

    A single call samples ``count`` independent latents and writes one 256x256
    grayscale PNG per sample. ``seed`` makes the run reproducible; when None,
    each image gets a freshly-drawn random seed so the run is non-deterministic.

    Returns metadata for each generated file. ``quality_score`` is a cheap
    proxy derived from the sample's standard deviation — the model has no
    discriminator paired with it here, so this is only a UI hint.
    """
    if count < 1:
        raise ValueError("count must be at least 1")

    output_dir.mkdir(parents=True, exist_ok=True)
    model = _get_model()

    if seed is not None:
        # Deterministic batch from a single base seed.
        generator = torch.Generator().manual_seed(int(seed))
        per_image_seeds = [int(seed) + i for i in range(count)]
        z = torch.randn(count, LATENT_DIM, generator=generator)
    else:
        # Non-deterministic — but record the seed each image was drawn from
        # so the user can reproduce a single sample later if they want to.
        per_image_seeds = [int(torch.randint(0, 2**31 - 1, (1,)).item()) for _ in range(count)]
        zs = []
        for s in per_image_seeds:
            g = torch.Generator().manual_seed(s)
            zs.append(torch.randn(1, LATENT_DIM, generator=g))
        z = torch.cat(zs, dim=0)

    with torch.no_grad():
        fake = model(z)  # (B, 1, 256, 256), tanh in [-1, 1]

    # Map [-1, 1] -> [0, 255] uint8.
    images = ((fake.clamp(-1.0, 1.0) + 1.0) * 127.5).to(torch.uint8).cpu().numpy()

    results: list[SyntheticImage] = []
    for i, arr in enumerate(images):
        gray = arr[0]  # (256, 256)
        img = Image.fromarray(gray, mode="L")
        filename = f"synthetic-normal-{uuid4().hex[:12]}.png"
        path = output_dir / filename
        img.save(path, format="PNG", optimize=True)

        # Cheap proxy: how much spatial variance there is in the sample.
        std = float(np.std(gray.astype(np.float32) / 255.0))
        quality = max(0.0, min(1.0, std * 3.0))

        results.append(
            SyntheticImage(
                storage_path=path,
                seed=per_image_seeds[i],
                quality_score=round(quality, 4),
            )
        )

    return results
