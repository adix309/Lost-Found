"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import type { NotificationItem } from "@/types/notification";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: number) => void;
  onOpenMatches?: (notification: NotificationItem) => void;
}

function formatDate(value: string) {
  try {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    const datePart = `${day}/${month}/${year}`;
    
    const timePart = parsed.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });
    
    return `${datePart} · ${timePart}`;
  } catch {
    return value;
  }
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onOpenMatches,
}: NotificationCardProps) {
  const [loadingChat, setLoadingChat] = useState(false);
  const router = useRouter();
  const claimId = notification.data?.claim_id as number | undefined;

  const handleGoToClaimChat = async () => {
    if (!claimId) return;

    setLoadingChat(true);
    const token = localStorage.getItem("access_token");
    if (!token) {
      router.push("/login");
      return;
    }

    try {
      const claimRes = await fetch(`${API_BASE_URL}/claims/${claimId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!claimRes.ok) {
        throw new Error("Neuspješno učitavanje detalja claima.");
      }

      const claimData = await claimRes.json();
      const claimantId = claimData.user_id;
      const itemId = claimData.item_id;

      const convRes = await fetch(`${API_BASE_URL}/conversations/my`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (!convRes.ok) {
        throw new Error("Neuspješno učitavanje razgovora.");
      }

      const convs = await convRes.json();

      const targetConv = convs.find((c: any) => 
        c.item.id === itemId && 
        (c.otherUser.id === claimantId || (claimData.item && c.otherUser.id === claimData.item.user_id))
      );

      if (targetConv) {
        router.push(`/chat/${targetConv.conversationId}`);
      } else {
        const startRes = await fetch(`${API_BASE_URL}/conversations/start`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ item_id: itemId }),
        });
        if (startRes.ok) {
          const startData = await startRes.json();
          router.push(`/chat/${startData.conversation_id}`);
        } else {
          alert("Nije pronađen razgovor za ovaj zahtjev.");
        }
      }
    } catch (err: any) {
      console.error(err);
      alert(err.message || "Greška pri usmjeravanju na chat.");
    } finally {
      setLoadingChat(false);
    }
  };

  const hasMatchSuggestions =
    Array.isArray(notification.data?.matches) &&
    notification.data.matches.length > 0;

  const handleOpen = () => {
    if (hasMatchSuggestions && onOpenMatches) {
      onOpenMatches(notification);
    }
  };

  return (
    <Card
      sx={{
        p: 2.5,
        border: "1px solid",
        borderColor: notification.is_read ? "grey.200" : "primary.light",
        backgroundColor: notification.is_read ? "background.paper" : "primary.light",
        borderRadius: 4,
        boxShadow: "0 8px 24px rgba(15, 23, 42, 0.06)",
        position: "relative",
      }}
    >
      <CardContent sx={{ p: 0, "&:last-child": { pb: 0 } }}>
        <Stack direction="row" spacing={2} sx={{ justifyContent: "space-between", alignItems: "flex-start", mb: 1.5 }}>
          <Box sx={{ minWidth: 0 }}>
            <Typography variant="h6" component="h3" sx={{ fontWeight: 700, fontSize: "1.05rem", color: "text.primary" }}>
              {notification.title}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              {formatDate(notification.created_at)}
            </Typography>
          </Box>

          {!notification.is_read && (
            <Box
              sx={{
                width: 10,
                height: 10,
                borderRadius: "50%",
                backgroundColor: "primary.main",
                flexShrink: 0,
                mt: 0.8,
              }}
            />
          )}
        </Stack>

        <Typography variant="body2" color="text.primary" sx={{ lineHeight: 1.6, mb: 1.5 }}>
          {notification.body}
        </Typography>

        {notification.data?.best_score ? (
          <Typography variant="body2" sx={{ fontWeight: 600, color: "primary.dark", mb: 2 }}>
            Najbolji score: {Math.round(Number(notification.data.best_score) * 100)}%
          </Typography>
        ) : null}
      </CardContent>

      <CardActions sx={{ p: 0, gap: 1.5, justifyContent: "flex-start", flexWrap: "wrap" }}>
        {claimId && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleGoToClaimChat}
            disabled={loadingChat}
            startIcon={loadingChat ? <CircularProgress size={14} color="inherit" /> : null}
            sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
          >
            {loadingChat ? "Učitavanje..." : "Pregledaj u chatu"}
          </Button>
        )}

        {hasMatchSuggestions && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleOpen}
            sx={{ textTransform: "none", fontWeight: 800, borderRadius: 2 }}
          >
            Pogledaj preporuke
          </Button>
        )}

        {!notification.is_read && (
          <Button
            variant="outlined"
            color="secondary"
            size="small"
            onClick={() => onMarkAsRead(notification.id)}
            sx={{ textTransform: "none", fontWeight: 700, borderRadius: 2 }}
          >
            Označi kao pročitano
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
