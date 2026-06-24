"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ProfileForm } from "@/components/profile/ProfileForm";
import { ProfileSummary } from "@/components/profile/ProfileSummary";
import { ProfileListings } from "@/components/profile/ProfileListings";
import { AuthGuard } from "@/components/auth/AuthGuard";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Grid from "@mui/material/Grid";
import Typography from "@mui/material/Typography";

export default function ProfilePage() {
  return (
    <AuthGuard>
      <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
        <Header />
        <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 8 } }}>
          <Container maxWidth="lg">
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
                Moj profil
              </Typography>
              <Typography
                variant="h4"
                component="h1"
                sx={{
                  fontWeight: 800,
                  color: "text.primary",
                  mt: 0.5,
                  letterSpacing: "-0.02em",
                  fontSize: { xs: "2.25rem", md: "2.75rem" },
                }}
              >
                Profil korisnika
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
                Pregledaj i ažuriraj svoje osnovne informacije te prati oglase koje
                si objavio.
              </Typography>
            </Box>

            <Grid container spacing={4} sx={{ mb: 6, alignItems: "flex-start" }}>
              <Grid size={{ xs: 12, md: 8 }}>
                <ProfileForm />
              </Grid>
              <Grid size={{ xs: 12, md: 4 }}>
                <ProfileSummary />
              </Grid>
            </Grid>

            <ProfileListings />
          </Container>
        </Box>
        <Footer />
      </Box>
    </AuthGuard>
  );
}