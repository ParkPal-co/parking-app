import React, { useState, useEffect } from "react";
import { GoogleMap } from "@react-google-maps/api";
import { MapErrorBoundary } from "./MapErrorBoundary";
import { MapMarkers } from "./MapMarkers";
import { Event, ParkingSpot } from "../../types";

const MAP_CONTAINER_STYLE = {
  width: "100%",
  height: "100%",
} as const;

const MAP_OPTIONS = {
  disableDefaultUI: true,
  zoomControl: true,
} as const;

interface MapContainerProps {
  center: { lat: number; lng: number };
  event: Event | null;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot | null) => void;
  onBookSpot: (spot: ParkingSpot) => void;
  onMapLoad: (map: google.maps.Map) => void;
}

export const MapContainer: React.FC<MapContainerProps> = ({
  center,
  event,
  spots,
  selectedSpot,
  onSpotSelect,
  onBookSpot,
  onMapLoad,
}) => {
  const [mapInstance, setMapInstance] = useState<google.maps.Map | null>(null);

  const handleMapLoad = (map: google.maps.Map) => {
    setMapInstance(map);
    onMapLoad(map);
  };

  useEffect(() => {
    if (mapInstance && selectedSpot) {
      const LAT_OFFSET = 0.0003; // ~90 meters, adjust as needed
      const adjustedCenter = {
        lat: selectedSpot.coordinates.lat + LAT_OFFSET,
        lng: selectedSpot.coordinates.lng,
      };
      mapInstance.panTo(adjustedCenter);
      mapInstance.setZoom(18);
    }
  }, [mapInstance, selectedSpot]);

  return (
    <MapErrorBoundary>
      <GoogleMap
        mapContainerStyle={MAP_CONTAINER_STYLE}
        zoom={15}
        center={center}
        options={{
          ...MAP_OPTIONS,
          mapId: "62416d455647914f888c8042",
        }}
        onLoad={handleMapLoad}
      >
        <MapMarkers
          map={mapInstance}
          event={event}
          spots={spots}
          selectedSpot={selectedSpot}
          onSpotSelect={onSpotSelect}
          onBookSpot={onBookSpot}
        />
      </GoogleMap>
    </MapErrorBoundary>
  );
};
