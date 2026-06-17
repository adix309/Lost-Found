from datetime import datetime
from typing import Optional

from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Depends
from sqlmodel import Session

from app.database import get_session
from models.chat.conversations import Conversation
from models.chat.messages import Message

router = APIRouter()

active_connections: dict[int, WebSocket] = {}


@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    session: Session = Depends(get_session),
):
    await websocket.accept()

    current_user_id: Optional[int] = None

    try:
        while True:
            data = await websocket.receive_json()

            if data["type"] == "JOIN":
                current_user_id = int(data["userId"])
                active_connections[current_user_id] = websocket

                await websocket.send_json({
                    "type": "JOINED",
                    "message": f"User {current_user_id} je spojen na chat."
                })

            elif data["type"] == "SEND_MESSAGE":
                if current_user_id is None:
                    await websocket.send_json({
                        "type": "ERROR",
                        "message": "Prvo moraš uraditi JOIN."
                    })
                    continue

                conversation_id = int(data["conversationId"])
                content = data["content"].strip()

                if not content:
                    continue

                conversation = session.get(Conversation, conversation_id)

                if not conversation:
                    await websocket.send_json({
                        "type": "ERROR",
                        "message": "Conversation ne postoji."
                    })
                    continue

                if current_user_id not in [
                    conversation.participant_one_id,
                    conversation.participant_two_id,
                ]:
                    await websocket.send_json({
                        "type": "ERROR",
                        "message": "Nemaš pristup ovom chatu."
                    })
                    continue

                message = Message(
                    conversation_id=conversation_id,
                    sender_id=current_user_id,
                    content=content,
                )

                session.add(message)

                conversation.updated_at = datetime.utcnow()
                session.add(conversation)

                session.commit()
                session.refresh(message)

                receiver_id = (
                    conversation.participant_two_id
                    if current_user_id == conversation.participant_one_id
                    else conversation.participant_one_id
                )

                message_payload = {
                    "type": "NEW_MESSAGE",
                    "id": message.id,
                    "conversationId": conversation_id,
                    "senderId": current_user_id,
                    "receiverId": receiver_id,
                    "content": message.content,
                    "createdAt": str(message.created_at),
                }

                receiver_socket = active_connections.get(receiver_id)

                if receiver_socket:
                    await receiver_socket.send_json(message_payload)

                await websocket.send_json(message_payload)

    except WebSocketDisconnect:
        if current_user_id is not None:
            active_connections.pop(current_user_id, None)

        print(f"User {current_user_id} se diskonektovao.")