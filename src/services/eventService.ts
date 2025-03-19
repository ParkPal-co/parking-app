/**
 * src/services/eventService.ts
 * Service for handling event-related operations
 */

import { collection, query, getDocs, doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { Event } from "../types";
import { convertToDate } from "../utils/dateUtils";
import { calculateDistance } from "../utils/locationUtils";

export interface EventSearchParams {
  query?: string;
  userLocation?: {
    latitude: number;
    longitude: number;
  };
}

export async function fetchEventById(eventId: string): Promise<Event | null> {
  try {
    const eventRef = doc(db, "events", eventId);
    const eventDoc = await getDoc(eventRef);

    if (!eventDoc.exists()) {
      return null;
    }

    const eventData = eventDoc.data();

    const event: Event = {
      id: eventDoc.id,
      title: eventData.title || "Untitled Event",
      description: eventData.description || "",
      location: eventData.location || {
        address: "Location TBD",
        coordinates: null,
      },
      expectedAttendance: eventData.expectedAttendance || 0,
      status: eventData.status || "upcoming",
      startDate: convertToDate(eventData.startDate),
      endDate: convertToDate(eventData.endDate),
      createdAt: convertToDate(eventData.createdAt),
      imageUrl: eventData.imageUrl || "",
    };

    return event;
  } catch (error) {
    console.error("Error fetching event by ID:", error);
    throw error;
  }
}

export async function fetchEvents(params: EventSearchParams): Promise<Event[]> {
  try {
    const eventsRef = collection(db, "events");
    const q = query(eventsRef);
    const querySnapshot = await getDocs(q);

    const eventResults: Event[] = [];
    const searchLower = params.query?.toLowerCase() || "";

    querySnapshot.forEach((doc) => {
      const eventData = doc.data();

      try {
        const event: Event = {
          id: doc.id,
          title: eventData.title || "Untitled Event",
          description: eventData.description || "",
          location: eventData.location || {
            address: "Location TBD",
            coordinates: null,
          },
          expectedAttendance: eventData.expectedAttendance || 0,
          status: eventData.status || "upcoming",
          startDate: convertToDate(eventData.startDate),
          endDate: convertToDate(eventData.endDate),
          createdAt: convertToDate(eventData.createdAt),
          imageUrl: eventData.imageUrl || "",
        };

        if (!params.query || event.title.toLowerCase().includes(searchLower)) {
          if (params.userLocation && event.location?.coordinates) {
            if (
              typeof event.location.coordinates.lat === "number" &&
              typeof event.location.coordinates.lng === "number"
            ) {
              const distance = calculateDistance(
                params.userLocation.latitude,
                params.userLocation.longitude,
                event.location.coordinates.lat,
                event.location.coordinates.lng
              );
              event.distance = Number(distance.toFixed(1));
            }
          }

          eventResults.push(event);
        }
      } catch (err) {
        console.error("Error processing event document:", doc.id, err);
      }
    });

    // Sort by distance if location is available, otherwise sort by date
    if (params.userLocation) {
      eventResults.sort((a, b) => (a.distance || Infinity) - (b.distance || Infinity));
    } else {
      eventResults.sort((a, b) => a.startDate.getTime() - b.startDate.getTime());
    }

    return eventResults;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
} 