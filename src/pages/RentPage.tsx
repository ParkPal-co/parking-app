import React, { useState, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Event, ParkingSpot } from "../types";

export default function RentPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const eventQuery = searchParams.get("event");
  const [searchInput, setSearchInput] = useState(eventQuery || "");

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Search for events based on query
  useEffect(() => {
    const searchEvents = async () => {
      if (!eventQuery) {
        setLoading(false);
        return;
      }

      try {
        const eventsRef = collection(db, "events");
        const q = query(eventsRef);

        const querySnapshot = await getDocs(q);
        const eventResults: Event[] = [];
        const searchLower = eventQuery.toLowerCase();

        querySnapshot.forEach((doc) => {
          const eventData = doc.data() as Event;
          if (
            eventData.title.toLowerCase().includes(searchLower) &&
            eventData.status === "upcoming"
          ) {
            eventResults.push({ id: doc.id, ...eventData });
          }
        });

        setEvents(eventResults);
      } catch (error) {
        console.error("Error searching events:", error);
      } finally {
        setLoading(false);
      }
    };

    searchEvents();
  }, [eventQuery]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ event: searchInput.trim() });
    }
  };

  // Fetch parking spots when an event is selected
  useEffect(() => {
    const fetchParkingSpots = async () => {
      if (!selectedEvent) return;

      try {
        const spotsRef = collection(db, "parkingSpots");
        const q = query(spotsRef, where("eventId", "==", selectedEvent.id));

        const querySnapshot = await getDocs(q);
        const spotResults: ParkingSpot[] = [];
        querySnapshot.forEach((doc) => {
          spotResults.push({ id: doc.id, ...doc.data() } as ParkingSpot);
        });

        setParkingSpots(spotResults);
      } catch (error) {
        console.error("Error fetching parking spots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpots();
  }, [selectedEvent]);

  const renderParkingSpotCard = (spot: ParkingSpot) => (
    <div
      key={spot.id}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
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
            onClick={() => {
              /* Handle booking */
            }}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Search Interface */}
      {!selectedEvent && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            Find Parking Near Your Event
          </h1>
          <form onSubmit={handleSearch} className="max-w-2xl mx-auto">
            <div className="flex gap-4">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Search for an event..."
                className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
              />
              <button
                type="submit"
                className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
              >
                Search
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p>Loading...</p>
        </div>
      )}

      {/* No Results Message */}
      {!loading && eventQuery && events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            No events found matching "{eventQuery}"
          </p>
        </div>
      )}

      {/* Event Search Results */}
      {events.length > 0 && !selectedEvent && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">Events</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => setSelectedEvent(event)}
              >
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-gray-600">{event.location.address}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Event and Parking Spots */}
      {selectedEvent && (
        <>
          <div className="mb-8">
            <button
              onClick={() => setSelectedEvent(null)}
              className="mb-4 text-gray-600 hover:text-black"
            >
              ← Back to events
            </button>
            <h1 className="text-3xl font-bold">{selectedEvent.title}</h1>
            <p className="text-gray-600">{selectedEvent.location.address}</p>
          </div>

          <div className="mb-6 flex justify-between items-center">
            <h2 className="text-2xl font-semibold">Available Parking Spots</h2>
            <div className="flex space-x-2">
              <button
                onClick={() => setViewMode("grid")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "grid"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Grid View
              </button>
              <button
                onClick={() => setViewMode("map")}
                className={`px-4 py-2 rounded-md ${
                  viewMode === "map"
                    ? "bg-black text-white"
                    : "bg-gray-200 text-gray-700"
                }`}
              >
                Map View
              </button>
            </div>
          </div>

          {loading ? (
            <div>Loading parking spots...</div>
          ) : viewMode === "grid" ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {parkingSpots.map(renderParkingSpotCard)}
            </div>
          ) : (
            <div className="h-[600px] bg-gray-100 rounded-lg">
              {/* Map view will be implemented later */}
              <div className="flex items-center justify-center h-full">
                <p className="text-gray-500">Map view coming soon!</p>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
