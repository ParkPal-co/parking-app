/**
 * src/services/bookingService.ts
 * Service for handling booking operations
 */

import { collection, addDoc, doc, updateDoc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Booking, ParkingSpot } from "../types";

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
      status: "confirmed" as const, // Set as confirmed since payment is already processed
      createdAt: new Date(),
    };

    const bookingRef = await addDoc(collection(db, "bookings"), bookingData);

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