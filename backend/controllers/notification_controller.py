from fastapi import APIRouter, Depends, Query

from core.dependencies import get_current_user, require_admin
from app.database import SessionDep
from models.user_model import User
from schemas.notification_schema import (
    NotificationCreateRequest,
    NotificationRead,
    NotificationListResponse,
    NotificationBroadcastRequest,
)
from services import notification_service

router = APIRouter()


@router.post("/", response_model=NotificationRead)
def create_notification(
    payload: NotificationCreateRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return notification_service.create_notification(
        session=session,
        user_id=payload.user_id,
        type=payload.type,
        title=payload.title,
        body=payload.body,
        data=payload.data,
    )


@router.get("/me", response_model=NotificationListResponse)
def list_my_notifications(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
    limit: int = Query(default=20, le=100),
    offset: int = Query(default=0, ge=0),
):
    items = notification_service.list_my_notifications(
        session=session,
        user_id=current_user.id,
        limit=limit,
        offset=offset,
    )
    return {"items": items}


@router.post("/{notification_id}/read", response_model=NotificationRead)
def mark_notification_as_read(
    notification_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return notification_service.read_notification(
        session=session,
        notification_id=notification_id,
        user_id=current_user.id,
    )

@router.post("/broadcast")
def broadcast_notification(
    payload: NotificationBroadcastRequest,
    session: SessionDep,
    admin_user: User = Depends(require_admin),
):
    return notification_service.broadcast_system_notification(
        session=session,
        title=payload.title,
        body=payload.body,
        data=payload.data,
    )
