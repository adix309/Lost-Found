from datetime import datetime
from typing import Optional

from fastapi import HTTPException, status, BackgroundTasks
from sqlmodel import Session, select

from models.claim_model import Claim, ClaimStatus
from models.user_model import User
from models.item_model import Item, ItemType, ItemStatus
from models.verification_question_model import VerificationQuestion
from models.item_match_model import MatchStatus
from models.notification_model import NotificationType
from schemas.claim_schema import ClaimCreate, ClaimUserUpdate, ClaimStatusUpdate
from repositories import claim_repository, item_repository
from services.notification_service import create_notification


def create_claim(
    session: Session,
    item_id: int,
    claim_data: ClaimCreate,
    current_user: User,
    background_tasks: Optional[BackgroundTasks] = None,
) -> Claim:
    item = item_repository.get_item_by_id(session, item_id)

    if not item:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Item not found",
        )

    if item.item_type != ItemType.found:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Možeš podnijeti claim samo za pronađene predmete (found).",
        )

    if item.user_id == current_user.id:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot claim your own item",
        )

    # Check for active/pending claims by this user for the same item
    existing_claims = claim_repository.get_claims_by_user_id(session, current_user.id)
    for c in existing_claims:
        if c.item_id == item_id and c.status not in (ClaimStatus.rejected, ClaimStatus.cancelled):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Već imaš aktivan claim za ovaj predmet.",
            )

    # Validate lost_item_id if provided
    if claim_data.lost_item_id:
        lost_item = item_repository.get_item_by_id(session, claim_data.lost_item_id)
        if not lost_item:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Lost item not found",
            )
        if lost_item.user_id != current_user.id:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You do not own the associated lost item",
            )
        if lost_item.item_type != ItemType.lost:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Associated item must be a lost item",
            )

    # Validate verification questions/answers
    verification_questions = session.exec(
        select(VerificationQuestion)
        .where(VerificationQuestion.item_id == item.id)
        .order_by(VerificationQuestion.id)
    ).all()

    answers_list = None
    if verification_questions and claim_data.verification_answers is not None:
        answers = claim_data.verification_answers

        if len(answers) != len(verification_questions):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Moraš odgovoriti na sva verifikaciona pitanja.",
            )

        question_ids = {question.id for question in verification_questions}
        answer_question_ids = {answer.question_id for answer in answers}

        if question_ids != answer_question_ids:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Odgovori ne odgovaraju verifikacionim pitanjima.",
            )

        for answer in answers:
            if not answer.answer.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Odgovori ne smiju biti prazni.",
                )
        answers_list = [a.model_dump() for a in answers]

    claim = Claim(
        item_id=item_id,
        user_id=current_user.id,
        lost_item_id=claim_data.lost_item_id,
        message=claim_data.message,
        proof_description=claim_data.proof_description,
        verification_answers=answers_list,
        status=ClaimStatus.pending,
    )

    created_claim = claim_repository.create_claim(session, claim)

    # Update ItemMatch status to claimed if exists
    if claim_data.lost_item_id:
        from repositories import item_match_repository
        match_rec = item_match_repository.get_match_by_pair(
            session,
            lost_item_id=claim_data.lost_item_id,
            found_item_id=item_id
        )
        if match_rec:
            match_rec.status = MatchStatus.claimed
            session.add(match_rec)
            session.commit()

    # Notify found item owner
    create_notification(
        session=session,
        user_id=item.user_id,
        type=NotificationType.SYSTEM_NOTIFICATION,
        title="Novi claim za vaš predmet",
        body=f"Korisnik je podnio claim za vaš pronađeni predmet '{item.title}'.",
        data={"claim_id": created_claim.id, "item_id": item.id},
        background_tasks=background_tasks,
    )

    return created_claim


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

    if claim.status not in (ClaimStatus.pending, ClaimStatus.under_verification):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You cannot edit a processed claim",
        )

    if claim_data.message is not None:
        claim.message = claim_data.message

    if claim_data.proof_description is not None:
        claim.proof_description = claim_data.proof_description

    if claim_data.verification_answers is not None:
        # Validate that answers are not empty
        for ans in claim_data.verification_answers:
            if not ans.answer.strip():
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Odgovori ne smiju biti prazni.",
                )
        claim.verification_answers = [ans.model_dump() for ans in claim_data.verification_answers]

    claim.updated_at = datetime.utcnow()

    return claim_repository.update_claim(session, claim)


def update_claim_status(
    session: Session,
    claim_id: int,
    status_data: ClaimStatusUpdate,
    current_user: User,
    background_tasks: Optional[BackgroundTasks] = None,
) -> Claim:
    claim = claim_repository.get_claim_by_id(session, claim_id)

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found",
        )

    # Block if already in terminal state
    if claim.status in (ClaimStatus.completed, ClaimStatus.cancelled, ClaimStatus.rejected):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Ne možeš mijenjati status završenog, otkazanog ili odbijenog claima."
        )

    if claim.user_id == current_user.id:
        # Claimant is performing the status change (e.g. cancelling)
        if status_data.status != ClaimStatus.cancelled:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Kao podnositelj claima, možeš samo otkazati claim (cancelled)."
            )
        claim.status = ClaimStatus.cancelled

        # Notify found item owner
        create_notification(
            session=session,
            user_id=claim.item.user_id,
            type=NotificationType.SYSTEM_NOTIFICATION,
            title="Claim otkazan",
            body=f"Korisnik je otkazao claim za vaš predmet '{claim.item.title}'.",
            data={"claim_id": claim.id, "item_id": claim.item_id},
            background_tasks=background_tasks,
        )
    elif claim.item.user_id == current_user.id:
        # Found item owner is performing status change
        allowed_owner_statuses = {
            ClaimStatus.under_verification,
            ClaimStatus.approved,
            ClaimStatus.handoff_pending,
            ClaimStatus.rejected
        }
        if status_data.status not in allowed_owner_statuses:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"Kao vlasnik oglasa, ne možeš postaviti status na {status_data.status}."
            )
        claim.status = status_data.status
        claim.reviewed_at = datetime.utcnow()

        # Notify claimant
        status_translations = {
            ClaimStatus.under_verification: ("u procesu provjere", "provjerava vaš claim"),
            ClaimStatus.approved: ("odobren", "je odobrio vaš claim. Slijedi fizička primopredaja"),
            ClaimStatus.handoff_pending: ("spreman za primopredaju", "je pokrenuo primopredaju"),
            ClaimStatus.rejected: ("odbijen", "je odbio vaš claim"),
        }

        translation = status_translations.get(claim.status, (str(claim.status), f"je postavio status na {claim.status}"))
        create_notification(
            session=session,
            user_id=claim.user_id,
            type=NotificationType.SYSTEM_NOTIFICATION,
            title=f"Claim je {translation[0]}",
            body=f"Vlasnik predmeta '{claim.item.title}' {translation[1]}.",
            data={"claim_id": claim.id, "item_id": claim.item_id},
            background_tasks=background_tasks,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Only item owner or claimant can update claim status",
        )

    claim.updated_at = datetime.utcnow()
    return claim_repository.update_claim(session, claim)


def confirm_claim_handoff(
    session: Session,
    claim_id: int,
    current_user: User,
    background_tasks: Optional[BackgroundTasks] = None,
) -> Claim:
    claim = claim_repository.get_claim_by_id(session, claim_id)

    if not claim:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Claim not found",
        )

    if claim.status != ClaimStatus.handoff_pending:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Primopredaja se može potvrditi samo kada je claim u statusu 'handoff_pending'."
        )

    if current_user.id == claim.user_id:
        claim.claimer_confirmed_handoff = True
        # Notify owner
        create_notification(
            session=session,
            user_id=claim.item.user_id,
            type=NotificationType.SYSTEM_NOTIFICATION,
            title="Tražitelj je potvrdio primopredaju",
            body=f"Korisnik koji je claimao oglas '{claim.item.title}' je potvrdio uspješnu primopredaju. Potvrdite i vi kako bi se oglas zatvorio.",
            data={"claim_id": claim.id, "item_id": claim.item_id},
            background_tasks=background_tasks,
        )
    elif current_user.id == claim.item.user_id:
        claim.owner_confirmed_handoff = True
        # Notify claimant
        create_notification(
            session=session,
            user_id=claim.user_id,
            type=NotificationType.SYSTEM_NOTIFICATION,
            title="Vlasnik je potvrdio primopredaju",
            body=f"Vlasnik predmeta '{claim.item.title}' je potvrdio uspješnu primopredaju. Potvrdite i vi kako bi se oglas zatvorio.",
            data={"claim_id": claim.id, "item_id": claim.item_id},
            background_tasks=background_tasks,
        )
    else:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Nemaš pristup ovom claimu.",
        )

    if claim.claimer_confirmed_handoff and claim.owner_confirmed_handoff:
        claim.status = ClaimStatus.completed

        # Mark found item (item_id) as resolved
        found_item = claim.item
        found_item.status = ItemStatus.resolved
        found_item.updated_at = datetime.utcnow()
        session.add(found_item)

        # Mark lost item (lost_item_id) as resolved if exists
        if claim.lost_item_id:
            lost_item = item_repository.get_item_by_id(session, claim.lost_item_id)
            if lost_item:
                lost_item.status = ItemStatus.resolved
                lost_item.updated_at = datetime.utcnow()
                session.add(lost_item)

            # Update match status to resolved
            from repositories import item_match_repository
            match_rec = item_match_repository.get_match_by_pair(
                session,
                lost_item_id=claim.lost_item_id,
                found_item_id=claim.item_id
            )
            if match_rec:
                match_rec.status = MatchStatus.resolved
                session.add(match_rec)

        # Notify both users that item resolved
        create_notification(
            session=session,
            user_id=claim.item.user_id,
            type=NotificationType.ITEM_RESOLVED,
            title="Primopredaja završena - predmet vraćen",
            body=f"Predmet iz oglasa '{claim.item.title}' je uspješno vraćen. Oglas je riješen (resolved).",
            data={"claim_id": claim.id, "item_id": claim.item_id},
            background_tasks=background_tasks,
        )
        create_notification(
            session=session,
            user_id=claim.user_id,
            type=NotificationType.ITEM_RESOLVED,
            title="Primopredaja završena - predmet vraćen",
            body=f"Predmet iz oglasa '{claim.item.title}' je uspješno vraćen. Oglas je riješen (resolved).",
            data={"claim_id": claim.id, "item_id": claim.item_id},
            background_tasks=background_tasks,
        )

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