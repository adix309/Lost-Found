from datetime import datetime
from typing import Optional

from pydantic import BaseModel

from models.claim_model import ClaimStatus
from schemas.user_schema import UserRead
from schemas.item_schema import ItemRead


class ClaimVerificationAnswer(BaseModel):
    question_id: int
    question_text: str
    answer: str


class ClaimCreate(BaseModel):
    message: str
    proof_description: Optional[str] = None
    lost_item_id: Optional[int] = None
    verification_answers: Optional[list[ClaimVerificationAnswer]] = None


class ClaimUserUpdate(BaseModel):
    message: Optional[str] = None
    proof_description: Optional[str] = None
    verification_answers: Optional[list[ClaimVerificationAnswer]] = None


class ClaimStatusUpdate(BaseModel):
    status: ClaimStatus


class ClaimRead(BaseModel):
    id: int
    item_id: int
    user_id: int
    lost_item_id: Optional[int] = None

    message: str
    proof_description: Optional[str] = None

    status: ClaimStatus

    claimer_confirmed_handoff: bool = False
    owner_confirmed_handoff: bool = False
    verification_answers: Optional[list[ClaimVerificationAnswer]] = None

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