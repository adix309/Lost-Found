"use client";

import { useEffect, useRef, useState } from "react";
import { useParams } from "next/navigation";

export default function ChatTestPage() {
    const params = useParams();
    const receiverUserId = Number(params.userId);


    const [currentUserId, setCurrentUserId] = useState<number | null>(null);



    const socketRef = useRef<WebSocket | null>(null);
    const [messages, setMessages] = useState<string[]>([]);
    const [messageInput, setMessageInput] = useState("");


    useEffect(() => {
        const initChat = async () => {
            const token = localStorage.getItem("access_token");

            if (!token) {
                window.location.replace("/login");
                return;
            }

            const res = await fetch("http://127.0.0.1:8000/auth/me", {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            if (!res.ok) {
                localStorage.removeItem("access_token");
                window.location.replace("/login");
                return;
            }

            const user = await res.json();
            setCurrentUserId(user.id);

            const socket = new WebSocket("ws://127.0.0.1:8000/ws/chat");
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

                if (data.type === "JOINED") {
                    setMessages((prev) => [...prev, data.message]);
                }

                if (data.type === "NEW_MESSAGE") {
                    setMessages((prev) => [
                        ...prev,
                        `User ${data.senderId}: ${data.content}`,
                    ]);
                }
            };

            socket.onerror = () => {
                console.warn("WebSocket warning u dev modu");
            };

            socket.onclose = (event) => {
                console.log("WebSocket zatvoren:", event.code, event.reason);
            };
        };

        initChat();

        return () => {
            socketRef.current?.close();
        };
    }, []);

    const sendMessage = () => {
        if (!currentUserId) return;
        if (!messageInput.trim()) return;

        socketRef.current?.send(
            JSON.stringify({
                type: "DIRECT_MESSAGE",
                senderId: currentUserId,
                receiverId: receiverUserId,
                content: messageInput,
            })
        );

        setMessageInput("");
    };

    return (
        <main style={{ padding: "30px" }}>
            <h1>Chat test</h1>

            <p>Trenutni korisnik: {currentUserId ?? "učitava se..."}</p>
            <p>Chat sa korisnikom: {receiverUserId}</p>

            <input
                type="text"
                value={messageInput}
                onChange={(e) => setMessageInput(e.target.value)}
                placeholder="Unesi poruku..."
                style={{ padding: "8px", marginRight: "10px" }}
            />

            <button onClick={sendMessage}>Pošalji poruku</button>

            <div>
                {messages.map((msg, index) => (
                    <p key={index}>{msg}</p>
                ))}
            </div>
        </main>
    );


}