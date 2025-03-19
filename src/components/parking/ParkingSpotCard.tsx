/**
 * src/components/parking/ParkingSpotCard.tsx
 * Reusable component for displaying parking spot information
 */

import React from "react";
import { ParkingSpot } from "../../types";

interface ParkingSpotCardProps {
  spot: ParkingSpot;
  onBook: (spot: ParkingSpot) => void;
}

export const ParkingSpotCard: React.FC<ParkingSpotCardProps> = ({
  spot,
  onBook,
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img
        src={spot.images[0]}
        alt={spot.address}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{spot.address}</h3>
        <p className="text-gray-600">{spot.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold">${spot.price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onBook(spot);
            }}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );
};
