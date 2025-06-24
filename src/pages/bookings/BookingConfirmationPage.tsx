/**
 * src/pages/bookings/BookingConfirmationPage.tsx
 * Page for confirming and completing a parking spot booking
 */

import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Event, ParkingSpot } from "../../types";
import { 
  fetchEventById, 
  fetchParkingSpotById, 
  createBooking, 
  createConversation 
} from "../../services";
import { useAuth } from "../../hooks/useAuth";
import {
  PaymentElement,
  useStripe,
  useElements,
  Elements,
} from "@stripe/react-stripe-js";
import { loadStripe } from "@stripe/stripe-js";
import { getFunctions, httpsCallable } from "firebase/functions";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { Modal } from "../../components/ui/Modal";

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
      <Card className="bg-white">
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-semibold">Payment Details</h2>
            <div className="text-primary-600">Total: ${spot.price}</div>
          </div>
          <div className="border-t border-primary-200 pt-4">
            <PaymentElement />
          </div>
        </div>
      </Card>

      <Button
        type="submit"
        disabled={!stripe || loading}
        variant="primary"
        size="large"
        fullWidth={true}
        isLoading={loading}
      >
        {loading ? "Processing..." : "Confirm Booking"}
      </Button>
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
  const [showPaymentModal, setShowPaymentModal] = useState(false);

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
      setShowPaymentModal(false);
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
        <div className="max-w-2xl mx-auto space-y-6">
          <Card isLoading className="h-64" />
          <Card isLoading className="h-32" />
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error" title="Error" message={error} />
      </div>
    );
  }

  if (!event || !spot) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert
          variant="error"
          title="Error"
          message="Booking details not found."
        />
      </div>
    );
  }

  const startDate = new Date(event.startDate);
  const endDate = new Date(event.endDate);
  const duration = Math.round(
    (endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60)
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-6">
        <Card className="overflow-hidden">
          <div className="relative h-48 md:h-64">
            <img
              src={spot.images[0] || "https://placehold.co/600x400"}
              alt={spot.address}
              className="w-full h-full object-cover"
            />
            <div className="absolute top-4 right-4 bg-black bg-opacity-75 text-white px-4 py-2 rounded-lg text-xl font-semibold">
              ${spot.price}
            </div>
          </div>
          <div className="p-6">
            <h1 className="text-2xl font-bold mb-6">Confirm Your Booking</h1>

            <div className="space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-primary-900 mb-2">
                  Event Details
                </h2>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-medium text-primary-900">
                    {event.title}
                  </h3>
                  <p className="text-primary-600 mt-1">
                    {event.location.address}
                  </p>
                  <p className="text-primary-500 mt-1">
                    {startDate.toLocaleDateString()} at{" "}
                    {startDate.toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-primary-900 mb-2">
                  Parking Spot
                </h2>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <h3 className="font-medium text-primary-900">
                    {spot.address}
                  </h3>
                  <p className="text-primary-600 mt-1">{spot.description}</p>
                </div>
              </div>

              <div>
                <h2 className="text-lg font-semibold text-primary-900 mb-2">
                  Booking Summary
                </h2>
                <div className="bg-primary-50 p-4 rounded-lg">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-primary-600">Duration</span>
                    <span className="font-medium text-primary-900">
                      {duration} hours
                    </span>
                  </div>
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-primary-600">Price per hour</span>
                    <span className="font-medium text-primary-900">
                      ${(spot.price / duration).toFixed(2)}
                    </span>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                    <span className="text-lg font-semibold text-primary-900">
                      Total
                    </span>
                    <span className="text-lg font-semibold text-primary-900">
                      ${spot.price}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {!clientSecret ? (
          <Button
            onClick={() => setShowPaymentModal(true)}
            variant="primary"
            size="large"
            fullWidth={true}
            isLoading={loading}
          >
            {loading ? "Processing..." : "Proceed to Payment"}
          </Button>
        ) : (
          <Elements stripe={stripePromise} options={{ clientSecret }}>
            <BookingForm event={event} spot={spot} onError={setError} />
          </Elements>
        )}

        <Modal
          isOpen={showPaymentModal}
          onClose={() => setShowPaymentModal(false)}
          title="Confirm Payment"
          description="You are about to proceed to payment. Please confirm the following details:"
        >
          <div className="space-y-4">
            <div className="bg-primary-50 p-4 rounded-lg">
              <div className="flex justify-between items-center mb-2">
                <span className="text-primary-600">Event</span>
                <span className="font-medium text-primary-900">
                  {event.title}
                </span>
              </div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-primary-600">Duration</span>
                <span className="font-medium text-primary-900">
                  {duration} hours
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-primary-200">
                <span className="text-lg font-semibold text-primary-900">
                  Total
                </span>
                <span className="text-lg font-semibold text-primary-900">
                  ${spot.price}
                </span>
              </div>
            </div>
            <div className="flex justify-end space-x-4">
              <Button
                variant="secondary"
                onClick={() => setShowPaymentModal(false)}
              >
                Cancel
              </Button>
              <Button
                variant="primary"
                onClick={handleCreatePaymentIntent}
                isLoading={loading}
              >
                Confirm & Pay
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </div>
  );
};

export default BookingConfirmationPage;
