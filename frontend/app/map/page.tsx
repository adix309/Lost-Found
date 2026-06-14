"use client";

import { useEffect, useState } from "react";
import dynamic from "next/dynamic";

import type { MapItem } from "@/components/map/ItemsMap";

const ItemsMap = dynamic(() => import("@/components/map/ItemsMap"), {
  ssr: false,
});

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

export default function MapPage() {
  const [items, setItems] = useState<MapItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchItems() {
      try {
        const response = await fetch(`${API_BASE_URL}/items`);

        if (!response.ok) {
          throw new Error("Failed to fetch items");
        }

        const data = await response.json();
        setItems(data);
      } catch (error) {
        console.error("Error loading map items:", error);
      } finally {
        setLoading(false);
      }
    }

    fetchItems();
  }, []);

  if (loading) {
    return <p>Učitavanje mape...</p>;
  }

  return (
    <main style={{ padding: "32px" }}>
      <h1>Mapa izgubljenih i pronađenih predmeta</h1>

      <ItemsMap
        items={items}
        apiBaseUrl={API_BASE_URL}
        defaultCenter={[44.2034, 17.9077]}
        defaultZoom={13}
      />
    </main>
  );
}