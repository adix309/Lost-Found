"use client";

import { useEffect, useState } from "react";
import styles from "./ProfileStyles.module.css";
import type {Listing} from "@/types/listing";
import type {User} from "@/types/user";


const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function ProfileSummary() {
  const [user, setUser] = useState<User | null>(null);
  const [items, setItems] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchSummaryData = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const [userRes, itemsRes] = await Promise.all([
          fetch(`${API_BASE_URL}/auth/me`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
          fetch(`${API_BASE_URL}/items/my`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }),
        ]);

        if (
          userRes.status === 401 ||
          userRes.status === 403 ||
          itemsRes.status === 401 ||
          itemsRes.status === 403
        ) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const userData = await userRes.json().catch(() => null);
        const itemsData = await itemsRes.json().catch(() => null);

        if (!userRes.ok) {
          throw new Error(userData?.detail || "Neuspješno učitavanje korisnika.");
        }

        if (!itemsRes.ok) {
          throw new Error(itemsData?.detail || "Neuspješno učitavanje oglasa.");
        }

        setUser(userData);
        setItems(Array.isArray(itemsData) ? itemsData : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchSummaryData();
  }, []);

  const totalItems = items.length;
  const activeItems = items.filter((item) => item.status === "active").length;
  const resolvedItems = items.filter((item) => item.status === "resolved").length;
  const expiredItems = items.filter((item) => item.status === "expired").length;

  const accountStatus = user?.is_active === false ? "Neaktivan" : "Aktivan";
  const accountRole = user?.role || "Korisnik";

  return (
    <aside className={styles["profile-panel"]}>
      <h2 className={styles["profile-panel__title"]}>Sažetak naloga</h2>

      {loading && (
        <p className={styles["profile-summary__state"]}>Učitavanje sažetka...</p>
      )}

      {!loading && error && (
        <p className={styles["profile-summary__state"]}>{error}</p>
      )}

      {!loading && !error && (
        <div className={styles["profile-summary"]}>
          <div className={styles["profile-summary__item"]}>
            <span className={styles["profile-summary__label"]}>Status naloga</span>
            <span className={styles["profile-summary__value"]}>{accountStatus}</span>
          </div>

          <div className={styles["profile-summary__item"]}>
            <span className={styles["profile-summary__label"]}>Uloga</span>
            <span className={styles["profile-summary__value"]}>{accountRole}</span>
          </div>

          <div className={styles["profile-summary__item"]}>
            <span className={styles["profile-summary__label"]}>Objavljeni oglasi</span>
            <span className={styles["profile-summary__value"]}>{totalItems}</span>
          </div>

          <div className={styles["profile-summary__item"]}>
            <span className={styles["profile-summary__label"]}>Aktivni oglasi</span>
            <span className={styles["profile-summary__value"]}>{activeItems}</span>
          </div>

          <div className={styles["profile-summary__item"]}>
            <span className={styles["profile-summary__label"]}>Resolved oglasi</span>
            <span className={styles["profile-summary__value"]}>{resolvedItems}</span>
          </div>

          <div className={styles["profile-summary__item"]}>
            <span className={styles["profile-summary__label"]}>Expired oglasi</span>
            <span className={styles["profile-summary__value"]}>{expiredItems}</span>
          </div>
        </div>
      )}
    </aside>
  );
}