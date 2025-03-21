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

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

const BookingForm: React.FC<{
  event: Event;
  spot: ParkingSpot;
  clientSecret: string;
  onSuccess: () => void;
  onError: (error: string) => void;
}> = ({ event, spot, clientSecret, onSuccess, onError }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const { user } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!stripe || !elements || !user) return;

    try {
      setLoading(true);

      // Confirm the payment with Stripe
      const { error: paymentError } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: window.location.origin + "/my-bookings",
        },
        redirect: "if_required",
      });

      if (paymentError) {
        throw new Error(paymentError.message);
      }

      // Create the booking after successful payment
      const booking = await createBooking(
        spot,
        user.id,
        spot.ownerId,
        new Date(event.startDate),
        new Date(event.endDate),
        spot.price
      );

      // Create a conversation between the renter and host
      await createConversation(
        user.id,
        spot.ownerId,
        booking.id,
        `Hi! I've just booked your parking spot for ${event.title}. Looking forward to parking there!`
      );

      onSuccess();
    } catch (err) {
      console.error("Error processing payment:", err);
      onError(err instanceof Error ? err.message : "Failed to process payment");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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

        // Create a payment intent
        const response = await fetch(
          "http://localhost:3001/api/create-payment-intent",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              amount: spotData.price,
              currency: "usd",
            }),
          }
        );

        if (!response.ok) {
          throw new Error("Failed to create payment intent");
        }

        const { clientSecret } = await response.json();
        setClientSecret(clientSecret);
      } catch (err) {
        console.error("Error loading booking details:", err);
        setError("Failed to load booking details");
      } finally {
        setLoading(false);
      }
    };

    loadBookingDetails();
  }, [eventId, spotId]);

  const handleSuccess = () => {
    navigate("/messages");
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

  if (!event || !spot || !clientSecret) {
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
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Confirm Your Booking</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* Left side - Booking details */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">Event Details</h2>
              <p className="text-gray-600">{event.title}</p>
              <p className="text-gray-600">
                {new Date(event.startDate).toLocaleDateString()} -{" "}
                {new Date(event.endDate).toLocaleDateString()}
              </p>
              <p className="text-gray-600">{event.location.address}</p>
            </div>

            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">
                Parking Spot Details
              </h2>
              <div className="relative h-48 mb-4">
                <img
                  src={spot.images[0] || "https://placehold.co/600x400"}
                  alt={spot.address}
                  className="w-full h-full object-cover rounded-md"
                />
              </div>
              <p className="text-gray-600">{spot.address}</p>
              <p className="text-gray-500 text-sm mt-2">
                Available:{" "}
                {new Date(spot.availability.start).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}{" "}
                -{" "}
                {new Date(spot.availability.end).toLocaleTimeString([], {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
              <p className="text-gray-600 mt-2">{spot.description}</p>
              <p className="text-2xl font-bold mt-2">${spot.price}</p>
            </div>
          </div>

          {/* Right side - Payment form */}
          <div>
            <Elements
              stripe={stripePromise}
              options={{
                clientSecret,
                appearance: {
                  theme: "stripe",
                },
              }}
            >
              <BookingForm
                event={event}
                spot={spot}
                clientSecret={clientSecret}
                onSuccess={handleSuccess}
                onError={setError}
              />
            </Elements>
          </div>
        </div>
      </div>
    </div>
  );
};
