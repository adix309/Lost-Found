"use client";

import { useEffect, useMemo, useState } from "react";
import {
    MapContainer,
    Marker,
    Popup,
    TileLayer,
    useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapPin, faCalendarDay, faCoins } from "@fortawesome/free-solid-svg-icons";
import styles from "./ItemsMap.module.css";

type ItemType = "lost" | "found";
type ItemStatus = "active" | "resolved" | "expired";

export type MapItem = {
    id: number;
    user_id?: number;

    title: string;
    description: string;

    item_type: ItemType;
    category: string;

    location_name: string;
    latitude: number | null;
    longitude: number | null;

    event_date?: string;

    image_url?: string | null;

    brand?: string | null;
    color?: string | null;

    reward_amount?: number | null;

    contact_phone?: string | null;
    contact_email?: string | null;

    status: ItemStatus;
};

type ItemsMapProps = {
    items: MapItem[];
    defaultCenter?: [number, number];
    defaultZoom?: number;
    apiBaseUrl?: string;
};

const lostIcon = new L.Icon({
    iconUrl: "/map-marker-lost.png",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
});

const foundIcon = new L.Icon({
    iconUrl: "/map-marker-found.png",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
});

const fallbackIcon = new L.Icon({
    iconUrl: "/map-marker-default.png",
    iconSize: [36, 36],
    iconAnchor: [18, 36],
    popupAnchor: [0, -34],
});

const userLocationIcon = new L.Icon({
    iconUrl: "/map-marker-default.png",
    iconSize: [34, 34],
    iconAnchor: [17, 34],
    popupAnchor: [0, -30],
});

function getItemIcon(itemType: ItemType) {
    if (itemType === "lost") return lostIcon;
    if (itemType === "found") return foundIcon;
    return fallbackIcon;
}

function getImageUrl(imageUrl?: string | null, apiBaseUrl?: string) {
    if (!imageUrl) return null;

    if (imageUrl.startsWith("http")) {
        return imageUrl;
    }

    if (!apiBaseUrl) {
        return imageUrl;
    }

    return `${apiBaseUrl}${imageUrl}`;
}

function normalizeText(value: string | null | undefined) {
    return value?.toLowerCase().trim() || "";
}

function formatItemType(type: ItemType) {
    return type === "lost" ? "Izgubljeno" : "Pronađeno";
}

function formatDateTime(value?: string | null) {
    if (!value) return "Nije navedeno";
    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) return value;
    const day = String(parsed.getDate()).padStart(2, "0");
    const month = String(parsed.getMonth() + 1).padStart(2, "0");
    const year = parsed.getFullYear();
    return `${day}/${month}/${year}`;
}

function LocateUserOnLoad({
                              onLocationFound,
                          }: {
    onLocationFound: (coords: [number, number]) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (!navigator.geolocation) {
            return;
        }

        navigator.geolocation.getCurrentPosition(
            (position) => {
                const coords: [number, number] = [
                    position.coords.latitude,
                    position.coords.longitude,
                ];

                onLocationFound(coords);
                map.setView(coords, 15, {
                    animate: true,
                });
            },
            () => {
                return;
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    }, [map, onLocationFound]);

    return null;
}

export default function ItemsMap({
                                     items,
                                     defaultCenter = [43.8563, 18.4131],
                                     defaultZoom = 13,
                                     apiBaseUrl,
                                 }: ItemsMapProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<"all" | ItemType>("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const activeItemsWithLocation = useMemo(() => {
        return items.filter((item) => {
            return (
                item.status === "active" &&
                item.latitude !== null &&
                item.longitude !== null &&
                Number.isFinite(item.latitude) &&
                Number.isFinite(item.longitude)
            );
        });
    }, [items]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();

        activeItemsWithLocation.forEach((item) => {
            if (item.category) {
                uniqueCategories.add(item.category);
            }
        });

        return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
    }, [activeItemsWithLocation]);

    const filteredItems = useMemo(() => {
        const normalizedSearch = normalizeText(searchTerm);

        return activeItemsWithLocation.filter((item) => {
            const matchesType =
                selectedType === "all" || item.item_type === selectedType;

            const matchesCategory =
                selectedCategory === "all" || item.category === selectedCategory;

            const searchableText = [
                item.title,
                item.description,
                item.location_name,
                item.category,
                item.brand,
                item.color,
            ]
                .map(normalizeText)
                .join(" ");

            const matchesSearch =
                normalizedSearch.length === 0 ||
                searchableText.includes(normalizedSearch);

            return matchesType && matchesCategory && matchesSearch;
        });
    }, [activeItemsWithLocation, searchTerm, selectedType, selectedCategory]);

    function resetFilters() {
        setSearchTerm("");
        setSelectedType("all");
        setSelectedCategory("all");
    }

    return (
        <div className={styles.mapShell}>
            <div className={styles.filterCard}>
                <div>
                    <h2 className={styles.filterTitle}>Pretraga mape</h2>
                    <p className={styles.filterText}>
                        Prikazano je {filteredItems.length} od {activeItemsWithLocation.length}{" "}
                        aktivnih predmeta sa lokacijom.
                    </p>
                </div>

                <div className={styles.filters}>
                    <div className={styles.searchGroup}>
                        <label htmlFor="map-search" className={styles.label}>
                            Pretraga
                        </label>

                        <input
                            id="map-search"
                            type="search"
                            value={searchTerm}
                            onChange={(event) => setSearchTerm(event.target.value)}
                            placeholder="Npr. novčanik, telefon, Zenica, crna..."
                            className={styles.searchInput}
                        />
                    </div>

                    <div className={styles.selectGroup}>
                        <label htmlFor="type-filter" className={styles.label}>
                            Tip
                        </label>

                        <select
                            id="type-filter"
                            value={selectedType}
                            onChange={(event) =>
                                setSelectedType(event.target.value as "all" | ItemType)
                            }
                            className={styles.select}
                        >
                            <option value="all">Svi tipovi</option>
                            <option value="lost">Izgubljeno</option>
                            <option value="found">Pronađeno</option>
                        </select>
                    </div>

                    <div className={styles.selectGroup}>
                        <label htmlFor="category-filter" className={styles.label}>
                            Kategorija
                        </label>

                        <select
                            id="category-filter"
                            value={selectedCategory}
                            onChange={(event) => setSelectedCategory(event.target.value)}
                            className={styles.select}
                        >
                            <option value="all">Sve kategorije</option>

                            {categories.map((category) => (
                                <option key={category} value={category}>
                                    {category}
                                </option>
                            ))}
                        </select>
                    </div>

                    <button
                        type="button"
                        onClick={resetFilters}
                        className={styles.resetButton}
                    >
                        Očisti filtere
                    </button>
                </div>
            </div>

            <div className={styles.mapWrapper}>
                <MapContainer
                    center={defaultCenter}
                    zoom={defaultZoom}
                    scrollWheelZoom
                    className={styles.map}
                >
                    <LocateUserOnLoad onLocationFound={setUserLocation} />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {userLocation && (
                        <Marker position={userLocation} icon={userLocationIcon}>
                            <Popup>Tvoja trenutna lokacija</Popup>
                        </Marker>
                    )}

                    {filteredItems.map((item) => {
                        const imageUrl = getImageUrl(item.image_url, apiBaseUrl);

                        return (
                            <Marker
                                key={item.id}
                                position={[item.latitude as number, item.longitude as number]}
                                icon={getItemIcon(item.item_type)}
                            >
                                <Popup>
                                    <div className={styles.popup}>
                                        <div className={styles.popupImageWrapper}>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.title}
                                                    className={styles.popupImage}
                                                />
                                            ) : (
                                                <div className={styles.popupImagePlaceholder}>
                                                    Slika nije dodana
                                                </div>
                                            )}

                                            {/* Type Badge Overlay */}
                                            <span
                                                className={`${styles.popupBadge} ${
                                                    item.item_type === "lost"
                                                        ? styles.popupBadgeLost
                                                        : styles.popupBadgeFound
                                                }`}
                                                style={{ position: "absolute", top: 8, left: 8, zIndex: 2 }}
                                            >
                                                {formatItemType(item.item_type)}
                                            </span>

                                            {/* Reward Overlay */}
                                            {item.reward_amount !== null && item.reward_amount !== undefined && item.reward_amount > 0 && (
                                                <div className={styles.popupReward}>
                                                    <FontAwesomeIcon icon={faCoins} /> {item.reward_amount} KM
                                                </div>
                                            )}
                                        </div>

                                        <div className={styles.popupContent}>
                                            <div className={styles.popupHeader}>
                                                <h3 className={styles.popupTitle}>{item.title}</h3>
                                            </div>

                                            {/* Location & Date Info Rows */}
                                            <div className={styles.popupInfoRow}>
                                                <FontAwesomeIcon icon={faMapPin} className={styles.popupInfoIcon} />
                                                <span className={styles.popupInfoText}>{item.location_name}</span>
                                            </div>

                                            <div className={styles.popupInfoRow}>
                                                <FontAwesomeIcon icon={faCalendarDay} className={styles.popupInfoIcon} />
                                                <span className={styles.popupInfoText}>{formatDateTime(item.event_date)}</span>
                                            </div>

                                            <Link
                                                href={`/AllItems/${item.id}`}
                                                className={styles.popupLink}
                                            >
                                                Pogledaj detalje &rarr;
                                            </Link>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        );
                    })}
                </MapContainer>

                <div className={styles.legend}>
                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.lostDot}`} />
                        Izgubljeno
                    </div>

                    <div className={styles.legendItem}>
                        <span className={`${styles.legendDot} ${styles.foundDot}`} />
                        Pronađeno
                    </div>
                </div>

                {filteredItems.length === 0 && (
                    <div className={styles.emptyState}>
                        <h3>Nema rezultata</h3>
                        <p>Promijeni pretragu ili filtere. Da, mapa ipak ne čita misli.</p>
                        <button type="button" onClick={resetFilters}>
                            Prikaži sve predmete
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}