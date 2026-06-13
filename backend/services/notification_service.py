from fastapi import HTTPException, status
from sqlmodel import Session

from models.notification_model import Notification, NotificationType
from repositories import notification_repository, user_repository


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