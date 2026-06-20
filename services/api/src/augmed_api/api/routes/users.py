from uuid import uuid4

from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from augmed_api.api.routes.auth import _user_to_read
from augmed_api.core.activity import record_audit
from augmed_api.core.database import get_db
from augmed_api.core.security import ROLE_ADMIN, get_current_user, hash_password, require_roles
from augmed_api.models.entities import User
from augmed_api.schemas.auth import UserCreate, UserListResponse, UserRead, UserUpdate

router = APIRouter(dependencies=[Depends(require_roles(ROLE_ADMIN))])


@router.get("", response_model=UserListResponse)
def list_users(db: Session = Depends(get_db)) -> UserListResponse:
    users = db.scalars(select(User).order_by(User.created_at.desc())).all()
    return UserListResponse(items=[_user_to_read(u) for u in users])


@router.post("", response_model=UserRead, status_code=status.HTTP_201_CREATED)
def create_user(
    payload: UserCreate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> UserRead:
    email = payload.email.lower().strip()
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Email already exists.")
    user = User(
        id=str(uuid4()),
        full_name=payload.full_name,
        email=email,
        role=payload.role,
        password_hash=hash_password(payload.password),
        is_active=payload.is_active,
    )
    db.add(user)
    record_audit(db, actor=current.email, action="user_change", target=email)
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


@router.patch("/{user_id}", response_model=UserRead)
def update_user(
    user_id: str,
    payload: UserUpdate,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> UserRead:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    if payload.full_name is not None:
        user.full_name = payload.full_name
    if payload.email is not None:
        new_email = payload.email.lower().strip()
        if new_email != user.email:
            clash = db.scalar(select(User).where(User.email == new_email))
            if clash and clash.id != user.id:
                raise HTTPException(
                    status_code=status.HTTP_409_CONFLICT,
                    detail="Email already exists.",
                )
            user.email = new_email
    if payload.role is not None:
        user.role = payload.role
    if payload.is_active is not None:
        user.is_active = payload.is_active
    if payload.password:
        user.password_hash = hash_password(payload.password)
    record_audit(db, actor=current.email, action="user_change", target=user.email)
    db.commit()
    db.refresh(user)
    return _user_to_read(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: str,
    db: Session = Depends(get_db),
    current: User = Depends(get_current_user),
) -> None:
    user = db.get(User, user_id)
    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found.")
    target_email = user.email
    db.delete(user)
    record_audit(db, actor=current.email, action="user_change", target=target_email)
    db.commit()
