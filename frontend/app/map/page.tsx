"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { MapItem } from "@/components/map/ItemsMap";

const ItemsMap = dynamic(() => import("@/components/map/ItemsMap"), {
  ssr: false,
  loading: () => <p>Učitavanje mape...</p>,
});

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function MapPage() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    async function fetchItems() {
      try {
        setError("");

        const response = await fetch(`${API_BASE_URL}/items`);

        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error loading map items:", error);
        setError("Nije moguće učitati predmete za mapu.");
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  return (
    <main
      style={{
        minHeight: "100vh",
        padding: "32px",
        background:
          "linear-gradient(180deg, #f8fafc 0%, #eef2ff 45%, #f8fafc 100%)",
      }}
    >
      <section
        style={{
          maxWidth: "1180px",
          margin: "0 auto",
        }}
      >
        <div
          style={{
            marginBottom: "24px",
          }}
        >
          <p
            style={{
              margin: "0 0 8px",
              fontSize: "14px",
              fontWeight: 700,
              color: "#2563eb",
              textTransform: "uppercase",
              letterSpacing: "0.08em",
            }}
          >
            Interaktivna mapa
          </p>

          <h1
            style={{
              margin: 0,
              fontSize: "34px",
              lineHeight: 1.15,
              color: "#0f172a",
            }}
          >
            Mapa izgubljenih i pronađenih predmeta
          </h1>

          <p
            style={{
              maxWidth: "680px",
              margin: "12px 0 0",
              fontSize: "16px",
              lineHeight: 1.6,
              color: "#475569",
            }}
          >
            Pretraži predmete po nazivu, lokaciji, kategoriji, boji ili brendu i
            brzo pronađi aktivne objave na mapi.
          </p>
        </div>

        {loading && (
          <div
            style={{
              padding: "18px 20px",
              borderRadius: "16px",
              background: "white",
              border: "1px solid #e2e8f0",
              color: "#475569",
              boxShadow: "0 12px 30px rgba(15, 23, 42, 0.06)",
            }}
          >
            Učitavanje mape...
          </div>
        )}

        {!loading && error && (
          <div
            style={{
              padding: "18px 20px",
              borderRadius: "16px",
              background: "#fef2f2",
              border: "1px solid #fecaca",
              color: "#991b1b",
              fontWeight: 600,
            }}
          >
            {error}
          </div>
        )}

        {!loading && !error && (
          <ItemsMap
            items={items}
            apiBaseUrl={API_BASE_URL}
            defaultCenter={[44.2034, 17.9077]}
            defaultZoom={13}
          />
        )}
      </section>
    </main>
  );
}