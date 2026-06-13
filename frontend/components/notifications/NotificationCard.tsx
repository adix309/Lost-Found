import type { NotificationItem } from "@/types/notification";
import styles from "./NotificationsPage.module.css";

interface NotificationCardProps {
  notification: NotificationItem;
  onMarkAsRead: (notificationId: number) => void;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("bs-BA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function NotificationCard({ notification, onMarkAsRead }: NotificationCardProps) {
  const cardClassName = notification.is_read
    ? styles.card
    : `${styles.card} ${styles.cardUnread}`;

  return (
    <article className={cardClassName}>
      <div className={styles.cardHeader}>
        <div>
          <h2 className={styles.cardTitle}>{notification.title}</h2>
          <p className={styles.cardDate}>{formatDate(notification.created_at)}</p>
        </div>
        {!notification.is_read && <span className={styles.cardDot} />}
      </div>

      <p className={styles.cardBody}>{notification.body}</p>

      {notification.data?.score ? (
        <p className={styles.cardMeta}>
          Match score: {Math.round(Number(notification.data.score) * 100)}%
        </p>
      ) : null}

      {!notification.is_read && (
        <button
          type="button"
          className={styles.cardButton}
          onClick={() => onMarkAsRead(notification.id)}
        >
          Označi kao pročitano
        </button>
      )}
    </article>
  );
}