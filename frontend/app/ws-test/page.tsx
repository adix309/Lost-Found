"use client";

import { useEffect, useRef, useState } from "react";

export default function WsTestPage() {
  const socketRef = useRef<WebSocket | null>(null);
  const [messages, setMessages] = useState<string[]>([]);

  useEffect(() => {
    const socket = new WebSocket("ws://127.0.0.1:8000/ws/test");
    socketRef.current = socket;

    socket.onopen = () => {
      console.log("Spojen na WebSocket");
      socket.send("Pozdrav backend iz Next.js stranice");
    };

    socket.onmessage = (event) => {
      console.log("Poruka sa backend-a:", event.data);
      setMessages((prev) => [...prev, event.data]);
    };

    socket.onerror = () => {
      console.warn("WebSocket warning u dev modu");
    };

    socket.onclose = (event) => {
      console.log("WebSocket zatvoren:", event.code, event.reason);
    };

    return () => {
      socket.close();
    };
  }, []);

  return (
    <main style={{ padding: "30px" }}>
      <h1>WebSocket Test</h1>

      <button
        onClick={() => {
          socketRef.current?.send("Poruka sa dugmetaaa");
        }}
      >
        Pošalji poruku
      </button>

      <div>
        {messages.map((msg, index) => (
          <p key={index}>{msg}</p>
        ))}
      </div>
    </main>
  );
}