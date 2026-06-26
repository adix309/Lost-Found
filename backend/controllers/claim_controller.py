from fastapi import APIRouter, Depends, status, BackgroundTasks
from sqlmodel import Session

from app.database import SessionDep
from core.dependencies import get_current_user
from models.user_model import User
from schemas.claim_schema import (
    ClaimCreate,
    ClaimRead,
    ClaimWithUserRead,
    ClaimFullRead,
    ClaimUserUpdate,
    ClaimStatusUpdate,
    ClaimWithItemRead,
)
from services import claim_service


router = APIRouter()


@router.post(
    "/items/{item_id}/claims",
    response_model=ClaimRead,
    status_code=status.HTTP_201_CREATED,
)
def create_claim(
    item_id: int,
    claim_data: ClaimCreate,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    return claim_service.create_claim(
        session=session,
        item_id=item_id,
        claim_data=claim_data,
        current_user=current_user,
        background_tasks=background_tasks,
    )


@router.get(
    "/claims/my",
    response_model=list[ClaimWithItemRead],
)
def get_my_claims(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return claim_service.get_my_claims(
        session=session,
        current_user=current_user,
    )


@router.get(
    "/claims/{claim_id}",
    response_model=ClaimFullRead,
)
def get_claim_by_id(
    claim_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return claim_service.get_claim_by_id(
        session=session,
        claim_id=claim_id,
        current_user=current_user,
    )


@router.get(
    "/items/{item_id}/claims",
    response_model=list[ClaimWithUserRead],
)
def get_claims_for_item(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return claim_service.get_claims_for_item(
        session=session,
        item_id=item_id,
        current_user=current_user,
    )


@router.patch(
    "/claims/{claim_id}",
    response_model=ClaimRead,
)
def update_my_claim(
    claim_id: int,
    claim_data: ClaimUserUpdate,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    return claim_service.update_my_claim(
        session=session,
        claim_id=claim_id,
        claim_data=claim_data,
        current_user=current_user,
    )


@router.patch(
    "/claims/{claim_id}/status",
    response_model=ClaimRead,
)
def update_claim_status(
    claim_id: int,
    status_data: ClaimStatusUpdate,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    return claim_service.update_claim_status(
        session=session,
        claim_id=claim_id,
        status_data=status_data,
        current_user=current_user,
        background_tasks=background_tasks,
    )


@router.delete(
    "/claims/{claim_id}",
    status_code=status.HTTP_204_NO_CONTENT,
)
def delete_my_claim(
    claim_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    claim_service.delete_my_claim(
        session=session,
        claim_id=claim_id,
        current_user=current_user,
    )


@router.post(
    "/claims/{claim_id}/confirm-handoff",
    response_model=ClaimRead,
)
def confirm_claim_handoff(
    claim_id: int,
    session: SessionDep,
    background_tasks: BackgroundTasks,
    current_user: User = Depends(get_current_user),
):
    return claim_service.confirm_claim_handoff(
        session=session,
        claim_id=claim_id,
        current_user=current_user,
        background_tasks=background_tasks,
    )