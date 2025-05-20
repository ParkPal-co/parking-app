/**
 * src/pages/DrivewaySelectPage.tsx
 * Page for selecting a parking spot for a specific event
 */

import React, { useEffect, useState, useCallback } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import {
  GoogleMap,
  useLoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { ParkingSpotCard } from "../components/parking/ParkingSpotCard";
import { Event, ParkingSpot } from "../types";
import { fetchParkingSpots } from "../services/parkingSpotService";
import { fetchEventById } from "../services/eventService";
import { DrivewayListingsPanel } from "../components/parking/DrivewayListingsPanel";
import { BackButton } from "../components/navigation/BackButton";

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

const DrivewaySelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  const [event, setEvent] = useState<Event | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isPanelOpen, setIsPanelOpen] = useState(false);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY,
  });

  useEffect(() => {
    const loadEventAndSpots = async () => {
      if (!eventId) {
        setError("No event selected");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [eventData, parkingSpots] = await Promise.all([
          fetchEventById(eventId),
          fetchParkingSpots(eventId),
        ]);

        setEvent(eventData);
        setSpots(parkingSpots);
      } catch (err) {
        console.error("Error loading event and spots:", err);
        setError("Failed to load event and parking spots");
      } finally {
        setLoading(false);
      }
    };

    loadEventAndSpots();
  }, [eventId]);

  const handleSpotSelect = useCallback((spot: ParkingSpot) => {
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
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Error loading Google Maps
        </div>
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading maps...</div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading parking spots...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  if (!event) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">Event not found</div>
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

      {/* Map - Fullscreen on small screens, half-width on larger screens */}
      <div className="w-full h-full pt-14 lg:pt-0 lg:w-1/2 lg:fixed lg:right-0 lg:top-0">
        <GoogleMap
          mapContainerStyle={mapContainerStyle}
          zoom={14}
          center={center}
          options={{
            ...options,
            styles: [
              {
                featureType: "poi",
                elementType: "labels",
                stylers: [{ visibility: "off" }],
              },
            ],
          }}
        >
          {/* Event marker */}
          <Marker
            position={center}
            icon={{
              path: "M 12,0 L 18,0 C 24.6,0 30,5.4 30,12 C 30,18.6 24.6,24 18,24 L 12,24 C 5.4,24 0,18.6 0,12 C 0,5.4 5.4,0 12,0 Z", // Modern pill shape
              fillColor: "#000000",
              fillOpacity: 1,
              strokeWeight: 1,
              strokeColor: "#FFFFFF",
              scale: 1.5,
              labelOrigin: new window.google.maps.Point(15, 12),
            }}
          />
          {/* Parking spot markers */}
          {spots.map((spot) => (
            <Marker
              key={spot.id}
              position={spot.coordinates}
              onClick={() => handleSpotSelect(spot)}
              icon={{
                path: "M 12,0 L 18,0 C 24.6,0 30,5.4 30,12 C 30,18.6 24.6,24 18,24 L 12,24 C 5.4,24 0,18.6 0,12 C 0,5.4 5.4,0 12,0 Z", // Modern pill shape
                fillColor: selectedSpot?.id === spot.id ? "#000000" : "#A0AEC0",
                fillOpacity: 1,
                strokeWeight: 1,
                strokeColor: "#FFFFFF",
                scale: 1.5,
                labelOrigin: new window.google.maps.Point(15, 12),
              }}
            />
          ))}
        </GoogleMap>
      </div>

      {/* Driveway listings - Hidden on small screens, shown on larger screens */}
      <div className="hidden lg:block lg:w-1/2 lg:pl-8 lg:pr-4 lg:py-8">
        <div className="mb-6 opacity-0 animate-fade-in-from-top [animation-fill-mode:forwards]">
          <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
          <p className="text-gray-600">
            {new Date(event.startDate).toLocaleDateString()}
          </p>
          <p className="text-gray-600">{event.location.address}</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {spots.length === 0 ? (
            <div className="text-center py-8 col-span-2 opacity-0 animate-fade-in-from-top [animation-delay:0.2s] [animation-fill-mode:forwards]">
              <p className="text-gray-600">
                No parking spots available for this event
              </p>
            </div>
          ) : (
            spots.map((spot, index) => (
              <div
                key={spot.id}
                className="opacity-0 animate-fade-in-from-top transition-all duration-300 hover:shadow-xl hover:scale-[1.02]"
                style={{
                  animationDelay: `${0.2 + index * 0.1}s`,
                  animationFillMode: "forwards",
                }}
              >
                <ParkingSpotCard
                  spot={spot}
                  isSelected={selectedSpot?.id === spot.id}
                  onSelect={handleSpotSelect}
                  onBook={handleBookSpot}
                />
              </div>
            ))
          )}
        </div>
      </div>

      <DrivewayListingsPanel
        eventTitle={event.title}
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
