import React from "react";
import { Card } from "../ui/Card";
import { ParkingSpotCard } from "./ParkingSpotCard";
import { Event, ParkingSpot } from "../../types";

interface DrivewayListingsProps {
  event: Event;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot | null) => void;
  onBookSpot: (spot: ParkingSpot) => void;
}

export const DrivewayListings: React.FC<DrivewayListingsProps> = ({
  event,
  spots,
  selectedSpot,
  onSpotSelect,
  onBookSpot,
}) => {
  return (
    <div className="hidden lg:block lg:w-1/2 lg:pl-8 lg:pr-4 lg:py-8 lg:overflow-y-auto lg:max-h-screen">
      <Card className="mb-6 opacity-0 animate-fade-in-from-top [animation-fill-mode:forwards]">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        <p className="text-primary-600">
          {new Date(event.startDate).toLocaleDateString()}
        </p>
        <p className="text-primary-600">{event.location.address}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spots.length === 0 ? (
          <Card className="text-center py-8 col-span-2 opacity-0 animate-fade-in-from-top [animation-delay:0.2s] [animation-fill-mode:forwards]">
            <p className="text-primary-600">
              No parking spots available for this event
            </p>
          </Card>
        ) : (
          spots.map((spot, index) => (
            <div
              key={spot.id}
              className="opacity-0 animate-fade-in-from-top transition-normal hover:shadow-xl hover:scale-[1.02]"
              style={{
                animationDelay: `${0.2 + index * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              <ParkingSpotCard
                spot={spot}
                isSelected={selectedSpot?.id === spot.id}
                onSelect={onSpotSelect}
                onBook={onBookSpot}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
