from fastapi import APIRouter, Depends
from sqlmodel import Session

from app.database import SessionDep
from core.dependencies import get_current_user
from models.user_model import User
from schemas.user_schema import UserRead, UserUpdate
from services.user_service import update_current_user

router = APIRouter()

@router.put("/me", response_model=UserRead)
def update_me(
    user_data: UserUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return update_current_user(session, current_user, user_data)