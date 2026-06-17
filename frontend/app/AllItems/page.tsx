"use client";

import { useEffect, useState } from "react";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@/types/listing";

const API_URL = "http://localhost:8000";

export default function AllItemsPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(`${API_URL}/items`);

        if (!response.ok) {
          throw new Error("Greška pri dohvaćanju itema iz baze.");
        }

        const data: Listing[] = await response.json();
        setItems(data);
      } catch (err) {
        console.error(err);
        setError("Nije moguće učitati iteme. Provjeri da li backend radi.");
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

  const hasItems = items.length > 0;

  return (
    <div className="app-shell">
      <Header />

      <main className="app-main all-items-page">
        <section className="all-items-page__hero">
          <h1>Svi oglasi</h1>
          <p>Lista svih aktivnih izgubljenih i pronađenih predmeta iz baze.</p>
        </section>

        {isLoading ? <p>Učitavanje itema...</p> : null}

        {error ? <p style={{ color: "red" }}>{error}</p> : null}

        {!isLoading && !error && !hasItems ? (
          <p>Trenutno nema itema u bazi.</p>
        ) : null}

        {!isLoading && !error && hasItems ? (
          <section className="all-items-page__grid">
            {items.map((item) => (
              <ListingCard key={item.id} listing={item} />
            ))}
          </section>
        ) : null}
      </main>

      <Footer />
    </div>
  );
}