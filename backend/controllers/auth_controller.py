from fastapi import APIRouter, Depends
from fastapi.security import HTTPBearer

from app.database import SessionDep
from schemas.user_schema import UserCreate, UserRead, UserLogin, Token
from services import auth_service
from repositories import user_repository

from core.dependencies import get_current_user
from models.user_model import User


router = APIRouter()

security = HTTPBearer()

@router.post("/register", response_model=UserRead)
def register(register_data: UserCreate, session: SessionDep):
    return auth_service.register_user(session, register_data)


@router.post("/login", response_model=Token)
def login(login_data: UserLogin, session: SessionDep):
    return auth_service.login_user(session, login_data)


@router.get("/me", response_model=UserRead)
def me(current_user: User = Depends(get_current_user)):
    return current_user