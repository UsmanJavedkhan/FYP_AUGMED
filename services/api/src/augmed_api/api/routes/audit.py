"""Admin Audit Logs endpoints."""
import csv
import io

from fastapi import APIRouter, Depends, Query
from fastapi.responses import StreamingResponse
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.models.entities import AuditLog
from augmed_api.schemas.admin import AuditLogListResponse, AuditLogRead

router = APIRouter()


def _to_read(log: AuditLog) -> AuditLogRead:
    return AuditLogRead(
        id=log.id,
        actor=log.actor,
        action=log.action,
        target=log.target,
        created_at=log.created_at,
    )


@router.get("", response_model=AuditLogListResponse)
def list_audit_logs(
    limit: int = Query(default=200, ge=1, le=1000),
    db: Session = Depends(get_db),
) -> AuditLogListResponse:
    logs = db.scalars(
        select(AuditLog).order_by(AuditLog.created_at.desc()).limit(limit)
    ).all()
    return AuditLogListResponse(items=[_to_read(log) for log in logs])


@router.get("/export/csv")
def export_audit_csv(db: Session = Depends(get_db)):
    """Export the full audit trail as a CSV file."""
    logs = db.scalars(select(AuditLog).order_by(AuditLog.created_at.desc())).all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow(["timestamp", "actor", "action", "target"])
    for log in logs:
        writer.writerow([str(log.created_at), log.actor, log.action, log.target])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=augmed-audit-export.csv"},
    )
