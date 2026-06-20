"""Admin Background Jobs endpoints."""
from fastapi import APIRouter, Depends, HTTPException, status
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


@router.post("/{job_id}/retry", response_model=JobRead)
def retry_job(job_id: int, db: Session = Depends(get_db)) -> JobRead:
    """Re-queue a failed job."""
    job = db.get(Job, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found.")
    if job.status != "failed":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only failed jobs can be retried.",
        )
    job.status = "queued"
    job.progress = 0
    db.commit()
    db.refresh(job)
    return _to_read(job)
