/**
 * src/pages/BookingConfirmationPage.tsx
 * Page for confirming and completing a parking spot booking
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event, ParkingSpot } from "../types";
import { fetchEventById } from "../services/eventService";
import { fetchParkingSpotById } from "../services/parkingSpotService";
import { useAuth } from "../hooks/useAuth";

export const BookingConfirmationPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");
  const spotId = searchParams.get("spot");
  const { user } = useAuth();

  const [event, setEvent] = useState<Event | null>(null);
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const loadBookingDetails = async () => {
      if (!eventId || !spotId) {
        setError("Missing booking details");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        const [eventData, spotData] = await Promise.all([
          fetchEventById(eventId),
          fetchParkingSpotById(spotId),
        ]);

        setEvent(eventData);
        setSpot(spotData);
      } catch (err) {
        console.error("Error loading booking details:", err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [eventId, spotId]);

  const handleConfirmBooking = async () => {
    if (!user || !event || !spot) {
      setError("Missing required information");
      return;
    }

    try {
      // TODO: Implement booking confirmation logic with Stripe integration
      // This would involve:
      // 1. Creating a booking record in Firestore
      // 2. Processing payment through Stripe
      // 3. Updating spot availability
      // 4. Redirecting to success page

      navigate("/booking-success");
    } catch (err) {
      console.error("Error confirming booking:", err);
      setError("Failed to confirm booking");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading booking details...</div>
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

  if (!event || !spot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">
          Booking details not found
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Confirm Your Booking</h1>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Event Details</h2>
          <p className="text-gray-600">{event.title}</p>
          <p className="text-gray-600">
            {event.startDate.toLocaleDateString()} -{" "}
            {event.endDate.toLocaleDateString()}
          </p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Parking Spot Details</h2>
          <p className="text-gray-600">{spot.address}</p>
          <p className="text-gray-600">{spot.description}</p>
          <p className="text-2xl font-bold mt-2">${spot.price}</p>
        </div>

        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
          <p className="text-gray-600">Card ending in ****</p>
          <p className="text-gray-600">Total: ${spot.price}</p>
        </div>

        <button
          onClick={handleConfirmBooking}
          className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800"
        >
          Confirm Booking
        </button>
      </div>
    </div>
  );
};
