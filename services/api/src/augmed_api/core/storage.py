from dataclasses import dataclass
from pathlib import Path

from augmed_api.core.config import settings


def storage_url_for(path: str | Path | None) -> str | None:
    """Convert an absolute storage path into a browser-friendly URL."""
    if not path:
        return None
    candidate = Path(path)
    try:
        relative = candidate.resolve().relative_to(settings.storage_root.resolve())
    except (ValueError, OSError):
        return None
    return f"{settings.storage_url_prefix.rstrip('/')}/{relative.as_posix()}"


@dataclass
class StoragePaths:
    root: Path
    uploads: Path
    artifacts: Path
    reports: Path
    synthetic: Path


def ensure_storage_directories() -> StoragePaths:
    root = settings.storage_root
    uploads = root / "uploads"
    artifacts = root / "artifacts"
    reports = root / "reports"
    synthetic = root / "synthetic"
    for path in (root, uploads, artifacts, reports, synthetic):
        path.mkdir(parents=True, exist_ok=True)
    return StoragePaths(
        root=root,
        uploads=uploads,
        artifacts=artifacts,
        reports=reports,
        synthetic=synthetic,
    )


def storage_summary() -> dict[str, object]:
    paths = ensure_storage_directories()
    buckets = []
    for name, path in (
        ("uploads", paths.uploads),
        ("artifacts", paths.artifacts),
        ("reports", paths.reports),
        ("synthetic", paths.synthetic),
    ):
        buckets.append(
            {
                "name": name,
                "path": str(path),
                "file_count": sum(1 for item in path.iterdir() if item.is_file()),
            }
        )
    return {"root": str(paths.root), "buckets": buckets}
