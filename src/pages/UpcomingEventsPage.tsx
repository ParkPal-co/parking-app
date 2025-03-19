/**
 * src/pages/UpcomingEventsPage.tsx
 * Page for displaying upcoming events with location-based sorting
 */

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { Event } from "../types";

const calculateDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number => {
  const R = 6371; // Earth's radius in km
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

export const UpcomingEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { events, loading, error, searchInput, setSearchInput, handleSearch } =
    useEvents();
  const [sortedEvents, setSortedEvents] = useState<Event[]>([]);
  const [userLocation, setUserLocation] = useState<{
    lat: number;
    lng: number;
  } | null>(null);

  // Update sorted events whenever events change
  useEffect(() => {
    if (events) {
      setSortedEvents(events);
    }
  }, [events]);

  // Set initial search input from URL params if present
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const query = params.get("q");
    const showNearby = params.get("nearby") === "true";

    if (query && query !== searchInput) {
      setSearchInput(query);
    }

    if (showNearby) {
      handleShowNearbyEvents();
    }
  }, [location.search]);

  const handleFindParking = (eventId: string) => {
    navigate(`/rent?event=${eventId}`);
  };

  const handleShowNearbyEvents = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const userLoc = {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          };
          setUserLocation(userLoc);

          const eventsWithDistance = events.map((event) => ({
            ...event,
            distance: calculateDistance(
              userLoc.lat,
              userLoc.lng,
              event.location.coordinates.lat,
              event.location.coordinates.lng
            ),
          }));

          const sorted = [...eventsWithDistance].sort(
            (a, b) => (a.distance || 0) - (b.distance || 0)
          );
          setSortedEvents(sorted);
        },
        (error) => {
          console.error("Error getting location:", error);
          alert(
            "Unable to get your location. Please check your browser settings."
          );
        }
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleSearch();
    // Update URL with search query
    const params = new URLSearchParams(location.search);
    params.set("q", searchInput);
    navigate({ search: params.toString() });
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading events...</div>
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

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Bar */}
      <div className="mb-8">
        <form onSubmit={handleSearchSubmit} className="max-w-2xl mx-auto">
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              placeholder="Search for events..."
              className="w-full px-6 py-3 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </div>
        </form>
      </div>

      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">Upcoming Events</h1>
        <button
          onClick={handleShowNearbyEvents}
          className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
        >
          Show Events Near Me
        </button>
      </div>

      {sortedEvents.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No upcoming events found</p>
        </div>
      ) : (
        <div className="space-y-6 max-w-4xl mx-auto">
          {sortedEvents.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200 flex"
            >
              {event.imageUrl && (
                <div className="w-48 h-auto">
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="flex-1 p-6 flex justify-between items-center">
                <div>
                  <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
                  <p className="text-gray-600 mb-2">{event.location.address}</p>
                  <p className="text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                  {event.distance && (
                    <p className="text-sm text-gray-500 mt-2">
                      {event.distance.toFixed(1)} km away
                    </p>
                  )}
                </div>
                <div className="ml-6">
                  <button
                    onClick={() => handleFindParking(event.id)}
                    className="bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors whitespace-nowrap"
                  >
                    Find Parking
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
