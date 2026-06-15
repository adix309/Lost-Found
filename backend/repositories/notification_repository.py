from datetime import datetime, timezone
from sqlmodel import Session, select

from models.notification_model import Notification


def create(session: Session, notification: Notification):
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification


def get_for_user(session: Session, user_id: int, limit: int = 20, offset: int = 0):
    statement = (
        select(Notification)
        .where(Notification.user_id == user_id)
        .order_by(Notification.created_at.desc())
        .offset(offset)
        .limit(limit)
    )
    return list(session.exec(statement).all())


def mark_as_read(session: Session, notification_id: int, user_id: int) -> Notification | None:
    statement = select(Notification).where(
        Notification.id == notification_id,
        Notification.user_id == user_id,
    )
    notification = session.exec(statement).first()
    if not notification:
        return None

    notification.is_read = True
    notification.read_at = datetime.now(timezone.utc)
    session.add(notification)
    session.commit()
    session.refresh(notification)
    return notification