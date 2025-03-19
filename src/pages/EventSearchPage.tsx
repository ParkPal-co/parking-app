/**
 * src/pages/EventSearchPage.tsx
 * Page for searching and selecting events
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { EventSearch } from "../components/events/EventSearch";
import { EventCard } from "../components/events/EventCard";
import { LocationPrompt } from "../components/location/LocationPrompt";
import { useEvents } from "../hooks/useEvents";
import { useLocation } from "../hooks/useLocation";

export const EventSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, loading, error, searchInput, setSearchInput, handleSearch } =
    useEvents();
  const {
    userLocation,
    locationError,
    isRequestingLocation,
    requestLocation,
    clearLocation,
  } = useLocation();

  const handleEventSelect = (event: Event) => {
    navigate(`/rent?event=${event.id}`);
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
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-6">
          Find Parking Near Your Event
        </h1>

        <div className="max-w-4xl mx-auto">
          <LocationPrompt
            onRequestLocation={requestLocation}
            onClearLocation={clearLocation}
            isRequestingLocation={isRequestingLocation}
            locationError={locationError}
            hasLocation={!!userLocation}
          />

          <EventSearch
            searchInput={searchInput}
            onSearchInputChange={setSearchInput}
            onSubmit={handleSearch}
          />
        </div>
      </div>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {searchInput
              ? `No events found matching "${searchInput}"`
              : "No upcoming events found"}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => (
            <EventCard
              key={event.id}
              event={event}
              onClick={handleEventSelect}
            />
          ))}
        </div>
      )}
    </div>
  );
};
