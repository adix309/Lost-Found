"use client";

import { useEffect, useMemo, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { NotificationCard } from "@/components/notifications/NotificationCard";
import type { NotificationItem, NotificationListResponse } from "@/types/notification";
import styles from "./NotificationsPage.module.css";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchNotifications = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          setError("Morate biti prijavljeni da biste vidjeli notifikacije.");
          setLoading(false);
          return;
        }

        const res = await fetch(`${API_BASE_URL}/notifications/me?limit=50&offset=0`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        const data = (await res.json().catch(() => ({ items: [] }))) as NotificationListResponse;

        if (!res.ok) {
          setError("Notifikacije trenutno nije moguće učitati.");
          setLoading(false);
          return;
        }

        setNotifications(data.items ?? []);
      } catch {
        setError("Došlo je do greške pri učitavanju notifikacija.");
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter((notification) => !notification.is_read).length,
    [notifications]
  );

  const markAsRead = async (notificationId: number) => {
    const token = localStorage.getItem("access_token");
    if (!token) return;

    try {
      const res = await fetch(`${API_BASE_URL}/notifications/${notificationId}/read`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!res.ok) return;

      setNotifications((prev) =>
        prev.map((notification) =>
          notification.id === notificationId
            ? { ...notification, is_read: true, read_at: new Date().toISOString() }
            : notification
        )
      );
    } catch {}
  };

  return (
    <>
      <Header />

      <main className={styles.page}>
        <section className={styles.hero}>
          <div className={styles.container}>
            <p className={styles.eyebrow}>Obavijesti</p>
            <h1 className={styles.title}>Vaše notifikacije</h1>
            <p className={styles.subtitle}>
              Imate {unreadCount} nepročitanih notifikacija.
            </p>
          </div>
        </section>

        <section className={styles.content}>
          <div className={styles.container}>
            {loading ? (
              <div className={styles.state}>Učitavanje notifikacija...</div>
            ) : error ? (
              <div className={`${styles.state} ${styles.stateError}`}>{error}</div>
            ) : notifications.length === 0 ? (
              <div className={styles.state}>Trenutno nemate notifikacija.</div>
            ) : (
              <div className={styles.list}>
                {notifications.map((notification) => (
                  <NotificationCard
                    key={notification.id}
                    notification={notification}
                    onMarkAsRead={markAsRead}
                  />
                ))}
              </div>
            )}
          </div>
        </section>
      </main>

      <Footer />
    </>
  );
}