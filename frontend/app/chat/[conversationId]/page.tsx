"use client";

import { useEffect, useRef, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import Stack from "@mui/material/Stack";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import Avatar from "@mui/material/Avatar";
import Paper from "@mui/material/Paper";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import Divider from "@mui/material/Divider";
import Collapse from "@mui/material/Collapse";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPaperPlane, faUser, faFileInvoice, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ClaimStatusBadge } from "@/components/common/ClaimStatusBadge";
import type { Claim, ClaimStatus } from "@/types/claim";

type ChatMessage = {
  id?: number;
  conversationId: number;
  senderId: number;
  content: string;
  createdAt?: string;
};

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

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";
const WS_URL = API_URL.replace(/^http/, "ws") + "/ws/chat";

export default function ChatPage() {
  const router = useRouter();
  const params = useParams();
  const conversationId = Number(params.conversationId);

  const socketRef = useRef<WebSocket | null>(null);
  const messagesEndRef = useRef<HTMLDivElement | null>(null);

  const [currentUserId, setCurrentUserId] = useState<number | null>(null);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [messageInput, setMessageInput] = useState("");
  const [conversation, setConversation] = useState<ChatListItem | null>(null);
  const [loading, setLoading] = useState(true);

  // Claim status states
  const [claim, setClaim] = useState<Claim | null>(null);
  const [item, setItem] = useState<any | null>(null);
  const [isPanelExpanded, setIsPanelExpanded] = useState(true);
  const [itemQuestions, setItemQuestions] = useState<any[]>([]);
  const [tempAnswers, setTempAnswers] = useState<Record<number, string>>({});
  const [submittingAnswers, setSubmittingAnswers] = useState(false);

  useEffect(() => {
    if (claim && itemQuestions.length > 0) {
      const initialAnswers: Record<number, string> = {};
      itemQuestions.forEach((q: any) => {
        const existing = claim.verification_answers?.find((a: any) => a.question_id === q.id);
        initialAnswers[q.id] = existing ? existing.answer : "";
      });
      setTempAnswers(initialAnswers);
    }
  }, [claim, itemQuestions]);

  const refreshItemDetails = async () => {
    if (!conversation?.item.id) return;
    try {
      const res = await fetch(`${API_URL}/items/${conversation.item.id}`);
      if (res.ok) {
        const data = await res.json();
        setItem(data);
      }
    } catch (err) {
      console.error("Greška pri osvježavanju detalja predmeta:", err);
    }
  };

  const updateClaimStatus = async (newStatus: ClaimStatus) => {
    const token = localStorage.getItem("access_token");
    if (!token || !claim) return;

    try {
      const res = await fetch(`${API_URL}/claims/${claim.id}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Greška pri promjeni statusa.");
        return;
      }

      const updatedClaim = await res.json();
      setClaim(updatedClaim);

      if (newStatus === "completed" || newStatus === "rejected" || newStatus === "cancelled") {
        refreshItemDetails();
      }
    } catch (err) {
      console.error("Greška pri promjeni statusa claima:", err);
    }
  };

  const submitVerificationAnswers = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !claim) return;

    const unanswered = itemQuestions.some(q => !tempAnswers[q.id]?.trim());
    if (unanswered) {
      alert("Molimo odgovorite na sva pitanja.");
      return;
    }

    setSubmittingAnswers(true);
    try {
      const formattedAnswers = itemQuestions.map(q => ({
        question_id: q.id,
        question_text: q.questionText || q.question_text,
        answer: tempAnswers[q.id].trim()
      }));

      const res = await fetch(`${API_URL}/claims/${claim.id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify({
          verification_answers: formattedAnswers
        })
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Greška pri slanju odgovora.");
        return;
      }

      const updatedClaim = await res.json();
      setClaim(updatedClaim);
      alert("Odgovori su uspješno poslani vlasniku na provjeru.");
    } catch (err) {
      console.error("Greška pri slanju odgovora:", err);
    } finally {
      setSubmittingAnswers(false);
    }
  };

  const confirmHandoff = async () => {
    const token = localStorage.getItem("access_token");
    if (!token || !claim) return;

    try {
      const res = await fetch(`${API_URL}/claims/${claim.id}/confirm-handoff`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) {
        const errorData = await res.json();
        alert(errorData.detail || "Greška pri potvrdi primopredaje.");
        return;
      }

      const updatedClaim = await res.json();
      setClaim(updatedClaim);

      if (updatedClaim.status === "completed") {
        refreshItemDetails();
      }
    } catch (err) {
      console.error("Greška pri potvrdi primopredaje:", err);
    }
  };

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case "pending":
        return "rgba(234, 179, 8, 0.05)";
      case "under_verification":
        return "rgba(59, 130, 246, 0.05)";
      case "approved":
        return "rgba(20, 184, 166, 0.05)";
      case "handoff_pending":
        return "rgba(168, 85, 247, 0.05)";
      case "completed":
        return "rgba(34, 197, 94, 0.05)";
      case "rejected":
        return "rgba(239, 68, 68, 0.05)";
      case "cancelled":
      default:
        return "rgba(100, 116, 139, 0.05)";
    }
  };

  const renderHandoffChecklist = (isOwner: boolean) => {
    if (!claim) return null;

    const hasOwnerConfirmed = claim.owner_confirmed_handoff;
    const hasClaimerConfirmed = claim.claimer_confirmed_handoff;
    const isMeConfirmed = isOwner ? hasOwnerConfirmed : hasClaimerConfirmed;

    return (
      <Box sx={{ p: 2, border: "1px solid", borderColor: "secondary.light", bgcolor: "rgba(168, 85, 247, 0.01)", borderRadius: 3 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "secondary.dark", mb: 1 }}>
          Potvrda fizičke primopredaje predmeta
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.8rem" }}>
          Nakon što se fizički sastanete i razmijenite predmet, potvrdite primopredaju ispod. Kada obojica potvrdite, oglas se automatski rješava.
        </Typography>
        
        <Stack spacing={1} sx={{ mb: 2 }}>
          <FormControlLabel
            control={<Checkbox checked={hasOwnerConfirmed} readOnly disabled />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Vlasnik potvrdio predaju</Typography>}
          />
          <FormControlLabel
            control={<Checkbox checked={hasClaimerConfirmed} readOnly disabled />}
            label={<Typography variant="body2" sx={{ fontWeight: 600 }}>Tražitelj potvrdio preuzimanje</Typography>}
          />
        </Stack>

        {!isMeConfirmed ? (
          <Button
            variant="contained"
            color="secondary"
            size="small"
            onClick={confirmHandoff}
            sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
          >
            Potvrdi primopredaju predmeta
          </Button>
        ) : (
          <Typography variant="body2" sx={{ fontStyle: "italic", color: "success.main", fontWeight: 600 }}>
            Čeka se potvrda druge strane...
          </Typography>
        )}
      </Box>
    );
  };

  const renderClaimActions = () => {
    if (!claim || !item || !currentUserId) return null;

    const isOwner = item.user_id === currentUserId;

    if (isOwner) {
      switch (claim.status) {
        case "pending":
          const hasQuestions = itemQuestions.length > 0;
          return (
            <Stack direction="row" spacing={1.5}>
              <Button
                variant="outlined"
                color="info"
                size="small"
                disabled={!hasQuestions}
                onClick={() => updateClaimStatus("under_verification")}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
              >
                Započni provjeru
              </Button>
              {!hasQuestions && (
                <Button
                  variant="contained"
                  color="primary"
                  size="small"
                  onClick={() => updateClaimStatus("approved")}
                  sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                >
                  Odobri
                </Button>
              )}
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  if (window.confirm("Da li ste sigurni da želite odbiti ovaj zahtjev?")) {
                    updateClaimStatus("rejected");
                  }
                }}
                sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
              >
                Odbij
              </Button>
            </Stack>
          );
        case "under_verification":
          const answersSubmitted = claim.verification_answers && claim.verification_answers.length > 0;
          if (answersSubmitted) {
            return (
              <Box>
                <Typography variant="body2" sx={{ color: "success.main", fontWeight: 600, mb: 1.5, fontSize: "0.85rem" }}>
                  Tražitelj je odgovorio na pitanja. Molimo provjerite odgovore u detaljima iznad i donesite odluku:
                </Typography>
                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    color="primary"
                    size="small"
                    onClick={() => updateClaimStatus("approved")}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                  >
                    Odobri
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      if (window.confirm("Da li ste sigurni da želite odbiti ovaj zahtjev?")) {
                        updateClaimStatus("rejected");
                      }
                    }}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                  >
                    Odbij
                  </Button>
                </Stack>
              </Box>
            );
          } else {
            return (
              <Box sx={{ p: 1.5, border: "1px dashed", borderColor: "info.light", borderRadius: 2, bgcolor: "rgba(2, 136, 209, 0.02)", width: "100%" }}>
                <Typography variant="body2" color="info.main" sx={{ fontWeight: 600, fontSize: "0.85rem" }}>
                  Pokrenuli ste provjeru. Čeka se da tražitelj odgovori na verifikaciona pitanja.
                </Typography>
              </Box>
            );
          }
        case "approved":
          return (
            <Box>
              <Typography variant="body2" sx={{ color: "text.secondary", mb: 1, fontSize: "0.85rem" }}>
                Zahtjev je odobren. Možete pokrenuti proces fizičke primopredaje predmeta.
              </Typography>
              <Button
                variant="contained"
                color="secondary"
                size="small"
                onClick={() => updateClaimStatus("handoff_pending")}
                sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
              >
                Pokreni primopredaju
              </Button>
            </Box>
          );
        case "handoff_pending":
          return renderHandoffChecklist(isOwner);
        case "completed":
          return (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Uspješno završeno. Predmet je vraćen vlasniku!
            </Alert>
          );
        case "rejected":
          return (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Zahtjev je odbijen.
            </Alert>
          );
        default:
          return null;
      }
    } else {
      switch (claim.status) {
        case "pending":
        case "approved":
          return (
            <Button
              variant="outlined"
              color="error"
              size="small"
              onClick={() => {
                if (window.confirm("Da li želite otkazati Vaš zahtjev za povrat?")) {
                  updateClaimStatus("cancelled");
                }
              }}
              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
            >
              Otkaži zahtjev
            </Button>
          );
        case "under_verification":
          const answered = claim.verification_answers && claim.verification_answers.length > 0;
          if (answered) {
            return (
              <Stack spacing={2}>
                <Typography variant="body2" sx={{ color: "info.main", fontWeight: 600, fontSize: "0.85rem" }}>
                  Odgovori su uspješno poslani. Vlasnik predmeta ih sada provjerava.
                </Typography>
                <Button
                  variant="outlined"
                  color="error"
                  size="small"
                  onClick={() => {
                    if (window.confirm("Da li želite otkazati Vaš zahtjev za povrat?")) {
                      updateClaimStatus("cancelled");
                    }
                  }}
                  sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start", borderRadius: 2 }}
                >
                  Otkaži zahtjev
                </Button>
              </Stack>
            );
          } else {
            return (
              <Box sx={{ p: 2, border: "1px solid", borderColor: "info.light", bgcolor: "rgba(2, 136, 209, 0.01)", borderRadius: 3, width: "100%" }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "info.dark", mb: 1 }}>
                  Odgovorite na verifikaciona pitanja
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2, fontSize: "0.8rem" }}>
                  Vlasnik je pokrenuo provjeru predmeta. Odgovorite na pitanja ispod kako biste dokazali vlasništvo:
                </Typography>
                
                <Stack spacing={2} sx={{ mb: 2.5 }}>
                  {itemQuestions.map((q: any) => (
                    <Box key={q.id}>
                      <Typography variant="body2" sx={{ fontWeight: 700, mb: 0.5, fontSize: "0.85rem", color: "text.primary" }}>
                        Pitanje: {q.questionText || q.question_text}
                      </Typography>
                      <TextField
                        fullWidth
                        size="small"
                        placeholder="Vaš odgovor..."
                        value={tempAnswers[q.id] || ""}
                        onChange={(e) => setTempAnswers(prev => ({ ...prev, [q.id]: e.target.value }))}
                        sx={{ bgcolor: "background.paper" }}
                      />
                    </Box>
                  ))}
                </Stack>

                <Stack direction="row" spacing={1.5}>
                  <Button
                    variant="contained"
                    color="info"
                    size="small"
                    onClick={submitVerificationAnswers}
                    disabled={submittingAnswers}
                    sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
                  >
                    {submittingAnswers ? "Slanje..." : "Pošalji odgovore"}
                  </Button>
                  <Button
                    variant="outlined"
                    color="error"
                    size="small"
                    onClick={() => {
                      if (window.confirm("Da li želite otkazati Vaš zahtjev za povrat?")) {
                        updateClaimStatus("cancelled");
                      }
                    }}
                    sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
                  >
                    Otkaži zahtjev
                  </Button>
                </Stack>
              </Box>
            );
          }
        case "handoff_pending":
          return (
            <Stack spacing={2}>
              {renderHandoffChecklist(isOwner)}
              <Button
                variant="outlined"
                color="error"
                size="small"
                onClick={() => {
                  if (window.confirm("Da li želite otkazati Vaš zahtjev za povrat?")) {
                    updateClaimStatus("cancelled");
                  }
                }}
                sx={{ textTransform: "none", fontWeight: 700, alignSelf: "flex-start", borderRadius: 2 }}
              >
                Otkaži zahtjev
              </Button>
            </Stack>
          );
        case "completed":
          return (
            <Alert severity="success" sx={{ borderRadius: 2 }}>
              Predmet Vam je uspješno vraćen! Hvala na saradnji.
            </Alert>
          );
        case "cancelled":
          return (
            <Alert severity="warning" sx={{ borderRadius: 2 }}>
              Otkazali ste ovaj zahtjev.
            </Alert>
          );
        case "rejected":
          return (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              Vlasnik je odbio Vaš zahtjev.
            </Alert>
          );
        default:
          return null;
      }
    }
  };

  // Auto scroll logic
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const initChat = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        window.location.replace("/login");
        return;
      }

      try {
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

        // Fetch old messages
        const messagesRes = await fetch(`${API_URL}/conversations/${conversationId}/messages`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (messagesRes.ok) {
          const oldMessages = await messagesRes.json();
          setMessages(oldMessages);
          if (oldMessages && oldMessages.length > 0) {
            const lastMsg = oldMessages[oldMessages.length - 1];
            if (lastMsg && lastMsg.createdAt) {
              localStorage.setItem(`chat_read_${conversationId}`, lastMsg.createdAt);
            }
          }
        }

        // Fetch conversation details to show headers
        const convsRes = await fetch(`${API_URL}/conversations/my`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (convsRes.ok) {
          const convs: ChatListItem[] = await convsRes.json();
          const activeConv = convs.find(c => c.conversationId === conversationId);
          if (activeConv) {
            setConversation(activeConv);
            if (activeConv.lastMessage) {
              localStorage.setItem(`chat_read_${conversationId}`, activeConv.lastMessage.createdAt);
            } else {
              localStorage.setItem(`chat_read_${conversationId}`, activeConv.updatedAt);
            }

            // Fetch item and claim details
            if (activeConv.item.id) {
              try {
                const itemRes = await fetch(`${API_URL}/items/${activeConv.item.id}`);
                if (itemRes.ok) {
                  const itemData = await itemRes.json();
                  setItem(itemData);

                  // Fetch verification questions for the item
                  try {
                    const questionsRes = await fetch(`${API_URL}/verification-questions/items/${itemData.id}`);
                    if (questionsRes.ok) {
                      const questionsData = await questionsRes.json();
                      setItemQuestions(questionsData || []);
                    }
                  } catch (qErr) {
                    console.error("Greška pri učitavanju verifikacionih pitanja:", qErr);
                  }

                  const isItemOwner = itemData.user_id === user.id;
                  if (isItemOwner) {
                    const claimsRes = await fetch(`${API_URL}/items/${itemData.id}/claims`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (claimsRes.ok) {
                      const claims: Claim[] = await claimsRes.json();
                      const claimOfUser = claims
                        .filter(c => c.user_id === activeConv.otherUser.id)
                        .sort((a, b) => b.id - a.id)[0];
                      setClaim(claimOfUser || null);
                    }
                  } else {
                    const claimsRes = await fetch(`${API_URL}/claims/my`, {
                      headers: { Authorization: `Bearer ${token}` },
                    });
                    if (claimsRes.ok) {
                      const claims: Claim[] = await claimsRes.json();
                      const claimForItem = claims
                        .filter(c => c.item_id === itemData.id)
                        .sort((a, b) => b.id - a.id)[0];
                      setClaim(claimForItem || null);
                    }
                  }
                }
              } catch (err) {
                console.error("Greška pri učitavanju detalja claima/oglasa:", err);
              }
            }
          }
        }

        // Connect WebSocket
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
            localStorage.setItem(`chat_read_${conversationId}`, data.createdAt);
          }

          if (data.type === "ERROR") {
            alert(data.message);
          }
        };
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
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

  const formatMessageTime = (timeStr?: string) => {
    if (!timeStr) return "";
    try {
      const date = new Date(timeStr);
      return date.toLocaleTimeString("bs-BA", { hour: "2-digit", minute: "2-digit" });
    } catch {
      return "";
    }
  };

  const otherUserDisplayName = conversation
    ? `${conversation.otherUser.firstName} ${conversation.otherUser.lastName}`.trim() || conversation.otherUser.username
    : `Korisnik`;

  const itemTitle = conversation?.item.title || "Oglas";
  const itemImageSrc = conversation?.item.imageUrl
    ? `${API_URL}${conversation.item.imageUrl}`
    : null;

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 4, md: 6 } }}>
        <Container maxWidth="md">
          {/* Header Action Bar */}
          <Box sx={{ mb: 3 }}>
            <Button
              component={Link}
              href="/AllChats"
              startIcon={<FontAwesomeIcon icon={faArrowLeft} />}
              sx={{ textTransform: "none", fontWeight: 700 }}
            >
              Nazad na razgovore
            </Button>
          </Box>

          {loading ? (
            <Stack direction="row" spacing={2} sx={{ py: 10, alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={28} />
              <Typography variant="body1" color="text.secondary">
                Učitavanje poruka...
              </Typography>
            </Stack>
          ) : (
            <Card
              sx={{
                borderRadius: 4,
                border: "1px solid",
                borderColor: "grey.200",
                boxShadow: "0 10px 40px rgba(28, 25, 23, 0.04)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
                height: { xs: "calc(100vh - 12rem)", md: "650px" },
              }}
            >
              {/* Chat Header Banner */}
              <Box
                sx={{
                  p: 2.5,
                  bgcolor: "background.paper",
                  borderBottom: "1px solid",
                  borderColor: "grey.100",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                }}
              >
                <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
                  <Avatar
                    src={itemImageSrc || undefined}
                    alt={itemTitle}
                    sx={{
                      width: 44,
                      height: 44,
                      borderRadius: 2,
                      bgcolor: "primary.light",
                      color: "primary.main",
                      fontWeight: 700,
                      boxShadow: "0 2px 8px rgba(27, 77, 62, 0.05)",
                    }}
                  >
                    {!itemImageSrc && (conversation ? (conversation.otherUser.firstName ? conversation.otherUser.firstName.charAt(0).toUpperCase() : conversation.otherUser.username.charAt(0).toUpperCase()) : "K")}
                  </Avatar>
                  <Box>
                    <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                      {otherUserDisplayName}
                    </Typography>
                    <Typography variant="caption" color="text.secondary" sx={{ fontWeight: 550 }}>
                      Predmet: {itemTitle}
                    </Typography>
                  </Box>
                </Stack>
              </Box>
 
              {/* Claim Status Panel */}
              {claim && item && (
                <Box
                  sx={{
                    bgcolor: getStatusBgColor(claim.status),
                    borderBottom: "1px solid",
                    borderColor: "grey.200",
                    p: 2.5,
                    transition: "all 0.2s ease-in-out",
                  }}
                >
                  <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                    <Stack direction="row" spacing={1.5} sx={{ alignItems: "center" }}>
                      <Typography variant="subtitle2" sx={{ fontWeight: 800, color: "text.primary", fontSize: "0.9rem" }}>
                        Zahtjev za povrat:
                      </Typography>
                      <ClaimStatusBadge status={claim.status} />
                    </Stack>
                    <Button
                      size="small"
                      variant="text"
                      onClick={() => setIsPanelExpanded(!isPanelExpanded)}
                      endIcon={isPanelExpanded ? <ExpandLessIcon sx={{ fontSize: "1rem" }} /> : <ExpandMoreIcon sx={{ fontSize: "1rem" }} />}
                      sx={{ textTransform: "none", fontWeight: 700, fontSize: "0.8rem" }}
                    >
                      {isPanelExpanded ? "Sakrij detalje" : "Prikaži detalje"}
                    </Button>
                  </Stack>

                  <Collapse in={isPanelExpanded}>
                    <Box sx={{ mt: 2 }}>
                      <Divider sx={{ my: 1.5 }} />
                      <Stack spacing={2}>
                        {/* Claim Message & Proof */}
                        <Box>
                          <Typography variant="caption" sx={{ display: "block", fontWeight: 800, color: "text.secondary", mb: 0.5, fontSize: "0.75rem" }}>
                            Poruka / Opis dokaza vlasništva od tražitelja:
                          </Typography>
                          <Typography variant="body2" sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "grey.200", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                            {claim.message}
                          </Typography>
                        </Box>

                        {claim.proof_description && (
                          <Box>
                            <Typography variant="caption" sx={{ display: "block", fontWeight: 800, color: "text.secondary", mb: 0.5, fontSize: "0.75rem" }}>
                              Dodatni dokaz vlasništva:
                            </Typography>
                            <Typography variant="body2" sx={{ bgcolor: "background.paper", p: 1.5, borderRadius: 2, border: "1px solid", borderColor: "grey.200", fontSize: "0.85rem", whiteSpace: "pre-wrap" }}>
                              {claim.proof_description}
                            </Typography>
                          </Box>
                        )}

                        {/* Verification Answers */}
                        {claim.verification_answers && claim.verification_answers.length > 0 && (
                          <Box>
                            <Typography variant="caption" sx={{ display: "block", fontWeight: 800, color: "text.secondary", mb: 1, fontSize: "0.75rem" }}>
                              Odgovori na verifikaciona pitanja:
                            </Typography>
                            <Stack spacing={1.5}>
                              {claim.verification_answers.map((ans, idx) => (
                                <Box key={idx} sx={{ p: 1.5, bgcolor: "background.paper", borderRadius: 2, border: "1px solid", borderColor: "grey.200" }}>
                                  <Typography variant="body2" sx={{ fontWeight: 800, fontSize: "0.8rem", color: "primary.main", display: "flex", alignItems: "center", gap: 1 }}>
                                    <FontAwesomeIcon icon={faQuestionCircle} style={{ fontSize: "0.85rem" }} />
                                    P: {ans.question_text}
                                  </Typography>
                                  <Typography variant="body2" sx={{ mt: 0.5, fontStyle: "italic", fontSize: "0.85rem", pl: 2.5 }}>
                                    O: {ans.answer}
                                  </Typography>
                                </Box>
                              ))}
                            </Stack>
                          </Box>
                        )}

                        {/* Linked Lost Item */}
                        {claim.lost_item_id && (
                          <Box>
                            <Typography variant="caption" sx={{ display: "block", fontWeight: 800, color: "text.secondary", mb: 0.5, fontSize: "0.75rem" }}>
                              Povezani oglas o izgubljenom predmetu:
                            </Typography>
                            <Button
                              component={Link}
                              href={`/AllItems/${claim.lost_item_id}`}
                              size="small"
                              variant="outlined"
                              sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2, fontSize: "0.75rem" }}
                            >
                              Pogledaj oglas tražitelja &rarr;
                            </Button>
                          </Box>
                        )}

                        {/* Action buttons section */}
                        <Box sx={{ pt: 1 }}>
                          {renderClaimActions()}
                        </Box>
                      </Stack>
                    </Box>
                  </Collapse>
                </Box>
              )}

              {/* Chat Messages Area */}
              <Box
                sx={{
                  flexGrow: 1,
                  overflowY: "auto",
                  p: 3,
                  bgcolor: "grey.50",
                  display: "flex",
                  flexDirection: "column",
                  gap: 2,
                }}
              >
                {messages.length === 0 ? (
                  <Box sx={{ m: "auto", textAlign: "center", color: "text.secondary" }}>
                    <Typography variant="body2">Nema poruka još.</Typography>
                    <Typography variant="caption" sx={{ display: "block", mt: 0.5 }}>
                      Pošaljite poruku ispod kako biste započeli razgovor.
                    </Typography>
                  </Box>
                ) : (
                  messages.map((msg, index) => {
                    const isMine = msg.senderId === currentUserId;

                    return (
                      <Box
                        key={msg.id ?? index}
                        sx={{
                          display: "flex",
                          justifyContent: isMine ? "flex-end" : "flex-start",
                        }}
                      >
                        <Box sx={{ maxWidth: "70%" }}>
                          <Paper
                            elevation={0}
                            sx={{
                              p: "10px 16px",
                              borderRadius: isMine ? "16px 16px 4px 16px" : "16px 16px 16px 4px",
                              bgcolor: isMine ? "primary.main" : "background.paper",
                              color: isMine ? "primary.contrastText" : "text.primary",
                              border: isMine ? "none" : "1px solid",
                              borderColor: "grey.200",
                              boxShadow: "0 2px 6px rgba(28, 25, 23, 0.02)",
                            }}
                          >
                            <Typography variant="body2" sx={{ lineHeight: 1.5, wordBreak: "break-word" }}>
                              {msg.content}
                            </Typography>
                          </Paper>
                          {msg.createdAt && (
                            <Stack
                              direction="row"
                              spacing={0.5}
                              sx={{
                                justifyContent: isMine ? "flex-end" : "flex-start",
                                alignItems: "center",
                                mt: 0.5,
                                px: 0.5,
                              }}
                            >
                              <Typography
                                variant="caption"
                                sx={{
                                  color: "text.secondary",
                                  fontSize: "0.7rem",
                                }}
                              >
                                {formatMessageTime(msg.createdAt)}
                              </Typography>
                              {isMine && (
                                <Typography
                                  variant="caption"
                                  sx={{
                                    color: "primary.main",
                                    fontSize: "0.7rem",
                                    fontWeight: 600,
                                  }}
                                >
                                  · Poslano
                                </Typography>
                              )}
                            </Stack>
                          )}
                        </Box>
                      </Box>
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </Box>

              {/* Chat Composer Input */}
              <Box
                sx={{
                  p: 2,
                  bgcolor: "background.paper",
                  borderTop: "1px solid",
                  borderColor: "grey.100",
                  display: "flex",
                  gap: 1.5,
                  alignItems: "center",
                }}
              >
                <TextField
                  fullWidth
                  size="small"
                  value={messageInput}
                  onChange={(e) => setMessageInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") sendMessage();
                  }}
                  placeholder="Unesi poruku..."
                  aria-label="Unos poruke"
                  sx={{
                    "& .MuiOutlinedInput-root": {
                      borderRadius: 3,
                    },
                  }}
                />
                <IconButton
                  color="primary"
                  onClick={sendMessage}
                  disabled={!messageInput.trim()}
                  aria-label="Pošalji poruku"
                  sx={{
                    bgcolor: messageInput.trim() ? "primary.main" : "grey.100",
                    color: messageInput.trim() ? "primary.contrastText" : "text.secondary",
                    width: 40,
                    height: 40,
                    borderRadius: 3,
                    "&:hover": {
                      bgcolor: "primary.dark",
                      color: "primary.contrastText",
                    },
                  }}
                >
                  <FontAwesomeIcon icon={faPaperPlane} style={{ fontSize: "0.95rem" }} />
                </IconButton>
              </Box>
            </Card>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}