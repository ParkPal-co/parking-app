/**
 * src/hooks/useLocation.ts
 * Custom hook for handling location-related functionality
 */

import { useState } from "react";

interface Location {
  latitude: number;
  longitude: number;
}

export function useLocation() {
  const [userLocation, setUserLocation] = useState<Location | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const requestLocation = () => {
    setIsRequestingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError("");
          setIsRequestingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not get your location. Please try again.");
          setIsRequestingLocation(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setIsRequestingLocation(false);
    }
  };

  const clearLocation = () => {
    setUserLocation(null);
    setLocationError("");
  };

  return {
    userLocation,
    locationError,
    isRequestingLocation,
    requestLocation,
    clearLocation,
  };
} 