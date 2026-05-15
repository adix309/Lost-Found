from typing import Optional

from sqlmodel import Session, select

from models.item_model import Item, ItemStatus, ItemType


def create_item(session: Session, item: Item) -> Item:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def get_item_by_id(session: Session, item_id: int) -> Optional[Item]:
    return session.get(Item, item_id)


def get_items(
    session: Session,
    status: Optional[ItemStatus] = None,
    item_type: Optional[ItemType] = None,
    category: Optional[str] = None,
    search: Optional[str] = None,
) -> list[Item]:
    statement = select(Item)

    if status is not None:
        statement = statement.where(Item.status == status)

    if item_type is not None:
        statement = statement.where(Item.item_type == item_type)

    if category is not None:
        statement = statement.where(Item.category == category)

    if search is not None:
        search_pattern = f"%{search}%"
        statement = statement.where(
            Item.title.ilike(search_pattern) |
            Item.description.ilike(search_pattern) |
            Item.location_name.ilike(search_pattern)
        )

    return list(session.exec(statement).all())


def get_items_by_user_id(session: Session, user_id: int) -> list[Item]:
    statement = select(Item).where(Item.user_id == user_id)
    return list(session.exec(statement).all())


def update_item(session: Session, item: Item) -> Item:
    session.add(item)
    session.commit()
    session.refresh(item)
    return item


def delete_item(session: Session, item: Item) -> None:
    session.delete(item)
    session.commit()