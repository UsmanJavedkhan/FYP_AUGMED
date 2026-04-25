# AugMed Getting Started

## Runtime Choices

- Python `3.12`
- Node.js with npm workspaces
- SQLite by default for the first runnable build
- PostgreSQL-ready via `DATABASE_URL` when we move past the zero-friction local phase

## First-Time Setup

```powershell
py -3.12 -m venv .venv
.\.venv\Scripts\python.exe -m pip install --upgrade pip
npm install
npm run api:install
```

## Run The Stack

```powershell
npm run api:dev
npm run dev:clinician
npm run dev:admin
```
