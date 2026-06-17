"use client";


import { useState, useEffect, type MouseEvent } from "react";


import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faCalendarDay } from "@fortawesome/free-solid-svg-icons";

import type { Listing } from "@/types/listing";
import { StatusBadge } from "@/components/common/StatusBadge";
import styles from "./ListingCard.module.css";

import { useRouter } from "next/navigation";


const API_URL = "http://127.0.0.1:8000";

function formatDateTime(value: string) {
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
}

export function ListingCard({ listing }: { listing: Listing }) {
  const router = useRouter();


  const imageSrc = listing.image_url
    ? `${API_URL}${listing.image_url}`
    : "/no-image.jpg";

  const imageAlt = listing.image_url ? listing.title : "Slika nije dodana";

  const eventDate = formatDateTime(listing.event_date);


  
  const typeLabel = listing.item_type === "lost" ? "Izgubljeno" : "Pronađeno";
const createdAt = formatDateTime(listing.created_at);


  return (
    
    <Link href={`/AllItems/${listing.id}`} className={styles.card}>
      <div className={styles.modalImageWrap}>
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={900}
          height={500}
          className={styles.modalImage}
          unoptimized
        />
      </div>

      <div className={styles.body}>
        <div className={styles.top}>
          <h3 className={styles.title}>{listing.title}</h3>
          <StatusBadge status={listing.status} />
        </div>

        <p className={styles.description}>{listing.description}</p>

        <div className={styles.info}>
          <span>
            <FontAwesomeIcon icon={faMapPin} aria-hidden="true" />{" "}
            {listing.location_name}
          </span>

          <span>
            <FontAwesomeIcon icon={faCalendarDay} aria-hidden="true" />{" "}
            {eventDate}
          </span>

          <span>{listing.category}</span>
        </div>

        <div className={styles.details}>
          {listing.color ? <span>Boja: {listing.color}</span> : null}

          {listing.brand ? <span>Brand: {listing.brand}</span> : null}


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

                <div>


                  


                </div>

              </div>
            </div>
          </div>

        </div>
      
    </Link>
  );
}