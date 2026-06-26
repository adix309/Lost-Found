from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlmodel import SQLModel, Field, Relationship
from pydantic import EmailStr
from enum import Enum
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB

if TYPE_CHECKING:
    from models.user_model import User
    from models.claim_model import Claim


class ItemType(str, Enum):
    lost = "lost"
    found = "found"


class ItemStatus(str, Enum):
    active = "active"
    resolved = "resolved"
    expired = "expired"


class Item(SQLModel, table=True):
    __tablename__ = "items"

    id: Optional[int] = Field(default=None, primary_key=True)

    user_id: int = Field(foreign_key="users.id", ondelete="CASCADE")

    user: "User" = Relationship(back_populates="items")
    claims: list["Claim"] = Relationship(
        back_populates="item",
        cascade_delete=True,
        sa_relationship_kwargs={
            "primaryjoin": "Claim.item_id == Item.id",
        }
    )
    images: list["ItemImage"] = Relationship(
        back_populates="item",
        cascade_delete=True,
    )
   

    title: str
    description: str

    item_type: ItemType
    category: str

    location_name: Optional[str] = None
    latitude: Optional[float] = None
    longitude: Optional[float] = None

    event_date: datetime

    image_url: Optional[str] = None

    brand: Optional[str] = None
    color: Optional[str] = None

    reward_amount: Optional[float] = None

    contact_phone: Optional[str] = None
    contact_email: Optional[EmailStr] = None

    hidden_unique_features: Optional[dict] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )

    status: ItemStatus = Field(default=ItemStatus.active)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    @property
    def image_urls(self) -> list[str]:
        urls = [image.image_url for image in self.images]

        if self.image_url and self.image_url not in urls:
            return [self.image_url, *urls]

        return urls


class ItemImage(SQLModel, table=True):
    __tablename__ = "item_images"

    id: Optional[int] = Field(default=None, primary_key=True)
    item_id: int = Field(foreign_key="items.id", ondelete="CASCADE")
    image_url: str
    embedding_status: str = Field(default="pending")
    embedding_model: Optional[str] = Field(default=None)
    embedding_vector: Optional[list[float]] = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    item: Item = Relationship(back_populates="images")
