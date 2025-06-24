import { fetchParkingSpotById, fetchParkingSpots } from './parkingSpotService';
import { collection, query, where, getDocs, doc, getDoc } from 'firebase/firestore';
import { ParkingSpot } from '../../types';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;

describe('parkingSpotService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('fetchParkingSpotById', () => {
    it('should successfully fetch a parking spot by ID', async () => {
      const mockSpotDoc = {
        exists: () => true,
        id: 'spot123',
        data: () => ({
          address: '123 Test St',
          coordinates: { lat: 45.5, lng: -122.6 },
          price: 10,
          eventId: 'event123',
          hostId: 'host456',
          status: 'available',
          description: 'Great parking spot',
          createdAt: new Date('2023-12-01'),
        }),
      };

      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockResolvedValue(mockSpotDoc as any);

      const result = await fetchParkingSpotById('spot123');

      expect(doc).toHaveBeenCalledWith(expect.anything(), 'parkingSpots', 'spot123');
      expect(result).toMatchObject({
        id: 'spot123',
        address: '123 Test St',
        coordinates: { lat: 45.5, lng: -122.6 },
        price: 10,
        eventId: 'event123',
        hostId: 'host456',
        status: 'available',
        description: 'Great parking spot',
      });
    });

    it('should return null if parking spot does not exist', async () => {
      const mockSpotDoc = {
        exists: () => false,
      };

      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockResolvedValue(mockSpotDoc as any);

      const result = await fetchParkingSpotById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors when fetching parking spot', async () => {
      const mockError = new Error('Firestore error');
      mockDoc.mockReturnValue('mockDocRef' as any);
      mockGetDoc.mockRejectedValue(mockError);

      await expect(fetchParkingSpotById('spot123')).rejects.toThrow('Firestore error');
    });
  });

  describe('fetchParkingSpots', () => {
    const mockSpotData = {
      address: '123 Test St',
      coordinates: { lat: 45.5, lng: -122.6 },
      price: 10,
      eventId: 'event123',
      hostId: 'host456',
      status: 'available',
      description: 'Great parking spot',
      createdAt: new Date('2023-12-01'),
    };

    it('should successfully fetch parking spots for an event', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'spot123',
            data: () => mockSpotData,
          });
          callback({
            id: 'spot456',
            data: () => ({
              ...mockSpotData,
              coordinates: { lat: 45.6, lng: -122.7 },
              price: 15,
            }),
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await fetchParkingSpots('event123');

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'parkingSpots');
      expect(where).toHaveBeenCalledWith('eventId', '==', 'event123');
      expect(where).toHaveBeenCalledWith('status', '==', 'available');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'spot123',
        address: '123 Test St',
        price: 10,
      });
      expect(result[1]).toMatchObject({
        id: 'spot456',
        address: '123 Test St',
        price: 15,
      });
    });

    it('should filter out duplicate coordinates', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn((callback) => {
          // Three spots, two with same coordinates
          callback({
            id: 'spot123',
            data: () => mockSpotData,
          });
          callback({
            id: 'spot456',
            data: () => ({
              ...mockSpotData,
              price: 15,
            }),
          });
          callback({
            id: 'spot789',
            data: () => ({
              ...mockSpotData,
              coordinates: { lat: 45.6, lng: -122.7 },
              price: 20,
            }),
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await fetchParkingSpots('event123');

      // Should only return 2 spots (duplicates filtered out)
      expect(result).toHaveLength(2);
      expect(result[0].id).toBe('spot123'); // First spot with coordinates 45.5,-122.6
      expect(result[1].id).toBe('spot789'); // Spot with different coordinates 45.6,-122.7
    });

    it('should return empty array when no spots found', async () => {
      const mockQuerySnapshot = {
        forEach: jest.fn(() => {}),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockQuerySnapshot as any);

      const result = await fetchParkingSpots('event123');

      expect(result).toHaveLength(0);
    });

    it('should handle Firestore errors', async () => {
      const mockError = new Error('Firestore error');

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockRejectedValue(mockError);

      await expect(fetchParkingSpots('event123')).rejects.toThrow('Firestore error');
    });
  });
});