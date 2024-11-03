// MapComponent.tsx
import React, { useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Polyline,
  Popup,
  Marker,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import axios from "axios";
import polyline from "@mapbox/polyline";
interface Props {
  start: [number, number];
  end: [number, number];
}

export const Map: React.FC<Props> = ({ start, end }) => {
  const [route, setRoute] = useState<L.LatLng[]>([]);
  const [currentPosition, setCurrentPosition] = useState<
    [number, number] | null
  >(null);
  useEffect(() => {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCurrentPosition([
          position.coords.latitude,
          position.coords.longitude,
        ]);
      },
      (error) => {
        console.error("Error getting current position:", error);
      },
    );

    const fetchRoute = async () => {
      try {
        const response = await axios.get(
          `https://graphhopper.com/api/1/route?point=${start[0]},${start[1]}&point=${end[0]},${end[1]}&vehicle=car&locale=en&key=98affaf4-7d5a-4df6-a134-b6d988de2b7a`,
        );
        const encodedPolyline = response.data.paths[0].points;
        const decodedPoints = polyline.decode(encodedPolyline);
        const polylinePoints = decodedPoints.map((point: number[]) =>
          L.latLng(point[0], point[1]),
        );
        console.log({ encodedPolyline, response: response.data });
        const instructions = response.data.paths[0].instructions;
        setRoute(polylinePoints);
        const turnsWithArrows = instructions.map((instruction: any) => {
          const startIdx = instruction.interval[0];
          const [latitude, longitude] = decodedPoints[startIdx];
          const azimuth = instruction.sign; // `sign` có thể dùng để xác định góc hướng rẽ
          return { latitude, longitude, text: instruction.text, azimuth };
        });
      } catch (error) {
        console.error("Error fetching route:", error);
      }
    };

    fetchRoute();
  }, [start, end]);

  return (
    <MapContainer
      center={start}
      zoom={13}
      style={{ height: "100vh", width: "100%" }}
    >
      <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
      {route.length > 0 && <Polyline positions={route} color="blue" />}
      {currentPosition && (
        <Marker
          position={currentPosition}
          icon={L.icon({
            iconUrl: "https://maps.google.com/mapfiles/ms/icons/blue-dot.png",
          })}
        >
          <Popup>Vị trí hiện tại của bạn</Popup>
        </Marker>
      )}
    </MapContainer>
  );
};
