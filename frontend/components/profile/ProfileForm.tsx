"use client";

import { useEffect, useState } from "react";

type UserForm = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function ProfileForm() {
  const [form, setForm] = useState<UserForm>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
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

        setForm({
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        });
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, []);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    setError("");

    const { name, value } = e.target;

    setForm((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSaving(true);
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

      if (!form.email.trim()) {
        throw new Error("Email je obavezan.");
      }

      const payload = {
        first_name: form.first_name.trim(),
        last_name: form.last_name.trim(),
        username: form.username.trim(),
        email: form.email.trim(),
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

      setForm({
        first_name: data.first_name ?? payload.first_name,
        last_name: data.last_name ?? payload.last_name,
        username: data.username ?? payload.username,
        email: data.email ?? payload.email,
        phone: data.phone ?? payload.phone,
      });

      setMessage("Profil je uspješno ažuriran.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <section className="profile-panel">
        <h2 className="profile-panel__title">Lične informacije</h2>
        <p style={{ margin: 0, color: "var(--slate-600)" }}>
          Učitavanje profila...
        </p>
      </section>
    );
  }

  return (
    <section className="profile-panel">
      <h2 className="profile-panel__title">Lične informacije</h2>

      {message && (
        <div className="profile-message profile-message--success">
          {message}
        </div>
      )}

      {error && (
        <div className="profile-message profile-message--error">
          {error}
        </div>
      )}

      <form className="profile-form" onSubmit={handleSubmit}>
        <div className="profile-form__row">
          <div className="profile-form__field">
            <label htmlFor="first_name" className="field-label">
              Ime
            </label>
            <input
              id="first_name"
              name="first_name"
              className="form-input"
              value={form.first_name}
              onChange={handleChange}
            />
          </div>

          <div className="profile-form__field">
            <label htmlFor="last_name" className="field-label">
              Prezime
            </label>
            <input
              id="last_name"
              name="last_name"
              className="form-input"
              value={form.last_name}
              onChange={handleChange}
            />
          </div>
        </div>

        <div className="profile-form__field">
          <label htmlFor="username" className="field-label">
            Korisničko ime
          </label>
          <input
            id="username"
            name="username"
            className="form-input"
            value={form.username}
            onChange={handleChange}
          />
        </div>

        <div className="profile-form__field">
          <label htmlFor="email" className="field-label">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            className="form-input"
            value={form.email}
            onChange={handleChange}
          />
        </div>

        <div className="profile-form__field">
          <label htmlFor="phone" className="field-label">
            Telefon
          </label>
          <input
            id="phone"
            name="phone"
            className="form-input"
            value={form.phone}
            onChange={handleChange}
            placeholder="+387 61 000 000"
          />
        </div>

        <div className="profile-form__actions">
          <button className="btn btn--primary" type="submit" disabled={saving}>
            {saving ? "Spremanje..." : "Sačuvaj promjene"}
          </button>
        </div>
      </form>
    </section>
  );
}