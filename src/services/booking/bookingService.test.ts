import { createBooking, getBookingById, cancelBooking } from './bookingService';
import { 
  collection, 
  doc, 
  updateDoc, 
  getDoc, 
  runTransaction
} from 'firebase/firestore';
import { getFunctions, httpsCallable } from 'firebase/functions';
import { Booking, ParkingSpot } from '../../types';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('firebase/functions');
jest.mock('../../firebase/config', () => ({
  db: {},
  app: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockGetDoc = getDoc as jest.MockedFunction<typeof getDoc>;
const mockRunTransaction = runTransaction as jest.MockedFunction<typeof runTransaction>;
const mockGetFunctions = getFunctions as jest.MockedFunction<typeof getFunctions>;
const mockHttpsCallable = httpsCallable as jest.MockedFunction<typeof httpsCallable>;

describe('bookingService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createBooking', () => {
    const mockSpot: ParkingSpot = {
      id: 'spot123',
      address: '123 Test St',
      coordinates: { lat: 45.5, lng: -122.6 },
      price: 10,
      eventId: 'event123',
      hostId: 'host123',
      status: 'available',
      description: 'Test spot',
      createdAt: new Date(),
    };

    const mockStartTime = new Date('2024-01-01T10:00:00');
    const mockEndTime = new Date('2024-01-01T14:00:00');

    it('should successfully create a booking', async () => {
      const mockUserDoc = {
        exists: () => true,
        data: () => ({ name: 'John Doe', email: 'john@example.com' }),
      };

      const mockSpotDoc = {
        exists: () => true,
        data: () => ({ status: 'available' }),
      };

      const mockBookingRef = { id: 'booking123' };
      
      mockRunTransaction.mockImplementation(async (db, updateFunction) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue(mockSpotDoc),
          update: jest.fn(),
          set: jest.fn(),
        };
        
        return await updateFunction(mockTransaction as any);
      });

      mockGetDoc
        .mockResolvedValueOnce(mockUserDoc as any) // For renter name fetch
        .mockResolvedValueOnce(mockUserDoc as any) // For renter info
        .mockResolvedValueOnce(mockUserDoc as any); // For host info

      mockDoc.mockReturnValue(mockBookingRef as any);
      mockCollection.mockReturnValue('mockCollection' as any);

      // Mock Firebase functions
      const mockSendBookingConfirmation = jest.fn().mockResolvedValue({});
      mockGetFunctions.mockReturnValue({} as any);
      mockHttpsCallable.mockReturnValue(mockSendBookingConfirmation);

      const result = await createBooking(
        mockSpot,
        'user123',
        'host123',
        mockStartTime,
        mockEndTime,
        40
      );

      expect(result).toMatchObject({
        id: 'booking123',
        parkingSpotId: 'spot123',
        userId: 'user123',
        hostId: 'host123',
        totalPrice: 40,
        status: 'confirmed',
      });
    });

    it('should throw error if parking spot does not exist', async () => {
      const mockSpotDoc = {
        exists: () => false,
      };

      mockRunTransaction.mockImplementation(async (db, updateFunction) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue(mockSpotDoc),
        };
        
        try {
          await updateFunction(mockTransaction as any);
        } catch (error) {
          throw error;
        }
      });

      await expect(
        createBooking(mockSpot, 'user123', 'host123', mockStartTime, mockEndTime, 40)
      ).rejects.toThrow('Parking spot does not exist');
    });

    it('should throw error if parking spot is not available', async () => {
      const mockSpotDoc = {
        exists: () => true,
        data: () => ({ status: 'booked' }),
      };

      mockRunTransaction.mockImplementation(async (db, updateFunction) => {
        const mockTransaction = {
          get: jest.fn().mockResolvedValue(mockSpotDoc),
        };
        
        try {
          await updateFunction(mockTransaction as any);
        } catch (error) {
          throw error;
        }
      });

      await expect(
        createBooking(mockSpot, 'user123', 'host123', mockStartTime, mockEndTime, 40)
      ).rejects.toThrow('Parking spot is not available');
    });
  });

  describe('getBookingById', () => {
    it('should successfully fetch a booking by ID', async () => {
      const mockBookingDoc = {
        exists: () => true,
        id: 'booking123',
        data: () => ({
          parkingSpotId: 'spot123',
          userId: 'user123',
          hostId: 'host123',
          startTime: { toDate: () => new Date('2024-01-01T10:00:00') },
          endTime: { toDate: () => new Date('2024-01-01T14:00:00') },
          totalPrice: 40,
          status: 'confirmed',
          createdAt: { toDate: () => new Date('2024-01-01T09:00:00') },
          paidOut: false,
        }),
      };

      mockGetDoc.mockResolvedValue(mockBookingDoc as any);
      mockDoc.mockReturnValue('mockDocRef' as any);

      const result = await getBookingById('booking123');

      expect(result).toMatchObject({
        id: 'booking123',
        parkingSpotId: 'spot123',
        userId: 'user123',
        hostId: 'host123',
        totalPrice: 40,
        status: 'confirmed',
        paidOut: false,
      });
      expect(result?.startTime).toBeInstanceOf(Date);
      expect(result?.endTime).toBeInstanceOf(Date);
      expect(result?.createdAt).toBeInstanceOf(Date);
    });

    it('should return null if booking does not exist', async () => {
      const mockBookingDoc = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockBookingDoc as any);
      mockDoc.mockReturnValue('mockDocRef' as any);

      const result = await getBookingById('nonexistent');

      expect(result).toBeNull();
    });

    it('should handle errors when fetching booking', async () => {
      const mockError = new Error('Firestore error');
      mockGetDoc.mockRejectedValue(mockError);
      mockDoc.mockReturnValue('mockDocRef' as any);

      await expect(getBookingById('booking123')).rejects.toThrow('Firestore error');
    });
  });

  describe('cancelBooking', () => {
    it('should successfully cancel a booking', async () => {
      const mockBookingDoc = {
        exists: () => true,
        data: () => ({
          parkingSpotId: 'spot123',
        }),
      };

      mockGetDoc.mockResolvedValue(mockBookingDoc as any);
      mockDoc.mockReturnValue('mockDocRef' as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await cancelBooking('booking123');

      expect(updateDoc).toHaveBeenCalledTimes(2);
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { status: 'cancelled' });
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { status: 'available' });
    });

    it('should throw error if booking does not exist', async () => {
      const mockBookingDoc = {
        exists: () => false,
      };

      mockGetDoc.mockResolvedValue(mockBookingDoc as any);
      mockDoc.mockReturnValue('mockDocRef' as any);

      await expect(cancelBooking('nonexistent')).rejects.toThrow('Booking not found');
    });

    it('should handle errors when cancelling booking', async () => {
      const mockError = new Error('Firestore error');
      mockGetDoc.mockRejectedValue(mockError);
      mockDoc.mockReturnValue('mockDocRef' as any);

      await expect(cancelBooking('booking123')).rejects.toThrow('Firestore error');
    });
  });
});