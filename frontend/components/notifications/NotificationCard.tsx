"use client";

import type { NotificationItem } from "@/types/notification";
import styles from "./NotificationsPage.module.css";

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: number) => void;
  onOpenMatches?: (notification: NotificationItem) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bs-BA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationCard({
  notification,
  onMarkAsRead,
  onOpenMatches,
}: NotificationCardProps) {
  const hasMatchSuggestions =
    Array.isArray(notification.data?.matches) &&
    notification.data.matches.length > 0;

  const handleOpen = () => {
    if (hasMatchSuggestions && onOpenMatches) {
      onOpenMatches(notification);
    }
  };

  return (
    <article className={styles.card}>
      <div className={styles.header}>
        <div>
          <h3 className={styles.title}>{notification.title}</h3>
          <p className={styles.date}>{formatDate(notification.created_at)}</p>
        </div>

        {!notification.is_read ? <span className={styles.unreadDot} /> : null}
      </div>

      <p className={styles.body}>{notification.body}</p>

      {notification.data?.best_score ? (
        <p className={styles.meta}>
          Najbolji score: {Math.round(Number(notification.data.best_score) * 100)}%
        </p>
      ) : null}

      <div className={styles.actions}>
        {hasMatchSuggestions ? (
          <button
            type="button"
            className={styles.primaryButton}
            onClick={handleOpen}
          >
            Pogledaj preporuke
          </button>
        ) : null}

        {!notification.is_read ? (
          <button
            type="button"
            className={styles.secondaryButton}
            onClick={() => onMarkAsRead(notification.id)}
          >
            Označi kao pročitano
          </button>
        ) : null}
      </div>
    </article>
  );
}
