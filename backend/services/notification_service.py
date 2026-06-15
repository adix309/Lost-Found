from fastapi import HTTPException, status
from sqlmodel import Session

from repositories import item_repository, match_notif_log_repository, item_match_repository
from models.notification_model import Notification, NotificationType
from repositories import notification_repository, user_repository
from models.item_model import Item, ItemType

def _humanize_match_reasons(reasons: dict | list | None) -> list[str]:
    if not reasons:
        return []

    if isinstance(reasons, list):
        return [str(reason) for reason in reasons[:3]]

    if not isinstance(reasons, dict):
        return []

    reason_config = [
        ("title_score", "Sličan naslov", 0.55),
        ("title", "Sličan naslov", 0.55),
        ("description_score", "Sličan opis", 0.45),
        ("description", "Sličan opis", 0.45),
        ("brand_score", "Isti ili sličan brend", 0.70),
        ("brand", "Isti ili sličan brend", 0.70),
        ("color_score", "Slična boja", 0.65),
        ("color", "Slična boja", 0.65),
        ("category_score", "Ista kategorija", 0.80),
        ("category", "Ista kategorija", 0.80),
        ("location_score", "Slična lokacija", 0.55),
        ("location", "Slična lokacija", 0.55),
        ("location_name", "Slična lokacija", 0.55),
        ("date_score", "Blizak datum događaja", 0.50),
        ("date", "Blizak datum događaja", 0.50),
    ]

    readable_reasons: list[tuple[str, float]] = []

    for key, label, threshold in reason_config:
        raw_value = reasons.get(key)

        if raw_value is None:
            continue

        try:
            numeric_value = float(raw_value)
        except (TypeError, ValueError):
            continue

        if numeric_value >= threshold:
            readable_reasons.append((label, numeric_value))

    readable_reasons.sort(key=lambda item: item[1], reverse=True)

    unique_labels: list[str] = []
    seen = set()

    for label, _score in readable_reasons:
        if label not in seen:
            unique_labels.append(label)
            seen.add(label)

    return unique_labels[:3]

def create_notification(
    session: Session,
    user_id: int,
    type: NotificationType,
    title: str,
    body: str,
    data: dict | None = None,
):
    notification = Notification(
        user_id=user_id,
        type=type,
        title=title,
        body=body,
        data=data,
    )
    return notification_repository.create(session, notification)


def list_my_notifications(session: Session, user_id: int, limit: int = 20, offset: int = 0):
    return notification_repository.get_for_user(session, user_id=user_id, limit=limit, offset=offset)


def read_notification(session: Session, notification_id: int, user_id: int):
    notification = notification_repository.mark_as_read(session, notification_id, user_id)
    if not notification:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notifikacija nije pronađena."
        )
    return notification


def broadcast_system_notification(
    session: Session,
    title: str,
    body: str,
    data: dict | None = None,
) -> dict:
    users = user_repository.get_all_active(session)

    if not users:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Nema aktivnih korisnika za slanje notifikacije.",
        )

    notifications = [
        Notification(
            user_id=user.id,
            type=NotificationType.SYSTEM_NOTIFICATION,
            title=title,
            body=body,
            data=data,
        )
        for user in users
    ]

    session.add_all(notifications)
    session.commit()

    return {
        "sent_count": len(notifications),
        "message": "Sistemska notifikacija je uspješno poslana svim aktivnim korisnicima.",
    }


def _serialize_match_preview(session: Session, match, target_item: Item) -> dict:
    if target_item.item_type == ItemType.lost:
        counterpart_item_id = match.found_item_id
    else:
        counterpart_item_id = match.lost_item_id

    counterpart_item = item_repository.get_item_by_id(session, counterpart_item_id)

    return {
        "match_id": match.id,
        "item_id": counterpart_item.id if counterpart_item else counterpart_item_id,
        "title": counterpart_item.title if counterpart_item else "Nepoznat predmet",
        "category": counterpart_item.category if counterpart_item else None,
        "location_name": counterpart_item.location_name if counterpart_item else None,
        "event_date": counterpart_item.event_date.isoformat() if counterpart_item and counterpart_item.event_date else None,
        "score": match.score,
        "reasons": _humanize_match_reasons(match.reasons),
    }


def notify_top_matches_for_item(session: Session, source_item: Item, matches: list):
    if not matches:
        return

    grouped_matches_by_target_item_id: dict[int, list] = {}

    for match in matches:
        if source_item.item_type == ItemType.found:
            target_item_id = match.lost_item_id
        else:
            target_item_id = match.found_item_id

        grouped_matches_by_target_item_id.setdefault(target_item_id, []).append(match)

    for target_item_id, _relevant_matches in grouped_matches_by_target_item_id.items():
        target_item = item_repository.get_item_by_id(session, target_item_id)
        if not target_item:
            continue

        top_matches_for_target = item_match_repository.get_top_matches_for_item(
            session=session,
            item_id=target_item.id,
            item_type=target_item.item_type,
            limit=3,
        )

        if not top_matches_for_target:
            continue

        best_match = top_matches_for_target[0]

        if match_notif_log_repository.was_recently_notified(
            session,
            user_id=target_item.user_id,
            item_match_id=best_match.id,
            channel="in_app",
            within_hours=72,
        ):
            continue

        match_previews = [
            _serialize_match_preview(session, match, target_item)
            for match in top_matches_for_target
        ]

        create_notification(
            session=session,
            user_id=target_item.user_id,
            type=NotificationType.POTENTIAL_MATCH,
            title="Pronašli smo moguće poklapanje",
            body=f"Imamo do 3 potencijalna poklapanja za vaš predmet '{target_item.title}'.",
            data={
                "source_item_id": target_item.id,
                "source_item_title": target_item.title,
                "best_score": best_match.score,
                "matches": match_previews,
            },
        )

        match_notif_log_repository.create_notification_log(
            session,
            user_id=target_item.user_id,
            item_match_id=best_match.id,
            channel="in_app",
        )