"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import type { Listing } from "@/types/listing";
import { StatusBadge } from "@/components/common/StatusBadge";
import styles from "./ListingCard.module.css";

export function ListingCard({ listing }: { listing: Listing }) {
  const [isOpen, setIsOpen] = useState(false);
  const [eventDate, setEventDate] = useState(listing.event_date);
  const [createdAt, setCreatedAt] = useState(listing.created_at);

  const typeLabel = listing.item_type === "lost" ? "Izgubljeno" : "Pronađeno";

  const imageSrc = listing.image_url || "/no-image.jpg";
  const imageAlt = listing.image_url ? listing.title : "Slika nije dodana";

  const formatDateTime = (value: string) => {
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    const date = parsed.toLocaleDateString("bs-BA", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
    const time = parsed.toLocaleTimeString("bs-BA", {
      hour: "2-digit",
      minute: "2-digit",
    });

    return `${date} · ${time}`;
  };

  useEffect(() => {
    setEventDate(formatDateTime(listing.event_date));
    setCreatedAt(formatDateTime(listing.created_at));
  }, [listing.event_date, listing.created_at]);

  return (
    <>
      <article className={styles.card} onClick={() => setIsOpen(true)}>
        <div className={styles.modalImageWrap}>
          <Image
            src={imageSrc}
            alt={imageAlt}
            width={900}
            height={500}
            className={styles.modalImage}
            priority
          />
        </div>

        <div className={styles.body}>
          <div className={styles.top}>
            <h3 className={styles.title}>{listing.title}</h3>
            <StatusBadge status={listing.status} />
          </div>

          <p className={styles.description}>{listing.description}</p>

          <div className={styles.info}>
            <span>📍 {listing.location_name}</span>
            <span>🗓 {eventDate}</span>
            <span> {listing.category}</span>
          </div>

          <div className={styles.details}>
            {listing.color && <span>Boja: {listing.color}</span>}
            {listing.brand && <span>Brand: {listing.brand}</span>}
            {listing.reward_amount !== null && (
              <span>Nagrada: {listing.reward_amount} KM</span>
            )}
          </div>
        </div>
      </article>

      {isOpen && (
        <div className={styles.overlay} onClick={() => setIsOpen(false)}>
          <div className={styles.modal} onClick={(event) => event.stopPropagation()}>
            <button className={styles.closeButton} onClick={() => setIsOpen(false)}>
              ×
            </button>

            <div className={styles.modalImageWrap}>
              <Image
                src={imageSrc}
                alt={imageAlt}
                width={900}
                height={500}
                className={styles.modalImage}
              />
            </div>

            <div className={styles.modalContent}>
              <div className={styles.modalHeader}>
                <div>
                  <span
                    className={`${styles.type} ${listing.item_type === "lost" ? styles.lost : styles.found
                      }`}
                  >
                    {typeLabel}
                  </span>

                  <h2 className={styles.modalTitle}>{listing.title}</h2>
                </div>

                <StatusBadge status={listing.status} />
              </div>

              <p className={styles.modalDescription}>{listing.description}</p>

              <div className={styles.fullInfoGrid}>
                <div>
                  <strong>Kategorija</strong>
                  <span>{listing.category}</span>
                </div>

                <div>
                  <strong>Lokacija</strong>
                  <span>{listing.location_name}</span>
                </div>

                <div>
                  <strong>Datum događaja</strong>
                  <span>{eventDate}</span>
                </div>

                <div>
                  <strong>Boja</strong>
                  <span>{listing.color || "Nije navedeno"}</span>
                </div>

                <div>
                  <strong>Brand</strong>
                  <span>{listing.brand || "Nije navedeno"}</span>
                </div>

                <div>
                  <strong>Nagrada</strong>
                  <span>
                    {listing.reward_amount !== null
                      ? `${listing.reward_amount} KM`
                      : "Nije navedeno"}
                  </span>
                </div>

                <div>
                  <strong>Telefon</strong>
                  <span>{listing.contact_phone || "Nije navedeno"}</span>
                </div>

                <div>
                  <strong>Email</strong>
                  <span>{listing.contact_email || "Nije navedeno"}</span>
                </div>

                <div>
                  <strong>Status</strong>
                  <span>{listing.status}</span>
                </div>

                <div>
                  <strong>Objavljeno</strong>
                  <span>{createdAt}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}