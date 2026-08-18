# augmed-api

FastAPI back-end for the **AugMed** chest X-ray platform: authentication, case management, the ML inference pipeline (DenseNet121 classifier + 3-class head, DCGAN synthetic generation, Grad-CAM), PDF reporting, and admin services.

See the [repository README](../../README.md) for full setup and architecture.

## Install

```bash
# base install
pip install -e .

# with the real ML inference stack (PyTorch, TorchXRayVision, etc.)
pip install -e ".[ml]"
```

## Run

```bash
uvicorn --app-dir src augmed_api.main:app --reload --host 127.0.0.1 --port 8000
```

Interactive API docs are then available at http://127.0.0.1:8000/docs.
