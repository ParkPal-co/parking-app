/**
 * src/pages/BookingConfirmationPage.tsx
 * Page for confirming and completing a parking spot booking
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event, ParkingSpot } from "../types";
import { fetchEventById } from "../services/eventService";
import { fetchParkingSpotById } from "../services/parkingSpotService";
import { createBooking } from "../services/bookingService";
import { createConversation } from "../services/messageService";
import { useAuth } from "../hooks/useAuth";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingForm: React.FC<{
  event: Event;
  spot: ParkingSpot;
  onError: (error: string) => void;
}> = ({ event, spot, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    try {
      setLoading(true);
      console.log("Starting payment confirmation...");

      // Confirm the payment with Stripe
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/booking-success",
        },
        redirect: "if_required",
      });

      if (paymentError) {
        console.error("Payment error:", paymentError);
        throw new Error(paymentError.message);
      }

      console.log("Payment confirmed successfully, creating booking...");

      // Create the booking after successful payment
      const booking = await createBooking(
        spot,
        user.id,
        spot.ownerId,
        new Date(event.startDate),
        new Date(event.endDate),
        spot.price
      );

      console.log("Booking created successfully:", booking.id);

      // Create a conversation between the renter and host
      await createConversation(
        user.id,
        spot.ownerId,
        booking.id,
        `Hi! I've just booked your parking spot for ${event.title}. Looking forward to parking there!`
      );

      console.log("Conversation created successfully");

      // Navigate to success page with booking ID
      navigate(`/booking-success?bookingId=${booking.id}`);
    } catch (err) {
      console.error("Error in booking process:", err);
      onError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-6 opacity-0 animate-fade-in-from-top [animation-delay:0.4s] [animation-fill-mode:forwards]"
    >
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Payment Details</h2>
        <PaymentElement />
      </div>

      <button
        type="submit"
        disabled={!stripe || loading}
        className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
      >
        {loading ? "Processing..." : "Confirm Booking"}
      </button>
    </form>
  );
};

const BookingConfirmationPage: React.FC = () => {
  const [searchParams] = useSearchParams();
  const eventId = searchParams.get("event");
  const spotId = searchParams.get("spot");

  const [event, setEvent] = useState<Event | null>(null);
  const [spot, setSpot] = useState<ParkingSpot | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [clientSecret, setClientSecret] = useState<string | null>(null);

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

        if (!eventData || !spotData) {
          setError("Booking details not found");
          return;
        }

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

  // Handler to create payment intent when user clicks Confirm Booking
  const handleCreatePaymentIntent = async () => {
    if (!spot) return;
    setLoading(true);
    setError(null);
    try {
      const functions = getFunctions();
      const createPaymentIntent = httpsCallable(
        functions,
        "createPaymentIntent"
      );
      const { data } = await createPaymentIntent({
        amount: Math.round(spot.price * 100), // Ensure cents
        currency: "usd",
      });
      setClientSecret((data as { clientSecret: string }).clientSecret);
    } catch (err) {
      setError("Failed to initiate payment");
      console.error(err);
    } finally {
      setLoading(false);
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
          Booking details not found.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-xl mx-auto bg-white rounded-lg shadow-md p-8">
        <h1 className="text-2xl font-bold mb-4">Confirm Your Booking</h1>
        <div className="mb-6">
          <div className="font-semibold">Event:</div>
          <div>{event.title}</div>
          <div className="font-semibold mt-2">Parking Spot:</div>
          <div>{spot.address}</div>
          <div className="font-semibold mt-2">Price:</div>
          <div>${spot.price.toFixed(2)}</div>
        </div>
        {!clientSecret ? (
          <button
            onClick={handleCreatePaymentIntent}
            className="w-full bg-black text-white py-3 rounded-md hover:bg-gray-800 disabled:bg-gray-400"
            disabled={loading}
          >
            {loading ? "Processing..." : "Confirm Booking"}
          </button>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <BookingForm event={event} spot={spot} onError={setError} />
          </Elements>
        )}
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
