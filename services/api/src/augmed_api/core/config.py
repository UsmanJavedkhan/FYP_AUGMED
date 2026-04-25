from functools import lru_cache
from pathlib import Path

from pydantic import Field
from pydantic_settings import BaseSettings, SettingsConfigDict

PROJECT_ROOT = Path(__file__).resolve().parents[5]
SERVICE_ROOT = Path(__file__).resolve().parents[3]


class Settings(BaseSettings):
    app_name: str = "AugMed API"
    app_env: str = "development"
    api_prefix: str = "/api/v1"
    database_url: str = f"sqlite:///{(PROJECT_ROOT / 'storage' / 'augmed.db').as_posix()}"
    storage_root: Path = PROJECT_ROOT / "storage"
    storage_url_prefix: str = "/storage"
    upload_max_mb: int = 25
    allowed_origins: list[str] = Field(
        default_factory=lambda: [
            "http://127.0.0.1:5173",
            "http://localhost:5173",
            "http://127.0.0.1:5174",
            "http://localhost:5174",
        ]
    )

    model_config = SettingsConfigDict(
        env_file=SERVICE_ROOT / ".env",
        env_file_encoding="utf-8",
        extra="ignore",
    )


@lru_cache
def get_settings() -> Settings:
    return Settings()


settings = get_settings()
