/**
 * src/pages/admin/ArchivedEventsPage.tsx
 * Page component for viewing archived (completed) events
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";

interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  website: string;
  startDate: string;
  endDate: string;
  expectedAttendance: number;
  imageUrl: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: string;
  createdAt: string;
  createdBy: string;
  payoutStatus: string;
}

interface ParkingSpot {
  id: string;
  eventId: string;
  // other fields not needed for this operation
}

const ArchivedEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [parkingSpotCounts, setParkingSpotCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch archived events and their associated parking spot counts
  useEffect(() => {
    const fetchEventsAndCounts = async () => {
      try {
        // Fetch archived events
        const eventsQuery = query(
          collection(db, "events"),
          where("status", "==", "completed")
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(eventsData);

        // Fetch parking spot counts for each event
        const parkingSpotsSnapshot = await getDocs(
          collection(db, "parkingSpots")
        );
        const counts: Record<string, number> = {};
        parkingSpotsSnapshot.docs.forEach((doc) => {
          const spot = doc.data() as ParkingSpot;
          if (eventsData.some((event) => event.id === spot.eventId)) {
            counts[spot.eventId] = (counts[spot.eventId] || 0) + 1;
          }
        });
        setParkingSpotCounts(counts);
      } catch (err) {
        console.error("Error fetching archived events:", err);
        setError("Failed to load archived events");
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndCounts();
  }, []);

  const handleUnarchive = async (eventId: string) => {
    try {
      const eventRef = doc(db, "events", eventId);
      // We can set it to 'upcoming', as an admin can change dates if needed.
      await updateDoc(eventRef, { status: "upcoming" });

      // Update local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setSuccess("Event unarchived successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error unarchiving event:", err);
      setError("Failed to unarchive event");
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Archived Events</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {loading ? (
        <div className="text-center py-8">Loading archived events...</div>
      ) : (
        <div className="space-y-6">
          {events.length === 0 ? (
            <div className="text-center text-gray-500 py-8">
              No archived events found.
            </div>
          ) : (
            events.map((event) => (
              <div
                key={event.id}
                className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <h2 className="text-xl font-semibold">{event.title}</h2>
                    <p className="text-gray-600 mt-1">{event.venue}</p>
                    <p className="text-gray-500 text-sm mt-2">
                      {event.description}
                    </p>
                  </div>
                  <img
                    src={event.imageUrl}
                    alt={event.title}
                    className="h-20 w-auto object-contain"
                  />
                </div>

                <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-600">Start Date:</p>
                    <p>{new Date(event.startDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">End Date:</p>
                    <p>{new Date(event.endDate).toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Expected Attendance:</p>
                    <p>{event.expectedAttendance.toLocaleString()}</p>
                  </div>
                  <div>
                    <p className="text-gray-600">Listed Driveways:</p>
                    <p>{parkingSpotCounts[event.id] || 0}</p>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600">Location:</p>
                  <p>{event.location.address}</p>
                </div>

                <div className="mt-4">
                  <p className="text-gray-600">Website:</p>
                  <a
                    href={event.website}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:underline"
                  >
                    {event.website}
                  </a>
                </div>

                <div className="mt-6 flex justify-end space-x-3">
                  <button
                    onClick={() => handleUnarchive(event.id)}
                    className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                  >
                    Unarchive
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ArchivedEventsPage;
