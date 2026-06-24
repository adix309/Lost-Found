from typing import Optional

from sqlmodel import Session, select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from models.item_model import Item, ItemImage, ItemStatus, ItemType


def create_item(session: Session, item: Item) -> Item:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def get_item_by_id(session: Session, item_id: int) -> Optional[Item]:
    statement = (
        select(Item)
        .where(Item.id == item_id)
        .options(selectinload(Item.user), selectinload(Item.images))
    )

    return session.exec(statement).first()


def get_items(
    session: Session,
    status: Optional[ItemStatus] = None,
    user_id: Optional[int] = None,
    item_type: Optional[ItemType] = None,
    category: Optional[str] = None,
    location_name: Optional[str] = None,
    brand: Optional[str] = None,
    color: Optional[str] = None,
    search: Optional[str] = None,
) -> list[Item]:
    statement = select(Item).options(
        selectinload(Item.user),
        selectinload(Item.images),
    )

    if status is not None:
        statement = statement.where(Item.status == status)

    if user_id is not None:
        statement = statement.where(Item.user_id == user_id)

    if item_type is not None:
        statement = statement.where(Item.item_type == item_type)

    if category is not None and category.strip():
        statement = statement.where(Item.category.ilike(category.strip()))

    if location_name is not None and location_name.strip():
        statement = statement.where(Item.location_name.ilike(location_name.strip()))

    if brand is not None and brand.strip():
        statement = statement.where(Item.brand.ilike(brand.strip()))

    if color is not None and color.strip():
        statement = statement.where(Item.color.ilike(color.strip()))

    if search is not None and search.strip():
        search_pattern = f"%{search.strip()}%"
        statement = statement.where(
            Item.title.ilike(search_pattern)
            | Item.description.ilike(search_pattern)
            | Item.category.ilike(search_pattern)
            | func.coalesce(Item.location_name, "").ilike(search_pattern)
            | Item.brand.ilike(search_pattern)
            | Item.color.ilike(search_pattern)
        )

    return list(session.exec(statement).all())


def get_items_by_user_id(session: Session, user_id: int) -> list[Item]:
    statement = (
        select(Item)
        .where(Item.user_id == user_id)
        .options(selectinload(Item.user), selectinload(Item.images))
    )

    return list(session.exec(statement).all())


def update_item(session: Session, item: Item) -> Item:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def add_item_images(
    session: Session,
    item: Item,
    image_urls: list[str],
) -> list[ItemImage]:
    item_images = [
        ItemImage(item_id=item.id, image_url=image_url)
        for image_url in image_urls
    ]

    session.add_all(item_images)

    if image_urls and not item.image_url:
        item.image_url = image_urls[0]

    session.add(item)
    session.commit()

    for item_image in item_images:
        session.refresh(item_image)

    session.refresh(item)
    return item_images


def delete_item(session: Session, item: Item) -> None:
    session.delete(item)
    session.commit()
