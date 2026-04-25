from datetime import datetime

from pydantic import BaseModel, Field


class UploadedImageSummary(BaseModel):
    filename: str
    storage_path: str
    url: str | None = None
    content_type: str
    size_bytes: int
    width: int | None = None
    height: int | None = None


class ArtifactSummary(BaseModel):
    url: str | None = None
    storage_path: str
    technique: str | None = None
    method: str | None = None


class PredictionSummary(BaseModel):
    label: str
    confidence: float
    model_name: str
    model_version: str
    status: str
    created_at: datetime


class ReviewSummary(BaseModel):
    reviewer_name: str
    decision: str
    corrected_label: str | None = None
    comments: str | None = None
    reviewed_at: datetime


class ReportSummary(BaseModel):
    status: str
    path: str
    generated_at: datetime | None = None


class CaseDetail(BaseModel):
    id: str
    patient_reference: str | None = None
    status: str
    modality: str
    created_at: datetime
    updated_at: datetime
    notes: str | None = None
    uploaded_image: UploadedImageSummary | None = None
    enhanced_image: ArtifactSummary | None = None
    heatmap: ArtifactSummary | None = None
    prediction: PredictionSummary | None = None
    review: ReviewSummary | None = None
    report: ReportSummary | None = None


class CaseResponse(BaseModel):
    item: CaseDetail


class CaseListResponse(BaseModel):
    items: list[CaseDetail]


class ReviewRequest(BaseModel):
    reviewer_name: str = Field(min_length=2, max_length=120)
    decision: str = Field(pattern="^(approved|rejected|corrected)$")
    corrected_label: str | None = None
    comments: str | None = Field(default=None, max_length=1000)
