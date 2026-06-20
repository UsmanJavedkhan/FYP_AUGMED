"""Synthetic chest X-ray generation endpoints.

The bundled checkpoint only generates *normal* (Healthy) X-rays — pneumonia,
TB, COVID-19 etc. are not modelled. Requests for any other target class are
rejected here with a 400.
"""
from __future__ import annotations

import io
import logging
import zipfile

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field
from sqlalchemy.orm import Session

from augmed_api.core.activity import record_job
from augmed_api.core.database import get_db
from augmed_api.core.storage import ensure_storage_directories, storage_url_for

logger = logging.getLogger(__name__)
router = APIRouter()

SUPPORTED_CLASSES = {"Healthy", "Normal"}

# Dataset buckets surfaced on the clinician Datasets page. Only Healthy has a
# trained GAN today; TB and Pneumonia are placeholders until their models land.
# `aliases` are the filename tokens (synthetic-<token>-<hex>.png) that map here.
CLASS_DATASETS = [
    {"key": "Healthy", "label": "Healthy", "aliases": ("normal", "healthy"), "model_available": True},
    {"key": "Pneumonia", "label": "Pneumonia", "aliases": ("pneumonia", "pneu"), "model_available": False},
    {"key": "Tuberculosis", "label": "Tuberculosis", "aliases": ("tb", "tuberculosis"), "model_available": False},
]

# filename token (synthetic-<token>-<hex>.png) -> dataset class key
_ALIAS_TO_KEY = {alias: d["key"] for d in CLASS_DATASETS for alias in d["aliases"]}


def _classify(path) -> str | None:
    """Return the dataset class for a synthetic file, or None if unrecognised."""
    parts = path.stem.split("-")  # e.g. ["synthetic", "normal", "<hex>"]
    if len(parts) < 2 or parts[0] != "synthetic":
        return None
    return _ALIAS_TO_KEY.get(parts[1].lower())


class GenerateRequest(BaseModel):
    target_class: str = Field(default="Healthy")
    count: int = Field(default=4, ge=1, le=32)
    seed: int | None = None
    guidance: float | None = None  # accepted for forward-compat; ignored by this DCGAN


class GenerateItem(BaseModel):
    id: str
    class_: str = Field(alias="class")
    seed: int
    quality_score: float
    image_url: str | None
    storage_path: str

    model_config = {"populate_by_name": True}


class GenerateResponse(BaseModel):
    items: list[GenerateItem]
    model_name: str
    model_version: str


@router.post("/generate", response_model=GenerateResponse)
def generate(payload: GenerateRequest, db: Session = Depends(get_db)) -> GenerateResponse:
    if payload.target_class not in SUPPORTED_CLASSES:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=(
                f"This generator only produces normal/healthy chest X-rays. "
                f"Requested class '{payload.target_class}' is not supported."
            ),
        )

    try:
        from augmed_api.ml.synth_generator import generate_normal_xrays
    except ImportError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=f"Generator dependencies not installed: {exc}",
        ) from exc

    paths = ensure_storage_directories()
    try:
        results = generate_normal_xrays(
            count=payload.count,
            output_dir=paths.synthetic,
            seed=payload.seed,
        )
    except FileNotFoundError as exc:
        raise HTTPException(
            status_code=status.HTTP_503_SERVICE_UNAVAILABLE,
            detail=str(exc),
        ) from exc
    except Exception as exc:
        logger.exception("Synthetic generation failed")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Generation failed: {exc}",
        ) from exc

    items = [
        GenerateItem(
            id=r.storage_path.stem,
            **{"class": "Healthy"},
            seed=r.seed,
            quality_score=r.quality_score,
            image_url=storage_url_for(r.storage_path),
            storage_path=str(r.storage_path),
        )
        for r in results
    ]

    record_job(
        db,
        name=f"Synthetic batch ({len(items)} images)",
        type="synthetic",
        status="completed",
        progress=100,
    )
    db.commit()

    return GenerateResponse(
        items=items,
        model_name="Normal CXR DCGAN",
        model_version="v1-128x128-grayscale",
    )


class GalleryImage(BaseModel):
    id: str
    class_: str = Field(alias="class")
    image_url: str | None

    model_config = {"populate_by_name": True}


class GalleryDataset(BaseModel):
    class_: str = Field(alias="class")
    label: str
    model_available: bool
    count: int
    images: list[GalleryImage]

    model_config = {"populate_by_name": True}


class GalleryResponse(BaseModel):
    datasets: list[GalleryDataset]


@router.get("/gallery", response_model=GalleryResponse)
def gallery() -> GalleryResponse:
    """List previously generated synthetic X-rays, bucketed by class.

    Every PNG the generator drops in the synthetic storage folder is named
    ``synthetic-<class>-<hex>.png``; we read that token to assign each image to
    its dataset. New generations show up here the next time the page loads.
    """
    paths = ensure_storage_directories()

    buckets: dict[str, list[GalleryImage]] = {d["key"]: [] for d in CLASS_DATASETS}

    files = [
        p for p in paths.synthetic.iterdir()
        if p.is_file() and p.suffix.lower() == ".png"
    ]
    # Newest first so the most recent generations lead each bucket.
    files.sort(key=lambda p: p.stat().st_mtime, reverse=True)

    for path in files:
        key = _classify(path)
        if key is None:
            continue
        buckets[key].append(
            GalleryImage(id=path.stem, image_url=storage_url_for(path), **{"class": key})
        )

    datasets = [
        GalleryDataset(
            label=d["label"],
            model_available=d["model_available"],
            count=len(buckets[d["key"]]),
            images=buckets[d["key"]],
            **{"class": d["key"]},
        )
        for d in CLASS_DATASETS
    ]
    return GalleryResponse(datasets=datasets)


@router.get("/gallery/download")
def download_gallery():
    """Bundle every generated synthetic X-ray into a single ZIP.

    Images are organised into one folder per class inside the archive, so the
    combined dataset stays sorted (Healthy/, Pneumonia/, Tuberculosis/).
    """
    paths = ensure_storage_directories()

    members: list[tuple[str, object]] = []
    for path in sorted(paths.synthetic.glob("*.png")):
        key = _classify(path)
        if key is None:
            continue
        members.append((f"{key}/{path.name}", path))

    if not members:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No synthetic images have been generated yet.",
        )

    buffer = io.BytesIO()
    with zipfile.ZipFile(buffer, "w", zipfile.ZIP_DEFLATED) as archive:
        for arcname, path in members:
            archive.write(path, arcname=arcname)
    buffer.seek(0)

    return StreamingResponse(
        iter([buffer.getvalue()]),
        media_type="application/zip",
        headers={"Content-Disposition": "attachment; filename=augmed-synthetic-datasets.zip"},
    )
