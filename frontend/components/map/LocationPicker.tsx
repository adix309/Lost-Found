"use client";

import L from "leaflet";
import { MapContainer, Marker, TileLayer, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./LocationPicker.module.css";

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (latitude: number, longitude: number) => void;
};

const DEFAULT_CENTER: [number, number] = [43.8563, 18.4131];

const locationIcon = new L.Icon({
  iconUrl: "/map-marker-default.png",
  iconSize: [38, 38],
  iconAnchor: [19, 38],
});

function LocationMarker({
  latitude,
  longitude,
  onLocationSelect,
}: LocationPickerProps) {
  useMapEvents({
    click(event) {
      onLocationSelect(event.latlng.lat, event.latlng.lng);
    },
  });

  if (latitude === null || longitude === null) {
    return null;
  }

  return <Marker position={[latitude, longitude]} icon={locationIcon} />;
}

export default function LocationPicker(props: LocationPickerProps) {
  const center: [number, number] =
    props.latitude !== null && props.longitude !== null
      ? [props.latitude, props.longitude]
      : DEFAULT_CENTER;

  return (
    <div className={styles.wrapper}>
      <MapContainer
        center={center}
        zoom={13}
        scrollWheelZoom
        className={styles.map}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <LocationMarker {...props} />
      </MapContainer>
    </div>
  );
}
