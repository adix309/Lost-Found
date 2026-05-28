"use client";

import { useEffect, useState } from "react";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ListingCard } from "@/components/listings/ListingCard";
import styles from "./ProfileStyles.module.css";
import type {Listing} from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

export function ProfileListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchMyListings = async () => {
      try {
        const token = localStorage.getItem("access_token");

        if (!token) {
          localStorage.removeItem("access_token");
          window.location.replace("/login");
          return;
        }

        const res = await fetch(`${API_BASE_URL}/items/my`, {
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
          throw new Error(data?.detail || "Neuspješno učitavanje oglasa.");
        }

        setListings(Array.isArray(data) ? data : []);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Došlo je do greške.");
      } finally {
        setLoading(false);
      }
    };

    fetchMyListings();
  }, []);

  return (
    <section className={styles["profile-listings"]}>
      <SectionHeading
        title="Moji oglasi"
        description="Pregled oglasa koje si objavio"
      />

      {loading && (
        <p className={styles["profile-listings__state"]}>Učitavanje oglasa...</p>
      )}

      {!loading && error && (
        <p className={styles["profile-listings__state"]}>{error}</p>
      )}

      {!loading && !error && listings.length === 0 && (
        <p className={styles["profile-listings__state"]}>
          Trenutno nemaš objavljenih oglasa.
        </p>
      )}

      {!loading && !error && listings.length > 0 && (
        <div className={styles["profile-listings__grid"]}>
          {listings.map((listing) => (
              <ListingCard key={listing.id} listing={listing} />
          ))}
        </div>
      )}
    </section>
  );
}