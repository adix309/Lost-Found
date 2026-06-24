"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import Box from "@mui/material/Box";
import Container from "@mui/material/Container";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function LoginPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    username: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setError("");
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");

      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Prijava nije uspjela.");
      }

      localStorage.setItem("access_token", data.access_token);
      router.push("/profile");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <Box sx={{ display: "flex", flexDirection: "column", minHeight: "100vh", bgcolor: "background.default" }}>
      <Header />
      <Box component="main" sx={{ flexGrow: 1, py: { xs: 6, md: 8 }, display: "flex", alignItems: "center" }}>
        <Container maxWidth="xs">
          <Box sx={{ mb: 4, textAlign: "center" }}>
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
              Zajednica se okuplja ovdje
            </Typography>
            <Typography
              variant="h4"
              component="h1"
              sx={{
                fontWeight: 800,
                color: "text.primary",
                mt: 0.5,
                letterSpacing: "-0.02em",
              }}
            >
              Dobrodošli nazad
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Prijavite se na svoj korisnički nalog kako biste prijavljivali predmete, pratili obavještenja ili stupili u kontakt s nalazačima.
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}>
                Login
              </Typography>

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3.5 }}>
                <TextField
                  id="username"
                  name="username"
                  label="Korisničko ime"
                  value={form.username}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <TextField
                  id="password"
                  name="password"
                  label="Lozinka"
                  type="password"
                  value={form.password}
                  onChange={handleChange}
                  fullWidth
                  required
                />

                <Button
                  type="submit"
                  variant="contained"
                  color="primary"
                  disabled={loading}
                  fullWidth
                  sx={{ py: 1.2 }}
                >
                  {loading ? "Prijava..." : "Prijavi se"}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                  Nemate korisnički račun?{" "}
                  <Link href="/register" style={{ color: "#1b4d3e", fontWeight: 700, textDecoration: "none" }}>
                    Registrujte se ovdje
                  </Link>
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Container>
      </Box>
      <Footer />
    </Box>
  );
}