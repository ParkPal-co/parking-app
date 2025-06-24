import { sortEvents, filterEvents, type EventSortOptions } from './eventSortFilterService';
import { Event } from '../../types';

// Mock the location utils
jest.mock('../../utils/locationUtils', () => ({
  calculateDistance: jest.fn((lat1, lng1, lat2, lng2) => {
    // Simple mock distance calculation
    return Math.abs(lat1 - lat2) + Math.abs(lng1 - lng2);
  }),
}));

describe('eventSortFilterService', () => {
  const mockEvents: Event[] = [
    {
      id: 'event1',
      title: 'Portland Music Festival',
      description: 'Great music event',
      location: {
        address: '123 Portland St',
        coordinates: { lat: 45.5, lng: -122.6 },
      },
      expectedAttendance: 500,
      status: 'upcoming',
      startDate: new Date('2024-01-01'),
      endDate: new Date('2024-01-02'),
      createdAt: new Date('2023-12-01'),
      imageUrl: 'https://example.com/image1.jpg',
    },
    {
      id: 'event2',
      title: 'Seattle Art Show',
      description: 'Amazing art exhibition',
      location: {
        address: '456 Seattle Ave',
        coordinates: { lat: 47.6, lng: -122.3 },
      },
      expectedAttendance: 200,
      status: 'upcoming',
      startDate: new Date('2024-01-15'),
      endDate: new Date('2024-01-16'),
      createdAt: new Date('2023-12-15'),
      imageUrl: 'https://example.com/image2.jpg',
    },
    {
      id: 'event3',
      title: 'Tech Conference',
      description: 'Technology and innovation',
      location: {
        address: '789 Tech Blvd',
        coordinates: { lat: 45.7, lng: -122.4 },
      },
      expectedAttendance: 1000,
      status: 'upcoming',
      startDate: new Date('2024-01-10'),
      endDate: new Date('2024-01-11'),
      createdAt: new Date('2023-12-10'),
      imageUrl: 'https://example.com/image3.jpg',
    },
  ];

  describe('sortEvents', () => {
    it('should sort events by date (default)', () => {
      const options: EventSortOptions = {};
      const result = sortEvents(mockEvents, options);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('event1'); // Jan 1
      expect(result[1].id).toBe('event3'); // Jan 10
      expect(result[2].id).toBe('event2'); // Jan 15
    });

    it('should sort events by distance when user location provided', () => {
      const options: EventSortOptions = {
        sortBy: 'distance',
        userLocation: { lat: 45.5, lng: -122.6 },
      };
      const result = sortEvents(mockEvents, options);

      expect(result).toHaveLength(3);
      // Event1 should be first (distance 0), then event3 (distance 0.4), then event2 (distance 2.4)
      expect(result[0].id).toBe('event1');
      expect(result[1].id).toBe('event3');
      expect(result[2].id).toBe('event2');
    });

    it('should handle events without coordinates when sorting by distance', () => {
      const eventsWithoutCoords = [
        ...mockEvents,
        {
          ...mockEvents[0],
          id: 'event4',
          location: {
            address: 'No coordinates',
            coordinates: null,
          },
        },
      ];

      const options: EventSortOptions = {
        sortBy: 'distance',
        userLocation: { lat: 45.5, lng: -122.6 },
      };
      const result = sortEvents(eventsWithoutCoords, options);

      expect(result).toHaveLength(4);
      // Event without coordinates should be last
      expect(result[3].id).toBe('event4');
    });

    it('should fall back to date sorting when no user location provided', () => {
      const options: EventSortOptions = {
        sortBy: 'distance',
        // No userLocation provided
      };
      const result = sortEvents(mockEvents, options);

      expect(result).toHaveLength(3);
      expect(result[0].id).toBe('event1'); // Jan 1
      expect(result[1].id).toBe('event3'); // Jan 10
      expect(result[2].id).toBe('event2'); // Jan 15
    });

    it('should not mutate original array', () => {
      const originalEvents = [...mockEvents];
      const options: EventSortOptions = {};
      const result = sortEvents(mockEvents, options);

      expect(mockEvents).toEqual(originalEvents);
      expect(result).not.toBe(mockEvents);
    });
  });

  describe('filterEvents', () => {
    it('should return all events when no search query provided', () => {
      const result = filterEvents(mockEvents, '');
      expect(result).toHaveLength(3);
      expect(result).toEqual(mockEvents);
    });

    it('should filter events by title', () => {
      const result = filterEvents(mockEvents, 'music');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Portland Music Festival');
    });

    it('should filter events by description', () => {
      const result = filterEvents(mockEvents, 'art');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Seattle Art Show');
    });

    it('should filter events by location', () => {
      const result = filterEvents(mockEvents, 'seattle');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Seattle Art Show');
    });

    it('should be case insensitive', () => {
      const result = filterEvents(mockEvents, 'TECH');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Tech Conference');
    });

    it('should return multiple matches', () => {
      const result = filterEvents(mockEvents, 'event');
      expect(result).toHaveLength(1); // Only matches description
      expect(result[0].description).toContain('music event');
    });

    it('should return empty array when no matches found', () => {
      const result = filterEvents(mockEvents, 'nonexistent');
      expect(result).toHaveLength(0);
    });

    it('should handle partial matches', () => {
      const result = filterEvents(mockEvents, 'port');
      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Portland Music Festival');
    });
  });
});