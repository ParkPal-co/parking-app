/**
 * src/components/events/EventCard.tsx
 * Reusable component for displaying event information
 */

import React from "react";
import { Event } from "../../types";

interface EventCardProps {
  event: Event;
  onClick: (event: Event) => void;
}

export const EventCard: React.FC<EventCardProps> = ({ event, onClick }) => {
  return (
    <div
      className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
      onClick={() => onClick(event)}
    >
      <div className="relative h-48 mb-4">
        <img
          src={event.imageUrl || "/placeholder-event.jpg"}
          alt={event.title}
          className="w-full h-full object-cover rounded-md"
        />
        {event.distance !== undefined && (
          <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-sm">
            {event.distance} miles away
          </div>
        )}
      </div>
      <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
      <p className="text-gray-600 mb-2">{event.description}</p>
      <div className="flex justify-between items-center text-sm text-gray-500">
        <span>{event.location.address}</span>
        <span>
          {event.startDate.toLocaleDateString()} -{" "}
          {event.endDate.toLocaleDateString()}
        </span>
      </div>
    </div>
  );
};
