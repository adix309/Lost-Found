"use client";

import type { NotificationItem } from "@/types/notification";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import CardActions from "@mui/material/CardActions";
import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";

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
        {hasMatchSuggestions && (
          <Button
            variant="contained"
            color="primary"
            size="small"
            onClick={handleOpen}
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
          >
            Označi kao pročitano
          </Button>
        )}
      </CardActions>
    </Card>
  );
}
