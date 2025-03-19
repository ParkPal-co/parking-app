/**
 * src/pages/DrivewaySelectPage.tsx
 * Page for selecting a parking spot for a specific event
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { ParkingSpotCard } from "../components/parking/ParkingSpotCard";
import { Event } from "../types";
import { fetchParkingSpots } from "../services/parkingSpotService";
import { fetchEventById } from "../services/eventService";

export const DrivewaySelectPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");

  const [event, setEvent] = useState<Event | null>(null);
  const [spots, setSpots] = useState<ParkingSpot[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const handleBookSpot = (spot: ParkingSpot) => {
    navigate(`/booking-confirmation?event=${eventId}&spot=${spot.id}`);
  };

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

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{event.title}</h1>
        <p className="text-gray-600">
          {event.startDate.toLocaleDateString()} -{" "}
          {event.endDate.toLocaleDateString()}
        </p>
      </div>

      {spots.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No parking spots available for this event
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {spots.map((spot) => (
            <ParkingSpotCard
              key={spot.id}
              spot={spot}
              onBook={handleBookSpot}
            />
          ))}
        </div>
      )}
    </div>
  );
};
