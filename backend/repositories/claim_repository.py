from sqlmodel import Session, select

from models.claim_model import Claim


def create_claim(session: Session, claim: Claim) -> Claim:
    session.add(claim)
    session.commit()
    session.refresh(claim)
    return claim


def get_claim_by_id(session: Session, claim_id: int) -> Claim | None:
    return session.get(Claim, claim_id)


def get_claims_by_user_id(session: Session, user_id: int) -> list[Claim]:
    statement = select(Claim).where(Claim.user_id == user_id)
    return list(session.exec(statement).all())


def get_claims_by_item_id(session: Session, item_id: int) -> list[Claim]:
    statement = select(Claim).where(Claim.item_id == item_id)
    return list(session.exec(statement).all())


def update_claim(session: Session, claim: Claim) -> Claim:
    session.add(claim)
    session.commit()
    session.refresh(claim)
    return claim


def delete_claim(session: Session, claim: Claim) -> None:
    session.delete(claim)
    session.commit()