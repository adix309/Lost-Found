"use client";

import { useEffect, useMemo, useRef, useState } from "react";
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

    location_name: string | null;
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
    focusedItemId?: number;
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

function hasCoordinates(item: MapItem) {
    return (
        item.latitude !== null &&
        item.longitude !== null &&
        Number.isFinite(item.latitude) &&
        Number.isFinite(item.longitude)
    );
}

function itemMatchesFilters(
    item: MapItem,
    normalizedSearch: string,
    selectedType: "all" | ItemType,
    selectedCategory: string,
) {
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
}

function LocateUserOnLoad({
                              enabled,
                              onLocationFound,
                          }: {
    enabled: boolean;
    onLocationFound: (coords: [number, number]) => void;
}) {
    const map = useMap();

    useEffect(() => {
        if (!enabled || !navigator.geolocation) {
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
    }, [enabled, map, onLocationFound]);

    return null;
}

function FocusedItemMarker({
                               item,
                               apiBaseUrl,
                               focused,
                           }: {
    item: MapItem;
    apiBaseUrl?: string;
    focused: boolean;
}) {
    const markerRef = useRef<L.Marker | null>(null);
    const map = useMap();
    const imageUrl = getImageUrl(item.image_url, apiBaseUrl);

    useEffect(() => {
        if (!focused || item.latitude === null || item.longitude === null) {
            return;
        }

        const position: [number, number] = [item.latitude, item.longitude];

        map.setView(position, Math.max(map.getZoom(), 16), {
            animate: true,
        });

        window.setTimeout(() => {
            markerRef.current?.openPopup();
        }, 350);
    }, [focused, item.latitude, item.longitude, map]);

    return (
        <Marker
            ref={markerRef}
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

                        <div className={styles.popupInfoRow}>
                            <FontAwesomeIcon icon={faMapPin} className={styles.popupInfoIcon} />
                            <span className={styles.popupInfoText}>
                                {item.location_name || "Lokacija nije navedena"}
                            </span>
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
}

export default function ItemsMap({
                                     items,
                                     defaultCenter = [43.8563, 18.4131],
                                     defaultZoom = 13,
                                     apiBaseUrl,
                                     focusedItemId,
                                 }: ItemsMapProps) {
    const [searchTerm, setSearchTerm] = useState("");
    const [selectedType, setSelectedType] = useState<"all" | ItemType>("all");
    const [selectedCategory, setSelectedCategory] = useState("all");
    const [userLocation, setUserLocation] = useState<[number, number] | null>(null);

    const activeItems = useMemo(() => {
        return items.filter((item) => item.status === "active");
    }, [items]);

    const activeItemsWithLocation = useMemo(() => {
        return activeItems.filter(hasCoordinates);
    }, [activeItems]);

    const activeItemsWithoutLocation = useMemo(() => {
        return activeItems.filter((item) => !hasCoordinates(item));
    }, [activeItems]);

    const categories = useMemo(() => {
        const uniqueCategories = new Set<string>();

        activeItems.forEach((item) => {
            if (item.category) {
                uniqueCategories.add(item.category);
            }
        });

        return Array.from(uniqueCategories).sort((a, b) => a.localeCompare(b));
    }, [activeItems]);

    const filteredItems = useMemo(() => {
        const normalizedSearch = normalizeText(searchTerm);

        return activeItemsWithLocation.filter((item) =>
            itemMatchesFilters(item, normalizedSearch, selectedType, selectedCategory)
        );
    }, [activeItemsWithLocation, searchTerm, selectedType, selectedCategory]);

    const filteredItemsWithoutLocation = useMemo(() => {
        const normalizedSearch = normalizeText(searchTerm);

        return activeItemsWithoutLocation.filter((item) =>
            itemMatchesFilters(item, normalizedSearch, selectedType, selectedCategory)
        );
    }, [activeItemsWithoutLocation, searchTerm, selectedType, selectedCategory]);

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
                    <LocateUserOnLoad
                        enabled={focusedItemId === undefined}
                        onLocationFound={setUserLocation}
                    />

                    <TileLayer
                        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    />

                    {userLocation && (
                        <Marker position={userLocation} icon={userLocationIcon}>
                            <Popup>Tvoja trenutna lokacija</Popup>
                        </Marker>
                    )}

                    {filteredItems.map((item) => (
                        <FocusedItemMarker
                            key={item.id}
                            item={item}
                            apiBaseUrl={apiBaseUrl}
                            focused={item.id === focusedItemId}
                        />
                    ))}
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

            {activeItemsWithoutLocation.length > 0 && (
                <section className={styles.noLocationSection}>
                    <div className={styles.noLocationHeader}>
                        <div>
                            <h2>Stavke bez lokacije</h2>
                            <p>
                                Prikazano je {filteredItemsWithoutLocation.length} od{" "}
                                {activeItemsWithoutLocation.length} aktivnih predmeta bez koordinata.
                            </p>
                        </div>
                    </div>

                    {filteredItemsWithoutLocation.length > 0 ? (
                        <div className={styles.noLocationGrid}>
                            {filteredItemsWithoutLocation.map((item) => {
                                const imageUrl = getImageUrl(item.image_url, apiBaseUrl);

                                return (
                                    <Link
                                        key={item.id}
                                        href={`/AllItems/${item.id}`}
                                        className={styles.noLocationCard}
                                    >
                                        <div className={styles.noLocationImageWrapper}>
                                            {imageUrl ? (
                                                <img
                                                    src={imageUrl}
                                                    alt={item.title}
                                                    className={styles.noLocationImage}
                                                />
                                            ) : (
                                                <div className={styles.noLocationImagePlaceholder}>
                                                    Slika nije dodana
                                                </div>
                                            )}

                                            <span
                                                className={`${styles.noLocationBadge} ${
                                                    item.item_type === "lost"
                                                        ? styles.noLocationBadgeLost
                                                        : styles.noLocationBadgeFound
                                                }`}
                                            >
                                                {formatItemType(item.item_type)}
                                            </span>
                                        </div>

                                        <div className={styles.noLocationContent}>
                                            <h3>{item.title}</h3>
                                            <div className={styles.noLocationMeta}>
                                                <span>{item.category}</span>
                                                <span>{formatDateTime(item.event_date)}</span>
                                            </div>
                                            <p>
                                                {item.location_name
                                                    ? `Tekst lokacije: ${item.location_name}`
                                                    : "Geografska lokacija nije navedena."}
                                            </p>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    ) : (
                        <div className={styles.noLocationEmpty}>
                            Nema stavki bez lokacije za trenutno odabrane filtere.
                        </div>
                    )}
                </section>
            )}
        </div>
    );
}
