"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

type ChatMessage = {
  id?: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt?: string;
};

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws/chat";

export default function ChatPage() {
  const params = useParams();
  const conversationId = Number(params.conversationId);

  const socketRef = useRef<WebSocket | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");

  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      const meRes = await fetch(`${API_URL}/auth/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!meRes.ok) {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
        return;
      }

      const user = await meRes.json();
      setCurrentUserId(user.id);

      const messagesRes = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (messagesRes.ok) {
        const oldMessages = await messagesRes.json();
        setMessages(oldMessages);
      }


      const socket = new WebSocket(WS_URL);
      socketRef.current = socket;

      socket.onopen = () => {
        socket.send(
          JSON.stringify({
            type: "JOIN",
            userId: user.id,
          })
        );
      };

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data);

        if (data.type === "NEW_MESSAGE") {
          setMessages((prev) => [
            ...prev,
            {
              id: data.id,
              conversationId: data.conversationId,
              senderId: data.senderId,
              content: data.content,
              createdAt: data.createdAt,
            },
          ]);
        }

        if (data.type === "ERROR") {
          alert(data.message);
        }
      };
    };

    initChat();

    return () => {
      socketRef.current?.close();
    };
  }, [conversationId]);

  const sendMessage = () => {
    if (!messageInput.trim()) return;

    socketRef.current?.send(
      JSON.stringify({
        type: "SEND_MESSAGE",
        conversationId,
        content: messageInput,
      })
    );

    setMessageInput("");
  };

  return (
    <main
      style={{
        maxWidth: "800px",
        margin: "40px auto",
        padding: "24px",
        border: "1px solid #ddd",
        borderRadius: "16px",
        background: "#fff",
      }}
    >
      <h1>Chat</h1>
      <p style={{ color: "#666" }}>Conversation ID: {conversationId}</p>

      <div
        style={{
          minHeight: "400px",
          border: "1px solid #eee",
          borderRadius: "12px",
          padding: "16px",
          marginTop: "20px",
          marginBottom: "20px",
          background: "#fafafa",
        }}
      >
        {messages.length === 0 && (
          <p style={{ color: "#777" }}>Nema poruka još.</p>
        )}

        {messages.map((msg, index) => {
          const isMine = msg.senderId === currentUserId;

          return (
            <div
              key={msg.id ?? index}
              style={{
                display: "flex",
                justifyContent: isMine ? "flex-end" : "flex-start",
                marginBottom: "10px",
              }}
            >
              <div
                style={{
                  maxWidth: "70%",
                  padding: "10px 14px",
                  borderRadius: "14px",
                  background: isMine ? "#111827" : "#e5e7eb",
                  color: isMine ? "white" : "black",
                }}
              >
                {msg.content}
              </div>
            </div>
          );
        })}
      </div>

      <div style={{ display: "flex", gap: "10px" }}>
        <input
          value={messageInput}
          onChange={(e) => setMessageInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter") sendMessage();
          }}
          placeholder="Unesi poruku..."
          style={{
            flex: 1,
            padding: "12px",
            borderRadius: "10px",
            border: "1px solid #ccc",
          }}
        />

        <button
          onClick={sendMessage}
          style={{
            padding: "12px 18px",
            borderRadius: "10px",
            border: "none",
            background: "#111827",
            color: "white",
            cursor: "pointer",
          }}
        >
          Pošalji
        </button>
      </div>
    </main>
  );
}