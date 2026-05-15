from typing import Optional

from fastapi import APIRouter, Depends, status
from sqlmodel import Session

from app.database import SessionDep
from models.item_model import ItemStatus, ItemType
from models.user_model import User
from schemas.item_schema import ItemCreate, ItemRead, ItemOwnerRead, ItemUpdate
from services import item_service
from core.dependencies import get_current_user


router = APIRouter()

@router.post(
    "",
    response_model=ItemOwnerRead,
    status_code=status.HTTP_201_CREATED,
)
def create_item(
    item_data: ItemCreate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return item_service.create_item(session, item_data, current_user)


@router.get(
    "",
    response_model=list[ItemRead],
)
def get_items(
    session: SessionDep,
    status_filter: ItemStatus = ItemStatus.active,
    item_type: Optional[ItemType] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
):
    return item_service.get_public_items(
        session=session,
        status_filter=status_filter,
        item_type=item_type,
        category=category,
        search=search,
    )

@router.get(
    "/my",
    response_model=list[ItemOwnerRead],
)
def get_my_items(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return item_service.get_my_items(session, current_user)


@router.get(
    "/my/{item_id}",
    response_model=ItemOwnerRead,
)
def get_my_item_by_id(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return item_service.get_my_item_by_id(session, item_id, current_user)


@router.get(
    "/{item_id}",
    response_model=ItemRead,
)
def get_item_by_id(
    item_id: int,
    session: SessionDep,
):
    return item_service.get_public_item_by_id(session, item_id)


@router.put(
    "/{item_id}",
    response_model=ItemOwnerRead,
)
def update_item(
    item_id: int,
    item_data: ItemUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return item_service.update_item(session, item_id, item_data, current_user)


@router.delete(
    "/{item_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_item(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    item_service.delete_item(session, item_id, current_user)
    return None


@router.patch(
    "/{item_id}/resolve",
    response_model=ItemOwnerRead,
)
def resolve_item(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return item_service.resolve_item(session, item_id, current_user)


@router.patch(
    "/{item_id}/expire",
    response_model=ItemOwnerRead,
)
def expire_item(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return item_service.expire_item(session, item_id, current_user)