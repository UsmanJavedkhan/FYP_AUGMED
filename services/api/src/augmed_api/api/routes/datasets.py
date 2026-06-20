"""Admin Datasets registry endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.models.entities import Dataset
from augmed_api.schemas.admin import DatasetCreate, DatasetListResponse, DatasetRead

router = APIRouter()


def _to_read(d: Dataset) -> DatasetRead:
    return DatasetRead(
        id=d.id,
        name=d.name,
        source=d.source,
        source_url=d.source_url,
        item_count=d.item_count,
        status=d.status,
        updated_at=d.updated_at,
    )


@router.get("", response_model=DatasetListResponse)
def list_datasets(db: Session = Depends(get_db)) -> DatasetListResponse:
    datasets = db.scalars(select(Dataset).order_by(Dataset.updated_at.desc())).all()
    return DatasetListResponse(items=[_to_read(d) for d in datasets])


@router.post("", response_model=DatasetRead, status_code=status.HTTP_201_CREATED)
def create_dataset(payload: DatasetCreate, db: Session = Depends(get_db)) -> DatasetRead:
    dataset = Dataset(
        name=payload.name,
        source=payload.source,
        source_url=(payload.source_url.strip() or None) if payload.source_url else None,
        item_count=payload.item_count,
        status="active",
    )
    db.add(dataset)
    db.commit()
    db.refresh(dataset)
    return _to_read(dataset)


@router.delete("/{dataset_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_dataset(dataset_id: int, db: Session = Depends(get_db)) -> None:
    dataset = db.get(Dataset, dataset_id)
    if not dataset:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Dataset not found.")
    db.delete(dataset)
    db.commit()
