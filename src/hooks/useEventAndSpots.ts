import { useState, useEffect } from 'react';
import { Event, ParkingSpot } from '../types';
import { fetchEventById } from '../services/eventService';
import { fetchParkingSpots } from '../services/parkingSpotService';

interface UseEventAndSpotsResult {
  event: Event | null;
  spots: ParkingSpot[];
  loading: boolean;
  error: string | null;
}

export const useEventAndSpots = (eventId: string | null): UseEventAndSpotsResult => {
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

  return { event, spots, loading, error };
}; 