"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type VerificationQuestion = {
  id: number;
  questionText: string;
};

export function StartChatButton({ itemId }: { itemId: number }) {
  const router = useRouter();

  const [questions, setQuestions] = useState<VerificationQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<number, string>>({});
  const [showVerificationForm, setShowVerificationForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const getToken = () => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return null;
    }

    return token;
  };

  const startChat = async () => {
    const token = getToken();
    if (!token) return;

    setLoading(true);

    try {
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

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Greška pri pokretanju chata.");
        return;
      }

      if (data.requiresVerification) {
        setQuestions(data.questions || []);
        setShowVerificationForm(true);
        return;
      }

      router.push(`/chat/${data.conversation_id}`);
    } finally {
      setLoading(false);
    }
  };

  const submitVerificationAnswers = async () => {
    const token = getToken();
    if (!token) return;

    const verification_answers = questions.map((question) => ({
      question_id: question.id,
      question_text: question.questionText,
      answer: answers[question.id] || "",
    }));

    const hasEmptyAnswer = verification_answers.some(
      (item) => !item.answer.trim()
    );

    if (hasEmptyAnswer) {
      alert("Moraš odgovoriti na sva pitanja.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch(`${API_URL}/conversations/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          item_id: itemId,
          verification_answers,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.detail || "Greška pri slanju odgovora.");
        return;
      }

      router.push(`/chat/${data.conversation_id}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <button onClick={startChat} disabled={loading}>
        {loading ? "Pokretanje..." : "Chat sa korisnikom"}
      </button>

      {showVerificationForm && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px",
            border: "1px solid #ddd",
            borderRadius: "12px",
            background: "#f8fafc",
          }}
        >
          <h3 style={{ marginTop: 0 }}>Odgovori na verifikaciona pitanja</h3>

          <p style={{ color: "#64748b" }}>
            Vlasnik oglasa je dodao pitanja kako bi provjerio da li si stvarni vlasnik predmeta.
          </p>

          <div style={{ display: "grid", gap: "12px" }}>
            {questions.map((question, index) => (
              <label key={question.id} style={{ display: "grid", gap: "6px" }}>
                <strong>
                  {index + 1}. {question.questionText}
                </strong>

                <textarea
                  value={answers[question.id] || ""}
                  onChange={(event) =>
                    setAnswers((prev) => ({
                      ...prev,
                      [question.id]: event.target.value,
                    }))
                  }
                  placeholder="Unesi odgovor..."
                  rows={3}
                  style={{
                    padding: "10px",
                    borderRadius: "10px",
                    border: "1px solid #cbd5e1",
                    resize: "vertical",
                  }}
                />
              </label>
            ))}
          </div>

          <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
            <button onClick={submitVerificationAnswers} disabled={loading}>
              {loading ? "Šaljem..." : "Pošalji odgovore i započni chat"}
            </button>

            <button
              type="button"
              onClick={() => setShowVerificationForm(false)}
              disabled={loading}
            >
              Odustani
            </button>
          </div>
        </div>
      )}
    </>
  );
}
