import csv
import io
from datetime import UTC, datetime
from io import BytesIO
from pathlib import Path
from uuid import uuid4

from fastapi import APIRouter, Depends, File, Form, HTTPException, Query, UploadFile, status
from fastapi.responses import FileResponse, StreamingResponse
from PIL import Image, UnidentifiedImageError
from sqlalchemy import select
from sqlalchemy.orm import Session, joinedload

from augmed_api.core.activity import record_audit, record_job
from augmed_api.core.config import settings
from augmed_api.core.database import get_db
from augmed_api.core.security import get_current_user
from augmed_api.core.storage import ensure_storage_directories, storage_url_for
from augmed_api.ml.pipeline import run as run_ml_pipeline
from augmed_api.models.entities import (
    Case,
    EnhancedImage,
    ExpertReview,
    ExplanationHeatmap,
    Prediction,
    Report,
    UploadedImage,
    User,
)
from augmed_api.schemas.case import CaseDetail, CaseListResponse, CaseResponse, ReviewRequest

router = APIRouter()

ALLOWED_IMAGE_TYPES = {"image/png", "image/jpeg", "image/jpg"}

_CASE_LOAD_OPTIONS = (
    joinedload(Case.uploaded_images),
    joinedload(Case.enhanced_images),
    joinedload(Case.heatmaps),
    joinedload(Case.predictions),
    joinedload(Case.reviews),
    joinedload(Case.reports),
)



def case_to_schema(case: Case) -> CaseDetail:
    latest_prediction = case.predictions[-1] if case.predictions else None
    latest_review = case.reviews[-1] if case.reviews else None
    latest_report = case.reports[-1] if case.reports else None
    uploaded_image = case.uploaded_images[-1] if case.uploaded_images else None
    enhanced_image = case.enhanced_images[-1] if case.enhanced_images else None
    heatmap = case.heatmaps[-1] if case.heatmaps else None

    return CaseDetail(
        id=str(case.id),
        patient_reference=case.patient_reference,
        status=case.status,
        modality=case.modality,
        created_at=case.created_at,
        updated_at=case.updated_at,
        notes=case.notes,
        uploaded_image=(
            {
                "filename": uploaded_image.original_filename,
                "storage_path": uploaded_image.storage_path,
                "url": storage_url_for(uploaded_image.storage_path),
                "content_type": uploaded_image.content_type,
                "size_bytes": uploaded_image.size_bytes,
                "width": uploaded_image.width,
                "height": uploaded_image.height,
            }
            if uploaded_image
            else None
        ),
        enhanced_image=(
            {
                "url": storage_url_for(enhanced_image.storage_path),
                "storage_path": enhanced_image.storage_path,
                "technique": enhanced_image.technique,
                "method": None,
            }
            if enhanced_image
            else None
        ),
        heatmap=(
            {
                "url": storage_url_for(heatmap.storage_path),
                "storage_path": heatmap.storage_path,
                "technique": None,
                "method": heatmap.method,
            }
            if heatmap
            else None
        ),
        prediction=(
            {
                "label": latest_prediction.label,
                "confidence": latest_prediction.confidence,
                "model_name": latest_prediction.model_name,
                "model_version": latest_prediction.model_version,
                "status": latest_prediction.status,
                "created_at": latest_prediction.created_at,
            }
            if latest_prediction
            else None
        ),
        review=(
            {
                "reviewer_name": latest_review.reviewer_name,
                "decision": latest_review.decision,
                "corrected_label": latest_review.corrected_label,
                "comments": latest_review.comments,
                "reviewed_at": latest_review.reviewed_at,
            }
            if latest_review
            else None
        ),
        report=(
            {
                "status": latest_report.status,
                "path": latest_report.path,
                "generated_at": latest_report.generated_at,
            }
            if latest_report
            else None
        ),
    )


@router.get("", response_model=CaseListResponse)
def list_cases(db: Session = Depends(get_db)) -> CaseListResponse:
    statement = select(Case).options(*_CASE_LOAD_OPTIONS).order_by(Case.created_at.desc())
    cases = db.scalars(statement).unique().all()
    return CaseListResponse(items=[case_to_schema(case) for case in cases])


@router.get("/export/csv")
def export_cases_csv(
    date_from: str | None = Query(default=None, description="ISO date, e.g. 2025-01-01"),
    date_to: str | None = Query(default=None, description="ISO date, e.g. 2025-12-31"),
    db: Session = Depends(get_db),
):
    """Export the case list as a CSV file, optionally filtered by date range."""
    statement = select(Case).options(*_CASE_LOAD_OPTIONS).order_by(Case.created_at.desc())

    if date_from:
        statement = statement.where(Case.created_at >= datetime.fromisoformat(date_from))
    if date_to:
        dt_to = datetime.fromisoformat(date_to).replace(hour=23, minute=59, second=59)
        statement = statement.where(Case.created_at <= dt_to)

    cases = db.scalars(statement).unique().all()

    output = io.StringIO()
    writer = csv.writer(output)
    writer.writerow([
        "case_id", "patient_reference", "status", "modality",
        "prediction_label", "prediction_confidence", "model_name", "model_version",
        "review_decision", "reviewer_name", "created_at", "updated_at",
    ])

    for case in cases:
        pred = case.predictions[-1] if case.predictions else None
        review = case.reviews[-1] if case.reviews else None
        writer.writerow([
            case.id,
            case.patient_reference or "",
            case.status,
            case.modality,
            pred.label if pred else "",
            f"{pred.confidence:.4f}" if pred else "",
            pred.model_name if pred else "",
            pred.model_version if pred else "",
            review.decision if review else "",
            review.reviewer_name if review else "",
            str(case.created_at),
            str(case.updated_at),
        ])

    output.seek(0)
    return StreamingResponse(
        iter([output.getvalue()]),
        media_type="text/csv",
        headers={"Content-Disposition": "attachment; filename=augmed-cases-export.csv"},
    )


@router.get("/{case_id}", response_model=CaseResponse)
def get_case(case_id: str, db: Session = Depends(get_db)) -> CaseResponse:
    statement = select(Case).options(*_CASE_LOAD_OPTIONS).where(Case.id == case_id)
    case = db.scalars(statement).unique().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")
    return CaseResponse(item=case_to_schema(case))


@router.post("/upload", response_model=CaseResponse, status_code=status.HTTP_201_CREATED)
async def upload_case(
    file: UploadFile = File(...),
    patient_reference: str | None = Form(default=None),
    notes: str | None = Form(default=None),
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> CaseResponse:
    if file.content_type not in ALLOWED_IMAGE_TYPES:
        raise HTTPException(
            status_code=status.HTTP_415_UNSUPPORTED_MEDIA_TYPE,
            detail="Only PNG and JPEG uploads are supported right now.",
        )

    payload = await file.read()
    if not payload:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Uploaded file is empty.")
    if len(payload) > settings.upload_max_mb * 1024 * 1024:
        raise HTTPException(
            status_code=status.HTTP_413_REQUEST_ENTITY_TOO_LARGE,
            detail=f"Upload exceeds the {settings.upload_max_mb} MB limit.",
        )

    try:
        with Image.open(BytesIO(payload)) as image:
            width, height = image.size
    except UnidentifiedImageError as exc:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Invalid image payload.") from exc

    paths = ensure_storage_directories()
    case_id = str(uuid4())
    extension = Path(file.filename or "scan.png").suffix.lower() or ".png"
    stored_filename = f"{case_id}{extension}"
    stored_path = paths.uploads / stored_filename
    stored_path.write_bytes(payload)

    enhanced_path = paths.artifacts / f"{case_id}_enhanced.png"
    heatmap_path = paths.artifacts / f"{case_id}_heatmap.png"
    try:
        ml_result = run_ml_pipeline(
            stored_path,
            enhanced_path,
            heatmap_path,
            filename=file.filename or stored_filename,
        )
    except Exception as exc:  # pragma: no cover - defensive for dev pipeline
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            detail=f"Failed to process image artifacts: {exc}",
        ) from exc

    case = Case(
        id=case_id,
        patient_reference=patient_reference or f"XR-{case_id[:8].upper()}",
        status="review_pending",
        modality="CXR",
        notes=notes,
    )
    db.add(case)
    db.flush()

    db.add(
        UploadedImage(
            case_id=case_id,
            original_filename=file.filename or stored_filename,
            storage_path=str(stored_path),
            content_type=file.content_type,
            size_bytes=len(payload),
            width=width,
            height=height,
        )
    )
    db.add(
        EnhancedImage(
            case_id=case_id,
            storage_path=str(enhanced_path),
            technique=ml_result.enhanced_technique,
        )
    )
    db.add(
        ExplanationHeatmap(
            case_id=case_id,
            storage_path=str(heatmap_path),
            method=ml_result.heatmap_method,
        )
    )
    db.add(
        Prediction(
            case_id=case_id,
            label=ml_result.label,
            confidence=ml_result.confidence,
            model_name=ml_result.model_name,
            model_version=ml_result.model_version,
            status="completed",
        )
    )
    db.add(
        Report(
            case_id=case_id,
            status="pending_generation",
            path=str(paths.reports / f"{case_id}.pdf"),
            generated_at=None,
        )
    )
    record_audit(db, actor=current.email, action="upload", target=case_id)
    record_job(db, name=f"Inference {case_id[:8]}", type="inference", status="completed", progress=100)
    db.commit()
    return get_case(case_id=case_id, db=db)


@router.post("/{case_id}/review", response_model=CaseResponse)
def submit_review(
    case_id: str,
    payload: ReviewRequest,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> CaseResponse:
    case = db.scalars(select(Case).where(Case.id == case_id)).first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    db.add(
        ExpertReview(
            case_id=case_id,
            reviewer_name=payload.reviewer_name,
            decision=payload.decision,
            corrected_label=payload.corrected_label,
            comments=payload.comments,
            reviewed_at=datetime.now(UTC),
        )
    )
    case.status = "reviewed" if payload.decision == "approved" else "rejected"
    case.updated_at = datetime.now(UTC)
    record_audit(db, actor=current.email, action="review", target=case_id)
    db.commit()
    return get_case(case_id=case_id, db=db)


@router.post("/{case_id}/report")
def generate_report(
    case_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
):
    """Generate (or regenerate) the PDF report for a case and return it."""
    from augmed_api.core.reports import generate_pdf_report

    statement = select(Case).options(*_CASE_LOAD_OPTIONS).where(Case.id == case_id)
    case = db.scalars(statement).unique().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    latest_prediction = case.predictions[-1] if case.predictions else None
    latest_review = case.reviews[-1] if case.reviews else None
    uploaded_image = case.uploaded_images[-1] if case.uploaded_images else None
    enhanced_image = case.enhanced_images[-1] if case.enhanced_images else None
    heatmap = case.heatmaps[-1] if case.heatmaps else None

    report_row = case.reports[-1] if case.reports else None
    if not report_row:
        paths = ensure_storage_directories()
        report_row = Report(
            case_id=case_id,
            status="pending_generation",
            path=str(paths.reports / f"{case_id}.pdf"),
        )
        db.add(report_row)
        db.flush()

    output_path = Path(report_row.path)

    review_dict = None
    if latest_review:
        review_dict = {
            "reviewer_name": latest_review.reviewer_name,
            "decision": latest_review.decision,
            "corrected_label": latest_review.corrected_label,
            "comments": latest_review.comments,
            "reviewed_at": str(latest_review.reviewed_at),
        }

    try:
        generate_pdf_report(
            case_id=case_id,
            patient_reference=case.patient_reference,
            modality=case.modality,
            status=case.status,
            created_at=str(case.created_at),
            notes=case.notes,
            label=latest_prediction.label if latest_prediction else "N/A",
            confidence=latest_prediction.confidence if latest_prediction else 0.0,
            model_name=latest_prediction.model_name if latest_prediction else "N/A",
            model_version=latest_prediction.model_version if latest_prediction else "N/A",
            enhanced_technique=enhanced_image.technique if enhanced_image else "",
            heatmap_method=heatmap.method if heatmap else "",
            original_path=uploaded_image.storage_path if uploaded_image else None,
            enhanced_path=enhanced_image.storage_path if enhanced_image else None,
            heatmap_path=heatmap.storage_path if heatmap else None,
            review=review_dict,
            output_path=output_path,
        )
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Report generation failed: {exc}",
        ) from exc

    report_row.status = "generated"
    report_row.generated_at = datetime.now(UTC)
    record_audit(db, actor=current.email, action="report", target=case_id)
    record_job(db, name=f"PDF report {case_id[:8]}", type="report", status="completed", progress=100)
    db.commit()

    return FileResponse(
        path=str(output_path),
        media_type="application/pdf",
        filename=f"augmed-report-{case_id[:12]}.pdf",
    )


@router.get("/{case_id}/report")
def download_report(case_id: str, db: Session = Depends(get_db)):
    """Download a previously generated PDF report."""
    statement = select(Case).options(joinedload(Case.reports)).where(Case.id == case_id)
    case = db.scalars(statement).unique().first()
    if not case:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Case not found.")

    report_row = case.reports[-1] if case.reports else None
    if not report_row or report_row.status != "generated":
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Report has not been generated yet. POST to this endpoint first.",
        )

    pdf_path = Path(report_row.path)
    if not pdf_path.exists():
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Report file not found on disk.")

    return FileResponse(
        path=str(pdf_path),
        media_type="application/pdf",
        filename=f"augmed-report-{case_id[:12]}.pdf",
    )


