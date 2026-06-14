"use client";

import { useMemo } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./ItemsMap.module.css";
import Link from "next/link";

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
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const foundIcon = new L.Icon({
  iconUrl: "/map-marker-found.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
});

const fallbackIcon = new L.Icon({
  iconUrl: "/map-marker-default.png",
  iconSize: [32, 32],
  iconAnchor: [16, 32],
  popupAnchor: [0, -32],
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

export default function ItemsMap({
  items,
  defaultCenter = [44.2034, 17.9077],
  defaultZoom = 13,
  apiBaseUrl,
}: ItemsMapProps) {
  const mapItems = useMemo(() => {
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

  return (
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

        {mapItems.map((item) => {
          const imageUrl = getImageUrl(item.image_url, apiBaseUrl);

          return (
            <Marker
              key={item.id}
              position={[item.latitude as number, item.longitude as number]}
              icon={getItemIcon(item.item_type)}
            >
              <Popup>
                <div className={styles.popup}>
                  {imageUrl && (
                    <img
                      src={imageUrl}
                      alt={item.title}
                      className={styles.popupImage}
                    />
                  )}

                  <div className={styles.popupHeader}>
                    <span className={styles.badge}>
                      {item.item_type === "lost" ? "Izgubljeno" : "Pronađeno"}
                    </span>

                    <span className={styles.category}>
                      {item.category}
                    </span>
                  </div>

                  <h3 className={styles.popupTitle}>{item.title}</h3>

                  <p className={styles.popupLocation}>
                    {item.location_name}
                  </p>

                  <p className={styles.popupDescription}>
                    {item.description}
                  </p>

                  {(item.brand || item.color) && (
                    <p className={styles.popupMeta}>
                      {item.brand && <span>Brend: {item.brand}</span>}
                      {item.brand && item.color && <span> · </span>}
                      {item.color && <span>Boja: {item.color}</span>}
                    </p>
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
    </div>
  );
}