"use client";

import { useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Avatar from "@mui/material/Avatar";
import Divider from "@mui/material/Divider";
import Stack from "@mui/material/Stack";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@/types/listing";

const API_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

type PublicUser = {
  id: number;
  username: string;
  email?: string | null;
  profile_image?: string | null;
  created_at?: string | null;
};

type UserItem = Listing & {
  id: number;
  title: string;
  description: string;
  item_type: "lost" | "found";
  category: string;
  location_name: string | null;
  image_url?: string | null;
  status: "active" | "resolved" | "expired";
  created_at: string;
};

interface PublicProfileClientProps {
  user: PublicUser;
  items: UserItem[];
}

function getImageSrc(imageUrl?: string | null) {
  if (!imageUrl) {
    return "/no-image.jpg";
  }

  if (imageUrl.startsWith("http")) {
    return imageUrl;
  }

  return `${API_URL}${imageUrl}`;
}

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

function getCurrentUserIdFromToken() {
  const token = localStorage.getItem("access_token");

  if (!token) {
    return null;
  }

  try {
    const payload = token.split(".")[1];

    if (!payload) {
      return null;
    }

    const normalizedPayload = payload.replace(/-/g, "+").replace(/_/g, "/");
    const decodedPayload = JSON.parse(
      atob(normalizedPayload.padEnd(Math.ceil(normalizedPayload.length / 4) * 4, "=")),
    ) as { sub?: string };
    const currentUserId = Number(decodedPayload.sub);

    return Number.isFinite(currentUserId) ? currentUserId : null;
  } catch {
    return null;
  }
}

export function PublicProfileClient({ user, items }: PublicProfileClientProps) {
  const router = useRouter();
  const userItems = useMemo(
    () => items.filter((item) => item.user_id === user.id),
    [items, user.id],
  );
  const activeItems = userItems.filter((item) => item.status === "active");

  useEffect(() => {
    const currentUserId = getCurrentUserIdFromToken();

    if (currentUserId === user.id) {
      router.replace("/profile");
    }
  }, [router, user.id]);

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />

      <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 8 } }}>
        <Container maxWidth="lg">
          {/* Header */}
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
              Javni profil
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
              {user.username}
            </Typography>
            <Typography
              variant="body1"
              sx={{
                mt: 1.5,
                maxWidth: "40rem",
                color: "text.secondary",
                lineHeight: 1.6,
              }}
            >
              Pregled javnih informacija člana zajednice i oglasa koje je objavio na platformi.
            </Typography>
          </Box>

          <Grid container spacing={4} sx={{ alignItems: "flex-start" }}>
            {/* Left Sidebar */}
            <Grid size={{ xs: 12, md: 4 }}>
              <Card sx={{ bgcolor: "background.paper", borderRadius: 3 }}>
                <CardContent sx={{ p: 4, display: "flex", flexDirection: "column", alignItems: "center" }}>
                  <Avatar
                    src={user.profile_image ? getImageSrc(user.profile_image) : undefined}
                    alt={user.username}
                    sx={{ width: 110, height: 110, mb: 2, bgcolor: "primary.light", color: "primary.main", fontSize: "2.5rem", fontWeight: 700 }}
                  >
                    {user.username.charAt(0).toUpperCase()}
                  </Avatar>

                  <Typography variant="h5" component="h2" sx={{ fontWeight: 800, textAlign: "center", mb: 0.5 }}>
                    {user.username}
                  </Typography>

                  {user.email && (
                    <Typography variant="body2" color="text.secondary" sx={{ textAlign: "center", mb: 3 }}>
                      {user.email}
                    </Typography>
                  )}

                  <Divider sx={{ width: "100%", my: 2 }} />

                  <Stack spacing={2} sx={{ width: "100%" }}>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Aktivnih oglasa
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {activeItems.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Ukupno prijava
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {userItems.length}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                      <Typography variant="body2" color="text.secondary" sx={{ fontWeight: 500 }}>
                        Član od
                      </Typography>
                      <Typography variant="body2" sx={{ fontWeight: 700 }}>
                        {formatDate(user.created_at)}
                      </Typography>
                    </Box>
                  </Stack>
                </CardContent>
              </Card>
            </Grid>

            {/* Right List */}
            <Grid size={{ xs: 12, md: 8 }}>
              <Card sx={{ bgcolor: "background.paper", borderRadius: 3 }}>
                <CardContent sx={{ p: 4 }}>
                  <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
                    Predmeti koje je korisnik objavio
                  </Typography>

                  {userItems.length === 0 ? (
                    <Box
                      sx={{
                        p: 3,
                        textAlign: "center",
                        bgcolor: "grey.50",
                        color: "text.secondary",
                        borderRadius: 2,
                        border: "1px dashed",
                        borderColor: "grey.200",
                      }}
                    >
                      Ovaj korisnik još nema objavljenih predmeta.
                    </Box>
                  ) : (
                    <Grid container spacing={3}>
                      {userItems.map((item) => (
                        <Grid size={{ xs: 12, sm: 6, md: 4 }} key={item.id}>
                          <ListingCard listing={item} />
                        </Grid>
                      ))}
                    </Grid>
                  )}
                </CardContent>
              </Card>
            </Grid>
          </Grid>
        </Container>
      </Box>

      <Footer />
    </Box>
  );
}
