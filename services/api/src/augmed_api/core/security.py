"""Authentication primitives for AugMed.

Intentionally dependency-free: passwords use PBKDF2-SHA256 from the stdlib
and JWTs are signed with HS256 via hmac. This keeps the local-dev install
path friction-free (no bcrypt or PyJWT build step on Windows).
"""
from __future__ import annotations

import base64
import hashlib
import hmac
import json
import os
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.models.entities import User

# ---------- Config ----------
_JWT_SECRET = os.environ.get("AUGMED_JWT_SECRET") or "augmed-dev-secret-change-me"
_JWT_ALGO = "HS256"
_JWT_TTL = timedelta(hours=12)

ROLE_ADMIN = "admin"
ROLE_CLINICIAN = "clinician"
ROLE_RESEARCHER = "researcher"
ROLE_REVIEWER = "reviewer"
ALL_ROLES = (ROLE_ADMIN, ROLE_CLINICIAN, ROLE_RESEARCHER, ROLE_REVIEWER)

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login", auto_error=False)


# ---------- Password hashing ----------
_PBKDF2_ITERATIONS = 200_000


def hash_password(password: str) -> str:
    salt = secrets.token_bytes(16)
    digest = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, _PBKDF2_ITERATIONS)
    return f"pbkdf2_sha256${_PBKDF2_ITERATIONS}${_b64e(salt)}${_b64e(digest)}"


def verify_password(password: str, encoded: str | None) -> bool:
    if not encoded:
        return False
    try:
        scheme, iterations_s, salt_b64, hash_b64 = encoded.split("$")
        if scheme != "pbkdf2_sha256":
            return False
        iterations = int(iterations_s)
        salt = _b64d(salt_b64)
        expected = _b64d(hash_b64)
    except Exception:
        return False
    candidate = hashlib.pbkdf2_hmac("sha256", password.encode("utf-8"), salt, iterations)
    return hmac.compare_digest(candidate, expected)


# ---------- JWT (HS256) ----------
def _b64e(data: bytes) -> str:
    return base64.urlsafe_b64encode(data).rstrip(b"=").decode("ascii")


def _b64d(data: str) -> bytes:
    padding = "=" * (-len(data) % 4)
    return base64.urlsafe_b64decode(data + padding)


def create_access_token(*, subject: str, role: str, email: str) -> tuple[str, datetime]:
    now = datetime.now(UTC)
    expires_at = now + _JWT_TTL
    header = {"alg": _JWT_ALGO, "typ": "JWT"}
    payload = {
        "sub": subject,
        "role": role,
        "email": email,
        "iat": int(now.timestamp()),
        "exp": int(expires_at.timestamp()),
    }
    header_b64 = _b64e(json.dumps(header, separators=(",", ":")).encode("utf-8"))
    payload_b64 = _b64e(json.dumps(payload, separators=(",", ":")).encode("utf-8"))
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    signature = hmac.new(_JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    token = f"{header_b64}.{payload_b64}.{_b64e(signature)}"
    return token, expires_at


def decode_token(token: str) -> dict:
    try:
        header_b64, payload_b64, signature_b64 = token.split(".")
    except ValueError as exc:
        raise ValueError("Malformed token") from exc
    signing_input = f"{header_b64}.{payload_b64}".encode("ascii")
    expected = hmac.new(_JWT_SECRET.encode("utf-8"), signing_input, hashlib.sha256).digest()
    if not hmac.compare_digest(expected, _b64d(signature_b64)):
        raise ValueError("Invalid signature")
    payload = json.loads(_b64d(payload_b64))
    if int(payload.get("exp", 0)) < int(datetime.now(UTC).timestamp()):
        raise ValueError("Token expired")
    return payload


# ---------- FastAPI dependencies ----------
def get_current_user(
    token: str | None = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
) -> User:
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authentication required.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    try:
        payload = decode_token(token)
    except Exception as exc:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {exc}",
            headers={"WWW-Authenticate": "Bearer"},
        ) from exc
    user = db.get(User, payload.get("sub"))
    if not user or not user.is_active:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User inactive or missing.")
    return user


def require_roles(*roles: str):
    allowed = set(roles)

    def dependency(user: User = Depends(get_current_user)) -> User:
        if user.role not in allowed:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail=f"Requires role: {', '.join(sorted(allowed))}",
            )
        return user

    return dependency


def require_any_authenticated(user: User = Depends(get_current_user)) -> User:
    return user
