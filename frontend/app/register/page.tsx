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
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";
import Alert from "@mui/material/Alert";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export default function RegisterPage() {
  const router = useRouter();

  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const { name, value } = e.target;
    setError("");
    setSuccess("");
    setForm((prev) => ({ ...prev, [name]: value }));
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();

    try {
      setLoading(true);
      setError("");
      setSuccess("");

      const response = await fetch(`${API_BASE_URL}/auth/register`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail[0].msg || "Registracija nije uspjela.");
      }

      setSuccess("Registracija je uspješna. Sada se možeš prijaviti.");

      setTimeout(() => {
        router.push("/login");
      }, 1200);
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
        <Container maxWidth="sm">
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
              Pridružite se zajednici
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
              Kreirajte svoj račun
            </Typography>
            <Typography
              variant="body2"
              sx={{
                mt: 1.5,
                color: "text.secondary",
                lineHeight: 1.5,
              }}
            >
              Registrujte se za nekoliko sekundi. Članstvo vam omogućava da oglasite izgubljene ili pronađene predmete i pomognete drugima.
            </Typography>
          </Box>

          <Card>
            <CardContent sx={{ p: 4 }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 800, mb: 3, textAlign: "center" }}>
                Register
              </Typography>

              {success && (
                <Alert severity="success" sx={{ mb: 3 }}>
                  {success}
                </Alert>
              )}

              {error && (
                <Alert severity="error" sx={{ mb: 3 }}>
                  {error}
                </Alert>
              )}

              <Box component="form" onSubmit={handleSubmit} sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
                <Grid container spacing={2}>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="first_name"
                      name="first_name"
                      label="Ime"
                      value={form.first_name}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                  <Grid size={{ xs: 12, sm: 6 }}>
                    <TextField
                      id="last_name"
                      name="last_name"
                      label="Prezime"
                      value={form.last_name}
                      onChange={handleChange}
                      fullWidth
                      required
                    />
                  </Grid>
                </Grid>

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
                  id="email"
                  name="email"
                  label="Email"
                  type="email"
                  value={form.email}
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
                  sx={{ py: 1.2, mt: 1 }}
                >
                  {loading ? "Registracija..." : "Registruj se"}
                </Button>

                <Typography variant="body2" color="text.secondary" align="center">
                  Već imate korisnički račun?{" "}
                  <Link href="/login" style={{ color: "#1b4d3e", fontWeight: 700, textDecoration: "none" }}>
                    Prijavite se ovdje
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