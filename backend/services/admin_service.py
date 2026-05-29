from datetime import datetime
from fastapi import HTTPException, status
from sqlmodel import Session

from models.user_model import User
from models.item_model import Item
from models.claim_model import Claim
from repositories import user_repository, item_repository, claim_repository
from schemas.user_schema import AdminUserUpdate
from schemas.item_schema import ItemUpdate
from schemas.claim_schema import ClaimStatusUpdate

def get_all_users(session: Session) -> list[User]:
    return user_repository.get_all(session)

def get_user_by_id(session: Session, user_id: int) -> User:
    user = user_repository.get_by_id(session, user_id)
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    return user

def update_user_as_admin(
    session: Session,
    user_id: int,
    user_data: AdminUserUpdate,
) -> User:
    user = get_user_by_id(session, user_id)

    if user_data.username and user_data.username != user.username:
        existing_username = user_repository.get_by_username(session, user_data.username)
        if existing_username and existing_username.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Username is already taken",
            )
        user.username = user_data.username.strip()

    if user_data.email and user_data.email != user.email:
        existing_email = user_repository.get_by_email(session, user_data.email)
        if existing_email and existing_email.id != user.id:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email is already taken",
            )
        user.email = user_data.email.strip().lower()

    if user_data.first_name is not None:
        user.first_name = user_data.first_name.strip()

    if user_data.last_name is not None:
        user.last_name = user_data.last_name.strip()

    if user_data.phone is not None:
        user.phone = user_data.phone.strip() or None

    if user_data.is_active is not None:
        user.is_active = user_data.is_active

    if user_data.is_admin is not None:
        user.is_admin = user_data.is_admin

    return user_repository.update(session, user)

def delete_user_as_admin(
    session: Session,
    user_id: int,
) -> None:
    user = get_user_by_id(session, user_id)
    user_repository.delete(session, user)

def get_all_items_for_admin(session: Session) -> list[Item]:
    return item_repository.get_items(session=session, status=None)

def get_item_for_admin(session: Session, item_id: int) -> Item:
    item = item_repository.get_item_by_id(session, item_id)
    if not item:
        raise HTTPException(status_code=404, detail="Item not found")
    return item

def update_item_as_admin(
    session: Session,
    item_id: int,
    item_data: ItemUpdate,
) -> Item:
    item = get_item_for_admin(session, item_id)
    update_data = item_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(item, key, value)

    item.updated_at = datetime.utcnow()
    return item_repository.update_item(session, item)

def delete_item_as_admin(
    session: Session,
    item_id: int,
) -> None:
    item = get_item_for_admin(session, item_id)
    item_repository.delete_item(session, item)

def get_all_claims_for_admin(session: Session) -> list[Claim]:
    return claim_repository.get_all_claims(session)

def get_claim_for_admin(session: Session, claim_id: int) -> Claim:
    claim = claim_repository.get_claim_by_id(session, claim_id)
    if not claim:
        raise HTTPException(status_code=404, detail="Claim not found")
    return claim

def update_claim_status_as_admin(
    session: Session,
    claim_id: int,
    status_data: ClaimStatusUpdate,
) -> Claim:
    claim = get_claim_for_admin(session, claim_id)
    claim.status = status_data.status
    claim.reviewed_at = datetime.utcnow()
    claim.updated_at = datetime.utcnow()
    return claim_repository.update_claim(session, claim)

def delete_claim_as_admin(
    session: Session,
    claim_id: int,
) -> None:
    claim = get_claim_for_admin(session, claim_id)
    claim_repository.delete_claim(session, claim)