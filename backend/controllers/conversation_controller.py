from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlmodel import select

from app.database import SessionDep
from core.dependencies import get_current_user
from models.item_model import Item
from models.chat.conversations import Conversation
from models.user_model import User

from models.chat.messages import Message
from sqlalchemy import or_
from models.verification_question_model import VerificationQuestion




router = APIRouter()


class VerificationAnswer(BaseModel):
    question_id: int
    question_text: str
    answer: str


class StartConversationRequest(BaseModel):
    item_id: int
    verification_answers: list[VerificationAnswer] | None = None


@router.post("/start")
def start_conversation(
    request: StartConversationRequest,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    item = session.get(Item, request.item_id)

    if not item:
        raise HTTPException(status_code=404, detail="Oglas nije pronađen.")

    item_owner_id = item.user_id

    if item_owner_id == current_user.id:
        raise HTTPException(
            status_code=400,
            detail="Ne možeš započeti chat sam sa sobom.",
        )

    # 1. Ako conversation već postoji, odmah vrati postojeći chat.
    # Ovo je bitno da korisnik ne mora opet odgovarati na pitanja.
    existing_conversation = session.exec(
        select(Conversation).where(
            Conversation.item_id == item.id,
            Conversation.participant_one_id == item_owner_id,
            Conversation.participant_two_id == current_user.id,
        )
    ).first()

    if existing_conversation:
        return {
            "conversation_id": existing_conversation.id,
            "item_id": existing_conversation.item_id,
            "participant_one_id": existing_conversation.participant_one_id,
            "participant_two_id": existing_conversation.participant_two_id,
            "created": False,
            "requiresVerification": False,
        }

    # 2. Ako conversation ne postoji, provjeri ima li pitanja za ovaj oglas.
    verification_questions = session.exec(
        select(VerificationQuestion)
        .where(VerificationQuestion.item_id == item.id)
        .order_by(VerificationQuestion.id)
    ).all()

    # 3. Ako pitanja postoje, ali frontend još nije poslao odgovore,
    # ne pravimo conversation, nego vraćamo pitanja frontendu.
    if verification_questions and not request.verification_answers:
        return {
            "requiresVerification": True,
            "questions": [
                {
                    "id": question.id,
                    "questionText": question.question_text,
                }
                for question in verification_questions
            ],
        }

    # 4. Ako pitanja postoje i frontend je poslao odgovore,
    # provjeri da je odgovoreno na sva pitanja.
    if verification_questions:
        answers = request.verification_answers or []

        if len(answers) != len(verification_questions):
            raise HTTPException(
                status_code=400,
                detail="Moraš odgovoriti na sva verifikaciona pitanja.",
            )

        question_ids = {question.id for question in verification_questions}
        answer_question_ids = {answer.question_id for answer in answers}

        if question_ids != answer_question_ids:
            raise HTTPException(
                status_code=400,
                detail="Odgovori ne odgovaraju verifikacionim pitanjima.",
            )

        for answer in answers:
            if not answer.answer.strip():
                raise HTTPException(
                    status_code=400,
                    detail="Odgovori ne smiju biti prazni.",
                )

    # 5. Sada možemo napraviti conversation.
    conversation = Conversation(
        item_id=item.id,
        participant_one_id=item_owner_id,
        participant_two_id=current_user.id,
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    # 6. Ako su postojala pitanja, ubaci odgovore kao prvu poruku u chat.
    if verification_questions and request.verification_answers:
        answers_by_question_id = {
            answer.question_id: answer.answer.strip()
            for answer in request.verification_answers
        }

        lines = [
            f'Verifikacioni odgovori za oglas "{item.title}":',
            "",
        ]

        for index, question in enumerate(verification_questions, start=1):
            lines.append(f"Pitanje {index}: {question.question_text}")
            lines.append(f"Odgovor: {answers_by_question_id.get(question.id, '')}")
            lines.append("")

        verification_message = Message(
            conversation_id=conversation.id,
            sender_id=current_user.id,
            content="\n".join(lines),
        )

        session.add(verification_message)
        session.commit()

    return {
        "conversation_id": conversation.id,
        "item_id": conversation.item_id,
        "participant_one_id": conversation.participant_one_id,
        "participant_two_id": conversation.participant_two_id,
        "created": True,
        "requiresVerification": False,
    }




@router.get("/my")
def get_my_conversations(
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    conversations = session.exec(
        select(Conversation)
        .where(
            or_(
                Conversation.participant_one_id == current_user.id,
                Conversation.participant_two_id == current_user.id,
            )
        )
        .order_by(Conversation.updated_at.desc())
    ).all()

    result = []

    for conversation in conversations:
        item = session.get(Item, conversation.item_id)

        other_user_id = (
            conversation.participant_two_id
            if conversation.participant_one_id == current_user.id
            else conversation.participant_one_id
        )

        other_user = session.get(User, other_user_id)

        last_message = session.exec(
            select(Message)
            .where(Message.conversation_id == conversation.id)
            .order_by(Message.created_at.desc())
        ).first()

        result.append({
            "conversationId": conversation.id,
            "item": {
                "id": item.id if item else None,
                "title": item.title if item else "Obrisan oglas",
                "imageUrl": item.image_url if item else None,
            },
            "otherUser": {
                "id": other_user.id if other_user else None,
                "username": other_user.username if other_user else "Nepoznat korisnik",
                "firstName": other_user.first_name if other_user else "",
                "lastName": other_user.last_name if other_user else "",
            },
            "lastMessage": {
                "content": last_message.content if last_message else None,
                "senderId": last_message.sender_id if last_message else None,
                "createdAt": str(last_message.created_at) if last_message else None,
            } if last_message else None,
            "updatedAt": str(conversation.updated_at),
        })

    return result


@router.get("/{conversation_id}/messages")
def get_conversation_messages(
    conversation_id: int,
    session: SessionDep,
    current_user: User = Depends(get_current_user),
):
    conversation = session.get(Conversation, conversation_id)

    if not conversation:
        raise HTTPException(status_code=404, detail="Conversation nije pronađena.")

    if current_user.id not in [
        conversation.participant_one_id,
        conversation.participant_two_id,
    ]:
        raise HTTPException(status_code=403, detail="Nemaš pristup ovom chatu.")

    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .order_by(Message.created_at)
    ).all()

    return [
        {
            "id": message.id,
            "conversationId": message.conversation_id,
            "senderId": message.sender_id,
            "content": message.content,
            "isRead": message.is_read,
            "createdAt": str(message.created_at),
        }
        for message in messages
    ]
