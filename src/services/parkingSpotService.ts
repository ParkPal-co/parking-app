/**
 * src/services/parkingSpotService.ts
 * Service for handling parking spot-related operations
 */

import { collection, query, where, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { ParkingSpot } from "../types";

export async function fetchParkingSpotById(spotId: string): Promise<ParkingSpot | null> {
  try {
    const spotRef = doc(db, "parkingSpots", spotId);
    const spotDoc = await getDoc(spotRef);

    if (!spotDoc.exists()) {
      return null;
    }

    const spotData = spotDoc.data();
    return {
      id: spotDoc.id,
      ...spotData,
    } as ParkingSpot;
  } catch (error) {
    console.error("Error fetching parking spot by ID:", error);
    throw error;
  }
}

export async function fetchParkingSpots(eventId: string): Promise<ParkingSpot[]> {
  try {
    const spotsRef = collection(db, "parkingSpots");
    const q = query(
      spotsRef,
      where("eventId", "==", eventId),
      where("status", "==", "available")
    );

    const querySnapshot = await getDocs(q);
    const spotResults: ParkingSpot[] = [];
    const seenCoordinates = new Set<string>();

    querySnapshot.forEach((doc) => {
      const spotData = doc.data() as ParkingSpot;
      const coordKey = `${spotData.coordinates.lat},${spotData.coordinates.lng}`;

      // Only add the spot if we haven't seen these coordinates before
      if (!seenCoordinates.has(coordKey)) {
        seenCoordinates.add(coordKey);
        spotResults.push({ id: doc.id, ...spotData });
      }
    });

    return spotResults;
  } catch (error) {
    console.error("Error fetching parking spots:", error);
    throw error;
  }
} 