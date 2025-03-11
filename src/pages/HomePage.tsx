import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

export default function HomePage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);
  const navigate = useNavigate();

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/rent?event=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const handleFindNearbyEvents = () => {
    setIsRequestingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        () => {
          setIsRequestingLocation(false);
          navigate("/rent");
        },
        (error) => {
          console.error("Error getting location:", error);
          setIsRequestingLocation(false);
          // Navigate anyway, the RentPage will handle the location error
          navigate("/rent");
        }
      );
    } else {
      setIsRequestingLocation(false);
      navigate("/rent");
    }
  };

  return (
    <div className="min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center px-4">
      <div className="max-w-3xl w-full text-center space-y-8">
        <h1 className="text-4xl sm:text-5xl font-bold text-gray-900">
          Find parking near your event
        </h1>
        <p className="text-xl text-gray-600">
          Book convenient parking spaces from local hosts for any upcoming event
        </p>

        <div className="space-y-4">
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex shadow-sm">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search for an event..."
                className="flex-1 px-4 py-3 rounded-l-md border-gray-300 focus:ring-black focus:border-black text-lg"
              />
              <button
                type="submit"
                className="px-6 py-3 bg-black text-white rounded-r-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Search
              </button>
            </div>
          </form>

          <div className="flex justify-center">
            <button
              onClick={handleFindNearbyEvents}
              disabled={isRequestingLocation}
              className="inline-flex items-center px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-md hover:bg-gray-100 hover:border-gray-400 hover:text-gray-900 transition-colors duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-400 disabled:opacity-50"
            >
              {isRequestingLocation ? (
                "Getting location..."
              ) : (
                <>
                  <span className="mr-2">📍</span>
                  Events happening near me
                </>
              )}
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mt-16">
          <div className="text-center">
            <h3 className="text-lg font-semibold">Find Nearby Parking</h3>
            <p className="mt-2 text-gray-600">
              Search for parking spots near your event venue
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Book Securely</h3>
            <p className="mt-2 text-gray-600">
              Reserve your spot with confidence using secure payment
            </p>
          </div>
          <div className="text-center">
            <h3 className="text-lg font-semibold">Park & Enjoy</h3>
            <p className="mt-2 text-gray-600">
              Simply arrive and park at your reserved spot
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
