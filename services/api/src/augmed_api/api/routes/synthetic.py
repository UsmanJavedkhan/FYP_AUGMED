"""Synthetic chest X-ray generation endpoints.

The bundled checkpoint only generates *normal* (Healthy) X-rays — pneumonia,
TB, COVID-19 etc. are not modelled. Requests for any other target class are
rejected here with a 400.
"""
from __future__ import annotations

import logging

from fastapi import APIRouter, HTTPException, status
from pydantic import BaseModel, Field

from augmed_api.core.storage import ensure_storage_directories, storage_url_for

logger = logging.getLogger(__name__)
router = APIRouter()

SUPPORTED_CLASSES = {"Healthy", "Normal"}


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
def generate(payload: GenerateRequest) -> GenerateResponse:
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

    return GenerateResponse(
        items=items,
        model_name="Normal CXR DCGAN",
        model_version="v1-128x128-grayscale",
    )
