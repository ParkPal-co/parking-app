/**
 * src/pages/bookings/BookingSuccessPage.tsx
 * Page shown after a successful booking
 */
import React, { useEffect, useState } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { getBookingById } from "../../services/booking/bookingService";

const BookingSuccessPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const bookingId = searchParams.get("bookingId");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    const verifyBooking = async () => {
      if (!bookingId) {
        setError("No booking ID provided");
        setLoading(false);
        return;
      }

      try {
        const booking = await getBookingById(bookingId);
        if (!booking) {
          setError("Booking not found");
        }
      } catch (err) {
        console.error("Error verifying booking:", err);
        setError("Failed to verify booking");
      } finally {
        setLoading(false);
      }
    };

    verifyBooking();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-center">Verifying your booking...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8 text-center">
        <div className="text-red-600 mb-4">{error}</div>
        <button
          onClick={() => navigate("/my-bookings")}
          className="text-blue-600 underline"
        >
          View My Bookings
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 text-center">
      <h1 className="text-3xl font-bold mb-4">Booking Confirmed!</h1>
      <p className="mb-4">Your booking was successful.</p>
      {bookingId && (
        <p className="mb-4">
          <strong>Booking ID:</strong> {bookingId}
        </p>
      )}
      <Link to="/my-bookings" className="text-blue-600 underline">
        View My Bookings
      </Link>
    </div>
  );
};

export default BookingSuccessPage;
