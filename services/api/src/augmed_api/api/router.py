from fastapi import APIRouter, Depends

from augmed_api.api.routes import admin, auth, cases, health, synthetic, users
from augmed_api.core.security import ROLE_ADMIN, require_roles, require_any_authenticated

api_router = APIRouter()
api_router.include_router(health.router, tags=["health"])
api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(
    cases.router,
    prefix="/cases",
    tags=["cases"],
    dependencies=[Depends(require_any_authenticated)],
)
api_router.include_router(
    synthetic.router,
    prefix="/synthetic",
    tags=["synthetic"],
    dependencies=[Depends(require_any_authenticated)],
)
api_router.include_router(
    admin.router,
    prefix="/admin",
    tags=["admin"],
    dependencies=[Depends(require_roles(ROLE_ADMIN))],
)
api_router.include_router(users.router, prefix="/users", tags=["users"])
