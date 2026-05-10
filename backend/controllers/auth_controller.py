from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer

from app.database import SessionDep
from schemas.user_schema import UserCreate, UserRead, UserLogin, Token
from services import auth_service
from repositories import user_repository
from core.security import decode_access_token


router = APIRouter()

security = HTTPBearer()

@router.post("/register", response_model=UserRead)
def register(register_data: UserCreate, session: SessionDep):
    return auth_service.register_user(session, register_data)


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, session: SessionDep):
    return auth_service.login_user(session, login_data)


@router.get("/me", response_model=UserRead)
def me(session: SessionDep, credentials: HTTPAuthorizationCredentials = Depends(security)):
    token = credentials.credentials

    payload = decode_access_token(token)

    if not payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired token"
        )

    user_id = payload.get("sub")

    if not user_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid token payload"
        )

    user = user_repository.get_by_id(session, int(user_id))

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user