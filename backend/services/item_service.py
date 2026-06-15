from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from models.item_model import Item, ItemStatus, ItemType
from models.user_model import User
from repositories import item_repository
from schemas.item_schema import ItemCreate, ItemUpdate


def create_item(
    session: Session,
    item_data: ItemCreate,
    current_user: User,
) -> Item:
    data = item_data.model_dump()

    if data["item_type"] == ItemType.found:
        data["reward_amount"] = None

    item = Item(
        **data,
        user_id=current_user.id,
    )

    created_item = item_repository.create_item(session, item)
    return created_item


def get_public_items(
    session: Session,
    status_filter: ItemStatus = ItemStatus.active,
    item_type: ItemType | None = None,
    category: str | None = None,
    location_name: str | None = None,
    brand: str | None = None,
    color: str | None = None,
    search: str | None = None,
) -> list[Item]:
    return item_repository.get_items(
        session=session,
        status=status_filter,
        item_type=item_type,
        category=category,
        location_name=location_name,
        brand=brand,
        color=color,
        search=search,
    )


def get_public_item_by_id(
    session: Session,
    item_id: int,
) -> Item:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    return item


def get_my_items(
    session: Session,
    current_user: User,
) -> list[Item]:
    return item_repository.get_items_by_user_id(session, current_user.id)


def get_my_item_by_id(
    session: Session,
    item_id: int,
    current_user: User,
) -> Item:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to access this item",
        )

    return item


def update_item(
    session: Session,
    item_id: int,
    item_data: ItemUpdate,
    current_user: User,
) -> Item:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to update this item",
        )

    update_data = item_data.model_dump(exclude_unset=True)

    for key, value in update_data.items():
        setattr(item, key, value)

    if item.item_type == ItemType.found:
        item.reward_amount = None

    item.updated_at = datetime.utcnow()

    updated_item = item_repository.update_item(session, item)
    return updated_item


def delete_item(
    session: Session,
    item_id: int,
    current_user: User,
) -> None:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to delete this item",
        )

    item_repository.delete_item(session, item)


def resolve_item(
    session: Session,
    item_id: int,
    current_user: User,
) -> Item:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to resolve this item",
        )

    item.status = ItemStatus.resolved
    item.updated_at = datetime.utcnow()

    updated_item = item_repository.update_item(session, item)
    return updated_item


def expire_item(
    session: Session,
    item_id: int,
    current_user: User,
) -> Item:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to expire this item",
        )

    item.status = ItemStatus.expired
    item.updated_at = datetime.utcnow()

    updated_item = item_repository.update_item(session, item)
    return updated_item