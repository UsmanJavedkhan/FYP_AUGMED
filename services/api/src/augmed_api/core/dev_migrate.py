"""Tiny best-effort SQLite migrator for local dev.

Not a substitute for Alembic. It only adds missing columns to known
tables so the dev loop survives schema tweaks without deleting the DB.
"""
from __future__ import annotations

from sqlalchemy import inspect, text

from augmed_api.core.database import engine

# (table, column, DDL fragment)
_EXPECTED_COLUMNS: list[tuple[str, str, str]] = [
    ("users", "password_hash", "VARCHAR(255)"),
    ("users", "last_login_at", "DATETIME"),
]


def apply_dev_migrations() -> None:
    if not engine.url.get_backend_name().startswith("sqlite"):
        return
    inspector = inspect(engine)
    existing_tables = set(inspector.get_table_names())
    with engine.begin() as conn:
        for table, column, ddl in _EXPECTED_COLUMNS:
            if table not in existing_tables:
                continue
            columns = {c["name"] for c in inspector.get_columns(table)}
            if column in columns:
                continue
            conn.execute(text(f'ALTER TABLE "{table}" ADD COLUMN "{column}" {ddl}'))
