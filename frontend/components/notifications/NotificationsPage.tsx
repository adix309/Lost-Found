"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import { MatchSuggestionsModal } from "@/components/notifications/MatchSuggestionsModal";
import type {
  NotificationItem,
  NotificationListResponse,
} from "@/types/notification";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [selectedNotification, setSelectedNotification] =
    useState<NotificationItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Morate biti prijavljeni da biste vidjeli notifikacije.");
          setLoading(false);
          return;
        }

        const res = await fetch(
          `${API_BASE_URL}/notifications/me?limit=50&offset=0`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = (await res.json().catch(() => ({ items: [] }))) as NotificationListResponse;

        if (!res.ok) {
          setError("Notifikacije trenutno nije moguće učitati.");
          setLoading(false);
          return;
        }

        setNotifications(Array.isArray(data.items) ? data.items : []);
      } catch {
        setError("Došlo je do greške pri učitavanju notifikacija.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const markAsRead = async (notificationId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(
        `${API_BASE_URL}/notifications/${notificationId}/read`,
        {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch {}
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="md">
          {/* Hero segment */}
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
              Obavijesti
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
              Vaše notifikacije
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              Imate {unreadCount} nepročitanih notifikacija.
            </Typography>
          </Box>

          {/* Content */}
          <Box sx={{ mt: 4 }}>
            {loading ? (
              <Stack direction="row" spacing={2} sx={{ py: 6, alignItems: "center", justifyContent: "center" }}>
                <CircularProgress size={28} />
                <Typography variant="body1" color="text.secondary">
                  Učitavanje notifikacija...
                </Typography>
              </Stack>
            ) : error ? (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            ) : notifications.length === 0 ? (
              <Box
                sx={{
                  p: 6,
                  textAlign: "center",
                  bgcolor: "background.paper",
                  color: "text.secondary",
                  borderRadius: 3,
                  border: "1px dashed",
                  borderColor: "grey.200",
                }}
              >
                <Typography variant="body1">
                  Trenutno nemate notifikacija.
                </Typography>
              </Box>
            ) : (
              <Stack spacing={2.5}>
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                    onOpenMatches={setSelectedNotification}
                  />
                ))}
              </Stack>
            )}
          </Box>
        </Container>
      </Box>

      <MatchSuggestionsModal
        notification={selectedNotification}
        isOpen={selectedNotification !== null}
        onClose={() => setSelectedNotification(null)}
      />

      <Footer />
    </Box>
  );
}