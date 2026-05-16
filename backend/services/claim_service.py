from datetime import datetime

from fastapi import HTTPException, status
from sqlmodel import Session

from models.claim_model import Claim, ClaimStatus
from models.user_model import User
from models.item_model import Item
from schemas.claim_schema import ClaimCreate, ClaimUserUpdate, ClaimStatusUpdate
from repositories import claim_repository, item_repository


def create_claim(
    session: Session,
    item_id: int,
    claim_data: ClaimCreate,
    current_user: User,
) -> Claim:
    item = item_repository.get_item_by_id(session, item_id)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot claim your own item",
        )

    claim = Claim(
        item_id=item_id,
        user_id=current_user.id,
        message=claim_data.message,
        proof_description=claim_data.proof_description,
    )

    return claim_repository.create_claim(session, claim)


def get_my_claims(
    session: Session,
    current_user: User,
) -> list[Claim]:
    return claim_repository.get_claims_by_user_id(session, current_user.id)


def get_claim_by_id(
    session: Session,
    claim_id: int,
    current_user: User,
) -> Claim:
    claim = claim_repository.get_claim_by_id(session, claim_id)

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found",
        )

    if claim.user_id != current_user.id and claim.item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not allowed to view this claim",
        )

    return claim


def get_claims_for_item(
    session: Session,
    item_id: int,
    current_user: User,
) -> list[Claim]:
    item = item_repository.get_item_by_id(session, item_id)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only item owner can view claims for this item",
        )

    return claim_repository.get_claims_by_item_id(session, item_id)


def update_my_claim(
    session: Session,
    claim_id: int,
    claim_data: ClaimUserUpdate,
    current_user: User,
) -> Claim:
    claim = claim_repository.get_claim_by_id(session, claim_id)

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found",
        )

    if claim.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only update your own claim",
        )

    if claim.status != ClaimStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot edit a processed claim",
        )

    if claim_data.message is not None:
        claim.message = claim_data.message

    if claim_data.proof_description is not None:
        claim.proof_description = claim_data.proof_description

    claim.updated_at = datetime.utcnow()

    return claim_repository.update_claim(session, claim)


def update_claim_status(
    session: Session,
    claim_id: int,
    status_data: ClaimStatusUpdate,
    current_user: User,
) -> Claim:
    claim = claim_repository.get_claim_by_id(session, claim_id)

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found",
        )

    if claim.item.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only item owner can update claim status",
        )

    claim.status = status_data.status
    claim.reviewed_at = datetime.utcnow()
    claim.updated_at = datetime.utcnow()

    return claim_repository.update_claim(session, claim)


def delete_my_claim(
    session: Session,
    claim_id: int,
    current_user: User,
) -> None:
    claim = claim_repository.get_claim_by_id(session, claim_id)

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found",
        )

    if claim.user_id != current_user.id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You can only delete your own claim",
        )

    if claim.status != ClaimStatus.pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot delete a processed claim",
        )

    claim_repository.delete_claim(session, claim)