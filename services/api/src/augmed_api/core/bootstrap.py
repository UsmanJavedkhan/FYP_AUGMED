from datetime import UTC, datetime
from pathlib import Path

from sqlalchemy import select

from augmed_api.core.database import SessionLocal, engine
from augmed_api.core.dev_migrate import apply_dev_migrations
from augmed_api.core.imaging import enhance_xray, generate_heatmap, write_placeholder_xray
from augmed_api.core.security import hash_password
from augmed_api.core.storage import ensure_storage_directories
from augmed_api.models.base import Base
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


def bootstrap_application() -> None:
    ensure_storage_directories()
    Base.metadata.create_all(bind=engine)
    apply_dev_migrations()
    seed_initial_data()


DEFAULT_SEED_PASSWORD = "augmed123"


def _materialise_demo_assets(case_id: str, label: str, focus: str) -> tuple[Path, Path, Path]:
    paths = ensure_storage_directories()
    source = paths.uploads / f"{case_id}.png"
    enhanced = paths.artifacts / f"{case_id}_enhanced.png"
    heatmap = paths.artifacts / f"{case_id}_heatmap.png"
    if not source.exists():
        write_placeholder_xray(source, label)
    if not enhanced.exists():
        enhance_xray(source, enhanced)
    if not heatmap.exists():
        generate_heatmap(source, heatmap, focus=focus)
    return source, enhanced, heatmap


_SEED_USERS = [
    ("Ayesha Khan", "admin@augmed.local", "admin"),
    ("Dr. Sana Ahmed", "clinician@augmed.local", "clinician"),
    ("Dr. Hamza Noor", "reviewer@augmed.local", "reviewer"),
    ("Dr. Imran Raza", "researcher@augmed.local", "researcher"),
]


def seed_initial_data() -> None:
    with SessionLocal() as session:
        # Ensure every seed account exists AND has a usable password.
        for full_name, email, role in _SEED_USERS:
            user = session.scalar(select(User).where(User.email == email))
            if user is None:
                session.add(
                    User(
                        full_name=full_name,
                        email=email,
                        role=role,
                        password_hash=hash_password(DEFAULT_SEED_PASSWORD),
                        is_active=True,
                    )
                )
            elif not user.password_hash:
                user.password_hash = hash_password(DEFAULT_SEED_PASSWORD)
        session.commit()

        if session.scalar(select(Case.id).limit(1)):
            session.commit()
            return

        demo_case = Case(
            id="demo-case-pneumonia",
            patient_reference="XR-DEMO-001",
            status="review_pending",
            modality="CXR",
            notes="Demo chest X-ray case seeded for the first end-to-end workflow.",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        reviewed_case = Case(
            id="demo-case-tb",
            patient_reference="XR-DEMO-002",
            status="reviewed",
            modality="CXR",
            notes="Reviewed tuberculosis example to populate admin metrics.",
            created_at=datetime.now(UTC),
            updated_at=datetime.now(UTC),
        )
        session.add_all([demo_case, reviewed_case])
        session.flush()

        pneumonia_source, pneumonia_enhanced, pneumonia_heatmap = _materialise_demo_assets(
            demo_case.id, "Pneumonia", focus="lower"
        )
        tb_source, tb_enhanced, tb_heatmap = _materialise_demo_assets(
            reviewed_case.id, "Tuberculosis", focus="upper"
        )

        session.add_all(
            [
                UploadedImage(
                    case_id=demo_case.id,
                    original_filename="demo-pneumonia.png",
                    storage_path=str(pneumonia_source),
                    content_type="image/png",
                    size_bytes=pneumonia_source.stat().st_size,
                    width=512,
                    height=512,
                ),
                UploadedImage(
                    case_id=reviewed_case.id,
                    original_filename="demo-tuberculosis.png",
                    storage_path=str(tb_source),
                    content_type="image/png",
                    size_bytes=tb_source.stat().st_size,
                    width=512,
                    height=512,
                ),
                EnhancedImage(case_id=demo_case.id, storage_path=str(pneumonia_enhanced)),
                EnhancedImage(case_id=reviewed_case.id, storage_path=str(tb_enhanced)),
                ExplanationHeatmap(case_id=demo_case.id, storage_path=str(pneumonia_heatmap)),
                ExplanationHeatmap(case_id=reviewed_case.id, storage_path=str(tb_heatmap)),
                Prediction(
                    case_id=demo_case.id,
                    label="Pneumonia",
                    confidence=0.93,
                    model_name="AugMed Baseline",
                    model_version="0.1-demo",
                    status="completed",
                ),
                Prediction(
                    case_id=reviewed_case.id,
                    label="Tuberculosis",
                    confidence=0.89,
                    model_name="AugMed Baseline",
                    model_version="0.1-demo",
                    status="completed",
                ),
                ExpertReview(
                    case_id=reviewed_case.id,
                    reviewer_name="Dr. Hamza Noor",
                    decision="approved",
                    corrected_label=None,
                    comments="Findings align with the expected tuberculosis pattern.",
                    reviewed_at=datetime.now(UTC),
                ),
                Report(
                    case_id=demo_case.id,
                    status="pending_generation",
                    path=str(ensure_storage_directories().reports / "demo-case-pneumonia.pdf"),
                    generated_at=None,
                ),
                Report(
                    case_id=reviewed_case.id,
                    status="ready",
                    path=str(ensure_storage_directories().reports / "demo-case-tb.pdf"),
                    generated_at=datetime.now(UTC),
                ),
            ]
        )
        session.commit()
