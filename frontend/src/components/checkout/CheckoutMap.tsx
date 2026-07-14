"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// Fix for leaflet default marker icon issue in Next.js/Webpack
const defaultIcon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41]
});

interface CheckoutMapProps {
  onLocationSelect: (lat: number, lng: number) => void;
  initialLat?: number;
  initialLng?: number;
}

// Sub-component to handle map clicks and moving the marker
function MapEventsHandler({ onLocationSelect, setMarkerPos }: { 
  onLocationSelect: (lat: number, lng: number) => void;
  setMarkerPos: (pos: [number, number]) => void;
}) {
  useMapEvents({
    click(e) {
      const { lat, lng } = e.latlng;
      setMarkerPos([lat, lng]);
      onLocationSelect(lat, lng);
    },
  });
  return null;
}

// Sub-component to fly to a location when center changes
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, map.getZoom());
  }, [center, map]);
  return null;
}

export default function CheckoutMap({ onLocationSelect, initialLat = 24.8607, initialLng = 67.0011 }: CheckoutMapProps) {
  const [markerPos, setMarkerPos] = useState<[number, number]>([initialLat, initialLng]);
  const [mapCenter, setMapCenter] = useState<[number, number]>([initialLat, initialLng]);

  // Sync map center and marker when props change (from parent geocoder search)
  useEffect(() => {
    setMarkerPos([initialLat, initialLng]);
    setMapCenter([initialLat, initialLng]);
  }, [initialLat, initialLng]);

  // Try to locate user on mount
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPos([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          onLocationSelect(latitude, longitude);
        },
        (error) => {
          console.log("Geolocation error:", error.message);
        },
        { enableHighAccuracy: true }
      );
    }
  }, [onLocationSelect]);

  const handleLocateMe = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMarkerPos([latitude, longitude]);
          setMapCenter([latitude, longitude]);
          onLocationSelect(latitude, longitude);
        }
      );
    }
  };

  return (
    <div className="space-y-3 w-full">
      <div className="flex justify-between items-center">
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Pinpoint Your Delivery Address</p>
        <button
          type="button"
          onClick={handleLocateMe}
          className="text-xs font-semibold px-3 py-1.5 rounded-lg bg-primary/10 text-primary border border-primary/20 hover:bg-primary/20 transition-all"
        >
          📍 Locate Me
        </button>
      </div>
      <div className="h-[280px] w-full rounded-2xl overflow-hidden border border-border shadow-inner relative z-0 [&_.leaflet-container]:grayscale [&_.leaflet-container]:contrast-[105%] [&_.leaflet-container]:brightness-[98%] dark:[&_.leaflet-container]:invert dark:[&_.leaflet-container]:hue-rotate-[180deg]">
        <MapContainer 
          center={mapCenter} 
          zoom={13} 
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <Marker position={markerPos} icon={defaultIcon} />
          <MapEventsHandler onLocationSelect={onLocationSelect} setMarkerPos={setMarkerPos} />
          <ChangeView center={mapCenter} />
        </MapContainer>
      </div>
      <p className="text-[11px] text-muted-foreground">
        Click anywhere on the map to pinpoint your exact location. Shipping fees are calculated dynamically based on distance.
      </p>
    </div>
  );
}
