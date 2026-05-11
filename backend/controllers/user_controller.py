from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import get_session
from core.dependencies import get_current_user
from models.user_model import User
from schemas.user_schema import UserRead, UserUpdate
from services.user_service import update_current_user

router = APIRouter()


@router.get("/me", response_model=UserRead)
def read_current_user(current_user: User = Depends(get_current_user)):
    return current_user


@router.put("/me", response_model=UserRead)
def update_me(
    user_data: UserUpdate,
    session: Session = Depends(get_session),
    current_user: User = Depends(get_current_user),
):
    return update_current_user(session, current_user, user_data)