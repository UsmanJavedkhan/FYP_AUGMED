"""Admin Model Registry endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.models.entities import ModelVersion
from augmed_api.schemas.admin import ModelListResponse, ModelRead

router = APIRouter()


def _to_read(m: ModelVersion) -> ModelRead:
    return ModelRead(
        id=m.id,
        name=m.name,
        version=m.version,
        framework=m.framework,
        accuracy=m.accuracy,
        status=m.status,
    )


@router.get("", response_model=ModelListResponse)
def list_models(db: Session = Depends(get_db)) -> ModelListResponse:
    models = db.scalars(select(ModelVersion).order_by(ModelVersion.created_at.desc())).all()
    return ModelListResponse(items=[_to_read(m) for m in models])
