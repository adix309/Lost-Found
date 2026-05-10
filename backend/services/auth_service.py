from fastapi import HTTPException, status
from sqlmodel import Session

from models.user_model import User
from schemas.user_schema import UserCreate, UserLogin
from repositories import user_repository
from core.security import hash_password, verify_password, create_access_token


def register_user(session: Session, user_data: UserCreate) -> User:
    existing_username = user_repository.get_by_username(session, user_data.username)

    if existing_username:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already taken"
        )

    existing_email = user_repository.get_by_email(session, user_data.email)

    if existing_email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email is already taken"
        )
    print(user_data.password)

    hashed = hash_password(user_data.password)

    user = User(
        first_name=user_data.first_name,
        last_name=user_data.last_name,
        username=user_data.username,
        email=user_data.email,
        hashed_password=hashed
    )

    return user_repository.create(session, user)


def login_user(session: Session, login_data: UserLogin) -> dict:
    user = user_repository.get_by_username(session, login_data.username)

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    password_valid = verify_password(login_data.password, user.hashed_password)

    if not password_valid:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password"
        )

    token = create_access_token(
        data={
            "sub": str(user.id),
            "username": user.username
        }
    )

    return {
        "access_token": token,
        "token_type": "bearer"
    }