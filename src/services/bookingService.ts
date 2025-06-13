/**
 * src/services/bookingService.ts
 * Service for handling booking operations
 */

import { collection, doc, updateDoc, getDoc, runTransaction } from "firebase/firestore";
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

// Helper to fetch user info by userId
async function fetchUserInfoById(userId: string): Promise<{ name: string; email: string } | null> {
  const userRef = doc(db, "users", userId);
  const userSnap = await getDoc(userRef);
  if (userSnap.exists()) {
    const userData = userSnap.data();
    return {
      name: userData.name || userData.email || "",
      email: userData.email || "",
    };
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
  const booking = await runTransaction(db, async (transaction) => {
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
      paidOut: false,
    };

    const bookingRef = doc(collection(db, "bookings"));
    transaction.set(bookingRef, bookingData);

    return {
      id: bookingRef.id,
      ...bookingData,
    } as Booking;
  });

  // After booking is created, send confirmation emails
  try {
    const [renter, host] = await Promise.all([
      fetchUserInfoById(userId),
      fetchUserInfoById(hostId),
    ]);
    if (renter && host) {
      // Dynamically import firebase/functions to avoid SSR issues
      const { getFunctions, httpsCallable } = await import("firebase/functions");
      const { app } = await import("../firebase/config");
      const functions = getFunctions(app);
      const sendBookingConfirmation = httpsCallable(functions, "sendBookingConfirmation");
      await sendBookingConfirmation({
        renterEmail: renter.email,
        renterName: renter.name,
        hostEmail: host.email,
        hostName: host.name,
        bookingDetails: {
          startTime: booking.startTime instanceof Date ? booking.startTime.toLocaleString() : String(booking.startTime),
          endTime: booking.endTime instanceof Date ? booking.endTime.toLocaleString() : String(booking.endTime),
          location: spot.address,
          price: booking.totalPrice,
        },
      });
    }
  } catch (err) {
    // Log but do not block booking creation if email fails
    console.error("Failed to send booking confirmation email:", err);
  }

  return booking;
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