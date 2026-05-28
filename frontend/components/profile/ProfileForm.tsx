"use client";

import { useEffect, useState } from "react";
import styles from "./ProfileStyles.module.css";

type UserForm = {
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  phone: string;
};

type EditableField = keyof UserForm | null;

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const fieldLabels: Record<keyof UserForm, string> = {
  first_name: "Ime",
  last_name: "Prezime",
  username: "Korisničko ime",
  email: "Email",
  phone: "Telefon",
};

const fieldPlaceholders: Record<keyof UserForm, string> = {
  first_name: "Unesi ime",
  last_name: "Unesi prezime",
  username: "Unesi korisničko ime",
  email: "Unesi email",
  phone: "+387 61 000 000",
};

export function ProfileForm() {
  const [form, setForm] = useState<UserForm>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [initialForm, setInitialForm] = useState<UserForm>({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    phone: "",
  });

  const [editingField, setEditingField] = useState<EditableField>(null);
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

        const fetchedForm = {
          first_name: data.first_name ?? "",
          last_name: data.last_name ?? "",
          username: data.username ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
        };

        setForm(fetchedForm);
        setInitialForm(fetchedForm);
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

      const updatedForm = {
        first_name: data.first_name ?? payload.first_name,
        last_name: data.last_name ?? payload.last_name,
        username: data.username ?? payload.username,
        email: data.email ?? payload.email,
        phone: data.phone ?? payload.phone,
      };

      setForm(updatedForm);
      setInitialForm(updatedForm);
      setEditingField(null);
      setMessage("Profil je uspješno ažuriran.");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Došlo je do greške.");
    } finally {
      setSaving(false);
    }
  };

  const hasChanges =
    JSON.stringify(form) !== JSON.stringify(initialForm);

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
    <section className={styles["profile-panel"]}>
      <h2 className={styles["profile-panel__title"]}>Lične informacije</h2>

      {message && (
        <div className={`${styles["profile-message"]} ${styles["profile-message--success"]}`}>
          {message}
        </div>
      )}

      {error && (
        <div className={`${styles["profile-message"]} ${styles["profile-message--error"]}`}>
          {error}
        </div>
      )}

      <div className={styles["profile-inline-list"]}>
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
                  type={field === "email" ? "email" : "text"}
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
          disabled={saving || !hasChanges}
          onClick={handleSubmit}
        >
          {saving ? "Spremanje..." : "Sačuvaj promjene"}
        </button>
      </div>
    </section>
  );
}