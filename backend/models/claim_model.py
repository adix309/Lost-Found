from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from enum import Enum
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

if TYPE_CHECKING:
    from models.user_model import User
    from models.item_model import Item


class ClaimStatus(str, Enum):
    pending = "pending"
    under_verification = "under_verification"
    approved = "approved"
    accepted = "accepted"  # keeping for backward compatibility
    handoff_pending = "handoff_pending"
    completed = "completed"
    rejected = "rejected"
    cancelled = "cancelled"


class Claim(SQLModel, table=True):
    __tablename__ = "claims"

    id: Optional[int] = Field(default=None, primary_key=True)

    item_id: int = Field(foreign_key="items.id")
    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE")
    lost_item_id: Optional[int] = Field(default=None, foreign_key="items.id", nullable=True)

    message: str
    proof_description: Optional[str] = None

    status: ClaimStatus = Field(default=ClaimStatus.pending)

    claimer_confirmed_handoff: bool = Field(default=False)
    owner_confirmed_handoff: bool = Field(default=False)
    verification_answers: Optional[list[dict]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )

    reviewed_at: Optional[datetime] = None

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    item: "Item" = Relationship(
        back_populates="claims",
        sa_relationship_kwargs={
            "primaryjoin": "Claim.item_id == Item.id",
        }
    )
    user: "User" = Relationship(back_populates="claims")