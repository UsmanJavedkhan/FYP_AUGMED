from datetime import UTC, datetime

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.core.activity import record_audit
from augmed_api.core.database import get_db
from augmed_api.core.security import (
    create_access_token,
    get_current_user,
    hash_password,
    verify_password,
)
from augmed_api.models.entities import User
from augmed_api.schemas.auth import (
    ChangePasswordRequest,
    LoginRequest,
    TokenResponse,
    UserRead,
)

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
    record_audit(db, actor=user.email, action="login")
    db.commit()
    return TokenResponse(access_token=token, expires_at=expires_at, user=_user_to_read(user))


@router.get("/me", response_model=UserRead)
def get_me(current: User = Depends(get_current_user)) -> UserRead:
    return _user_to_read(current)


@router.post("/change-password", status_code=status.HTTP_204_NO_CONTENT)
def change_password(
    payload: ChangePasswordRequest,
    current: User = Depends(get_current_user),
    db: Session = Depends(get_db),
) -> None:
    """Let the signed-in user change their own password (role/email stay admin-only)."""
    if not verify_password(payload.current_password, current.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Current password is incorrect.",
        )
    if verify_password(payload.new_password, current.password_hash):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="New password must be different from the current one.",
        )
    current.password_hash = hash_password(payload.new_password)
    record_audit(db, actor=current.email, action="user_change", target="password")
    db.commit()
