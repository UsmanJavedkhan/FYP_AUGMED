# AugMed — Build Roadmap & Memory

This file is the working memory for Claude while building AugMed. It mirrors the phases in `README.md` but tracks *what is actually built*, *what is next*, and *which reusable resources to wire in*. Update it whenever something ships.

Legend: `[x]` done · `[~]` partial / demo placeholder · `[ ]` not started

---

## Current Architecture Snapshot

- **Monorepo**: npm workspaces (`apps/*`, `packages/*`) + Python `services/api` (editable install into `.venv`).
- **Backend**: FastAPI + SQLAlchemy 2.0 + Pydantic v2, SQLite at `storage/augmed.db`, static mount at `/storage`.
- **ML pipeline**: TorchXRayVision DenseNet121 classifier + pytorch-grad-cam heatmaps + OpenCV CLAHE enhancement. Falls back to Pillow placeholders when ML deps unavailable. Located in `services/api/src/augmed_api/ml/`.
- **Reports**: ReportLab PDF generation (pure Python). POST generates, GET downloads.
- **Frontends**: React 19 + Vite + TypeScript. Clinician (`:5173`), Admin (`:5174`). Inter design system, dark/light themes.
- **Storage layout**: `storage/{uploads,artifacts,reports}/` + sqlite DB.
- **Entities live**: `User`, `Case`, `UploadedImage`, `EnhancedImage`, `ExplanationHeatmap`, `Prediction`, `ExpertReview`, `Report`.

Run:
```
npm run api:dev           # FastAPI on :8000
npm run dev:clinician     # Vite on :5173
npm run dev:admin         # Vite on :5174
```

---

## Phase 1 — Foundation

- [x] Monorepo + workspaces
- [x] FastAPI scaffold, health endpoint, CORS, static `/storage` mount
- [x] SQLAlchemy schema + auto-create on startup + seed demo data
- [x] Clinician frontend shell (sidebar, topbar, KPIs)
- [x] Admin frontend shell (sidebar, topbar, KPIs)
- [x] Local filesystem storage pipeline
- [x] Basic `.env` + settings via `pydantic-settings`
- [x] **Auth + RBAC** — custom HS256 JWT + PBKDF2 passwords (stdlib, zero new deps). Login pages on both apps, token persistence, 401 auto-logout, admin-only guard on `/admin/*` and `/users/*`, any-authenticated guard on `/cases/*`. Seed users: `admin@augmed.local` / `clinician@augmed.local` / `reviewer@augmed.local` / `researcher@augmed.local` (password `augmed123`).
- [x] **Admin Users CRUD** — list, create, change role, enable/disable, delete (self-delete blocked). New `Users & Roles` tab in the admin app.
- [x] **Dev auto-migrator** — lightweight SQLite ALTER helper in `core/dev_migrate.py` so schema additions don't require wiping the DB. Not a substitute for Alembic.
- [ ] **Alembic migrations** (replace `create_all` + the dev migrator once schema stabilises)
- [ ] **PostgreSQL switch** via `DATABASE_URL` (install Postgres locally, test the swap)
- [ ] **Redis + RQ/Celery** for background jobs (install Redis, wire a trivial task first)
- [ ] `.env.example` files fully documented for both the API and frontends

---

## Phase 2 — Clinical MVP

- [x] Upload endpoint with PNG/JPEG validation + size caps (Pillow)
- [x] Case detail API (`GET /cases`, `GET /cases/{id}`)
- [x] Review submission API (`POST /cases/{id}/review`)
- [x] **Placeholder** image enhancement (equalize + autocontrast + median denoise, Pillow)
- [x] **Placeholder** Grad-CAM-style heatmap (deterministic jet overlay)
- [x] Clinician viewer: Original / Enhanced / Grad-CAM tabs, opacity slider, confidence bar, review form
- [x] **Real classifier** — TorchXRayVision DenseNet121 (`densenet121-res224-all`), 18 pathologies mapped to `{Healthy, Pneumonia, Tuberculosis}`. Falls back to Pillow placeholder when torch unavailable. Located in `ml/classifier.py`.
- [x] **Real Grad-CAM** — `pytorch-grad-cam.GradCAM` against `features.denseblock4`, full-resolution overlay. Located in `ml/gradcam.py`.
- [x] **Real image enhancement** — OpenCV CLAHE + median blur in `ml/enhance.py`.
- [x] **PDF report generation** — ReportLab-based (pure Python, no GTK deps). Endpoint `POST /cases/{id}/report` generates and returns PDF; `GET /cases/{id}/report` downloads existing. Template includes original/enhanced/heatmap images, prediction, review, and disclaimer. Located in `core/reports.py`.
- [x] **CSV export** — `GET /cases/export/csv?date_from=&date_to=` returns full case list with prediction/review data.
- [ ] Inference queue decoupled from upload (background worker)
- [ ] Model registry table (`ModelVersion`) + swap-in API
- [ ] Case audit log entries (`AuditLog` table writes on upload/review/report)

---

## Phase 3 — Research Workflow

- [ ] Dataset registry (`Dataset`, `DatasetItem` tables)
- [ ] Dataset importer CLI (NIH ChestX-ray14 + Montgomery/Shenzhen TB)
- [ ] Dataset builder UI (real + enhanced + synthetic mix)
- [ ] Batch inference endpoint + worker
- [ ] Training job tracker (`BackgroundJob` table) — status, metrics, artifacts
- [ ] Model version compare view (confusion matrix, ROC, per-class F1)
- [ ] Experiment metadata logged to sqlite or MLflow-lite

---

## Phase 4 — Synthetic Data

- [ ] GAN baseline (stylegan2-ada-pytorch) for CXR generation on a small subset
- [ ] Synthetic review queue UI (approve/reject per image)
- [ ] Mixed dataset assembly (real + synthetic) with provenance stamps
- [ ] Optional: MONAI GenerativeModels diffusion experiments

---

## Phase 5 — Clinical-Grade Expansion

- [ ] DICOM ingestion (`pydicom`), metadata extraction
- [ ] OHIF Viewer embed for DICOM browsing
- [ ] MinIO (S3-compatible) local object storage swap
- [ ] Orthanc PACS integration
- [ ] FHIR/HL7 sample connector
- [ ] Observability: structured logs, OpenTelemetry, Prometheus metrics
- [ ] Security pass: TLS, secret management, signed audit trail

---

## Reusable Resources — Install Plan

When wiring real ML, install in this order inside `.venv`:

```
# Core ML (CPU wheels; switch to +cu121 if GPU)
pip install torch torchvision --index-url https://download.pytorch.org/whl/cpu
pip install torchxrayvision grad-cam opencv-python numpy scikit-image

# Reports & data
pip install weasyprint jinja2 reportlab pandas

# DICOM & medical (when Phase 5 starts)
pip install pydicom monai albumentations

# Workers (when Phase 1 async lands)
pip install celery redis   # or: rq
```

Frontend additions planned:
```
npm i -w @augmed/web-clinician @tanstack/react-query react-router-dom zod
npm i -w @augmed/web-admin    @tanstack/react-query react-router-dom recharts
```

Reference repos to mirror patterns from (not vendored):
- https://github.com/mlmed/torchxrayvision — pretrained DenseNet121 CXR, dataset wrappers
- https://github.com/jacobgil/pytorch-grad-cam — `GradCAM`, `GradCAM++`, `HiResCAM`
- https://github.com/Project-MONAI/MONAI — transforms, metrics, training loops
- https://github.com/Project-MONAI/GenerativeModels — diffusion for medical imaging
- https://github.com/NVlabs/stylegan2-ada-pytorch — GAN baseline for synthetic CXR
- https://github.com/xinntao/Real-ESRGAN — optional super-res enhancement
- https://github.com/arnoweng/CheXNet — CheXNet reference implementation
- https://github.com/OHIF/Viewers — DICOM viewer embed
- https://github.com/Kozea/WeasyPrint — HTML→PDF report rendering
- https://github.com/fastapi-users/fastapi-users — auth reference

Datasets to evaluate:
- NIH ChestX-ray14 (Pneumonia, Infiltration, etc.)
- CheXpert (Stanford)
- Montgomery & Shenzhen TB sets (tuberculosis ground truth)
- MIMIC-CXR / MIMIC-CXR-JPG (requires credentialing)

---

## Immediate Next Step (the one I'll tackle next)

**Wire inference queue + model registry + audit log (remaining Phase 2 items).**

1. Add `ModelVersion` table + seed with the DenseNet121 weights hash + expose in prediction metadata.
2. Add `AuditLog` table — write entries on upload, review, and report generation.
3. Decouple inference from upload via a background worker (Redis + RQ or in-process thread pool as interim).
4. Evaluate PostgreSQL switch if schema is stable enough for Alembic.

---

## Open Questions / Decisions to Confirm

- GPU or CPU-only on this machine? Determines torch wheel + whether to attempt training.
- PostgreSQL now or defer? SQLite is fine through Phase 2.
- Do we need real auth before Phase 3, or can it stay open on localhost?
- Which TB dataset to start with (Montgomery is small and clean; Shenzhen is slightly larger)?
