"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Button from "@mui/material/Button";
import Box from "@mui/material/Box";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faComments } from "@fortawesome/free-solid-svg-icons";

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
    } catch (err) {
      console.error(err);
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
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ width: "100%", mt: 1.5 }}>
      <Button
        fullWidth
        variant="contained"
        color="primary"
        onClick={startChat}
        disabled={loading}
        startIcon={loading ? <CircularProgress size={18} color="inherit" /> : <FontAwesomeIcon icon={faComments} />}
        sx={{
          py: 1.2,
          fontWeight: 700,
          textTransform: "none",
          borderRadius: 2,
        }}
      >
        {loading ? "Pokretanje..." : "Chat sa korisnikom"}
      </Button>

      {showVerificationForm && (
        <Card
          sx={{
            mt: 2.5,
            p: 3,
            borderRadius: 3,
            border: "1px solid",
            borderColor: "grey.200",
            bgcolor: "grey.50",
            boxShadow: "none",
          }}
        >
          <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
            <Typography variant="h6" sx={{ fontWeight: 800, mb: 1 }}>
              Odgovori na verifikaciona pitanja
            </Typography>

            <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
              Vlasnik oglasa je dodao pitanja kako bi provjerio da li si stvarni vlasnik predmeta.
            </Typography>

            <Stack spacing={3}>
              {questions.map((question, index) => (
                <Box key={question.id}>
                  <Typography variant="subtitle2" sx={{ fontWeight: 700, mb: 1, color: "text.primary" }}>
                    {index + 1}. {question.questionText}
                  </Typography>

                  <TextField
                    fullWidth
                    multiline
                    rows={3}
                    placeholder="Unesi odgovor..."
                    aria-label={`Odgovor na verifikaciono pitanje: ${question.questionText}`}
                    value={answers[question.id] || ""}
                    onChange={(event) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [question.id]: event.target.value,
                      }))
                    }
                    sx={{
                      bgcolor: "background.paper",
                      "& .MuiOutlinedInput-root": {
                        borderRadius: 2,
                      },
                    }}
                  />
                </Box>
              ))}
            </Stack>

            <Stack direction="row" spacing={2} sx={{ mt: 3 }}>
              <Button
                variant="contained"
                color="primary"
                onClick={submitVerificationAnswers}
                disabled={loading}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Pošalji odgovore i započni chat
              </Button>

              <Button
                variant="outlined"
                color="inherit"
                onClick={() => setShowVerificationForm(false)}
                disabled={loading}
                sx={{ textTransform: "none", fontWeight: 700 }}
              >
                Odustani
              </Button>
            </Stack>
          </CardContent>
        </Card>
      )}
    </Box>
  );
}
