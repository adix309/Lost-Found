from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum

if TYPE_CHECKING:
    from models.user_model import User
    from models.item_model import Item


class ClaimStatus(str, Enum):
    pending = "pending"
    accepted = "accepted"
    rejected = "rejected"


class Claim(SQLModel, table=True):
    __tablename__ = "claims"

    id: Optional[int] = Field(default=None, primary_key=True)

    item_id: int = Field(foreign_key="items.id")
    user_id: int = Field(foreign_key="users.id")

    message: str
    proof_description: Optional[str] = None

    status: ClaimStatus = Field(default=ClaimStatus.pending)

    reviewed_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    item: "Item" = Relationship(back_populates="claims")
    user: "User" = Relationship(back_populates="claims")