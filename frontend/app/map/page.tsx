"use client";

import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";
import { Suspense, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import { useSearchParams } from "next/navigation";
import styles from "./MapPage.module.css";

import type { MapItem } from "@/components/map/ItemsMap";

const ItemsMap = dynamic(() => import("@/components/map/ItemsMap"), {
    ssr: false,
    loading: () => <p>Učitavanje mape...</p>,
});

const API_BASE_URL =
    process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:8000";

function MapPageContent() {
    const searchParams = useSearchParams();
    const focusedItemId = Number(searchParams.get("focusedItem"));
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
                setError("Nije moguće učitati predmete za mapu. Provjerite da li backend radi.");
            } finally {
                setLoading(false);
            }
        }

        fetchItems();
    }, []);

    return (
        <div className={styles.pageShell}>
            <Header />

            <main className={styles.mapMain}>
                {/* Hero Header on a warm tinted background wrapper */}
                <section className={styles.mapHeroBg}>
                    <div className="container">
                        <div className={styles.headerSection}>
                            <p className={styles.eyebrow}>
                                Interaktivna mapa
                            </p>
                            <h1 className={styles.title}>
                                Mapa izgubljenih i pronađenih predmeta
                            </h1>
                            <p className={styles.description}>
                                Pretražite prijavljene predmete po nazivu, kategoriji ili lokaciji i vizuelno locirajte tačna mjesta na mapi.
                            </p>
                        </div>
                    </div>
                </section>

                {/* Map Wrapper Section on a clean white background */}
                <section className={styles.mapContentSection}>
                    <div className="container">
                        {loading && (
                            <div className={styles.loadingPanel}>
                                Učitavanje interaktivne mape i predmeta...
                            </div>
                        )}

                        {!loading && error && (
                            <div className={styles.errorPanel}>
                                {error}
                            </div>
                        )}

                        {!loading && !error && (
                            <ItemsMap
                                items={items}
                                apiBaseUrl={API_BASE_URL}
                                defaultCenter={[43.8563, 18.4131]}
                                defaultZoom={13}
                                focusedItemId={Number.isFinite(focusedItemId) ? focusedItemId : undefined}
                            />
                        )}
                    </div>
                </section>
            </main>

            <Footer />
        </div>
    );
}

export default function MapPage() {
    return (
        <Suspense fallback={<p>Učitavanje mape...</p>}>
            <MapPageContent />
        </Suspense>
    );
}
