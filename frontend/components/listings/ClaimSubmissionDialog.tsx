"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Dialog from "@mui/material/Dialog";
import DialogTitle from "@mui/material/DialogTitle";
import DialogContent from "@mui/material/DialogContent";
import DialogActions from "@mui/material/DialogActions";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Typography from "@mui/material/Typography";
import Stack from "@mui/material/Stack";
import Box from "@mui/material/Box";
import CircularProgress from "@mui/material/CircularProgress";
import MenuItem from "@mui/material/MenuItem";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import Alert from "@mui/material/Alert";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileInvoice, faQuestionCircle } from "@fortawesome/free-solid-svg-icons";
import type { Listing } from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

type VerificationQuestion = {
  id: number;
  itemId: number;
  questionText: string;
};

interface ClaimSubmissionDialogProps {
  itemId: number;
  itemTitle: string;
  open: boolean;
  onClose: () => void;
  onSuccess: () => void;
}

export function ClaimSubmissionDialog({
  itemId,
  itemTitle,
  open,
  onClose,
  onSuccess,
}: ClaimSubmissionDialogProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingInitial, setLoadingInitial] = useState(false);
  const [myLostItems, setMyLostItems] = useState<Listing[]>([]);
  const [selectedLostItemId, setSelectedLostItemId] = useState<number | "">("");
  
  const [message, setMessage] = useState("");
  const [proofDescription, setProofDescription] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;

    const fetchInitialData = async () => {
      setLoadingInitial(true);
      setError(null);
      const token = localStorage.getItem("access_token");

      if (!token) {
        router.push("/login");
        return;
      }

      try {
        // Fetch my items to find "lost" ones for linking
        const myItemsRes = await fetch(`${API_BASE_URL}/items/my`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        if (myItemsRes.ok) {
          const myItemsData: Listing[] = await myItemsRes.json();
          const lostItems = myItemsData.filter(
            (item) => item.item_type === "lost" && item.status === "active"
          );
          setMyLostItems(lostItems);
        }
      } catch (err) {
        console.error("Greška pri učitavanju inicijalnih podataka:", err);
      } finally {
        setLoadingInitial(false);
      }
    };

    fetchInitialData();
  }, [open, itemId, router]);

  const handleSubmit = async () => {
    setError(null);

    if (!message.trim()) {
      setError("Morate unijeti poruku vlasniku.");
      return;
    }

    setLoading(true);
    const token = localStorage.getItem("access_token");

    if (!token) {
      router.push("/login");
      return;
    }

    try {
      // Step 1: Start/join conversation
      const chatPayload = {
        item_id: itemId,
        force_start: true,
      };

      const chatRes = await fetch(`${API_BASE_URL}/conversations/start`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(chatPayload),
      });

      const chatData = await chatRes.json();

      if (!chatRes.ok) {
        throw new Error(chatData.detail || "Neuspješno započinjanje razgovora.");
      }

      const conversationId = chatData.conversation_id;

      // Step 2: Submit official Claim
      const claimPayload = {
        message,
        proof_description: proofDescription.trim() ? proofDescription : null,
        lost_item_id: selectedLostItemId !== "" ? selectedLostItemId : null,
        verification_answers: null,
      };

      const claimRes = await fetch(`${API_BASE_URL}/items/${itemId}/claims`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(claimPayload),
      });

      const claimDataRes = await claimRes.json();

      if (!claimRes.ok) {
        throw new Error(claimDataRes.detail || "Greška pri podnošenju claima.");
      }

      onSuccess();
      onClose();

      // Redirect user directly to the conversation page where the claim status panel is shown
      router.push(`/chat/${conversationId}`);
    } catch (err: any) {
      setError(err.message || "Došlo je do greške pri slanju zahtjeva.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      fullWidth
      maxWidth="sm"
      slotProps={{
        paper: {
          sx: {
            borderRadius: 4,
            p: 1.5,
          },
        },
      }}
    >
      <DialogTitle sx={{ fontWeight: 800, color: "text.primary", pb: 1 }}>
        Podnesi zahtjev za povrat
      </DialogTitle>
      
      <DialogContent dividers sx={{ borderTop: "none" }}>
        {loadingInitial ? (
          <Stack direction="row" spacing={2} sx={{ py: 6, justifyContent: "center", alignItems: "center" }}>
            <CircularProgress size={24} />
            <Typography variant="body2" color="text.secondary">Učitavanje forme...</Typography>
          </Stack>
        ) : (
          <Stack spacing={3} sx={{ mt: 1 }}>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.5 }}>
              Podnosite zahtjev za povrat predmeta <strong>{itemTitle}</strong>. 
              Vlasnik oglasa će biti obaviješten i moći će pregledati Vaš zahtjev direktno u vašem chatu.
            </Typography>

            {error && (
              <Alert severity="error" sx={{ borderRadius: 2 }}>
                {error}
              </Alert>
            )}



            {myLostItems.length > 0 && (
              <FormControl fullWidth size="small">
                <InputLabel id="link-lost-item-label">Poveži sa svojim oglasom (opcionalno)</InputLabel>
                <Select
                  labelId="link-lost-item-label"
                  value={selectedLostItemId}
                  onChange={(e) => setSelectedLostItemId(e.target.value as number)}
                  label="Poveži sa svojim oglasom (opcionalno)"
                >
                  <MenuItem value="">
                    <em>Bez povezivanja</em>
                  </MenuItem>
                  {myLostItems.map((item) => (
                    <MenuItem key={item.id} value={item.id}>
                      {item.title} ({item.location_name || "Nepoznata lokacija"})
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}

            <TextField
              label="Poruka vlasniku"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              fullWidth
              required
              multiline
              rows={3}
              placeholder="Napišite vlasniku zašto je ovo Vaš predmet i gdje ste ga izgubili..."
            />

            <TextField
              label="Opis dokaza vlasništva (opcionalno)"
              value={proofDescription}
              onChange={(e) => setProofDescription(e.target.value)}
              fullWidth
              multiline
              rows={2}
              placeholder="Unesite specifične detalje koji dokazuju vlasništvo (npr. ogrebotina na dnu, sadržaj džepova, serijski broj)..."
              helperText="Ovi detalji će pomoći vlasniku da brže i pouzdanije verifikuje vaš zahtjev."
            />
          </Stack>
        )}
      </DialogContent>

      <DialogActions sx={{ px: 3, py: 2 }}>
        <Button onClick={onClose} disabled={loading} color="secondary" sx={{ fontWeight: 700 }}>
          Odustani
        </Button>
        <Button
          onClick={handleSubmit}
          disabled={loading || loadingInitial}
          variant="contained"
          color="primary"
          sx={{ fontWeight: 800, borderRadius: 2 }}
          startIcon={loading ? <CircularProgress size={16} color="inherit" /> : <FontAwesomeIcon icon={faFileInvoice} />}
        >
          {loading ? "Slanje..." : "Pošalji zahtjev"}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
