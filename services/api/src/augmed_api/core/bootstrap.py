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
    AuditLog,
    Case,
    Dataset,
    EnhancedImage,
    ExpertReview,
    ExplanationHeatmap,
    Job,
    ModelVersion,
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
    seed_admin_data()


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


_SEED_DATASETS = [
    # (name, source, item_count, source_url)
    ("NIH ChestX-ray14", "NIH", 112120, "https://nihcc.app.box.com/v/ChestXray-NIHCC"),
    ("Montgomery TB", "Montgomery", 138,
     "https://lhncbc.nlm.nih.gov/LHC-publications/pubs/TuberculosisChestXrayImageDataSets.html"),
    ("Shenzhen TB", "Shenzhen", 662,
     "https://lhncbc.nlm.nih.gov/LHC-publications/pubs/TuberculosisChestXrayImageDataSets.html"),
    ("Local samples", "Internal", 24, None),
]

# The models that actually make up the AugMed inference stack. accuracy=0.0
# means "not formally evaluated yet" — the UI renders that as "—".
_SEED_MODELS = [
    # (name, version, framework, accuracy, status)
    ("TorchXRayVision DenseNet121", "densenet121-res224-all", "PyTorch / TorchXRayVision", 0.0, "active"),
    ("CXR 3-class Discriminator", "logreg-v1", "scikit-learn", 0.0, "active"),
    ("Normal CXR DCGAN", "v1-128x128-grayscale", "PyTorch (DCGAN)", 0.0, "active"),
]

# Fictional placeholder models from earlier seeds — removed on startup so the
# registry only shows the real stack.
_LEGACY_MODELS = [
    ("DenseNet121-CXR", "v1.0"),
    ("DenseNet121-CXR", "v0.9"),
    ("ResNet50-CXR", "v0.5"),
    ("EfficientNet-B0", "v0.1"),
]

_SEED_JOBS = [
    # (name, type, status, progress)
    ("Inference batch #142", "inference", "completed", 100),
    ("Train DenseNet121 v1.1", "training", "queued", 0),
    ("Generate synthetic batch #8", "synthetic", "completed", 100),
    ("PDF report generation", "report", "failed", 35),
]

_SEED_AUDIT = [
    # (actor, action, target)
    ("clinician@augmed.local", "upload", "case_a91b2"),
    ("reviewer@augmed.local", "review", "case_a91b2"),
    ("clinician@augmed.local", "report", "case_a91b2"),
    ("admin@augmed.local", "user_change", "researcher@augmed.local"),
    ("admin@augmed.local", "login", "-"),
]


def seed_admin_data() -> None:
    """Seed the admin registry tables (datasets, models, jobs, audit) once."""
    with SessionLocal() as session:
        if session.scalar(select(Dataset.id).limit(1)) is None:
            session.add_all(
                Dataset(name=name, source=source, item_count=count, source_url=url, status="active")
                for name, source, count, url in _SEED_DATASETS
            )
        else:
            # Backfill source URLs for already-seeded public datasets.
            _seed_urls = {name: url for name, _src, _cnt, url in _SEED_DATASETS if url}
            for dataset in session.scalars(
                select(Dataset).where(Dataset.source_url.is_(None))
            ).all():
                if dataset.name in _seed_urls:
                    dataset.source_url = _seed_urls[dataset.name]

        # Reconcile the model registry to the real inference stack: drop the
        # old fictional placeholders, then add any real model that's missing.
        for name, version in _LEGACY_MODELS:
            legacy = session.scalar(
                select(ModelVersion).where(
                    ModelVersion.name == name, ModelVersion.version == version
                )
            )
            if legacy is not None:
                session.delete(legacy)
        session.flush()
        existing_models = {
            (m.name, m.version) for m in session.scalars(select(ModelVersion)).all()
        }
        for name, version, framework, acc, status in _SEED_MODELS:
            if (name, version) not in existing_models:
                session.add(
                    ModelVersion(
                        name=name, version=version, framework=framework,
                        accuracy=acc, status=status,
                    )
                )

        if session.scalar(select(Job.id).limit(1)) is None:
            session.add_all(
                Job(name=name, type=type_, status=status, progress=progress)
                for name, type_, status, progress in _SEED_JOBS
            )

        if session.scalar(select(AuditLog.id).limit(1)) is None:
            session.add_all(
                AuditLog(actor=actor, action=action, target=target)
                for actor, action, target in _SEED_AUDIT
            )

        session.commit()
