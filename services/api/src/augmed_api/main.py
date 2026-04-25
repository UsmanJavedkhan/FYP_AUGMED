from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from augmed_api.api.router import api_router
from augmed_api.core.bootstrap import bootstrap_application
from augmed_api.core.config import settings
from augmed_api.core.storage import ensure_storage_directories


@asynccontextmanager
async def lifespan(_: FastAPI):
    bootstrap_application()
    yield


app = FastAPI(
    title=settings.app_name,
    version="0.1.0",
    summary="Local-first medical imaging workflow API for AugMed.",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.allowed_origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

_storage_paths = ensure_storage_directories()
app.mount(
    settings.storage_url_prefix,
    StaticFiles(directory=_storage_paths.root, check_dir=False),
    name="storage",
)

app.include_router(api_router, prefix=settings.api_prefix)


@app.get("/", tags=["meta"])
def root() -> dict[str, str]:
    return {
        "name": settings.app_name,
        "docs": "/docs",
        "api_prefix": settings.api_prefix,
        "environment": settings.app_env,
    }
