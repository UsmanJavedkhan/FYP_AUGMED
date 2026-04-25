from fastapi import APIRouter, Depends
from sqlalchemy import text
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.core.storage import storage_summary

router = APIRouter()


@router.get("/health")
def get_health(db: Session = Depends(get_db)) -> dict[str, object]:
    db.execute(text("SELECT 1"))
    return {
        "status": "ready",
        "database": "connected",
        "storage": storage_summary(),
    }
