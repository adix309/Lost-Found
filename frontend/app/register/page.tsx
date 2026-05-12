"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

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
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <section className="profile-page">
          <div className="container" style={{ maxWidth: "40rem" }}>
            <div className="profile-header">
              <p className="profile-header__eyebrow">Registracija</p>
              <h1 className="profile-header__title">Napravi račun</h1>
              <p className="profile-header__description">
                Kreiraj korisnički nalog za prijavu izgubljenih i pronađenih predmeta.
              </p>
            </div>

            <section className="profile-panel">
              <h2 className="profile-panel__title">Register</h2>

              {success && (
                <div className="profile-message profile-message--success">
                  {success}
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
                  <label htmlFor="password" className="field-label">
                    Lozinka
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    className="form-input"
                    value={form.password}
                    onChange={handleChange}
                  />
                </div>

                <div className="profile-form__actions">
                  <button type="submit" className="btn btn--primary btn--block" disabled={loading}>
                    {loading ? "Registracija..." : "Registruj se"}
                  </button>
                </div>
              </form>
            </section>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}