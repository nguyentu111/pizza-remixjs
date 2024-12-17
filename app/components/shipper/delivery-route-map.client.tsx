import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Marker,
  useMap,
  Popup,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type {
  DetailedRoute,
  Instruction,
  OptimizedRoute,
  RoutePoint,
} from "~/types/delivery";
import type { Delivery } from "@prisma/client";

// Custom marker icons
const createCustomIcon = (number: number | string, color: string) => {
  return L.divIcon({
    className: "custom-icon",
    html: `<div style="background-color: ${color}; width: 24px; height: 24px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; font-weight: bold;">${number}</div>`,
  });
};

const currentLocationIcon = L.divIcon({
  className: "custom-icon",
  html: `<div style="background-color: #4A90E2; width: 24px; height: 24px; border-radius: 50%; border: 3px solid white; box-shadow: 0 0 10px rgba(0,0,0,0.3);"></div>`,
});

// Map center updater component
function MapUpdater({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);
  return null;
}

interface Props {
  route: OptimizedRoute;
  currentOrderIndex: number;
  currentInstruction: Instruction | null;
  delivery: Delivery & {
    DeliveryOrder: Array<{
      order: {
        address: string;
        id: string;
      };
    }>;
  };
  routePoints: RoutePoint[];
  currentPosition: [number, number] | null;
  storeLocation: { lat: number; lng: number };
  children?: React.ReactNode;
}

export function DeliveryRouteMap({
  route,
  currentOrderIndex,
  currentInstruction,
  delivery,
  routePoints,
  currentPosition,
  storeLocation,
  children,
}: Props) {
  // Center map on current instruction or current order
  const center: [number, number] = currentInstruction
    ? [currentInstruction.latitude, currentInstruction.longitude]
    : route.steps[currentOrderIndex]
      ? [
          route.steps[currentOrderIndex].latitude,
          route.steps[currentOrderIndex].longitude,
        ]
      : [storeLocation.lat, storeLocation.lng];

  return (
    <div className="relative h-full w-full">
      <MapContainer
        center={center}
        zoom={15}
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />

        {/* Current location marker */}
        {currentPosition && (
          <Marker position={currentPosition} icon={currentLocationIcon}>
            <Popup>Vị trí của bạn</Popup>
          </Marker>
        )}

        {/* Store location marker */}
        <Marker
          position={[storeLocation.lat, storeLocation.lng]}
          icon={createCustomIcon("S", "#22C55E")}
        >
          <Popup>Cửa hàng</Popup>
        </Marker>

        {/* Order markers */}
        {route.steps.map((step: any, index: number) => (
          <Marker
            key={step.orderId}
            position={[step.latitude, step.longitude]}
            icon={createCustomIcon(
              index + 1,
              index === currentOrderIndex ? "#EF4444" : "#6B7280",
            )}
          >
            <Popup>
              <div className="p-2">
                <p className="font-semibold">Đơn hàng #{step.orderId}</p>
                <p className="text-sm">
                  {delivery.DeliveryOrder[index].order.address}
                </p>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Current instruction marker */}
        {currentInstruction && (
          <Marker
            position={[
              currentInstruction.latitude,
              currentInstruction.longitude,
            ]}
            icon={L.divIcon({
              className: "custom-icon",
              html: `<div style="background-color: #EF4444; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white;"></div>`,
            })}
          >
            <Popup>{currentInstruction.text}</Popup>
          </Marker>
        )}

        {/* Route polyline */}
        <Polyline
          positions={routePoints.map((point) => [point.lat, point.lng])}
          color="#3B82F6"
          weight={3}
        />

        {/* Update map center when instruction changes */}
        <MapUpdater center={center} zoom={15} />
      </MapContainer>

      {/* Navigation Instructions Overlay */}
      <div className="absolute bottom-8 left-0 right-0 z-[1000] px-4">
        {children}
      </div>
    </div>
  );
}
