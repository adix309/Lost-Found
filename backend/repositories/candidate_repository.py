from sqlmodel import Session
from sqlalchemy import text

from models.item_model import Item


def get_candidate_items_for_matching(
    session: Session,
    source_item: Item,
    limit: int = 50,
) -> list:
    opposite_type = "found" if source_item.item_type == "lost" else "lost"

    query = text("""
        SELECT i.*
        FROM items i
        WHERE i.id != :item_id
          AND i.status = 'active'
          AND i.item_type = :opposite_type
          AND i.event_date BETWEEN (:event_date - interval '30 day') AND (:event_date + interval '30 day')
          AND (
                lower(coalesce(i.category, '')) = lower(:category)
                OR similarity(lower(coalesce(i.category, '')), lower(:category)) > 0.35
                OR similarity(lower(coalesce(i.title, '')), lower(:title)) > 0.20
                OR similarity(lower(coalesce(i.description, '')), lower(:description)) > 0.15
          )
        ORDER BY (
            similarity(lower(coalesce(i.title, '')), lower(:title)) * 0.30 +
            similarity(lower(coalesce(i.description, '')), lower(:description)) * 0.25 +
            similarity(lower(coalesce(i.location_name, '')), lower(:location_name)) * 0.15 +
            similarity(lower(coalesce(i.brand, '')), lower(:brand)) * 0.10 +
            similarity(lower(coalesce(i.color, '')), lower(:color)) * 0.05 +
            similarity(lower(coalesce(i.category, '')), lower(:category)) * 0.15
        ) DESC,
        i.created_at DESC
        LIMIT :limit
    """)

    print(
        f"[CANDIDATE QUERY] item_id={source_item.id} "
        f"type={source_item.item_type} opposite_type={opposite_type} "
        f"event_date={source_item.event_date} category={source_item.category!r} "
        f"title={source_item.title!r}"
    )

    rows = session.exec(
        query,
        params={
            "item_id": source_item.id,
            "opposite_type": opposite_type,
            "category": source_item.category or "",
            "event_date": source_item.event_date,
            "title": source_item.title or "",
            "description": source_item.description or "",
            "location_name": source_item.location_name or "",
            "brand": source_item.brand or "",
            "color": source_item.color or "",
            "limit": limit,
        }
    ).all()

    print(f"[CANDIDATE QUERY] found_rows={len(rows)}")
    for r in rows[:5]:
        print(f"[CANDIDATE QUERY] row={r}")

    return list(rows)