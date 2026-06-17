from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from app.database import SessionDep
from core.dependencies import get_current_user
from models.item_model import Item
from models.user_model import User
from models.verification_question_model import VerificationQuestion

router = APIRouter()


class VerificationQuestionCreate(BaseModel):
    question_text: str


class VerificationQuestionsReplaceRequest(BaseModel):
    questions: list[VerificationQuestionCreate]


@router.get("/items/{item_id}")
def get_questions_for_item(
    item_id: int,
    session: SessionDep,
):
    item = session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=404, detail="Oglas nije pronađen.")

    questions = session.exec(
        select(VerificationQuestion)
        .where(VerificationQuestion.item_id == item_id)
        .order_by(VerificationQuestion.id)
    ).all()

    return [
        {
            "id": question.id,
            "itemId": question.item_id,
            "questionText": question.question_text,
        }
        for question in questions
    ]


@router.put("/items/{item_id}")
def replace_questions_for_item(
    item_id: int,
    payload: VerificationQuestionsReplaceRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    item = session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=404, detail="Oglas nije pronađen.")

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Samo vlasnik oglasa može uređivati verifikaciona pitanja.",
        )

    # Obriši stara pitanja za ovaj item
    existing_questions = session.exec(
        select(VerificationQuestion).where(VerificationQuestion.item_id == item_id)
    ).all()

    for question in existing_questions:
        session.delete(question)

    # Dodaj nova pitanja, ako ih ima
    created_questions = []

    for question_data in payload.questions:
        question_text = question_data.question_text.strip()

        if not question_text:
            continue

        question = VerificationQuestion(
            item_id=item_id,
            question_text=question_text,
        )

        session.add(question)
        created_questions.append(question)

    session.commit()

    for question in created_questions:
        session.refresh(question)

    return [
        {
            "id": question.id,
            "itemId": question.item_id,
            "questionText": question.question_text,
        }
        for question in created_questions
    ]


@router.delete("/items/{item_id}")
def delete_questions_for_item(
    item_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    item = session.get(Item, item_id)

    if not item:
        raise HTTPException(status_code=404, detail="Oglas nije pronađen.")

    if item.user_id != current_user.id:
        raise HTTPException(
            status_code=403,
            detail="Samo vlasnik oglasa može brisati verifikaciona pitanja.",
        )

    questions = session.exec(
        select(VerificationQuestion).where(VerificationQuestion.item_id == item_id)
    ).all()

    for question in questions:
        session.delete(question)

    session.commit()

    return {"message": "Verifikaciona pitanja su obrisana."}
