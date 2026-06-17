from datetime import datetime, timedelta
from sqlmodel import Session, select

from models.match_notif_log import MatchNotificationLog


def was_recently_notified(
    session: Session,
    *,
    user_id: int,
    item_match_id: int,
    channel: str,
    within_hours: int = 72,
) -> bool:
    cutoff = datetime.utcnow() - timedelta(hours=within_hours)

    statement = select(MatchNotificationLog).where(
        MatchNotificationLog.user_id == user_id,
        MatchNotificationLog.item_match_id == item_match_id,
        MatchNotificationLog.channel == channel,
        MatchNotificationLog.created_at >= cutoff,
    )
    return session.exec(statement).first() is not None


def create_notification_log(
    session: Session,
    *,
    user_id: int,
    item_match_id: int,
    channel: str,
) -> MatchNotificationLog:
    log = MatchNotificationLog(
        user_id=user_id,
        item_match_id=item_match_id,
        channel=channel,
    )
    session.add(log)
    session.commit()
    session.refresh(log)
    return log