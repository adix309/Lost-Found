"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import styles from "./AdminPanel.module.css";
import type { User } from "@/types/user";
import type { Listing } from "@/types/listing";
import type { Claim, ClaimStatus } from "@/types/claim";

type TabKey = "overview" | "users" | "items" | "claims";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

function formatDate(value: string) {
  const date = new Date(value);

  return new Intl.DateTimeFormat("bs-BA", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(date);
}

async function parseJsonSafe(res: Response) {
  return res.json().catch(() => null);
}

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<TabKey>("overview");

  const [users, setUsers] = useState<User[]>([]);
  const [items, setItems] = useState<Listing[]>([]);
  const [claims, setClaims] = useState<Claim[]>([]);

  const [loadingUsers, setLoadingUsers] = useState(true);
  const [loadingItems, setLoadingItems] = useState(true);
  const [loadingClaims, setLoadingClaims] = useState(true);

  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  const [showSystemNotificationModal, setShowSystemNotificationModal] =
    useState(false);
  const [notificationTitle, setNotificationTitle] = useState("");
  const [notificationBody, setNotificationBody] = useState("");
  const [sendingSystemNotification, setSendingSystemNotification] =
    useState(false);

  const authHeaders = useCallback(() => {
    const token = localStorage.getItem("access_token");

    if (!token) {
      localStorage.removeItem("access_token");
      window.location.replace("/login");
      throw new Error("Nedostaje token.");
    }

    return {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    };
  }, []);

  const handleUnauthorized = useCallback((res: Response) => {
    if (res.status === 401 || res.status === 403) {
      localStorage.removeItem("access_token");
      window.location.replace("/login");
      return true;
    }

    return false;
  }, []);

  const fetchUsers = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/users`, {
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno učitavanje korisnika.");
      }

      setUsers(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri učitavanju korisnika."
      );
    } finally {
      setLoadingUsers(false);
    }
  }, [authHeaders, handleUnauthorized]);

  const fetchItems = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/items`, {
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno učitavanje oglasa.");
      }

      setItems(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri učitavanju oglasa."
      );
    } finally {
      setLoadingItems(false);
    }
  }, [authHeaders, handleUnauthorized]);

  const fetchClaims = useCallback(async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/admin/claims`, {
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno učitavanje claimova.");
      }

      setClaims(Array.isArray(data) ? data : []);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri učitavanju claimova."
      );
    } finally {
      setLoadingClaims(false);
    }
  }, [authHeaders, handleUnauthorized]);

  const reloadUsers = async () => {
    setMessage("");
    setError("");
    setLoadingUsers(true);
    await fetchUsers();
  };

  const reloadItems = async () => {
    setMessage("");
    setError("");
    setLoadingItems(true);
    await fetchItems();
  };

  const reloadClaims = async () => {
    setMessage("");
    setError("");
    setLoadingClaims(true);
    await fetchClaims();
  };

  useEffect(() => {
    let cancelled = false;

    const loadAll = async () => {
      setError("");
      await Promise.all([fetchUsers(), fetchItems(), fetchClaims()]);
    };

    if (!cancelled) {
      loadAll();
    }

    return () => {
      cancelled = true;
    };
  }, [fetchUsers, fetchItems, fetchClaims]);

  const overview = useMemo(() => {
    const activeUsers = users.filter((user) => user.is_active).length;
    const adminUsers = users.filter((user) => user.is_admin).length;
    const activeItems = items.filter((item) => item.status === "active").length;
    const pendingClaims = claims.filter(
      (claim) => claim.status === "pending"
    ).length;

    return {
      totalUsers: users.length,
      activeUsers,
      adminUsers,
      totalItems: items.length,
      activeItems,
      totalClaims: claims.length,
      pendingClaims,
    };
  }, [users, items, claims]);

  const handleToggleUserActive = async (user: User) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          is_active: !user.is_active,
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješno ažuriranje korisnika.");
      }

      setUsers((prev) =>
        prev.map((entry) => (entry.id === user.id ? data : entry))
      );
      setMessage("Status korisnika je uspješno ažuriran.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri ažuriranju korisnika."
      );
    }
  };

  const handleToggleUserAdmin = async (user: User) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${user.id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({
          is_admin: !user.is_admin,
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.detail || "Neuspješna promjena admin privilegija."
        );
      }

      setUsers((prev) =>
        prev.map((entry) => (entry.id === user.id ? data : entry))
      );
      setMessage("Admin privilegije su uspješno ažurirane.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri ažuriranju admin privilegija."
      );
    }
  };

  const handleDeleteUser = async (userId: number) => {
    const confirmed = window.confirm(
      "Da li sigurno želiš obrisati korisnika? Ovo briše i njegove oglase."
    );

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/users/${userId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const data = await parseJsonSafe(res);
        throw new Error(data?.detail || "Neuspješno brisanje korisnika.");
      }

      setUsers((prev) => prev.filter((user) => user.id !== userId));
      setItems((prev) => prev.filter((item) => item.user_id !== userId));
      setClaims((prev) => prev.filter((claim) => claim.user_id !== userId));
      setMessage("Korisnik je uspješno obrisan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri brisanju korisnika."
      );
    }
  };

  const handleDeleteItem = async (itemId: number) => {
    const confirmed = window.confirm("Da li sigurno želiš obrisati oglas?");

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/items/${itemId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const data = await parseJsonSafe(res);
        throw new Error(data?.detail || "Neuspješno brisanje oglasa.");
      }

      setItems((prev) => prev.filter((item) => item.id !== itemId));
      setClaims((prev) => prev.filter((claim) => claim.item_id !== itemId));
      setMessage("Oglas je uspješno obrisan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri brisanju oglasa."
      );
    }
  };

  const handleDeleteClaim = async (claimId: number) => {
    const confirmed = window.confirm("Da li sigurno želiš obrisati claim?");

    if (!confirmed) return;

    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/claims/${claimId}`, {
        method: "DELETE",
        headers: authHeaders(),
      });

      if (handleUnauthorized(res)) return;

      if (!res.ok) {
        const data = await parseJsonSafe(res);
        throw new Error(data?.detail || "Neuspješno brisanje claima.");
      }

      setClaims((prev) => prev.filter((claim) => claim.id !== claimId));
      setMessage("Claim je uspješno obrisan.");
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Greška pri brisanju claima."
      );
    }
  };

  const handleUpdateClaimStatus = async (
    claimId: number,
    nextStatus: ClaimStatus
  ) => {
    setMessage("");
    setError("");

    try {
      const res = await fetch(`${API_BASE_URL}/admin/claims/${claimId}/status`, {
        method: "PATCH",
        headers: authHeaders(),
        body: JSON.stringify({
          status: nextStatus,
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(data?.detail || "Neuspješna promjena statusa claima.");
      }

      setClaims((prev) =>
        prev.map((claim) =>
          claim.id === claimId ? { ...claim, ...data } : claim
        )
      );
      setMessage("Status claima je uspješno ažuriran.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri promjeni statusa claima."
      );
    }
  };

  const handleSendSystemNotification = async () => {
    setMessage("");
    setError("");

    if (!notificationTitle.trim() || !notificationBody.trim()) {
      setError("Popuni naslov i poruku.");
      return;
    }

    try {
      setSendingSystemNotification(true);

      const res = await fetch(`${API_BASE_URL}/notifications/broadcast`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          title: notificationTitle.trim(),
          body: notificationBody.trim(),
          data: {
            source: "admin_panel_broadcast",
          },
        }),
      });

      if (handleUnauthorized(res)) return;

      const data = await parseJsonSafe(res);

      if (!res.ok) {
        throw new Error(
          data?.detail || "Neuspješno slanje sistemske notifikacije."
        );
      }

      setNotificationTitle("");
      setNotificationBody("");
      setShowSystemNotificationModal(false);
      setMessage(
        data?.message ||
          "Sistemska notifikacija je uspješno poslana svim aktivnim korisnicima."
      );
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Greška pri slanju sistemske notifikacije."
      );
    } finally {
      setSendingSystemNotification(false);
    }
  };

  return (
    <main className={styles["admin-page"]}>
      <section className={styles["admin-hero"]}>
        <div>
          <p className={styles["admin-hero__eyebrow"]}>Admin panel</p>
          <h1 className={styles["admin-hero__title"]}>Administracija</h1>
          <p className={styles["admin-hero__description"]}>
            Upravljaj korisnicima, oglasima i claimovima sa jednog mjesta.
          </p>
        </div>

        <div className={styles["admin-hero__actions"]}>
          <button
            type="button"
            className={styles["admin-primary-btn"]}
            onClick={() => setShowSystemNotificationModal(true)}
          >
            Pošalji sistemsku notifikaciju
          </button>
        </div>
      </section>

      {showSystemNotificationModal && (
        <div
          className={styles["admin-modal-backdrop"]}
          onClick={() => setShowSystemNotificationModal(false)}
        >
          <div
            className={styles["admin-modal"]}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles["admin-modal__header"]}>
              <h2 className={styles["admin-modal__title"]}>
                Nova sistemska notifikacija
              </h2>

              <button
                type="button"
                className={styles["admin-modal__close"]}
                onClick={() => setShowSystemNotificationModal(false)}
              >
                ✕
              </button>
            </div>

            <div className={styles["admin-modal__body"]}>
              <label className={styles["admin-field"]}>
                <span>Naslov</span>
                <input
                  type="text"
                  value={notificationTitle}
                  onChange={(e) => setNotificationTitle(e.target.value)}
                  placeholder="Unesi naslov notifikacije"
                />
              </label>

              <label className={styles["admin-field"]}>
                <span>Poruka</span>
                <textarea
                  value={notificationBody}
                  onChange={(e) => setNotificationBody(e.target.value)}
                  placeholder="Unesi tekst poruke"
                  rows={5}
                />
              </label>
            </div>

            <div className={styles["admin-modal__actions"]}>
              <button
                type="button"
                className={styles["admin-secondary-btn"]}
                onClick={() => setShowSystemNotificationModal(false)}
              >
                Odustani
              </button>

              <button
                type="button"
                className={styles["admin-primary-btn"]}
                onClick={handleSendSystemNotification}
                disabled={sendingSystemNotification}
              >
                {sendingSystemNotification ? "Slanje..." : "Pošalji"}
              </button>
            </div>
          </div>
        </div>
      )}

      {message && (
        <div
          className={`${styles["admin-alert"]} ${styles["admin-alert--success"]}`}
        >
          {message}
        </div>
      )}

      {error && (
        <div
          className={`${styles["admin-alert"]} ${styles["admin-alert--error"]}`}
        >
          {error}
        </div>
      )}

      <section className={styles["admin-tabs"]}>
        <button
          type="button"
          className={`${styles["admin-tab"]} ${
            activeTab === "overview" ? styles["admin-tab--active"] : ""
          }`}
          onClick={() => setActiveTab("overview")}
        >
          Pregled
        </button>

        <button
          type="button"
          className={`${styles["admin-tab"]} ${
            activeTab === "users" ? styles["admin-tab--active"] : ""
          }`}
          onClick={() => setActiveTab("users")}
        >
          Korisnici
        </button>

        <button
          type="button"
          className={`${styles["admin-tab"]} ${
            activeTab === "items" ? styles["admin-tab--active"] : ""
          }`}
          onClick={() => setActiveTab("items")}
        >
          Oglasi
        </button>

        <button
          type="button"
          className={`${styles["admin-tab"]} ${
            activeTab === "claims" ? styles["admin-tab--active"] : ""
          }`}
          onClick={() => setActiveTab("claims")}
        >
          Claimovi
        </button>
      </section>

      {activeTab === "overview" && (
        <section className={styles["admin-stats"]}>
          <article className={styles["admin-stat-card"]}>
            <span className={styles["admin-stat-card__label"]}>
              Ukupno korisnika
            </span>
            <strong className={styles["admin-stat-card__value"]}>
              {overview.totalUsers}
            </strong>
          </article>

          <article className={styles["admin-stat-card"]}>
            <span className={styles["admin-stat-card__label"]}>
              Aktivni korisnici
            </span>
            <strong className={styles["admin-stat-card__value"]}>
              {overview.activeUsers}
            </strong>
          </article>

          <article className={styles["admin-stat-card"]}>
            <span className={styles["admin-stat-card__label"]}>
              Admin korisnici
            </span>
            <strong className={styles["admin-stat-card__value"]}>
              {overview.adminUsers}
            </strong>
          </article>

          <article className={styles["admin-stat-card"]}>
            <span className={styles["admin-stat-card__label"]}>
              Ukupno oglasa
            </span>
            <strong className={styles["admin-stat-card__value"]}>
              {overview.totalItems}
            </strong>
          </article>

          <article className={styles["admin-stat-card"]}>
            <span className={styles["admin-stat-card__label"]}>
              Aktivni oglasi
            </span>
            <strong className={styles["admin-stat-card__value"]}>
              {overview.activeItems}
            </strong>
          </article>

          <article className={styles["admin-stat-card"]}>
            <span className={styles["admin-stat-card__label"]}>
              Pending claimovi
            </span>
            <strong className={styles["admin-stat-card__value"]}>
              {overview.pendingClaims}
            </strong>
          </article>
        </section>
      )}

      {activeTab === "users" && (
        <section className={styles["admin-section"]}>
          <div className={styles["admin-section__header"]}>
            <h2 className={styles["admin-section__title"]}>Korisnici</h2>
            <button
              type="button"
              className={styles["admin-refresh"]}
              onClick={reloadUsers}
            >
              Osvježi
            </button>
          </div>

          {loadingUsers ? (
            <p>Učitavanje korisnika...</p>
          ) : (
            <div className={styles["admin-table-wrap"]}>
              <table className={styles["admin-table"]}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Korisnik</th>
                    <th>Email</th>
                    <th>Status</th>
                    <th>Admin</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((user) => (
                    <tr key={user.id}>
                      <td>{user.id}</td>
                      <td>
                        <div className={styles["admin-cell-stack"]}>
                          <strong>
                            {user.first_name} {user.last_name}
                          </strong>
                          <span>@{user.username}</span>
                        </div>
                      </td>
                      <td>{user.email}</td>
                      <td>{user.is_active ? "Aktivan" : "Neaktivan"}</td>
                      <td>{user.is_admin ? "Da" : "Ne"}</td>
                      <td>
                        <div className={styles["admin-actions"]}>
                          <button
                            type="button"
                            className={styles["admin-action-btn"]}
                            onClick={() => handleToggleUserActive(user)}
                          >
                            {user.is_active ? "Deaktiviraj" : "Aktiviraj"}
                          </button>

                          <button
                            type="button"
                            className={styles["admin-action-btn"]}
                            onClick={() => handleToggleUserAdmin(user)}
                          >
                            {user.is_admin ? "Ukloni admin" : "Postavi admin"}
                          </button>

                          <button
                            type="button"
                            className={`${styles["admin-action-btn"]} ${styles["admin-action-btn--danger"]}`}
                            onClick={() => handleDeleteUser(user.id)}
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {users.length === 0 && (
                    <tr>
                      <td colSpan={6}>Nema korisnika za prikaz.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "items" && (
        <section className={styles["admin-section"]}>
          <div className={styles["admin-section__header"]}>
            <h2 className={styles["admin-section__title"]}>Oglasi</h2>
            <button
              type="button"
              className={styles["admin-refresh"]}
              onClick={reloadItems}
            >
              Osvježi
            </button>
          </div>

          {loadingItems ? (
            <p>Učitavanje oglasa...</p>
          ) : (
            <div className={styles["admin-table-wrap"]}>
              <table className={styles["admin-table"]}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Naslov</th>
                    <th>Tip</th>
                    <th>Status</th>
                    <th>Lokacija</th>
                    <th>Datum</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item) => (
                    <tr key={item.id}>
                      <td>{item.id}</td>
                      <td>
                        <div className={styles["admin-cell-stack"]}>
                          <strong>{item.title}</strong>
                          <span>{item.category}</span>
                        </div>
                      </td>
                      <td>{item.item_type}</td>
                      <td>{item.status}</td>
                      <td>{item.location_name}</td>
                      <td>{formatDate(item.event_date)}</td>
                      <td>
                        <div className={styles["admin-actions"]}>
                          <a
                            href={`/listings/${item.id}`}
                            className={styles["admin-action-btn"]}
                          >
                            Otvori
                          </a>

                          <button
                            type="button"
                            className={`${styles["admin-action-btn"]} ${styles["admin-action-btn--danger"]}`}
                            onClick={() => handleDeleteItem(item.id)}
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {items.length === 0 && (
                    <tr>
                      <td colSpan={7}>Nema oglasa za prikaz.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}

      {activeTab === "claims" && (
        <section className={styles["admin-section"]}>
          <div className={styles["admin-section__header"]}>
            <h2 className={styles["admin-section__title"]}>Claimovi</h2>
            <button
              type="button"
              className={styles["admin-refresh"]}
              onClick={reloadClaims}
            >
              Osvježi
            </button>
          </div>

          {loadingClaims ? (
            <p>Učitavanje claimova...</p>
          ) : (
            <div className={styles["admin-table-wrap"]}>
              <table className={styles["admin-table"]}>
                <thead>
                  <tr>
                    <th>ID</th>
                    <th>Korisnik</th>
                    <th>Oglas</th>
                    <th>Status</th>
                    <th>Poruka</th>
                    <th>Akcije</th>
                  </tr>
                </thead>
                <tbody>
                  {claims.map((claim) => (
                    <tr key={claim.id}>
                      <td>{claim.id}</td>
                      <td>{claim.user?.username || claim.user_id}</td>
                      <td>{claim.item?.title || claim.item_id}</td>
                      <td>{claim.status}</td>
                      <td className={styles["admin-message-cell"]}>
                        {claim.message}
                      </td>
                      <td>
                        <div className={styles["admin-actions"]}>
                          <button
                            type="button"
                            className={styles["admin-action-btn"]}
                            onClick={() =>
                              handleUpdateClaimStatus(claim.id, "accepted")
                            }
                          >
                            Prihvati
                          </button>

                          <button
                            type="button"
                            className={styles["admin-action-btn"]}
                            onClick={() =>
                              handleUpdateClaimStatus(claim.id, "rejected")
                            }
                          >
                            Odbij
                          </button>

                          <button
                            type="button"
                            className={`${styles["admin-action-btn"]} ${styles["admin-action-btn--danger"]}`}
                            onClick={() => handleDeleteClaim(claim.id)}
                          >
                            Obriši
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}

                  {claims.length === 0 && (
                    <tr>
                      <td colSpan={6}>Nema claimova za prikaz.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </main>
  );
}