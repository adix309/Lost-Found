from fastapi import HTTPException, status
from pydantic import BaseModel
from sqlmodel import Session
from core.security import verify_password, hash_password
from models.user_model import User
from repositories import user_repository, item_repository
from schemas.user_schema import ChangePasswordRequest, UserUpdate


def update_current_user(
    session: Session,
    current_user: User,
    user_data: UserUpdate
) -> User:
    if user_data.username and user_data.username != current_user.username:
        existing_username = user_repository.get_by_username(session, user_data.username)
        if existing_username:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken"
            )
        current_user.username = user_data.username

    if user_data.email and user_data.email != current_user.email:
        existing_email = user_repository.get_by_email(session, user_data.email)
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already taken"
            )
        current_user.email = user_data.email

    if user_data.first_name is not None:
        current_user.first_name = user_data.first_name

    if user_data.last_name is not None:
        current_user.last_name = user_data.last_name

    if user_data.phone is not None:
        current_user.phone = user_data.phone

    if user_data.is_active is not None:
        current_user.is_active = user_data.is_active

    if user_data.profile_image is not None:
        current_user.profile_image = user_data.profile_image

    return user_repository.update(session, current_user)

def update_current_user_password(
    session: Session,
    current_user: User,
    payload: ChangePasswordRequest,
):
    if not verify_password(payload.current_password, current_user.hashed_password):
        raise HTTPException(
            status_code=400,
            detail="Trenutna lozinka nije ispravna."
        )
    hashed_password = hash_password(payload.new_password)
    user_repository.update_password(session, current_user, hashed_password)

    return {"detail": "Lozinka uspješno promijenjena."}

def get_public_user_profile(session: Session, user_id: int) -> User:
    user = user_repository.get_by_id(session, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return user


def get_public_user_items(session: Session, user_id: int):
    user = user_repository.get_by_id(session, user_id)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    return item_repository.get_items_by_user_id(session, user_id)