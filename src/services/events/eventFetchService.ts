/**
 * eventFetchService.ts
 * Handles fetching events from Firestore (by ID, all, with search params)
 */
import { collection, query, getDocs, doc, getDoc, where } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Event } from "../../types";
import { convertToDate } from "../../utils/dateUtils";

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
    const q = query(eventsRef, where("status", "!=", "completed"));
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
              // Optionally, calculate distance here if needed
              // event.distance = ...
            }
          }

          eventResults.push(event);
        }
      } catch (err) {
        console.error("Error processing event document:", doc.id, err);
      }
    });

    return eventResults;
  } catch (error) {
    console.error("Error fetching events:", error);
    throw error;
  }
} 