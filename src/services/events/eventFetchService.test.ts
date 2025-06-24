import { fetchEventById, fetchEvents, type EventSearchParams } from './eventFetchService';
import { collection, query, getDocs, doc, getDoc, where } from 'firebase/firestore';
import { Event } from '../../types';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockWhere = where as jest.MockedFunction<typeof where>;

describe('eventFetchService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchEventById', () => {
    it('should successfully fetch an event by ID', async () => {
      const mockEventDoc = {
        exists: () => true,
        id: 'event123',
        data: () => ({
          title: 'Test Event',
          description: 'Test description',
          location: {
            address: '123 Test St',
            coordinates: { lat: 45.5, lng: -122.6 },
          },
          expectedAttendance: 100,
          status: 'upcoming',
          startDate: '2024-01-01',
          endDate: '2024-01-02',
          createdAt: '2023-12-01',
          imageUrl: 'https://example.com/image.jpg',
        }),
      };

      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockResolvedValue(mockEventDoc as any);

      const result = await fetchEventById('event123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'events', 'event123');
      expect(result).toMatchObject({
        id: 'event123',
        title: 'Test Event',
        description: 'Test description',
        status: 'upcoming',
        expectedAttendance: 100,
      });
      expect(result?.startDate).toBeInstanceOf(Date);
      expect(result?.endDate).toBeInstanceOf(Date);
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null if event does not exist', async () => {
      const mockEventDoc = {
        exists: () => false,
      };

      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockResolvedValue(mockEventDoc as any);

      const result = await fetchEventById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle missing fields with defaults', async () => {
      const mockEventDoc = {
        exists: () => true,
        id: 'event456',
        data: () => ({}),
      };

      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockResolvedValue(mockEventDoc as any);

      const result = await fetchEventById('event456');

      expect(result).toMatchObject({
        id: 'event456',
        title: 'Untitled Event',
        description: '',
        location: {
          address: 'Location TBD',
          coordinates: null,
        },
        expectedAttendance: 0,
        status: 'upcoming',
        imageUrl: '',
      });
    });

    it('should handle errors when fetching event', async () => {
      const mockError = new Error('Firestore error');
      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockRejectedValue(mockError);

      await expect(fetchEventById('event123')).rejects.toThrow('Firestore error');
    });
  });

  describe('fetchEvents', () => {
    const mockEventData = {
      title: 'Test Event',
      description: 'Test description',
      location: {
        address: '123 Test St',
        coordinates: { lat: 45.5, lng: -122.6 },
      },
      expectedAttendance: 100,
      status: 'upcoming',
      startDate: '2024-01-01',
      endDate: '2024-01-02',
      createdAt: '2023-12-01',
      imageUrl: 'https://example.com/image.jpg',
    };

    it('should successfully fetch events without search query', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'event123',
            data: () => mockEventData,
          });
          callback({
            id: 'event456',
            data: () => ({ ...mockEventData, title: 'Another Event' }),
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const params: EventSearchParams = {};
      const result = await fetchEvents(params);

      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'event123',
        title: 'Test Event',
      });
      expect(result[1]).toMatchObject({
        id: 'event456',
        title: 'Another Event',
      });
    });

    it('should filter events by search query', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'event123',
            data: () => mockEventData,
          });
          callback({
            id: 'event456',
            data: () => ({ ...mockEventData, title: 'Different Event' }),
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const params: EventSearchParams = {
        query: 'test',
      };
      const result = await fetchEvents(params);

      expect(result).toHaveLength(1);
      expect(result[0].title).toBe('Test Event');
    });

    it('should handle events with user location', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'event123',
            data: () => mockEventData,
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const params: EventSearchParams = {
        userLocation: {
          latitude: 45.5,
          longitude: -122.6,
        },
      };
      const result = await fetchEvents(params);

      expect(result).toHaveLength(1);
      expect(result[0]).toMatchObject({
        id: 'event123',
        title: 'Test Event',
      });
    });

    it('should handle events with invalid data gracefully', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          // Valid event
          callback({
            id: 'event123',
            data: () => mockEventData,
          });
          // Invalid event (will cause error in processing)
          callback({
            id: 'event456',
            data: () => {
              throw new Error('Invalid data');
            },
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const params: EventSearchParams = {};
      const result = await fetchEvents(params);

      // Should only return the valid event
      expect(result).toHaveLength(1);
      expect(result[0].id).toBe('event123');
    });

    it('should handle Firestore errors', async () => {
      const mockError = new Error('Firestore error');

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockRejectedValue(mockError);

      const params: EventSearchParams = {};

      await expect(fetchEvents(params)).rejects.toThrow('Firestore error');
    });
  });
});