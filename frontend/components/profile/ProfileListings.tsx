"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ListingCard } from "@/components/listings/ListingCard";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import CircularProgress from "@mui/material/CircularProgress";
import Stack from "@mui/material/Stack";
import Alert from "@mui/material/Alert";
import type { Listing } from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function ProfileListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/items/my`, {
          method: "GET",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = await res.json().catch(() => null);

        if (res.status === 401 || res.status === 403) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        if (!res.ok) {
          throw new Error(data?.detail || "Neuspješno učitavanje oglasa.");
        }

        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  return (
    <Box component="section" sx={{ mt: 6 }}>
      <SectionHeading
        title="Moji oglasi"
        description="Pregled oglasa koje si objavio"
      />

      {loading && (
        <Stack direction="row" spacing={2} sx={{ alignItems: "center", mt: 3 }}>
          <CircularProgress size={20} color="primary" />
          <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
            Učitavanje oglasa...
          </Typography>
        </Stack>
      )}

      {!loading && error && (
        <Alert severity="error" sx={{ mt: 3 }}>
          {error}
        </Alert>
      )}

      {!loading && !error && listings.length === 0 && (
        <Typography variant="body2" color="text.secondary" sx={{ mt: 3, fontStyle: "italic" }}>
          Trenutno nemaš objavljenih oglasa.
        </Typography>
      )}

      {!loading && !error && listings.length > 0 && (
        <Grid container spacing={3} sx={{ mt: 1 }}>
          {listings.map((listing) => (
            <Grid size={{ xs: 12, sm: 6, md: 4 }} key={listing.id}>
              <ListingCard listing={listing} />
            </Grid>
          ))}
        </Grid>
      )}
    </Box>
  );
}