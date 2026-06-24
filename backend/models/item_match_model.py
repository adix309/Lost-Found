from datetime import datetime
from enum import Enum
from typing import Optional

from sqlmodel import SQLModel, Field
from sqlalchemy import Column
from sqlalchemy.dialects.postgresql import JSONB


class MatchStatus(str, Enum):
    suggested = "suggested"
    notified = "notified"
    dismissed = "dismissed"
    claimed = "claimed"
    resolved = "resolved"


class ItemMatch(SQLModel, table=True):
    __tablename__ = "item_matches"

    id: Optional[int] = Field(default=None, primary_key=True)

    lost_item_id: int = Field(foreign_key="items.id", index=True, ondelete="CASCADE")
    found_item_id: int = Field(foreign_key="items.id", index=True, ondelete="CASCADE")

    score: float = Field(index=True)
    title_score: float = 0.0
    description_score: float = 0.0
    brand_score: float = 0.0
    color_score: float = 0.0
    category_score: float = 0.0
    location_score: float = 0.0
    date_score: float = 0.0

    reasons: dict | None = Field(
        default=None,
        sa_column=Column(JSONB, nullable=True)
    )

    image_similarity_score: Optional[float] = Field(default=None, nullable=True)
    final_score: Optional[float] = Field(default=None, nullable=True)
    used_image_reranking: bool = Field(default=False)

    status: MatchStatus = Field(default=MatchStatus.suggested, index=True)
    notified_at: Optional[datetime] = None
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)