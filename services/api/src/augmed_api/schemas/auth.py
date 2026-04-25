from datetime import datetime

from pydantic import BaseModel, Field


class LoginRequest(BaseModel):
    email: str = Field(min_length=3, max_length=255)
    password: str = Field(min_length=1, max_length=200)


class UserRead(BaseModel):
    id: str
    full_name: str
    email: str
    role: str
    is_active: bool
    last_login_at: datetime | None = None
    created_at: datetime


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_at: datetime
    user: UserRead


class UserCreate(BaseModel):
    full_name: str = Field(min_length=2, max_length=120)
    email: str = Field(min_length=3, max_length=255)
    role: str = Field(pattern="^(admin|clinician|reviewer|researcher)$")
    password: str = Field(min_length=6, max_length=200)
    is_active: bool = True


class UserUpdate(BaseModel):
    full_name: str | None = Field(default=None, min_length=2, max_length=120)
    role: str | None = Field(default=None, pattern="^(admin|clinician|reviewer|researcher)$")
    password: str | None = Field(default=None, min_length=6, max_length=200)
    is_active: bool | None = None


class UserListResponse(BaseModel):
    items: list[UserRead]
