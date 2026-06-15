from datetime import datetime
from typing import Optional
from pydantic import BaseModel

from models.notification_model import NotificationType


class NotificationCreateRequest(BaseModel):
    user_id: int
    type: NotificationType
    title: str
    body: str
    data: Optional[dict] = None


class NotificationRead(BaseModel):
    id: int
    user_id: int
    type: NotificationType
    title: str
    body: str
    is_read: bool
    created_at: datetime
    read_at: Optional[datetime] = None
    data: Optional[dict] = None


class NotificationListResponse(BaseModel):
    items: list[NotificationRead]

class NotificationBroadcastRequest(BaseModel):
    title: str
    body: str
    data: Optional[dict] = None