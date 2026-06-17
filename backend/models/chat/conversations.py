from datetime import datetime
from typing import Optional, TYPE_CHECKING

from sqlmodel import SQLModel, Field, Relationship

from models.chat.messages import Message

if TYPE_CHECKING:
    from models.user_model import User
    from models.item_model import Item
    


class Conversation(SQLModel, table=True):
    __tablename__ = "conversations"

    id: Optional[int] = Field(default=None, primary_key=True)

    # Oglas zbog kojeg je chat započet
    item_id: int = Field(foreign_key="items.id", ondelete="CASCADE")

    # Korisnik koji je vlasnik oglasa ili prvi učesnik razgovora
    participant_one_id: int = Field(foreign_key="users.id", ondelete="CASCADE")

    # Korisnik koji želi stupiti u kontakt
    participant_two_id: int = Field(foreign_key="users.id", ondelete="CASCADE")

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Poruke koje pripadaju ovoj konverzaciji
    messages: list["Message"] = Relationship(
        back_populates="conversation",
        cascade_delete=True,
    )
