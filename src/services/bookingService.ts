/**
 * src/services/bookingService.ts
 * Service for handling booking operations
 */

import { collection, addDoc, doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";
import { db } from "../firebase/config";
import { Booking, ParkingSpot } from "../types";

// Helper to fetch user name by userId
async function fetchUserNameById(userId: string): Promise<string | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return userData.name || userData.email || null;
  }
  return null;
}

export async function createBooking(
  spot: ParkingSpot,
  userId: string,
  hostId: string,
  startTime: Date,
  endTime: Date,
  totalPrice: number
): Promise<Booking> {
  // Fetch renter's name before transaction
  const renterName = await fetchUserNameById(userId);
  return await runTransaction(db, async (transaction) => {
    const spotRef = doc(db, "parkingSpots", spot.id!);
    const spotDoc = await transaction.get(spotRef);

    if (!spotDoc.exists()) {
      throw new Error("Parking spot does not exist");
    }

    const spotData = spotDoc.data();
    if (spotData.status !== "available") {
      throw new Error("Parking spot is not available");
    }

    // Update the status and bookedBy info
    transaction.update(spotRef, {
      status: "booked",
      bookedBy: userId,
      bookedByName: renterName || "Unknown"
    });

    // Create the booking
    const bookingData = {
      parkingSpotId: spot.id,
      userId,
      hostId,
      startTime,
      endTime,
      totalPrice,
      status: "confirmed" as const,
      createdAt: new Date(),
    };

    const bookingRef = doc(collection(db, "bookings"));
    transaction.set(bookingRef, bookingData);

    return {
      id: bookingRef.id,
      ...bookingData,
    } as Booking;
  });
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