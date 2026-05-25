"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import styles from "@/components/profile/ProfileStyles.module.css";

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
    <div className="app-shell">
      <Header />
      <main className="app-main">
        <section className={styles["profile-page"]}>
          <div className="container" style={{ maxWidth: "32rem" }}>
            <div className={styles["profile-header"]}>
              <p className={styles["profile-header__eyebrow"]}>Prijava</p>
              <h1 className={styles["profile-header__title"]}>Prijavi se</h1>
              <p className={styles["profile-header__description"]}>
                Unesi svoje korisničko ime i lozinku za pristup profilu.
              </p>
            </div>

            <section className={styles["profile-panel"]}>
              <h2 className={styles["profile-panel__title"]}>Login</h2>

              {error && (
                <div
                  className={`${styles["profile-message"]} ${styles["profile-message--error"]}`}
                >
                  {error}
                </div>
              )}

              <form className={styles["profile-form"]} onSubmit={handleSubmit}>
                <div className={styles["profile-form__field"]}>
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

                <div className={styles["profile-form__field"]}>
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

                <div className={styles["profile-form__actions"]}>
                  <button
                    type="submit"
                    className="btn btn--primary btn--block"
                    disabled={loading}
                  >
                    {loading ? "Prijava..." : "Prijavi se"}
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