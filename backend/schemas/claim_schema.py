from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models.claim_model import ClaimStatus
from schemas.user_schema import UserRead
from schemas.item_schema import ItemRead


class ClaimCreate(BaseModel):
    message: str
    proof_description: Optional[str] = None


class ClaimUserUpdate(BaseModel):
    message: Optional[str] = None
    proof_description: Optional[str] = None


class ClaimStatusUpdate(BaseModel):
    status: ClaimStatus


class ClaimRead(BaseModel):
    id: int
    item_id: int
    user_id: int

    message: str
    proof_description: Optional[str] = None

    status: ClaimStatus

    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class ClaimWithUserRead(ClaimRead):
    user: Optional[UserRead] = None


class ClaimWithItemRead(ClaimRead):
    item: Optional[ItemRead] = None


class ClaimFullRead(ClaimRead):
    user: Optional[UserRead] = None
    item: Optional[ItemRead] = None