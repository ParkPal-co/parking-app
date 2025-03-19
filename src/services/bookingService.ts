/**
 * src/services/bookingService.ts
 * Service for handling booking operations and Stripe integration
 */

import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Booking, ParkingSpot } from "../types";
import { loadStripe } from "@stripe/stripe-js";

// Initialize Stripe
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLIC_KEY);

export async function createBooking(
  spot: ParkingSpot,
  userId: string,
  hostId: string,
  startTime: Date,
  endTime: Date,
  totalPrice: number
): Promise<Booking> {
  try {
    // Create a booking record in Firestore
    const bookingData = {
      parkingSpotId: spot.id,
      userId,
      hostId,
      startTime,
      endTime,
      totalPrice,
      status: "pending" as const,
      createdAt: new Date(),
    };

    const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

    // Create a Stripe payment intent
    const response = await fetch("/api/create-payment-intent", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        amount: totalPrice * 100, // Convert to cents
        bookingId: bookingRef.id,
      }),
    });

    const { clientSecret } = await response.json();

    // Load Stripe
    const stripe = await stripePromise;
    if (!stripe) throw new Error("Stripe failed to load");

    // Confirm the payment
    const { error: paymentError } = await stripe.confirmCardPayment(clientSecret, {
      payment_method: {
        card: {
          // This would come from your Stripe Elements form
          // For now, we'll use a test card
          number: "4242424242424242",
          exp_month: 12,
          exp_year: 2025,
          cvc: "123",
        },
      },
    });

    if (paymentError) {
      // Update booking status to failed
      await updateDoc(doc(db, "bookings", bookingRef.id), {
        status: "cancelled",
      });
      throw new Error(paymentError.message);
    }

    // Update booking status to confirmed
    await updateDoc(doc(db, "bookings", bookingRef.id), {
      status: "confirmed",
    });

    // Update parking spot availability
    await updateDoc(doc(db, "parkingSpots", spot.id!), {
      status: "booked",
    });

    return {
      id: bookingRef.id,
      ...bookingData,
    } as Booking;
  } catch (error) {
    console.error("Error creating booking:", error);
    throw error;
  }
}

export async function getBookingById(bookingId: string): Promise<Booking | null> {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      return null;
    }

    const bookingData = bookingDoc.data();
    return {
      id: bookingDoc.id,
      ...bookingData,
      startTime: bookingData.startTime.toDate(),
      endTime: bookingData.endTime.toDate(),
      createdAt: bookingData.createdAt.toDate(),
    } as Booking;
  } catch (error) {
    console.error("Error fetching booking:", error);
    throw error;
  }
}

export async function cancelBooking(bookingId: string): Promise<void> {
  try {
    const bookingRef = doc(db, "bookings", bookingId);
    const bookingDoc = await getDoc(bookingRef);

    if (!bookingDoc.exists()) {
      throw new Error("Booking not found");
    }

    const bookingData = bookingDoc.data();

    // Update booking status
    await updateDoc(bookingRef, {
      status: "cancelled",
    });

    // Update parking spot availability
    await updateDoc(doc(db, "parkingSpots", bookingData.parkingSpotId), {
      status: "available",
    });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    throw error;
  }
} 