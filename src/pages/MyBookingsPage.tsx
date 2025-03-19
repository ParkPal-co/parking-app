/**
 * src/pages/MyBookingsPage.tsx
 * Page component for displaying user's parking spot bookings
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

interface Booking {
  id: string;
  userId: string;
  spotId: string;
  eventId: string;
  eventName: string;
  spotAddress: string;
  startDate: Date;
  endDate: Date;
  price: number;
  status: "pending" | "confirmed" | "completed" | "cancelled";
}

export const MyBookingsPage: React.FC = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchBookings = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const bookingsRef = collection(db, "bookings");
        const q = query(bookingsRef, where("userId", "==", user.id));
        const querySnapshot = await getDocs(q);

        const bookingsData: Booking[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          bookingsData.push({
            id: doc.id,
            ...data,
            startDate: data.startDate.toDate(),
            endDate: data.endDate.toDate(),
          } as Booking);
        });

        setBookings(bookingsData);
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setError("Failed to load bookings");
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
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
        <div className="grid gap-6">
          {bookings.map((booking) => (
            <div key={booking.id} className="bg-white rounded-lg shadow-md p-6">
              <div className="flex justify-between items-start">
                <div>
                  <h2 className="text-xl font-semibold mb-2">
                    {booking.eventName}
                  </h2>
                  <p className="text-gray-600 mb-2">{booking.spotAddress}</p>
                  <p className="text-gray-600">
                    {booking.startDate.toLocaleDateString()} -{" "}
                    {booking.endDate.toLocaleDateString()}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold">${booking.price}</p>
                  <span
                    className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                      booking.status === "confirmed"
                        ? "bg-green-100 text-green-800"
                        : booking.status === "pending"
                        ? "bg-yellow-100 text-yellow-800"
                        : booking.status === "completed"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-red-100 text-red-800"
                    }`}
                  >
                    {booking.status.charAt(0).toUpperCase() +
                      booking.status.slice(1)}
                  </span>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
