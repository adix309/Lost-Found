"use client";

import { useEffect, useState } from "react";
import styles from "./ProfileStyles.module.css";

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

  const hasChanges = JSON.stringify(form) !== JSON.stringify(initialForm);

  if (loading) {
    return (
      <section className={styles["profile-panel"]}>
        <h2 className={styles["profile-panel__title"]}>Lične informacije</h2>
        <p style={{ margin: 0, color: "var(--slate-600)" }}>
          Učitavanje profila...
        </p>
      </section>
    );
  }

  return (
    <>
      <section className={styles["profile-panel"]}>
        <h2 className={styles["profile-panel__title"]}>Lične informacije</h2>

        {message && (
          <div
            className={`${styles["profile-message"]} ${styles["profile-message--success"]}`}
          >
            {message}
          </div>
        )}

        {error && (
          <div
            className={`${styles["profile-message"]} ${styles["profile-message--error"]}`}
          >
            {error}
          </div>
        )}

        <div className={styles["profile-inline-list"]}>
          <div className={styles["profile-inline-item"]}>
            <div className={styles["profile-inline-item__top"]}>
              <label className={styles["profile-inline-item__label"]}>
                Email
              </label>
            </div>

            <div className={styles["profile-inline-item__value"]}>
              {email || "Nije uneseno"}
            </div>
          </div>

          {(Object.keys(form) as (keyof UserForm)[]).map((field) => (
            <div key={field} className={styles["profile-inline-item"]}>
              <div className={styles["profile-inline-item__top"]}>
                <label className={styles["profile-inline-item__label"]}>
                  {fieldLabels[field]}
                </label>

                {editingField !== field && (
                  <button
                    type="button"
                    className={styles["profile-inline-item__icon"]}
                    onClick={() => handleEdit(field)}
                    aria-label={`Uredi polje ${fieldLabels[field]}`}
                  >
                    ✏️
                  </button>
                )}
              </div>

              {editingField === field ? (
                <div className={styles["profile-inline-item__edit"]}>
                  <input
                    type="text"
                    className="form-input"
                    value={form[field]}
                    onChange={(e) => handleChange(field, e.target.value)}
                    placeholder={fieldPlaceholders[field]}
                    autoFocus
                  />

                  <div className={styles["profile-inline-item__actions"]}>
                    <button
                      type="button"
                      className={styles["profile-inline-item__text-btn"]}
                      onClick={handleCancelFieldEdit}
                    >
                      Odustani
                    </button>
                  </div>
                </div>
              ) : (
                <div className={styles["profile-inline-item__value"]}>
                  {form[field] || "Nije uneseno"}
                </div>
              )}
            </div>
          ))}
        </div>

        <div className={styles["profile-form__actions"]}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={savingProfile || savingPassword || !hasChanges}
            onClick={handleSubmit}
          >
            {savingProfile ? "Spremanje..." : "Sačuvaj promjene"}
          </button>
        </div>
      </section>

      <section className={styles["profile-panel"]}>
        <h3 className={styles["profile-panel__title"]}>Promjena lozinke</h3>

        <div className={styles["profile-inline-list"]}>
          <div className={styles["profile-inline-item"]}>
            <label className={styles["profile-inline-item__label"]}>
              Trenutna lozinka
            </label>
            <input
              type="password"
              className="form-input"
              value={passwordForm.current_password}
              onChange={(e) =>
                handlePasswordChange("current_password", e.target.value)
              }
              placeholder="Unesi trenutnu lozinku"
            />
          </div>

          <div className={styles["profile-inline-item"]}>
            <label className={styles["profile-inline-item__label"]}>
              Nova lozinka
            </label>
            <input
              type="password"
              className="form-input"
              value={passwordForm.new_password}
              onChange={(e) =>
                handlePasswordChange("new_password", e.target.value)
              }
              placeholder="Unesi novu lozinku"
            />
          </div>

          <div className={styles["profile-inline-item"]}>
            <label className={styles["profile-inline-item__label"]}>
              Potvrdi novu lozinku
            </label>
            <input
              type="password"
              className="form-input"
              value={passwordForm.confirm_new_password}
              onChange={(e) =>
                handlePasswordChange("confirm_new_password", e.target.value)
              }
              placeholder="Ponovo unesi novu lozinku"
            />
          </div>
        </div>

        <div className={styles["profile-form__actions"]}>
          <button
            type="button"
            className="btn btn--primary"
            disabled={
              savingPassword ||
              savingProfile ||
              !passwordForm.current_password.trim() ||
              !passwordForm.new_password.trim() ||
              !passwordForm.confirm_new_password.trim()
            }
            onClick={handlePasswordSubmit}
          >
            {savingPassword ? "Spremanje..." : "Promijeni lozinku"}
          </button>
        </div>
      </section>
    </>
  );
}