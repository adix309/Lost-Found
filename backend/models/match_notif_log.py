from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class MatchNotificationLog(SQLModel, table=True):
    __tablename__ = "match_notification_logs"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="users.id", index=True, ondelete="CASCADE")
    item_match_id: int = Field(foreign_key="item_matches.id", index=True, ondelete="CASCADE")

    channel: str = Field(index=True)  # "in_app", "email"
    created_at: datetime = Field(default_factory=datetime.utcnow)