/**
 * src/hooks/useEvents.ts
 * Custom hook for handling event-related state and operations
 */

import { useState, useEffect } from "react";
import { Event } from "../types";
import { fetchEvents } from "../services/eventService";
import { useLocation } from "./useLocation";

export function useEvents() {
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const { userLocation } = useLocation();

  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventResults = await fetchEvents({
          query: searchInput,
          userLocation: userLocation || undefined,
        });
        setEvents(eventResults);
      } catch (err) {
        console.error("Error loading events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [searchInput, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // The search is handled automatically by the useEffect
  };

  return {
    events,
    loading,
    error,
    searchInput,
    setSearchInput,
    handleSearch,
  };
} 