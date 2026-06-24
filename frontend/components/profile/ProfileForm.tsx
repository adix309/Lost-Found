"use client";

import { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Button from "@mui/material/Button";
import IconButton from "@mui/material/IconButton";
import TextField from "@mui/material/TextField";
import Avatar from "@mui/material/Avatar";
import Alert from "@mui/material/Alert";
import CircularProgress from "@mui/material/CircularProgress";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPencil, faCamera } from "@fortawesome/free-solid-svg-icons";

type UserForm = {
  first_name: string;
  last_name: string;
  username: string;
  phone: string;
};

type PasswordForm = {
  current_password: string;
  new_password: string;
  confirm_new_password: string;
};

type EditableField = keyof UserForm | null;

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const fieldLabels: Record<keyof UserForm, string> = {
  first_name: "Ime",
  last_name: "Prezime",
  username: "Username",
  phone: "Telefon",
};

const fieldPlaceholders: Record<keyof UserForm, string> = {
  first_name: "Unesi ime",
  last_name: "Unesi prezime",
  username: "Unesi username",
  phone: "+387 61 000 000",
};

export function ProfileForm() {
  const [form, setForm] = useState<UserForm>({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
  });

  const [initialForm, setInitialForm] = useState<UserForm>({
    first_name: "",
    last_name: "",
    username: "",
    phone: "",
  });

  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState("");

  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    current_password: "",
    new_password: "",
    confirm_new_password: "",
  });

  const [editingField, setEditingField] = useState<EditableField>(null);
  const [loading, setLoading] = useState(true);
  const [savingProfile, setSavingProfile] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/auth/me`, {
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
          throw new Error(data?.detail || "Neuspješno učitavanje profila.");
        }

        const fetchedForm = {
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          username: data.username ?? "",
          phone: data.phone ?? "",
        };

        setForm(fetchedForm);
        setInitialForm(fetchedForm);
        setEmail(data.email ?? "");
        setProfileImage(data.profile_image ?? "");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (field: keyof UserForm, value: string) => {
    setMessage("");
    setError("");

    setForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEdit = (field: keyof UserForm) => {
    setMessage("");
    setError("");
    setEditingField(field);
  };

  const handleCancelFieldEdit = () => {
    if (!editingField) return;

    setForm((prev) => ({
      ...prev,
      [editingField]: initialForm[editingField],
    }));

    setEditingField(null);
  };

  const handleSubmit = async () => {
    setSavingProfile(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
        return;
      }

      if (!form.first_name.trim()) {
        throw new Error("Ime je obavezno.");
      }

      if (!form.last_name.trim()) {
        throw new Error("Prezime je obavezno.");
      }

      if (!form.username.trim()) {
        throw new Error("Korisničko ime je obavezno.");
      }

      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        phone: form.phone.trim(),
      };

      const res = await fetch(`${API_BASE_URL}/users/me`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno spremanje profila.");
      }

      const updatedForm = {
        first_name: data.first_name ?? payload.first_name,
        last_name: data.last_name ?? payload.last_name,
        username: data.username ?? payload.username,
        phone: data.phone ?? payload.phone,
      };

      setForm(updatedForm);
      setInitialForm(updatedForm);
      setEditingField(null);
      setMessage("Profil je uspješno ažuriran.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setSavingProfile(false);
    }
  };

  const handlePasswordChange = (field: keyof PasswordForm, value: string) => {
    setMessage("");
    setError("");

    setPasswordForm((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handlePasswordSubmit = async () => {
    setSavingPassword(true);
    setMessage("");
    setError("");

    try {
      const token = localStorage.getItem("access_token");

      if (!token) {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
        return;
      }

      if (!passwordForm.current_password.trim()) {
        throw new Error("Trenutna lozinka je obavezna.");
      }

      if (!passwordForm.new_password.trim()) {
        throw new Error("Nova lozinka je obavezna.");
      }

      if (passwordForm.new_password.length < 8) {
        throw new Error("Nova lozinka mora imati najmanje 8 karaktera.");
      }

      if (passwordForm.new_password !== passwordForm.confirm_new_password) {
        throw new Error("Nova lozinka i potvrda lozinke se ne podudaraju.");
      }

      const res = await fetch(`${API_BASE_URL}/users/me/password`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          current_password: passwordForm.current_password,
          new_password: passwordForm.new_password,
        }),
      });

      const data = await res.json().catch(() => null);

      if (res.status === 401 || res.status === 403) {
        localStorage.removeItem("access_token");
        window.location.replace("/login");
        return;
      }

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješna promjena lozinke.");
      }

      setPasswordForm({
        current_password: "",
        new_password: "",
        confirm_new_password: "",
      });

      setMessage("Lozinka je uspješno promijenjena.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setSavingPassword(false);
    }
  };

  const handleProfileImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];

    if (!file) return;

    const token = localStorage.getItem("access_token");

    if (!token) return;

    const formData = new FormData();
    formData.append("image", file);

    const response = await fetch(
      `${API_BASE_URL}/uploads/profile-image`,
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      }
    );

    const data = await response.json();

    setProfileImage(data.image_url);

    await fetch(`${API_BASE_URL}/users/me`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({
        first_name: form.first_name,
        last_name: form.last_name,
        username: form.username,
        phone: form.phone,
        profile_image: data.image_url,
      }),
     });
  };

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  if (loading) {
    return (
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Lične informacije
          </Typography>
          <Stack direction="row" spacing={2} sx={{ alignItems: "center" }}>
            <CircularProgress size={20} />
            <Typography variant="body2" color="text.secondary" sx={{ fontStyle: "italic" }}>
              Učitavanje profila...
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" component="h2" sx={{ fontWeight: 800, mb: 3 }}>
            Lične informacije
          </Typography>

          <Box sx={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 2, mb: 4 }}>
            <Avatar
              src={profileImage ? `${API_BASE_URL}${profileImage}` : undefined}
              sx={{
                width: 120,
                height: 120,
                border: "4px solid #ffffff",
                boxShadow: "0 8px 24px rgba(28, 25, 23, 0.08)",
              }}
            />

            <Button
              component="label"
              variant="contained"
              size="small"
              startIcon={<FontAwesomeIcon icon={faCamera} />}
              sx={{ px: 2 }}
            >
              Promijeni sliku
              <input
                type="file"
                accept="image/*"
                onChange={handleProfileImageUpload}
                style={{ display: "none" }}
              />
            </Button>
          </Box>

          {message && (
            <Alert severity="success" sx={{ mb: 3 }}>
              {message}
            </Alert>
          )}

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <Stack spacing={0}>
            <Box sx={{ py: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
              <Typography
                variant="overline"
                sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: "0.08em" }}
              >
                Email
              </Typography>
              <Typography variant="body1" sx={{ mt: 0.5, color: "text.primary" }}>
                {email || "Nije uneseno"}
              </Typography>
            </Box>

            {(Object.keys(form) as (keyof UserForm)[]).map((field) => (
              <Box key={field} sx={{ py: 2, borderBottom: "1px solid", borderColor: "grey.100" }}>
                <Stack direction="row" sx={{ justifyContent: "space-between", alignItems: "center" }}>
                  <Typography
                    variant="overline"
                    sx={{ fontWeight: 800, color: "text.secondary", letterSpacing: "0.08em" }}
                  >
                    {fieldLabels[field]}
                  </Typography>

                  {editingField !== field && (
                    <IconButton
                      size="small"
                      onClick={() => handleEdit(field)}
                      aria-label={`Uredi polje ${fieldLabels[field]}`}
                      sx={{ color: "primary.main" }}
                    >
                      <FontAwesomeIcon icon={faPencil} size="xs" />
                    </IconButton>
                  )}
                </Stack>

                {editingField === field ? (
                  <Stack spacing={1.5} sx={{ mt: 1 }}>
                    <TextField
                      size="small"
                      value={form[field]}
                      onChange={(e) => handleChange(field, e.target.value)}
                      placeholder={fieldPlaceholders[field]}
                      autoFocus
                      fullWidth
                    />

                    <Box sx={{ display: "flex", justifyContent: "flex-end" }}>
                      <Button
                        size="small"
                        color="secondary"
                        onClick={handleCancelFieldEdit}
                        sx={{ fontWeight: 700 }}
                      >
                        Odustani
                      </Button>
                    </Box>
                  </Stack>
                ) : (
                  <Typography variant="body1" sx={{ mt: 0.5, color: "text.primary" }}>
                    {form[field] || "Nije uneseno"}
                  </Typography>
                )}
              </Box>
            ))}
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 3 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={savingProfile || savingPassword || !hasChanges}
              onClick={handleSubmit}
              sx={{ px: 3, py: 1 }}
            >
              {savingProfile ? "Spremanje..." : "Sačuvaj promjene"}
            </Button>
          </Box>
        </CardContent>
      </Card>

      <Card sx={{ mt: 4 }}>
        <CardContent sx={{ p: { xs: 3, md: 4 } }}>
          <Typography variant="h6" component="h3" sx={{ fontWeight: 800, mb: 3 }}>
            Promjena lozinke
          </Typography>

          <Stack spacing={3}>
            <TextField
              type="password"
              label="Trenutna lozinka"
              value={passwordForm.current_password}
              onChange={(e) =>
                handlePasswordChange("current_password", e.target.value)
              }
              placeholder="Unesi trenutnu lozinku"
              fullWidth
            />

            <TextField
              type="password"
              label="Nova lozinka"
              value={passwordForm.new_password}
              onChange={(e) =>
                handlePasswordChange("new_password", e.target.value)
              }
              placeholder="Unesi novu lozinku"
              fullWidth
            />

            <TextField
              type="password"
              label="Potvrdi novu lozinku"
              value={passwordForm.confirm_new_password}
              onChange={(e) =>
                handlePasswordChange("confirm_new_password", e.target.value)
              }
              placeholder="Ponovo unesi novu lozinku"
              fullWidth
            />
          </Stack>

          <Box sx={{ display: "flex", justifyContent: "flex-start", mt: 4 }}>
            <Button
              variant="contained"
              color="primary"
              disabled={
                savingPassword ||
                savingProfile ||
                !passwordForm.current_password.trim() ||
                !passwordForm.new_password.trim() ||
                !passwordForm.confirm_new_password.trim()
              }
              onClick={handlePasswordSubmit}
              sx={{ px: 3, py: 1 }}
            >
              {savingPassword ? "Spremanje..." : "Promijeni lozinku"}
            </Button>
          </Box>
        </CardContent>
      </Card>
    </>
  );
}