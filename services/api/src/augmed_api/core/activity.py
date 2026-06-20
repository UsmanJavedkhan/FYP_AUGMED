"""Small helpers to record audit-log and background-job rows.

These keep the Audit Logs and Background Jobs admin pages populated from
real activity. The caller owns the transaction — these only add() the row,
they do not commit.
"""
from __future__ import annotations

from sqlalchemy.orm import Session

from augmed_api.models.entities import AuditLog, Job


def record_audit(db: Session, *, actor: str, action: str, target: str = "-") -> None:
    db.add(AuditLog(actor=actor, action=action, target=target))


def record_job(
    db: Session,
    *,
    name: str,
    type: str,
    status: str = "completed",
    progress: int = 100,
) -> None:
    db.add(Job(name=name, type=type, status=status, progress=progress))
