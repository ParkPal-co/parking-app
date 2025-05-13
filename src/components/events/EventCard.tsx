import React from "react";
import { Card } from "../ui/Card";
import { Button } from "../ui/Button";
import { Event } from "../../types";

interface EventCardProps {
  event: Event;
  index?: number;
  onFindParking: (eventId: string) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  index = 0,
  onFindParking,
}) => {
  return (
    <Card
      padding="none"
      shadow="normal"
      border={true}
      variant="interactive"
      className={
        "lg:max-h-40 flex flex-col md:flex-row overflow-hidden opacity-0 animate-fade-in-from-top transition-all duration-300 hover:shadow-xl hover:scale-[1.02] hover:border-gray-300 cursor-pointer"
      }
      style={{
        animationDelay: `${0.4 + index * 0.1}s`,
        animationFillMode: "forwards",
      }}
      onClick={() => onFindParking(event.id)}
    >
      {event.imageUrl && (
        <div className="w-full h-40 md:w-48 md:h-auto flex-shrink-0">
          <img
            src={event.imageUrl}
            alt={`Poster for ${event.title}`}
            className="w-full h-full object-cover"
          />
        </div>
      )}
      <div className="flex-1 p-4 md:p-6 flex flex-col md:flex-row md:justify-between md:items-center gap-4">
        <div>
          <h3 className="text-xl font-semibold mb-2">{event.title}</h3>
          <p className="text-primary-600 mb-2">{event.location.address}</p>
          <p className="text-primary-500">
            {new Date(event.startDate).toLocaleDateString()}
          </p>
          {event.distance && (
            <p className="text-sm text-primary-500 mt-2">
              {event.distance.toFixed(1)} km away
            </p>
          )}
        </div>
        <div className="md:ml-6 w-full md:w-auto flex-shrink-0">
          <Button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onFindParking(event.id);
            }}
            size="medium"
            variant="primary"
            fullWidth={true}
            className="md:w-auto whitespace-nowrap"
            aria-label={`Find parking for ${event.title}`}
          >
            Find Parking
          </Button>
        </div>
      </div>
    </Card>
  );
};
