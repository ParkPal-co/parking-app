/**
 * src/components/parking/ParkingSpotCard.tsx
 * Reusable component for displaying parking spot information
 */

import React from "react";
import { ParkingSpot } from "../../types";

interface ParkingSpotCardProps {
  spot: ParkingSpot;
  isSelected?: boolean;
  onSelect?: (spot: ParkingSpot) => void;
  onBook: (spot: ParkingSpot) => void;
}

export const ParkingSpotCard: React.FC<ParkingSpotCardProps> = ({
  spot,
  isSelected = false,
  onSelect,
  onBook,
}) => {
  return (
    <div
      className={`bg-white rounded-lg shadow-md overflow-hidden border-2 transition-all h-[420px] flex flex-col ${
        isSelected ? "border-black" : "border-transparent"
      } ${onSelect ? "cursor-pointer" : ""}`}
      onClick={() => onSelect?.(spot)}
    >
      <div className="relative h-48 flex-shrink-0">
        <img
          src={spot.images[0] || "https://placehold.co/600x400"}
          alt={spot.address}
          className="w-full h-full object-cover"
        />
        <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-lg">
          ${spot.price}
        </div>
      </div>
      <div className="p-4 flex flex-col flex-grow">
        <h3 className="text-lg font-semibold mb-2 line-clamp-1">
          {spot.address}
        </h3>
        <p className="text-sm text-gray-500 mb-2">
          Available:{" "}
          {new Date(spot.availability.start).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}{" "}
          -{" "}
          {new Date(spot.availability.end).toLocaleTimeString([], {
            hour: "2-digit",
            minute: "2-digit",
          })}
        </p>
        <p className="text-gray-600 mb-4 line-clamp-3 flex-grow">
          {spot.description}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onBook(spot);
          }}
          className="w-full bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors mt-auto"
        >
          Book Now
        </button>
      </div>
    </div>
  );
};
