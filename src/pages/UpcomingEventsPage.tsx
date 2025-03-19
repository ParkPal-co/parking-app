/**
 * src/pages/UpcomingEventsPage.tsx
 * Page for displaying upcoming events
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { EventCard } from "../components/events/EventCard";
import { useEvents } from "../hooks/useEvents";

export const UpcomingEventsPage: React.FC = () => {
  const navigate = useNavigate();
  const { events, loading, error } = useEvents();

  const handleEventSelect = (event: Event) => {
    navigate(`/rent?event=${event.id}`);
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading upcoming events...</div>
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
      <h1 className="text-3xl font-bold mb-8">Upcoming Events</h1>

      {events.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No upcoming events found</p>
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
