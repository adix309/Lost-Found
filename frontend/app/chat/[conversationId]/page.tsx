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
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faPaperPlane, faUser } from "@fortawesome/free-solid-svg-icons";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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

const API_URL = "http://127.0.0.1:8000";
const WS_URL = "ws://127.0.0.1:8000/ws/chat";

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
                <Typography variant="caption" color="text.secondary" sx={{ display: { xs: "none", sm: "block" } }}>
                  ID razgovora: {conversationId}
                </Typography>
              </Box>

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