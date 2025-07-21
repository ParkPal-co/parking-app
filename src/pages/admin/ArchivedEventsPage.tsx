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
  getDoc,
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
  status: "available" | "booked" | "unavailable";
}

const ArchivedEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [parkingSpotStats, setParkingSpotStats] = useState<
    Record<string, { available: number; booked: number; unavailable: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedBookingsEventId, setExpandedBookingsEventId] = useState<
    string | null
  >(null);
  const [bookingsByEvent, setBookingsByEvent] = useState<Record<string, any[]>>(
    {}
  );

  // Fetch archived events and their associated parking spot stats
  useEffect(() => {
    const fetchEventsAndStats = async () => {
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
        // Sort by startDate descending (most recent first)
        const sortedEvents = eventsData.sort(
          (a, b) =>
            new Date(b.startDate).getTime() - new Date(a.startDate).getTime()
        );
        setEvents(sortedEvents);

        // Fetch parking spot stats for each event
        const parkingSpotsSnapshot = await getDocs(
          collection(db, "parkingSpots")
        );
        const stats: Record<
          string,
          { available: number; booked: number; unavailable: number }
        > = {};
        parkingSpotsSnapshot.docs.forEach((doc) => {
          const spot = doc.data() as ParkingSpot;
          if (eventsData.some((event) => event.id === spot.eventId)) {
            if (!stats[spot.eventId]) {
              stats[spot.eventId] = { available: 0, booked: 0, unavailable: 0 };
            }
            stats[spot.eventId][spot.status]++;
          }
        });
        setParkingSpotStats(stats);
      } catch (err) {
        console.error("Error fetching archived events:", err);
        setError("Failed to load archived events");
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndStats();
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

  // Show bookings logic (copied and adapted from RegisteredEventsPage)
  const handleToggleBookings = async (eventId: string) => {
    if (expandedBookingsEventId === eventId) {
      setExpandedBookingsEventId(null);
      return;
    }
    setExpandedBookingsEventId(eventId);
    if (!bookingsByEvent[eventId]) {
      try {
        // First get all parking spots for this event
        const parkingSpotsSnap = await getDocs(
          query(collection(db, "parkingSpots"), where("eventId", "==", eventId))
        );
        const parkingSpotIds = parkingSpotsSnap.docs.map((doc) => doc.id);
        if (parkingSpotIds.length === 0) {
          setBookingsByEvent((prev) => ({ ...prev, [eventId]: [] }));
          return;
        }
        // Then get all bookings for these parking spots
        const bookingsSnap = await getDocs(
          query(
            collection(db, "bookings"),
            where("parkingSpotId", "in", parkingSpotIds)
          )
        );
        // Get booking data with additional details
        const bookingsWithDetails = await Promise.all(
          bookingsSnap.docs.map(async (bookingDoc) => {
            const bookingData = bookingDoc.data();
            // Get parking spot details
            const spotRef = doc(db, "parkingSpots", bookingData.parkingSpotId);
            const spotDoc = await getDoc(spotRef);
            const spotData = spotDoc.exists() ? spotDoc.data() : null;
            // Get host details
            const hostRef = doc(db, "users", bookingData.hostId);
            const hostDoc = await getDoc(hostRef);
            const hostData = hostDoc.exists() ? hostDoc.data() : null;
            // Get renter details
            const renterRef = doc(db, "users", bookingData.userId);
            const renterDoc = await getDoc(renterRef);
            const renterData = renterDoc.exists() ? renterDoc.data() : null;
            return {
              id: bookingDoc.id,
              ...bookingData,
              parkingSpot: spotData,
              host: hostData,
              renter: renterData,
            };
          })
        );
        setBookingsByEvent((prev) => ({
          ...prev,
          [eventId]: bookingsWithDetails,
        }));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookingsByEvent((prev) => ({ ...prev, [eventId]: [] }));
      }
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
                    <p className="text-gray-600">Parking Spots:</p>
                    <div className="text-xs space-y-1">
                      <div className="flex justify-between">
                        <span className="text-green-600">Available:</span>
                        <span>
                          {parkingSpotStats[event.id]?.available || 0}
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-blue-600">Booked:</span>
                        <span>{parkingSpotStats[event.id]?.booked || 0}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-red-600">Unavailable:</span>
                        <span>
                          {parkingSpotStats[event.id]?.unavailable || 0}
                        </span>
                      </div>
                    </div>
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

                <div className="mt-4">
                  <button
                    className="text-sm text-blue-600 hover:underline"
                    onClick={() => handleToggleBookings(event.id)}
                  >
                    {expandedBookingsEventId === event.id ? "Hide" : "Show"}{" "}
                    Bookings
                  </button>
                  {expandedBookingsEventId === event.id && (
                    <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-4">
                      <h4 className="font-semibold mb-2">Bookings</h4>
                      {bookingsByEvent[event.id] ? (
                        bookingsByEvent[event.id].length > 0 ? (
                          <div className="overflow-x-auto">
                            <table className="min-w-full text-xs">
                              <thead>
                                <tr className="border-b border-gray-300">
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Booking ID
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Renter
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Host
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Address
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Description
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Start Time
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    End Time
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Price
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Status
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    License Plate
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Car Description
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Created
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold">
                                    Payout
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {bookingsByEvent[event.id].map((booking) => (
                                  <tr
                                    key={booking.id}
                                    className="border-b border-gray-200 hover:bg-gray-100"
                                  >
                                    <td className="py-2 px-2 font-mono text-xs">
                                      {booking.id}
                                    </td>
                                    <td className="py-2 px-2">
                                      {booking.renter?.name ||
                                        booking.renter?.email ||
                                        booking.bookedByName ||
                                        booking.userId}
                                    </td>
                                    <td className="py-2 px-2">
                                      {booking.host?.name ||
                                        booking.host?.email ||
                                        booking.hostId}
                                    </td>
                                    <td
                                      className="py-2 px-2 max-w-xs truncate"
                                      title={booking.parkingSpot?.address}
                                    >
                                      {booking.parkingSpot?.address || "N/A"}
                                    </td>
                                    <td
                                      className="py-2 px-2 max-w-xs truncate"
                                      title={booking.parkingSpot?.description}
                                    >
                                      {booking.parkingSpot?.description ||
                                        "N/A"}
                                    </td>
                                    <td className="py-2 px-2">
                                      {booking.startTime?.toDate
                                        ? booking.startTime
                                            .toDate()
                                            .toLocaleString()
                                        : new Date(
                                            booking.startTime
                                          ).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2">
                                      {booking.endTime?.toDate
                                        ? booking.endTime
                                            .toDate()
                                            .toLocaleString()
                                        : new Date(
                                            booking.endTime
                                          ).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2 font-semibold">
                                      ${booking.totalPrice}
                                    </td>
                                    <td className="py-2 px-2">
                                      <span
                                        className={`px-2 py-1 rounded text-xs font-semibold ${
                                          booking.status === "confirmed"
                                            ? "bg-green-100 text-green-800"
                                            : booking.status === "pending"
                                            ? "bg-yellow-100 text-yellow-800"
                                            : booking.status === "cancelled"
                                            ? "bg-red-100 text-red-800"
                                            : "bg-gray-100 text-gray-800"
                                        }`}
                                      >
                                        {booking.status}
                                      </span>
                                    </td>
                                    <td className="py-2 px-2 font-mono">
                                      {booking.licensePlate}
                                    </td>
                                    <td
                                      className="py-2 px-2 max-w-xs truncate"
                                      title={booking.carDescription}
                                    >
                                      {booking.carDescription}
                                    </td>
                                    <td className="py-2 px-2">
                                      {booking.createdAt?.toDate
                                        ? booking.createdAt
                                            .toDate()
                                            .toLocaleString()
                                        : new Date(
                                            booking.createdAt
                                          ).toLocaleString()}
                                    </td>
                                    <td className="py-2 px-2">
                                      <span
                                        className={`text-xs font-semibold ${
                                          booking.paidOut
                                            ? "text-green-600"
                                            : "text-yellow-600"
                                        }`}
                                      >
                                        {booking.paidOut ? "Paid" : "Unpaid"}
                                      </span>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        ) : (
                          <div className="text-gray-500">
                            No bookings for this event.
                          </div>
                        )
                      ) : (
                        <div>Loading bookings...</div>
                      )}
                    </div>
                  )}
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
