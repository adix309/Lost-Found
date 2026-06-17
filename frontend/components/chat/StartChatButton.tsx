"use client";

import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export function StartChatButton({ itemId }: { itemId: number }) {
  const router = useRouter();

  const startChat = async () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    const res = await fetch(`${API_URL}/conversations/start`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        item_id: itemId,
      }),
    });

    if (!res.ok) {
      const error = await res.json();
      alert(error.detail || "Greška pri pokretanju chata.");
      return;
    }

    const data = await res.json();
    router.push(`/chat/${data.conversation_id}`);
  };

  return <button onClick={startChat}>Chat sa korisnikom</button>;
}