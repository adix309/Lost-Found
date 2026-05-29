from fastapi import APIRouter, Depends, status

from app.database import SessionDep
from core.dependencies import require_admin
from models.user_model import User
from schemas.user_schema import UserRead, AdminUserUpdate
from schemas.item_schema import ItemRead, ItemOwnerRead, ItemUpdate
from schemas.claim_schema import ClaimFullRead, ClaimRead, ClaimStatusUpdate
from services import admin_service

router = APIRouter()

@router.get("/users", response_model=list[UserRead])
def get_users(
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.get_all_users(session)

@router.get("/users/{user_id}", response_model=UserRead)
def get_user(
    user_id: int,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.get_user_by_id(session, user_id)

@router.put("/users/{user_id}", response_model=UserRead)
def update_user(
    user_id: int,
    user_data: AdminUserUpdate,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.update_user_as_admin(session, user_id, user_data)

@router.delete("/users/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_user(
    user_id: int,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    admin_service.delete_user_as_admin(session, user_id)
    return None

@router.get("/items", response_model=list[ItemRead])
def get_items(
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.get_all_items_for_admin(session)

@router.get("/items/{item_id}", response_model=ItemOwnerRead)
def get_item(
    item_id: int,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.get_item_for_admin(session, item_id)

@router.put("/items/{item_id}", response_model=ItemOwnerRead)
def update_item(
    item_id: int,
    item_data: ItemUpdate,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.update_item_as_admin(session, item_id, item_data)

@router.delete("/items/{item_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_item(
    item_id: int,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    admin_service.delete_item_as_admin(session, item_id)
    return None

@router.get("/claims", response_model=list[ClaimFullRead])
def get_claims(
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.get_all_claims_for_admin(session)

@router.get("/claims/{claim_id}", response_model=ClaimFullRead)
def get_claim(
    claim_id: int,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.get_claim_for_admin(session, claim_id)

@router.patch("/claims/{claim_id}/status", response_model=ClaimRead)
def update_claim_status(
    claim_id: int,
    status_data: ClaimStatusUpdate,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return admin_service.update_claim_status_as_admin(session, claim_id, status_data)

@router.delete("/claims/{claim_id}", status_code=status.HTTP_204_NO_CONTENT)
def delete_claim(
    claim_id: int,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    admin_service.delete_claim_as_admin(session, claim_id)
    return None