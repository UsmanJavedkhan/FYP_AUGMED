from fastapi import APIRouter, Depends
from sqlalchemy import func, select
from sqlalchemy.orm import Session, joinedload

from augmed_api.api.routes.cases import case_to_schema
from augmed_api.core.database import get_db
from augmed_api.core.storage import storage_summary
from augmed_api.models.entities import Case, User
from augmed_api.schemas.admin import AdminSummary, AdminSummaryMetrics, QueueState, StorageBucket

router = APIRouter()


@router.get("/summary", response_model=AdminSummary)
def get_admin_summary(db: Session = Depends(get_db)) -> AdminSummary:
    total_cases = db.scalar(select(func.count()).select_from(Case)) or 0
    pending_reviews = db.scalar(select(func.count()).select_from(Case).where(Case.status == "review_pending")) or 0
    active_users = db.scalar(select(func.count()).select_from(User).where(User.is_active.is_(True))) or 0
    ready_reports = db.scalar(select(func.count()).select_from(Case).where(Case.status == "reviewed")) or 0

    recent_cases = db.scalars(
        select(Case)
        .options(
            joinedload(Case.uploaded_images),
            joinedload(Case.predictions),
            joinedload(Case.reviews),
            joinedload(Case.reports),
        )
        .order_by(Case.created_at.desc())
        .limit(6)
    ).unique().all()

    storage = storage_summary()
    storage_rows = [
        StorageBucket(name=item["name"], path=item["path"], file_count=item["file_count"])
        for item in storage["buckets"]
    ]

    queue_rows = [
        QueueState(name="classification", status="ready", backlog=max(pending_reviews - 1, 0)),
        QueueState(name="explainability", status="planned", backlog=pending_reviews),
        QueueState(name="reporting", status="ready", backlog=max(total_cases - ready_reports, 0)),
    ]

    return AdminSummary(
        metrics=AdminSummaryMetrics(
            total_cases=total_cases,
            pending_reviews=pending_reviews,
            active_users=active_users,
            ready_reports=ready_reports,
        ),
        queues=queue_rows,
        storage=storage_rows,
        recent_cases=[case_to_schema(case) for case in recent_cases],
    )
