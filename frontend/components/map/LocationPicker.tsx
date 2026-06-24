"use client";

import L from "leaflet";
import { useEffect } from "react";
import { MapContainer, Marker, TileLayer, useMap, useMapEvents } from "react-leaflet";
import "leaflet/dist/leaflet.css";

import styles from "./LocationPicker.module.css";

type LocationPickerProps = {
  latitude: number | null;
  longitude: number | null;
  onLocationSelect: (latitude: number, longitude: number) => void;
  onLocationClear?: () => void;
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

function MapCenterUpdater({
  latitude,
  longitude,
}: {
  latitude: number | null;
  longitude: number | null;
}) {
  const map = useMap();

  useEffect(() => {
    if (latitude === null || longitude === null) {
      return;
    }

    map.setView([latitude, longitude], Math.max(map.getZoom(), 15), {
      animate: true,
    });
  }, [latitude, longitude, map]);

  return null;
}

export default function LocationPicker(props: LocationPickerProps) {
  const center: [number, number] =
    props.latitude !== null && props.longitude !== null
      ? [props.latitude, props.longitude]
      : DEFAULT_CENTER;
  const hasLocation = props.latitude !== null && props.longitude !== null;

  return (
    <div className={styles.wrapper}>
      {hasLocation && props.onLocationClear && (
        <button
          type="button"
          className={styles.clearButton}
          onClick={props.onLocationClear}
          aria-label="Ukloni lokaciju"
        >
          X
        </button>
      )}

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
        <MapCenterUpdater latitude={props.latitude} longitude={props.longitude} />
        <LocationMarker {...props} />
      </MapContainer>
    </div>
  );
}
