"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import ButtonBase from "@mui/material/ButtonBase";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import Avatar from "@mui/material/Avatar";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadChats = async () => {
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
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

          setError("Greška pri učitavanju razgovora.");
          setLoading(false);
          return;
        }

        const data = await res.json();
        setChats(data);
      } catch (err) {
        console.error(err);
        setError("Nije moguće povezati se na server.");
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [router]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          <Box sx={{ mb: 5 }}>
            <Typography
              variant="overline"
              sx={{
                fontWeight: 700,
                letterSpacing: "0.2em",
                color: "primary.main",
                display: "block",
                lineHeight: 1.5,
              }}
            >
              Komunikacija
            </Typography>
            <Typography
              variant="h3"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                mt: 1,
                fontSize: { xs: "2.25rem", md: "2.75rem" },
              }}
            >
              Moji razgovori
            </Typography>
          </Box>

          {loading ? (
            <Stack direction="row" spacing={2} sx={{ py: 8, alignItems: "center", justifyContent: "center" }}>
              <CircularProgress size={28} />
              <Typography variant="body1" color="text.secondary">
                Učitavanje razgovora...
              </Typography>
            </Stack>
          ) : error ? (
            <Alert severity="error" sx={{ borderRadius: 2 }}>
              {error}
            </Alert>
          ) : chats.length === 0 ? (
            <Card
              sx={{
                p: 6,
                textAlign: "center",
                borderRadius: 3,
                border: "1px dashed",
                borderColor: "grey.200",
                bgcolor: "background.paper",
              }}
            >
              <Typography variant="body1" color="text.secondary">
                Nemaš još razgovora.
              </Typography>
            </Card>
          ) : (
            <Stack spacing={2}>
              {chats.map((chat) => {
                const imageSrc = chat.item.imageUrl
                  ? `${API_URL}${chat.item.imageUrl}`
                  : "/no-image.jpg";

                const lastRead = typeof window !== "undefined" ? localStorage.getItem(`chat_read_${chat.conversationId}`) : null;
                const isUnread = !!(chat.lastMessage && 
                  chat.lastMessage.senderId === chat.otherUser.id &&
                  (!lastRead || new Date(chat.lastMessage.createdAt) > new Date(lastRead)));

                return (
                  <Card
                    key={chat.conversationId}
                    sx={{
                      borderRadius: 3,
                      overflow: "hidden",
                      border: "1px solid",
                      borderColor: isUnread ? "primary.main" : "grey.200",
                      bgcolor: isUnread ? "rgba(13, 148, 136, 0.02)" : "background.paper",
                      boxShadow: "0 4px 12px rgba(28, 25, 23, 0.02)",
                      transition: "all 0.2s ease-in-out",
                      "&:hover": {
                        borderColor: "primary.main",
                        boxShadow: "0 6px 18px rgba(13, 148, 136, 0.05)",
                        transform: "translateY(-1px)",
                      },
                    }}
                  >
                    <ButtonBase
                      onClick={() => router.push(`/chat/${chat.conversationId}`)}
                      aria-label={`Razgovor za ${chat.item.title} sa korisnikom ${chat.otherUser.username}`}
                      sx={{
                        width: "100%",
                        display: "flex",
                        justifyContent: "flex-start",
                        p: 2.5,
                        textAlign: "left",
                      }}
                    >
                      <Stack direction="row" spacing={2.5} sx={{ alignItems: "center", width: "100%" }}>
                        <Box
                          sx={{
                            width: 70,
                            height: 70,
                            position: "relative",
                            borderRadius: 2,
                            overflow: "hidden",
                            flexShrink: 0,
                            bgcolor: "grey.100",
                            border: "1px solid",
                            borderColor: "grey.200",
                          }}
                        >
                          <Image
                            src={imageSrc}
                            alt={chat.item.title}
                            fill
                            sizes="70px"
                            unoptimized
                            style={{ objectFit: "cover" }}
                          />
                        </Box>

                        <Avatar
                          sx={{
                            width: 48,
                            height: 48,
                            bgcolor: "primary.light",
                            color: "primary.main",
                            border: "2px solid",
                            borderColor: "primary.light",
                            fontWeight: 700,
                            fontSize: "0.95rem",
                            boxShadow: "0 2px 8px rgba(13, 148, 136, 0.08)",
                          }}
                        >
                          {chat.otherUser.firstName ? chat.otherUser.firstName.charAt(0).toUpperCase() : chat.otherUser.username.charAt(0).toUpperCase()}
                        </Avatar>

                        <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                          <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 0.5 }}>
                            <Typography
                              variant="subtitle1"
                              sx={{
                                fontWeight: 800,
                                color: "text.primary",
                                lineHeight: 1.3,
                                whiteSpace: "nowrap",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                flexGrow: 1,
                              }}
                            >
                              Predmet: {chat.item.title}
                            </Typography>
                            {isUnread && (
                              <Box
                                sx={{
                                  width: 8,
                                  height: 8,
                                  borderRadius: "50%",
                                  bgcolor: "primary.main",
                                  ml: 1,
                                  mt: 0.8,
                                  flexShrink: 0,
                                }}
                              />
                            )}
                          </Stack>

                          <Typography
                            variant="body2"
                            sx={{
                              fontWeight: 600,
                              color: "text.secondary",
                              mb: 0.5,
                            }}
                          >
                            {chat.otherUser.firstName} {chat.otherUser.lastName} (@{chat.otherUser.username})
                          </Typography>

                          <Typography
                            variant="body2"
                            sx={{
                              color: isUnread ? "text.primary" : "text.secondary",
                              fontWeight: isUnread ? 700 : 400,
                              fontStyle: chat.lastMessage ? "normal" : "italic",
                              whiteSpace: "nowrap",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                            }}
                          >
                            {chat.lastMessage?.content ?? "Nema trenutno poruka."}
                          </Typography>
                        </Box>
                      </Stack>
                    </ButtonBase>
                  </Card>
                );
              })}
            </Stack>
          )}
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
