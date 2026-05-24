"use client";

import { useEffect, useState } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { ListingCard } from "@/components/listings/ListingCard";
import type { Listing } from "@/types/listing";

export default function AllItemPage() {
  const [items, setItems] = useState<Listing[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch("http://localhost:8000/items");

        if (!response.ok) {
          throw new Error("Greška pri dohvaćanju itema iz baze");
        }

        const data: Listing[] = await response.json();
        setItems(data);
      } catch (err) {
        setError("Nije moguće učitati iteme. Provjeri da li backend radi.");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchItems();
  }, []);

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

        {!isLoading && !error && items.length === 0 ? (
          <p>Trenutno nema itema u bazi.</p>
        ) : null}

        {!isLoading && !error && items.length > 0 ? (
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
