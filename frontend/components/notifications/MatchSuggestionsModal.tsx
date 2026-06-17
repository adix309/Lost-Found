"use client";

import Link from "next/link";
import type { NotificationItem } from "@/types/notification";
import styles from "./NotificationsPage.module.css";

interface MatchSuggestionsModalProps {
  notification: NotificationItem | null;
  isOpen: boolean;
  onClose: () => void;
}

function formatEventDate(value?: string | null) {
  if (!value) return "Nepoznat datum";

  return new Intl.DateTimeFormat("bs-BA", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(new Date(value));
}

export function MatchSuggestionsModal({
  notification,
  isOpen,
  onClose,
}: MatchSuggestionsModalProps) {
  if (!isOpen || !notification) return null;

  const matches = Array.isArray(notification.data?.matches)
    ? notification.data.matches.slice(0, 3)
    : [];

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div
        className={styles.modalCard}
        onClick={(event) => event.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="match-modal-title"
      >
        <div className={styles.modalHeader}>
          <div>
            <h3 id="match-modal-title" className={styles.modalTitle}>
              Potencijalna poklapanja
            </h3>
            <p className={styles.modalSubtitle}>
              {notification.data?.source_item_title
                ? `Za predmet: ${notification.data.source_item_title}`
                : "Pregled tri najbolja rezultata"}
            </p>
          </div>

          <button
            type="button"
            className={styles.modalCloseButton}
            onClick={onClose}
            aria-label="Zatvori modal"
          >
            ×
          </button>
        </div>

        <div className={styles.matchList}>
          {matches.map((match) => (
            <article key={match.match_id} className={styles.matchCard}>
              <div className={styles.matchTopRow}>
                <div>
                  <h4 className={styles.matchTitle}>{match.title}</h4>
                  <p className={styles.matchCategory}>
                    {match.category || "Nepoznata kategorija"}
                  </p>
                </div>

                <span className={styles.matchScoreBadge}>
                  {Math.round(Number(match.score) * 100)}%
                </span>
              </div>

              <div className={styles.matchMetaGrid}>
                <p>
                  <span className={styles.metaLabel}>Lokacija:</span>{" "}
                  {match.location_name || "Nepoznata lokacija"}
                </p>
                <p>
                  <span className={styles.metaLabel}>Datum:</span>{" "}
                  {formatEventDate(match.event_date)}
                </p>
              </div>

              {Array.isArray(match.reasons) && match.reasons.length > 0 ? (
                <ul className={styles.reasonList}>
                  {match.reasons.slice(0, 3).map((reason, index) => (
                    <li key={`${match.match_id}-${index}`} className={styles.reasonItem}>
                      {reason}
                    </li>
                  ))}
                </ul>
              ) : null}

              <div className={styles.matchActions}>
                <Link href={`/AllItems/${match.item_id}`} className={styles.matchLinkButton}>
                  Otvori detalje
                </Link>
              </div>
            </article>
          ))}
        </div>
      </div>
    </div>
  );
}