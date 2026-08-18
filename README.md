# AugMed

**AI-Powered Chest X-Ray Analysis Platform** — an explainable, GAN-augmented system that classifies chest X-rays as **Healthy**, **Pneumonia**, or **Tuberculosis**, with Grad-CAM explainability, a human-in-the-loop expert review workflow, and signed PDF reporting.

> Final Year Project — Riphah School of Computing & Innovation (RSCI), Riphah International University, Lahore.

---

## Overview

AugMed helps clinicians upload a chest X-ray, receive an AI classification with a confidence score and a Grad-CAM explainability heatmap, route the result through expert review, and generate a signed PDF report for the patient record. Class-specific DCGAN generators synthesise additional X-rays to augment and balance the training data.

On a held-out test set of 473 images the classifier achieves **93.45% accuracy** with a **93.4% macro F1-score**.

## Features

- **3-class classification** — TorchXRayVision **DenseNet121** backbone + a lightweight three-class logistic head (Healthy / Pneumonia / Tuberculosis) with confidence scores.
- **Synthetic data generation** — per-class **DCGAN** generators (128×128) to fight data scarcity and class imbalance.
- **Explainable AI** — **Grad-CAM** heatmaps that localise the evidence behind each prediction.
- **Image enhancement** — OpenCV-based preprocessing for clearer visualisation.
- **Expert review** — reviewers approve/reject and record a corrected label before anything is finalised.
- **PDF reporting** — signed reports (ReportLab) containing the image, prediction, heatmap, and reviewer decision.
- **Admin console** — dashboard KPIs, user management (CRUD), datasets catalogue, model registry, and an audit log.
- **Auth & access control** — JWT authentication with role-based access (admin, clinician, reviewer).

## Architecture

A local-first monorepo with two React front-ends talking to a FastAPI back-end over a JWT-secured REST API.

```
FYP_Augmed/
├── apps/
│   ├── web-clinician/     # React 19 + Vite — clinician workspace
│   └── web-admin/         # React 19 + Vite — administration console
├── packages/
│   ├── config/            # shared config
│   └── types/             # shared types
├── services/
│   └── api/               # FastAPI back-end (auth, cases, ML pipeline, reports, admin)
│       ├── src/augmed_api/
│       │   ├── api/routes/   # auth, cases, datasets, synthetic, users, admin, audit, ...
│       │   ├── core/         # config, database, storage, imaging, reports, security
│       │   ├── ml/           # classifier, tb_discriminator, synth_generator, gradcam, enhance
│       │   ├── models/       # SQLAlchemy entities
│       │   └── schemas/      # Pydantic schemas
│       └── models/checkpoints/   # DCGAN generator weights (*.pth)
├── data/                  # sample images
└── storage/              # SQLite DB, uploads, reports, synthetic output (git-ignored)
```

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Front-end | React 19, Vite |
| Back-end | FastAPI, Uvicorn, SQLAlchemy, Pydantic |
| Database | SQLite (development) · PostgreSQL (production, via `DATABASE_URL`) |
| ML / imaging | PyTorch, TorchXRayVision (DenseNet121), DCGAN, pytorch-grad-cam, OpenCV, Pillow |
| Reporting | ReportLab |
| Tooling | npm workspaces, pytest, ESLint |

## Getting Started

### Prerequisites

- **Node.js** 18+ and npm
- **Python** 3.12–3.13
- (optional) An NVIDIA GPU for faster inference

### 1. Install front-end dependencies

```bash
npm install
```

### 2. Set up the Python API

Create a virtual environment at the repo root, then install the API. The **`ml`** extra pulls in the real inference stack (PyTorch, TorchXRayVision, etc.); without it the pipeline falls back to a filename-based placeholder.

```bash
python -m venv .venv
npm run api:install            # installs services/api (base)
# for real inference:
.venv/Scripts/python -m pip install -e "services/api[ml]"
```

### 3. Run

Open three terminals (or run what you need):

```bash
npm run api:dev          # FastAPI  -> http://127.0.0.1:8000  (docs at /docs)
npm run dev:clinician    # Clinician app -> http://localhost:5173
npm run dev:admin        # Admin app     -> http://localhost:5174
```

### Seed accounts

All seeded with the password **`augmed123`**:

| Role | Email |
|------|-------|
| Admin | `admin@augmed.local` |
| Clinician | `clinician@augmed.local` |
| Reviewer | `reviewer@augmed.local` |

## Machine-Learning Models

- The **classifier** loads TorchXRayVision `densenet121-res224-all` and maps its pathology scores to the three clinical classes via a logistic head.
- The **DCGAN generators** load from `services/api/models/checkpoints/` (`Normal_new_gan_checkpoint.pth`, `pneumonia_new_gan_checkpoint.pth`, `TB_new_gan_checkpoint.pth`). Training scripts live in `services/api/scripts/`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run api:install` | Install the FastAPI service into `.venv` |
| `npm run api:dev` | Run the API with auto-reload |
| `npm run dev:clinician` | Run the clinician front-end |
| `npm run dev:admin` | Run the admin front-end |
| `npm run build` | Build all workspaces |
| `npm run lint` | Lint all workspaces |

## Testing

Back-end tests use **pytest** with FastAPI's `TestClient`. A full black-box test suite (56 cases) and an SQA plan accompany the project documentation.

## Team

- **Usman Javed Khan**
- **Zohaib**

**Supervisor:** Mr. Naeem Abbas · Department of Computer Science, RSCI.

## License

Academic project — not licensed for clinical use. AugMed is a decision-support prototype; all AI predictions require expert review and it is not a certified medical device.
