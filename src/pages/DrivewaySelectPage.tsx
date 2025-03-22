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

// Add animation keyframes
const fadeInFromTop = {
  "@keyframes fadeInFromTop": {
    "0%": {
      opacity: "0",
      transform: "translateY(-20px)",
    },
    "100%": {
      opacity: "1",
      transform: "translateY(0)",
    },
  },
};

const mapContainerStyle = {
  width: "100%",
  height: "100%",
};

const options = {
  disableDefaultUI: true,
  zoomControl: true,
};

export const DrivewaySelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  const [event, setEvent] = useState<Event | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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
    <div className="container mx-auto px-4 py-8">
      <div className="flex flex-col lg:flex-row gap-8">
        {/* Left side - Driveway listings */}
        <div className="lg:w-1/2">
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

        {/* Right side - Map */}
        <div className="lg:w-1/2 opacity-0 animate-fade-in-from-top [animation-delay:0.4s] [animation-fill-mode:forwards]">
          <div className="sticky top-24 h-[calc(100vh-8rem)] rounded-lg overflow-hidden shadow-lg border border-gray-200">
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
                  anchor: new window.google.maps.Point(15, 12),
                }}
                label={{
                  text: "EVENT",
                  color: "white",
                  className: "font-bold",
                  fontSize: "12px",
                }}
              />

              {/* Parking spot markers */}
              {spots.map((spot) => (
                <Marker
                  key={spot.id}
                  position={spot.coordinates}
                  onClick={() => handleSpotSelect(spot)}
                  icon={{
                    path: "M 12,0 L 28,0 C 34.6,0 40,5.4 40,12 C 40,18.6 34.6,24 28,24 L 12,24 C 5.4,24 0,18.6 0,12 C 0,5.4 5.4,0 12,0 Z", // Modern pill shape
                    fillColor:
                      selectedSpot?.id === spot.id ? "#000000" : "#333333",
                    fillOpacity: 1,
                    strokeWeight: 1,
                    strokeColor: "#FFFFFF",
                    scale: 1,
                    labelOrigin: new window.google.maps.Point(20, 12),
                    anchor: new window.google.maps.Point(20, 12),
                  }}
                  label={{
                    text: `$${spot.price}`,
                    color: "white",
                    className: "font-semibold",
                    fontSize: "12px",
                  }}
                >
                  {selectedSpot?.id === spot.id && (
                    <InfoWindow onCloseClick={() => setSelectedSpot(null)}>
                      <div className="max-w-xs">
                        <img
                          src={spot.images[0] || "https://placehold.co/600x400"}
                          alt={spot.address}
                          className="w-full h-32 object-cover rounded-t-lg"
                        />
                        <div className="p-2">
                          <p className="font-semibold text-lg mb-1">
                            ${spot.price}
                          </p>
                          <p className="text-sm text-gray-600 mb-1">
                            {spot.address}
                          </p>
                          <p className="text-sm text-gray-500">
                            {spot.description}
                          </p>
                        </div>
                      </div>
                    </InfoWindow>
                  )}
                </Marker>
              ))}
            </GoogleMap>
          </div>
        </div>
      </div>
    </div>
  );
};
