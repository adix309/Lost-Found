from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

if TYPE_CHECKING:
    from models.user_model import User
    from models.chat.conversations import Conversation


class Message(SQLModel, table=True):
    __tablename__ = "messages"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Chat/conversation kojem poruka pripada
    conversation_id: int = Field(
        foreign_key="conversations.id",
        ondelete="CASCADE",
    )

    # Korisnik koji je poslao poruku
    sender_id: int = Field(foreign_key="users.id", ondelete="CASCADE")

    # Tekst poruke
    content: str

    # Da li je poruka pročitana
    is_read: bool = Field(default=False)

    created_at: datetime = Field(default_factory=datetime.utcnow)

    conversation: "Conversation" = Relationship(back_populates="messages")
