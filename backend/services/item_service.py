from datetime import datetime

from fastapi import BackgroundTasks, HTTPException, UploadFile, status
from sqlmodel import Session
from services.item_match_service import run_item_matching_job
from models.item_model import Item, ItemStatus, ItemType
from models.user_model import User
from repositories import item_repository
from schemas.item_schema import ItemCreate, ItemUpdate
from services import upload_service

MATCH_RELEVANT_FIELDS = {
    "title",
    "description",
    "category",
    "location_name",
    "brand",
    "color",
    "event_date",
    "latitude",
    "longitude",
    "status",
}

def create_item(
    session: Session,
    item_data: ItemCreate,
    current_user: User,
    background_tasks: BackgroundTasks,
) -> Item:
    data = item_data.model_dump()

    if data["item_type"] == ItemType.found:
        data["reward_amount"] = None

    item = Item(
        **data,
        user_id=current_user.id,
    )
    item = item_repository.create_item(session, item)

    background_tasks.add_task(run_item_matching_job, item.id)

    return item


def add_item_images(
    session: Session,
    item_id: int,
    images: list[UploadFile],
    current_user: User,
) -> list[str]:
    item = item_repository.get_item_by_id(session, item_id)

    if item is None:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You are not allowed to upload images for this item",
        )

    image_urls = upload_service.save_item_images(images)
    item.updated_at = datetime.utcnow()
    item_repository.add_item_images(session, item, image_urls)
    return image_urls


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
    background_tasks: BackgroundTasks,
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
    should_rerun_matching = bool(MATCH_RELEVANT_FIELDS & set(update_data.keys()))

    for key, value in update_data.items():
        setattr(item, key, value)

    if item.item_type == ItemType.found:
        item.reward_amount = None

    item.updated_at = datetime.utcnow()

    item = item_repository.update_item(session, item)
    if should_rerun_matching:
        background_tasks.add_task(run_item_matching_job, item.id)

    return item


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

    return item_repository.update_item(session, item)


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

    return item_repository.update_item(session, item)
