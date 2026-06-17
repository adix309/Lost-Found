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



router = APIRouter()


class StartConversationRequest(BaseModel):
    item_id: int


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
        }

    conversation = Conversation(
        item_id=item.id,
        participant_one_id=item_owner_id,
        participant_two_id=current_user.id,
    )

    session.add(conversation)
    session.commit()
    session.refresh(conversation)

    return {
        "conversation_id": conversation.id,
        "item_id": conversation.item_id,
        "participant_one_id": conversation.participant_one_id,
        "participant_two_id": conversation.participant_two_id,
        "created": True,
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
