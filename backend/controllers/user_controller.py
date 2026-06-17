from fastapi import APIRouter, Depends
from app.database import SessionDep
from core.dependencies import get_current_user
from models.user_model import User
from schemas.user_schema import UserRead, UserUpdate, ChangePasswordRequest, UserPublicRead
from schemas.item_schema import ItemUserRead, ItemRead
from services.user_service import update_current_user, update_current_user_password, get_public_user_items, get_public_user_profile

router = APIRouter()

@router.put("/me", response_model=UserRead)
def update_me(
    user_data: UserUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return update_current_user(session, current_user, user_data)

@router.put("/me/password")
def change_password(
    payload: ChangePasswordRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return update_current_user_password(session, current_user, payload)

@router.get("/{user_id}", response_model=UserPublicRead)
def public_user_profile(
    user_id: int,
    session: SessionDep,
):
    return get_public_user_profile(session, user_id)


@router.get("/{user_id}/items", response_model=list[ItemRead])
def public_user_items(
    user_id: int,
    session: SessionDep,
):
    return get_public_user_items(session, user_id)