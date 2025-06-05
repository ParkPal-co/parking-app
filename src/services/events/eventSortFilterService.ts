/**
 * eventSortFilterService.ts
 * Handles sorting and filtering of event arrays
 */
import { Event } from "../../types";
import { calculateDistance } from "../../utils/locationUtils";

export interface EventSortOptions {
  sortBy?: 'distance' | 'date';
  userLocation?: {
    lat: number;
    lng: number;
  };
}

export function sortEvents(events: Event[], options: EventSortOptions): Event[] {
  const sortedEvents = [...events];

  if (options.sortBy === 'distance' && options.userLocation) {
    // Add distance to each event if not already present
    const eventsWithDistance = sortedEvents.map(event => ({
      ...event,
      distance: event.location.coordinates ? calculateDistance(
        options.userLocation!.lat,
        options.userLocation!.lng,
        event.location.coordinates.lat,
        event.location.coordinates.lng
      ) : undefined
    }));

    // Sort by distance
    return eventsWithDistance.sort((a, b) => {
      if (!a.distance && !b.distance) return 0;
      if (!a.distance) return 1;
      if (!b.distance) return -1;
      return a.distance - b.distance;
    });
  }

  // Default sort by date
  return sortedEvents.sort((a, b) => 
    a.startDate.getTime() - b.startDate.getTime()
  );
}

export function filterEvents(events: Event[], searchQuery: string): Event[] {
  if (!searchQuery) return events;
  
  const query = searchQuery.toLowerCase();
  return events.filter(event => 
    event.title.toLowerCase().includes(query) ||
    event.description.toLowerCase().includes(query) ||
    event.location.address.toLowerCase().includes(query)
  );
} 