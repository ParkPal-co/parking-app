/**
 * src/components/location/LocationPrompt.tsx
 * Reusable component for handling location requests
 */

import React from "react";

interface LocationPromptProps {
  onRequestLocation: () => void;
  onClearLocation: () => void;
  isRequestingLocation: boolean;
  locationError: string;
  hasLocation: boolean;
}

export const LocationPrompt: React.FC<LocationPromptProps> = ({
  onRequestLocation,
  onClearLocation,
  isRequestingLocation,
  locationError,
  hasLocation,
}) => {
  if (locationError) {
    return (
      <div className="mb-6 p-4 bg-red-50 rounded-lg text-center">
        <p className="text-red-800">{locationError}</p>
        <button
          onClick={onRequestLocation}
          className="mt-2 text-red-600 hover:text-red-800"
        >
          Try again
        </button>
      </div>
    );
  }

  if (hasLocation) {
    return (
      <div className="mb-6 p-4 bg-green-50 rounded-lg text-center">
        <p className="text-green-800">
          📍 Showing events near your location
          <button
            onClick={onClearLocation}
            className="ml-4 text-green-600 hover:text-green-800 underline"
          >
            Clear location
          </button>
        </p>
      </div>
    );
  }

  return (
    <div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
      <p className="text-blue-800 mb-2">See events happening near you!</p>
      <button
        onClick={onRequestLocation}
        disabled={isRequestingLocation}
        className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isRequestingLocation ? (
          "Getting location..."
        ) : (
          <>
            <span className="mr-2">📍</span>
            Show Nearby Events
          </>
        )}
      </button>
    </div>
  );
};
