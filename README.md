# AugMed

AugMed is a local-first chest X-ray workflow platform built as a monorepo. It combines a FastAPI backend, a clinician dashboard, an admin dashboard, local file storage, seeded demo data, and a baseline ML pipeline for upload, review, explainability, reporting, and synthetic image generation.

## Overview

The repository currently delivers a runnable MVP with these parts:

- `apps/web-clinician`: React + Vite clinician workspace on port `5173`
- `apps/web-admin`: React + Vite admin panel on port `5174`
- `services/api`: FastAPI backend on port `8000`
- `storage/`: local database, uploads, artifacts, reports, and synthetic outputs
- `data/samples/`: sample chest X-ray images for testing
- `docs/`: project documentation

The stack is designed to run locally first, without Docker.

## Current Features

- Email/password login with role-aware API access
- Seeded demo users and demo cases on first API startup
- Chest X-ray upload with PNG/JPEG validation
- Automatic enhancement and heatmap artifact generation
- Classification pipeline with:
  - real ML path when `torch` and `torchxrayvision` are available
  - placeholder demo path when ML dependencies are missing
- Clinician review workflow with approve/reject style decisions
- PDF report generation for a case
- CSV export of case records
- Admin summary dashboard for cases, queues, storage, and recent activity
- Admin user management: list, create, update, disable, delete
- Synthetic image generation endpoint and UI for healthy chest X-rays

## Architecture

```text
Clinician/Admin React apps
        |
        v
FastAPI API (`/api/v1`)
        |
        +-- Auth + role checks
        +-- Case upload/review/report routes
        +-- Synthetic generation route
        +-- Admin summary and user routes
        |
        v
SQLite database + local filesystem storage
        |
        +-- uploads/
        +-- artifacts/
        +-- reports/
        +-- synthetic/
```

## Repository Structure

```text
FYP_Augmed/
  apps/
    web-clinician/
    web-admin/
  data/
    samples/
  docs/
    getting-started.md
    workflow.md
  packages/
    config/
    types/
  services/
    api/
  storage/
  package.json
```

## Tech Stack

- Frontend: React 19, Vite
- Backend: FastAPI, SQLAlchemy, Pydantic Settings
- Database: SQLite by default
- Imaging: Pillow-based processing, optional PyTorch/TorchXRayVision path
- Auth: PBKDF2 password hashing + custom HS256 JWT implementation
- Reporting: PDF generation in the API service

## Setup

### Prerequisites

- Python `3.12`
- Node.js with npm

### Install

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
npm install
npm run api:install
```

### Run the Project

Start each service in its own terminal:

```powershell
npm run api:dev
```

```powershell
npm run dev:clinician
```

```powershell
npm run dev:admin
```

### Local URLs

- API root: [http://127.0.0.1:8000](http://127.0.0.1:8000)
- API docs: [http://127.0.0.1:8000/docs](http://127.0.0.1:8000/docs)
- Clinician app: [http://127.0.0.1:5173](http://127.0.0.1:5173)
- Admin app: [http://127.0.0.1:5174](http://127.0.0.1:5174)

## Seeded Accounts

These users are created automatically when the API boots for the first time:

- `admin@augmed.local` / `augmed123`
- `clinician@augmed.local` / `augmed123`
- `reviewer@augmed.local` / `augmed123`
- `researcher@augmed.local` / `augmed123`

## How the Backend Works

### Startup

On API startup, the backend:

1. Creates storage folders under `storage/`
2. Creates database tables
3. Applies development migrations
4. Seeds demo users
5. Seeds demo cases and generated demo artifacts if no cases exist yet

### Main API Areas

- `/api/v1/health`: health and storage status
- `/api/v1/auth/*`: login and current user
- `/api/v1/cases/*`: upload, list, detail, review, CSV export, PDF reports
- `/api/v1/synthetic/generate`: healthy synthetic chest X-ray generation
- `/api/v1/admin/summary`: admin dashboard metrics
- `/api/v1/users/*`: admin-only user management

### Storage Layout

- `storage/augmed.db`: SQLite database
- `storage/uploads/`: uploaded source images
- `storage/artifacts/`: enhanced images and heatmaps
- `storage/reports/`: generated PDF reports
- `storage/synthetic/`: generated synthetic chest X-rays

## Frontend Apps

### Clinician App

The clinician dashboard supports:

- sign in
- API health display
- upload case form
- case list and selection
- case viewer for uploaded image, enhanced image, heatmap, and prediction
- review submission
- report download
- CSV export
- synthetic data generation page

### Admin App

The admin dashboard supports:

- sign in
- operational summary
- queue visibility
- storage summary
- recent case activity
- user creation and role management

## Workflow Summary

### Clinician workflow

1. Sign in to the clinician app.
2. Upload a PNG or JPEG chest X-ray.
3. Backend stores the file and runs the pipeline.
4. Enhanced image, heatmap, and prediction are saved.
5. Case appears in the workspace with status `review_pending`.
6. Reviewer/clinician submits a decision.
7. Case status changes to `reviewed` or `needs_follow_up`.
8. PDF report can be generated and downloaded.

### Synthetic workflow

1. Open the Synthetic Data page in the clinician app.
2. Request healthy image generation.
3. Backend uses the bundled checkpoint to create images in `storage/synthetic/`.
4. Generated images are displayed and can be downloaded.

### Admin workflow

1. Sign in as an admin.
2. Review dashboard metrics and storage usage.
3. Manage platform users and roles.

For the full step-by-step flow, see [docs/workflow.md](/D:/FYP_Augmed/docs/workflow.md).

## Important Limitations

- Synthetic generation currently supports only `Healthy` / `Normal` images.
- Uploads currently support only `PNG` and `JPEG`.
- The default database is SQLite for local development.
- The production-grade worker/queue architecture is not implemented yet.
- Some UI sections are intentionally marked as coming soon.
- If PyTorch ML dependencies are not installed, the backend falls back to a demo pipeline based on filename heuristics and generated placeholder artifacts.

## Useful Commands

```powershell
npm run build
```

```powershell
npm run lint
```

## Suggested Next Documentation Targets

- environment variable reference
- API endpoint reference
- deployment guide
- model training and checkpoint management guide
- dataset preparation guide

