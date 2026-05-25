"use client";

import { useMemo, useState, useEffect } from "react";
import { Container } from "@/components/common/Container";
import { SectionHeading } from "@/components/common/SectionHeading";
import { ListingCard } from "@/components/listings/ListingCard";
import styles from "./FeaturedListings.module.css";
import type { Listing, ListingType } from "@/types/listing";

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://127.0.0.1:8000";

const tabs: { label: string; value: ListingType }[] = [
  { label: "Najnovije izgubljeno", value: "lost" },
  { label: "Najnovije pronađeno", value: "found" },
];

export function FeaturedListings() {
  const [activeTab, setActiveTab] = useState<ListingType>("lost");
  const [items, setItems] = useState([] as Listing[]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null as string | null);

  useEffect(() => {
    const fetchItems = async () => {
      try {
        const response = await fetch(`${API_BASE_URL}/items`);

        if (!response.ok) {
          throw new Error("Greška pri dohvaćanju itema iz baze");
        }

        const data: Listing[] = await response.json();
        setItems(data);
        setError(null);
      } catch (err) {
        setError("Nije moguće učitati iteme. Provjeri da li backend radi.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchItems();
  }, []);

  const listings = useMemo(() => {
    return items
      .filter((listing) => listing.item_type === activeTab)
      .sort((a, b) => Date.parse(b.created_at) - Date.parse(a.created_at))
      .slice(0, 6);
  }, [activeTab, items]);

  let content = null;

  if (isLoading) {
    content = <p>Učitavanje itema...</p>;
  } else if (error) {
    content = <p style={{ color: "red" }}>{error}</p>;
  } else if (listings.length === 0) {
    content = <p>Trenutno nema itema.</p>;
  } else {
    content = (
      <div className={styles.featured__grid}>
        {listings.map((listing) => (
          <ListingCard key={listing.id} listing={listing} />
        ))}
      </div>
    );
  }

  return (
    <section className={styles.featured}>
      <Container className={styles.featured__inner}>
        <SectionHeading
          title="Izdvojeni oglasi"
          description="Najnovije prijave iz zajednice"
        />
        <div className={styles.featured__tabs}>
          {tabs.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => setActiveTab(tab.value)}
              className={`${styles.tab} ${
                activeTab === tab.value ? styles["tab--active"] : ""
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
        {content}
      </Container>
    </section>
  );
}
