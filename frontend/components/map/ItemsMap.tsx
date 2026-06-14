"use client";

import { useMemo, useState } from "react";
import { MapContainer, Marker, Popup, TileLayer } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import Link from "next/link";
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

export default function ItemsMap({
  items,
  defaultCenter = [44.2034, 17.9077],
  defaultZoom = 13,
  apiBaseUrl,
}: ItemsMapProps) {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedType, setSelectedType] = useState<"all" | ItemType>("all");
  const [selectedCategory, setSelectedCategory] = useState("all");

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

          <button type="button" onClick={resetFilters} className={styles.resetButton}>
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
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

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
                    {imageUrl ? (
                      <img
                        src={imageUrl}
                        alt={item.title}
                        className={styles.popupImage}
                      />
                    ) : (
                      <div className={styles.popupImagePlaceholder}>
                        Nema slike
                      </div>
                    )}

                    <div className={styles.popupHeader}>
                      <span
                        className={`${styles.badge} ${
                          item.item_type === "lost"
                            ? styles.lostBadge
                            : styles.foundBadge
                        }`}
                      >
                        {formatItemType(item.item_type)}
                      </span>

                      <span className={styles.category}>{item.category}</span>
                    </div>

                    <h3 className={styles.popupTitle}>{item.title}</h3>

                    <p className={styles.popupLocation}>{item.location_name}</p>

                    <p className={styles.popupDescription}>{item.description}</p>

                    {(item.brand || item.color || item.reward_amount) && (
                      <div className={styles.popupMeta}>
                        {item.brand && <span>Brend: {item.brand}</span>}
                        {item.color && <span>Boja: {item.color}</span>}
                        {item.reward_amount !== null &&
                          item.reward_amount !== undefined &&
                          item.reward_amount > 0 && (
                            <span>Nagrada: {item.reward_amount} KM</span>
                          )}
                      </div>
                    )}

                    <Link
                      href={`/AllItems/${item.id}`}
                      className={styles.detailsLink}
                    >
                      Pogledaj detalje
                    </Link>
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