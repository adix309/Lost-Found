"use client";

import { useEffect, useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faHand, faHeart } from "@fortawesome/free-solid-svg-icons";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import CircularProgress from "@mui/material/CircularProgress";
import Alert from "@mui/material/Alert";
import type { Listing } from "@/types/listing";
import type { User } from "@/types/user";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function formatDate(value?: string | null) {
  if (!value) {
    return "Nije navedeno";
  }

  const parsed = new Date(value);

  if (Number.isNaN(parsed.getTime())) {
    return value;
  }

  const day = String(parsed.getDate()).padStart(2, "0");
  const month = String(parsed.getMonth() + 1).padStart(2, "0");
  const year = parsed.getFullYear();
  return `${day}/${month}/${year}`;
}

export function ProfileSummary() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const [userRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/items/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (
          userRes.status === 401 ||
          userRes.status === 403 ||
          itemsRes.status === 401 ||
          itemsRes.status === 403
        ) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const userData = await userRes.json().catch(() => null);
        const itemsData = await itemsRes.json().catch(() => null);

        if (!userRes.ok) {
          throw new Error(userData?.detail || "Neuspješno učitavanje korisnika.");
        }

        if (!itemsRes.ok) {
          throw new Error(itemsData?.detail || "Neuspješno učitavanje oglasa.");
        }

        setUser(userData);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const totalItems = items.length;
  const activeItems = items.filter((item) => item.status === "active").length;

  return (
    <Card sx={{ height: "100%" }}>
      <CardContent sx={{ p: { xs: 3, md: 4 } }}>
        <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
          Aktivnost u zajednici
        </Typography>

        {loading && (
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress size={20} color="primary" />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Učitavanje aktivnosti...
            </Typography>
          </Stack>
        )}

        {!loading && error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}

        {!loading && !error && (
          <Box>
            <Box
              sx={{
                display: "flex",
                gap: 2,
                bgcolor: "primary.light",
                border: "1px solid",
                borderColor: "rgba(27, 77, 62, 0.1)",
                p: 2.5,
                borderRadius: 2,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "inline-flex", alignItems: "center", color: "primary.main", fontSize: "1.25rem" }}>
                <FontAwesomeIcon icon={faHand} />
              </Box>
              <Box>
                <Typography variant="subtitle1" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1.2 }}>
                  Zdravo, {user?.first_name || user?.username}!
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5, lineHeight: 1.4 }}>
                  Drago nam je što pomažete i doprinosite našoj platformi.
                </Typography>
              </Box>
            </Box>

            <Grid container spacing={2} sx={{ mb: 2.5 }}>
              <Grid size={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    p: 2,
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Aktivne prijave
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "primary.main", lineHeight: 1 }}>
                    {activeItems}
                  </Typography>
                </Box>
              </Grid>
              <Grid size={6}>
                <Box
                  sx={{
                    display: "flex",
                    flexDirection: "column",
                    gap: 0.75,
                    p: 2,
                    bgcolor: "background.default",
                    border: "1px solid",
                    borderColor: "grey.200",
                    borderRadius: 2,
                  }}
                >
                  <Typography variant="caption" sx={{ fontWeight: 700, color: "text.secondary", letterSpacing: "0.05em", textTransform: "uppercase" }}>
                    Ukupno oglasa
                  </Typography>
                  <Typography variant="h4" sx={{ fontWeight: 800, color: "text.primary", lineHeight: 1 }}>
                    {totalItems}
                  </Typography>
                </Box>
              </Grid>
            </Grid>

            <Box
              sx={{
                display: "flex",
                gap: 1.5,
                bgcolor: "success.light",
                border: "1px solid",
                borderColor: "rgba(5, 150, 105, 0.1)",
                p: 2,
                borderRadius: 2,
                mb: 2.5,
              }}
            >
              <Box sx={{ display: "inline-flex", alignItems: "center", color: "success.main" }}>
                <FontAwesomeIcon icon={faHeart} />
              </Box>
              <Typography variant="body2" sx={{ color: "success.dark", lineHeight: 1.45, fontSize: "0.85rem" }}>
                Svaki oglas ili pronalazak koji prijavite gradi povjerenje i pomaže nekome da vrati izgubljenu uspomenu. Hvala vam na angažmanu!
              </Typography>
            </Box>

            <Box
              sx={{
                borderTop: "1px dashed",
                borderColor: "grey.200",
                pt: 2,
                mt: 1,
                color: "text.secondary",
                fontSize: "0.8rem",
                textAlign: "center",
                fontWeight: 600,
              }}
            >
              Korisnički profil kreiran: {formatDate(user?.created_at)}
            </Box>
          </Box>
        )}
      </CardContent>
    </Card>
  );
}
