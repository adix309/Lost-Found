"use client";

import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faXmark } from "@fortawesome/free-solid-svg-icons";
import type { NotificationItem } from "@/types/notification";
import { MatchResultsList } from "@/components/matching/MatchResultsList";

interface MatchSuggestionsModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

export function MatchSuggestionsModal({
  notification,
  isOpen,
  onClose,
}: MatchSuggestionsModalProps) {
  if (!notification) return null;

  const matches = Array.isArray(notification.data?.matches)
    ? notification.data.matches.slice(0, 3)
    : [];

  return (
    <Dialog
      open={isOpen}
      onClose={onClose}
      fullWidth
      maxWidth="md"
      aria-labelledby="match-modal-title"
    >
      <DialogTitle id="match-modal-title" sx={{ m: 0, p: 2.5, display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <Box sx={{ minWidth: 0 }}>
          <Typography variant="h6" component="div" sx={{ fontWeight: 800 }}>
            Potencijalna poklapanja
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {notification.data?.source_item_title
              ? `Za predmet: ${notification.data.source_item_title}`
              : "Pregled tri najbolja rezultata"}
          </Typography>
        </Box>
        <IconButton
          aria-label="Zatvori modal"
          onClick={onClose}
          sx={{
            color: "text.secondary",
            p: 0.5,
          }}
        >
          <FontAwesomeIcon icon={faXmark} />
        </IconButton>
      </DialogTitle>

      <DialogContent dividers sx={{ p: 2.5 }}>
        <MatchResultsList matches={matches} />
      </DialogContent>

      <DialogActions sx={{ p: 2 }}>
        <Button onClick={onClose} variant="outlined" color="secondary">
          Zatvori
        </Button>
      </DialogActions>
    </Dialog>
  );
}