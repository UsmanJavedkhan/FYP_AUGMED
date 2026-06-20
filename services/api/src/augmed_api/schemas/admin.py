from datetime import datetime

from pydantic import BaseModel, Field

from augmed_api.schemas.case import CaseDetail


class AdminSummaryMetrics(BaseModel):
    total_cases: int
    pending_reviews: int
    active_users: int
    ready_reports: int


class QueueState(BaseModel):
    name: str
    status: str
    backlog: int


class StorageBucket(BaseModel):
    name: str
    path: str
    file_count: int


class AdminSummary(BaseModel):
    metrics: AdminSummaryMetrics
    queues: list[QueueState]
    storage: list[StorageBucket]
    recent_cases: list[CaseDetail]


# ---------- Datasets ----------
class DatasetRead(BaseModel):
    id: int
    name: str
    source: str
    source_url: str | None = None
    item_count: int
    status: str
    updated_at: datetime


class DatasetCreate(BaseModel):
    name: str = Field(min_length=2, max_length=150)
    source: str = Field(min_length=1, max_length=120)
    source_url: str | None = Field(default=None, max_length=500)
    item_count: int = Field(default=0, ge=0)


class DatasetListResponse(BaseModel):
    items: list[DatasetRead]


# ---------- Model registry ----------
class ModelRead(BaseModel):
    id: int
    name: str
    version: str
    framework: str
    accuracy: float
    status: str


class ModelListResponse(BaseModel):
    items: list[ModelRead]


# ---------- Background jobs ----------
class JobRead(BaseModel):
    id: int
    name: str
    type: str
    status: str
    progress: int
    created_at: datetime


class JobListResponse(BaseModel):
    items: list[JobRead]


# ---------- Audit logs ----------
class AuditLogRead(BaseModel):
    id: int
    actor: str
    action: str
    target: str
    created_at: datetime


class AuditLogListResponse(BaseModel):
    items: list[AuditLogRead]
