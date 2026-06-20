"""Admin operations history (jobs) endpoints."""
from fastapi import APIRouter, Depends
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.models.entities import Job
from augmed_api.schemas.admin import JobListResponse, JobRead

router = APIRouter()


def _to_read(j: Job) -> JobRead:
    return JobRead(
        id=j.id,
        name=j.name,
        type=j.type,
        status=j.status,
        progress=j.progress,
        created_at=j.created_at,
    )


@router.get("", response_model=JobListResponse)
def list_jobs(db: Session = Depends(get_db)) -> JobListResponse:
    jobs = db.scalars(select(Job).order_by(Job.created_at.desc())).all()
    return JobListResponse(items=[_to_read(j) for j in jobs])
