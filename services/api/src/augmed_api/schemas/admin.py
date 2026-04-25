from pydantic import BaseModel

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
