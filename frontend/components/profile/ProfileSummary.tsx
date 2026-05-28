"use client";

import { useEffect, useState } from "react";
import styles from "./ProfileStyles.module.css";

type UserProfile = {
  id: number;
  first_name?: string | null;
  last_name?: string | null;
  username: string;
  email: string;
  phone?: string | null;
  is_active?: boolean;
  role?: string | null;
};

type ItemStatus = "active" | "resolved" | "expired";
type ItemType = "lost" | "found";

type ProfileListing = {
  id: number;
  user_id: number;
  title: string;
  description: string;
  item_type: ItemType;
  category: string;
  location_name: string;
  latitude?: number | null;
  longitude?: number | null;
  event_date: string;
  image_url?: string | null;
  brand?: string | null;
  color?: string | null;
  reward_amount?: number | null;
  contact_phone?: string | null;
  contact_email?: string | null;
  hidden_unique_features?: string | null;
  status: ItemStatus;
  created_at: string;
  updated_at: string;
};

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function ProfileSummary() {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [items, setItems] = useState<ProfileListing[]>([]);
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