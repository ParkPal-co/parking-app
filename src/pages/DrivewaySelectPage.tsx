/**
 * src/pages/DrivewaySelectPage.tsx
 * Page for selecting a parking spot for a specific event
 */

import React, { useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useLoadScript, Libraries } from "@react-google-maps/api";
import { ParkingSpot } from "../types";
import { DrivewayListingsPanel } from "../components/parking/DrivewayListingsPanel";
import { BackButton } from "../components/navigation/BackButton";
import { Alert } from "../components/ui/Alert";
import { Card } from "../components/ui/Card";
import { MapContainer } from "../components/map/MapContainer";
import { DrivewayListings } from "../components/parking/DrivewayListings";
import { useEventAndSpots } from "../hooks/useEventAndSpots";

// Constants
const GOOGLE_MAP_LIBRARIES: Libraries = ["marker"];

const DrivewaySelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  const { event, spots, loading, error } = useEventAndSpots(eventId);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
    libraries: GOOGLE_MAP_LIBRARIES,
  });

  const handleSpotSelect = useCallback((spot: ParkingSpot | null) => {
    setSelectedSpot(spot);
  }, []);

  const handleBookSpot = useCallback(
    (spot: ParkingSpot) => {
      navigate(`/booking-confirmation?event=${eventId}&spot=${spot.id}`);
    },
    [eventId, navigate]
  );

  if (loadError) {
    return (
      <div className="container-sm py-8">
        <Alert
          variant="error"
          title="Error"
          message="Failed to load Google Maps. Please try refreshing the page."
        />
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="container-sm py-8">
        <Card isLoading className="h-64" />
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container-sm py-8">
        <div className="space-y-4">
          <Card isLoading className="h-64" />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {[1, 2, 3, 4].map((i) => (
              <Card key={i} isLoading />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container-sm py-8">
        <Alert variant="error" title="Error" message={error} />
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container-sm py-8">
        <Alert variant="error" title="Error" message="Event not found" />
      </div>
    );
  }

  const center = event.location.coordinates || {
    lat: 37.7749,
    lng: -122.4194,
  };

  return (
    <div className="flex flex-col h-[calc(100vh-40px)] lg:space-y-0 overflow-hidden">
      {/* Fixed header bar below navbar */}
      <div className="fixed top-20 left-0 w-full h-14 bg-white z-30 flex items-center justify-center shadow-sm border-b border-primary-200 lg:hidden">
        <div className="absolute left-4">
          <BackButton />
        </div>
        <div className="text-lg font-semibold text-primary-900 truncate max-w-[70vw] text-center">
          {event.title}
        </div>
      </div>

      {/* Desktop BackButton */}
      <div className="hidden lg:flex items-center px-8 py-6">
        <BackButton />
      </div>

      {/* Map - Fullscreen on small screens, half-width on larger screens */}
      <div className="w-full h-full pt-14 lg:pt-0 lg:w-1/2 lg:fixed lg:right-0 lg:top-0">
        <MapContainer
          center={center}
          event={event}
          spots={spots}
          selectedSpot={selectedSpot}
          onSpotSelect={handleSpotSelect}
          onBookSpot={handleBookSpot}
          onMapLoad={() => {}}
        />
      </div>

      {/* Driveway listings */}
      <DrivewayListings
        event={event}
        spots={spots}
        selectedSpot={selectedSpot}
        onSpotSelect={handleSpotSelect}
        onBookSpot={handleBookSpot}
      />

      {/* Mobile panel */}
      <DrivewayListingsPanel
        spots={spots}
        selectedSpot={selectedSpot}
        onSpotSelect={handleSpotSelect}
        onSpotBook={handleBookSpot}
        isOpen={isPanelOpen}
        onToggle={() => setIsPanelOpen(!isPanelOpen)}
      />
    </div>
  );
};

export default DrivewaySelectPage;
