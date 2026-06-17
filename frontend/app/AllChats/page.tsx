"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";

const API_URL = "http://127.0.0.1:8000";

type ChatListItem = {
  conversationId: number;
  item: {
    id: number | null;
    title: string;
    imageUrl: string | null;
  };
  otherUser: {
    id: number | null;
    username: string;
    firstName: string;
    lastName: string;
  };
  lastMessage: {
    content: string;
    senderId: number;
    createdAt: string;
  } | null;
  updatedAt: string;
};

export default function ChatsPage() {
  const router = useRouter();
  const [chats, setChats] = useState<ChatListItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      const res = await fetch(`${API_URL}/conversations/my`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("access_token");
          router.push("/login");
          return;
        }

        alert("Greška pri učitavanju razgovora.");
        setLoading(false);
        return;
      }

      const data = await res.json();
      setChats(data);
      setLoading(false);
    };

    loadChats();
  }, [router]);

  if (loading) {
    return <main style={{ padding: "30px" }}>Učitavanje razgovora...</main>;
  }

  return (
    <main style={{ maxWidth: "900px", margin: "40px auto", padding: "20px" }}>
      <h1>Moji razgovori</h1>

      {chats.length === 0 && <p>Nemaš još razgovora.</p>}

      <div style={{ display: "grid", gap: "12px", marginTop: "20px" }}>
        {chats.map((chat) => {
          const imageSrc = chat.item.imageUrl
            ? `${API_URL}${chat.item.imageUrl}`
            : "/no-image.jpg";

          return (
            <button
              key={chat.conversationId}
              onClick={() => router.push(`/chat/${chat.conversationId}`)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: "14px",
                padding: "14px",
                border: "1px solid #ddd",
                borderRadius: "12px",
                background: "white",
                cursor: "pointer",
                textAlign: "left",
              }}
            >
              <Image
                src={imageSrc}
                alt={chat.item.title}
                width={70}
                height={70}
                style={{ objectFit: "cover", borderRadius: "10px" }}
                unoptimized
              />

              <div style={{ flex: 1 }}>
                <strong>Izgubljeni predmeta :  {chat.item.title}</strong>
                
                <p style={{ margin: "4px 0", color: "#555" }}>
                  Sa: {chat.otherUser.firstName} {chat.otherUser.lastName} (@{chat.otherUser.username})
                </p>

                <p style={{ margin: 0, color: "#777" }}>
                  {chat.lastMessage?.content ?? "Nema poruka još."}
                </p>
              </div>
            </button>
          );
        })}
      </div>
    </main>
  );
}
