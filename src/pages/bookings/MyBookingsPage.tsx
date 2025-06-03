/**
 * src/pages/bookings/MyBookingsPage.tsx
 * Page component for displaying user's parking spot bookings
 */

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import {
  collection,
  query,
  where,
  getDocs,
  getDoc,
  doc,
  DocumentData,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Booking, ParkingSpot, Event } from "../../types";
import { createConversation } from "../../services/messageService";

interface BookingWithDetails extends Booking {
  parkingSpot?: ParkingSpot;
  event?: Event;
}

const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [bookings, setBookings] = useState<BookingWithDetails[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        setError(null);

        // Fetch bookings
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);

        // Get all bookings and fetch their associated parking spots and events
        const bookingsWithDetails = await Promise.all(
          querySnapshot.docs.map(async (bookingDoc) => {
            const bookingData = bookingDoc.data() as DocumentData;
            const booking = {
              id: bookingDoc.id,
              ...bookingData,
              startTime: bookingData.startTime.toDate(),
              endTime: bookingData.endTime.toDate(),
              createdAt: bookingData.createdAt.toDate(),
            } as BookingWithDetails;

            // Fetch parking spot details
            const spotRef = doc(db, "parkingSpots", booking.parkingSpotId);
            const spotDoc = await getDoc(spotRef);
            if (spotDoc.exists()) {
              const spotData = spotDoc.data() as DocumentData;
              booking.parkingSpot = {
                id: spotDoc.id,
                ...spotData,
              } as ParkingSpot;

              // Fetch event details if we have the parking spot
              if (booking.parkingSpot.eventId) {
                const eventRef = doc(db, "events", booking.parkingSpot.eventId);
                const eventDoc = await getDoc(eventRef);
                if (eventDoc.exists()) {
                  const eventData = eventDoc.data() as DocumentData;
                  booking.event = {
                    id: eventDoc.id,
                    ...eventData,
                  } as Event;
                }
              }
            }

            return booking;
          })
        );

        // Sort bookings by start time (most recent first)
        setBookings(
          bookingsWithDetails.sort(
            (a, b) => b.startTime.getTime() - a.startTime.getTime()
          )
        );
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load your bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  const handleMessageHost = async (booking: BookingWithDetails) => {
    try {
      // Create a conversation with an initial message
      await createConversation(
        user!.id,
        booking.hostId,
        booking.id,
        `Hi! I have a booking for your parking spot at ${booking.parkingSpot?.address}. Can we discuss the details?`
      );

      // Navigate to messages page
      navigate(`/messages?hostId=${booking.hostId}&bookingId=${booking.id}`);
    } catch (err) {
      console.error("Error creating conversation:", err);
      setError("Failed to start conversation with host");
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Please log in to view your bookings.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Bookings</h1>

      {bookings.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">You haven't made any bookings yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {bookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="relative h-48">
                <img
                  src={
                    booking.parkingSpot?.images[0] ||
                    "https://placehold.co/600x400"
                  }
                  alt={booking.parkingSpot?.address}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-lg">
                  ${booking.totalPrice}
                </div>
                <div
                  className={`absolute top-2 left-2 px-2 py-1 rounded text-sm ${
                    booking.status === "confirmed"
                      ? "bg-green-500 text-white"
                      : booking.status === "cancelled"
                      ? "bg-red-500 text-white"
                      : booking.status === "completed"
                      ? "bg-blue-500 text-white"
                      : "bg-yellow-500 text-white"
                  }`}
                >
                  {booking.status.charAt(0).toUpperCase() +
                    booking.status.slice(1)}
                </div>
              </div>
              <div className="p-6">
                {booking.event && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {booking.event.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(booking.event.startDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {booking.event.location.address}
                    </p>
                  </div>
                )}

                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {booking.parkingSpot?.address}
                  </h3>
                  <p className="text-sm text-gray-500 mt-1">
                    {booking.parkingSpot?.description}
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Check-in</span>
                    <span className="text-gray-900">
                      {booking.startTime.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Check-out</span>
                    <span className="text-gray-900">
                      {booking.endTime.toLocaleString()}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => handleMessageHost(booking)}
                  className="w-full mt-4 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors"
                >
                  Message Host
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyBookingsPage;
