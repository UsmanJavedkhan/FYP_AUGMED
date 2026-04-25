from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.core.database import get_db
from augmed_api.core.security import (
    create_access_token,
    get_current_user,
    verify_password,
)
from augmed_api.models.entities import User
from augmed_api.schemas.auth import LoginRequest, TokenResponse, UserRead

router = APIRouter()


def _user_to_read(user: User) -> UserRead:
    return UserRead(
        id=user.id,
        full_name=user.full_name,
        email=user.email,
        role=user.role,
        is_active=user.is_active,
        last_login_at=user.last_login_at,
        created_at=user.created_at,
    )


@router.post("/login", response_model=TokenResponse)
def login(payload: LoginRequest, db: Session = Depends(get_db)) -> TokenResponse:
    user = db.scalar(select(User).where(User.email == payload.email.lower().strip()))
    if not user or not user.is_active or not verify_password(payload.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password.",
        )
    token, expires_at = create_access_token(subject=user.id, role=user.role, email=user.email)
    user.last_login_at = datetime.now(UTC)
    db.commit()
    return TokenResponse(access_token=token, expires_at=expires_at, user=_user_to_read(user))


@router.get("/me", response_model=UserRead)
def get_me(current: User = Depends(get_current_user)) -> UserRead:
    return _user_to_read(current)
