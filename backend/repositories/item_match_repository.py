from sqlmodel import Session, select, col
from sqlalchemy import or_
from models.item_model import ItemType
from models.item_match_model import ItemMatch


def get_match_by_pair(session: Session, lost_item_id: int, found_item_id: int) -> ItemMatch | None:
    statement = select(ItemMatch).where(
        ItemMatch.lost_item_id == lost_item_id,
        ItemMatch.found_item_id == found_item_id,
    )
    return session.exec(statement).first()

def get_top_matches_for_item(
    session: Session,
    item_id: int,
    item_type: ItemType,
    limit: int = 3,
) -> list[ItemMatch]:
    if item_type == ItemType.lost:
        statement = (
            select(ItemMatch)
            .where(ItemMatch.lost_item_id == item_id)
            .order_by(col(ItemMatch.score).desc())
            .limit(limit)
        )
    else:
        statement = (
            select(ItemMatch)
            .where(ItemMatch.found_item_id == item_id)
            .order_by(col(ItemMatch.score).desc())
            .limit(limit)
        )

    return list(session.exec(statement).all())

def upsert_match(
    session: Session,
    *,
    lost_item_id: int,
    found_item_id: int,
    score_data: dict,
) -> ItemMatch:
    match = get_match_by_pair(session, lost_item_id, found_item_id)

    if match is None:
        match = ItemMatch(
            lost_item_id=lost_item_id,
            found_item_id=found_item_id,
            **score_data,
        )
    else:
        for key, value in score_data.items():
            setattr(match, key, value)

    session.add(match)
    session.commit()
    session.refresh(match)
    return match


def list_top_matches_for_item(session: Session, item_id: int, limit: int = 3) -> list[ItemMatch]:
    statement = (
        select(ItemMatch)
        .where((ItemMatch.lost_item_id == item_id) | (ItemMatch.found_item_id == item_id))
        .order_by(ItemMatch.score.desc())
        .limit(limit)
    )
    return list(session.exec(statement).all())