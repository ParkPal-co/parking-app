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
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchInput, setSearchInput] = useState("");
  const { userLocation } = useLocation();

  // Fetch all events once on mount
  useEffect(() => {
    const loadEvents = async () => {
      try {
        setLoading(true);
        const eventResults = await fetchEvents({
          userLocation: userLocation || undefined,
        });
        setEvents(eventResults);
        setFilteredEvents(eventResults);
      } catch (err) {
        console.error("Error loading events:", err);
        setError(err instanceof Error ? err.message : "Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    loadEvents();
  }, [userLocation]);

  // Filter events based on search input
  useEffect(() => {
    if (!events.length) return;

    const searchLower = searchInput.toLowerCase().trim();
    if (!searchLower) {
      setFilteredEvents(events);
      return;
    }

    const filtered = events.filter(event => 
      event.title.toLowerCase().includes(searchLower) ||
      event.location.address.toLowerCase().includes(searchLower)
    );
    setFilteredEvents(filtered);
  }, [searchInput, events]);

  const handleSearch = () => {
    // This is now just a placeholder for form submission
    // The actual filtering is handled by the useEffect above
    console.log('Search submitted with:', searchInput);
  };

  return {
    events: filteredEvents, // Return filtered events instead of all events
    allEvents: events, // Keep access to unfiltered events if needed
    loading,
    error,
    searchInput,
    setSearchInput,
    handleSearch,
  };
} 