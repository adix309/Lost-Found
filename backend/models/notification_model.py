from datetime import datetime, timezone
from enum import Enum
from typing import Optional

from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB
from sqlmodel import SQLModel, Field


def utcnow():
    return datetime.now(timezone.utc)


class NotificationType(str, Enum):
    POTENTIAL_MATCH = "potential_match"
    CONVERSATION_STARTED = "conversation_started"
    ITEM_RESOLVED = "item_resolved"
    ITEM_REMOVED_BY_ADMIN = "item_removed_by_admin"
    SYSTEM_NOTIFICATION = "system_notification"


class Notification(SQLModel, table=True):
    __tablename__ = "notifications"

    id: Optional[int] = Field(default=None, primary_key=True)
    user_id: int = Field(foreign_key="users.id", index=True)
    type: NotificationType = Field(index=True)
    title: str = Field(max_length=255)
    body: str = Field(max_length=1000)
    is_read: bool = Field(default=False, index=True)
    created_at: datetime = Field(default_factory=utcnow, index=True)
    read_at: Optional[datetime] = Field(default=None)

    data: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )
