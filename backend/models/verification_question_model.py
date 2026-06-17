from datetime import datetime
from typing import Optional

from sqlmodel import SQLModel, Field


class VerificationQuestion(SQLModel, table=True):
    __tablename__ = "verification_questions"

    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="items.id", ondelete="CASCADE")
    question_text: str
    created_at: datetime = Field(default_factory=datetime.utcnow)
