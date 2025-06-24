import { createEvent, type EventFormData } from './eventCreateService';
import { addDoc, updateDoc, collection } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('firebase/storage');
jest.mock('../../firebase/config', () => ({
  db: {},
  storage: {},
}));

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockRef = ref as jest.MockedFunction<typeof ref>;
const mockUploadBytes = uploadBytes as jest.MockedFunction<typeof uploadBytes>;
const mockGetDownloadURL = getDownloadURL as jest.MockedFunction<typeof getDownloadURL>;

describe('eventCreateService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockUser = {
    email: 'admin@example.com',
    isAdmin: true,
  };

  const mockEventData: EventFormData = {
    title: 'Test Event',
    address: {
      street: '123 Test St',
      city: 'Portland',
      state: 'OR',
      zipCode: '97201',
    },
    website: 'https://test.com',
    startDate: '2025-12-01',
    endDate: '2025-12-02',
    venue: 'Test Venue',
    coordinates: {
      lat: 45.5,
      lng: -122.6,
    },
    imageUrl: '',
    expectedAttendance: '100',
    description: 'Test event description',
  };

  describe('createEvent', () => {
    it('should successfully create an event with image', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockDocRef = { id: 'event123' };
      const mockSnapshot = { ref: 'mockRef' };
      const mockImageUrl = 'https://example.com/image.jpg';

      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockRef.mockReturnValue('mockStorageRef' as any);
      mockUploadBytes.mockResolvedValue(mockSnapshot as any);
      mockGetDownloadURL.mockResolvedValue(mockImageUrl);

      await createEvent(mockEventData, mockFile, mockUser);

      expect(ref).toHaveBeenCalled();
      expect(uploadBytes).toHaveBeenCalledWith('mockStorageRef', mockFile);
      expect(getDownloadURL).toHaveBeenCalledWith('mockRef');
      expect(addDoc).toHaveBeenCalledWith('mockCollection', expect.objectContaining({
        title: 'Test Event',
        description: 'Test event description',
        expectedAttendance: 100,
        imageUrl: mockImageUrl,
        createdBy: 'admin@example.com',
        status: 'upcoming',
        payoutStatus: 'pending',
      }));
      expect(updateDoc).toHaveBeenCalledWith(mockDocRef, { id: 'event123' });
    });

    it('should create an event without image', async () => {
      const mockDocRef = { id: 'event456' };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockResolvedValue(mockDocRef as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await createEvent(mockEventData, null, mockUser);

      expect(addDoc).toHaveBeenCalledWith('mockCollection', expect.objectContaining({
        title: 'Test Event',
        imageUrl: '',
      }));
      expect(ref).not.toHaveBeenCalled();
      expect(uploadBytes).not.toHaveBeenCalled();
    });

    it('should throw error if user is not admin', async () => {
      const nonAdminUser = {
        email: 'user@example.com',
        isAdmin: false,
      };

      await expect(
        createEvent(mockEventData, null, nonAdminUser)
      ).rejects.toThrow('Only administrators can register events');
    });

    it('should throw error if user is null', async () => {
      await expect(
        createEvent(mockEventData, null, null)
      ).rejects.toThrow('Only administrators can register events');
    });

    it('should throw error if start date is in the past', async () => {
      const pastEventData = {
        ...mockEventData,
        startDate: '2020-01-01',
      };

      await expect(
        createEvent(pastEventData, null, mockUser)
      ).rejects.toThrow('Start date cannot be in the past');
    });

    it('should throw error if end date is before start date', async () => {
      const invalidEventData = {
        ...mockEventData,
        startDate: '2025-12-02',
        endDate: '2025-12-01',
      };

      await expect(
        createEvent(invalidEventData, null, mockUser)
      ).rejects.toThrow('End date must be after start date');
    });

    it('should throw error if expected attendance is invalid', async () => {
      const invalidEventData = {
        ...mockEventData,
        expectedAttendance: 'invalid',
      };

      await expect(
        createEvent(invalidEventData, null, mockUser)
      ).rejects.toThrow('Expected attendance must be a positive number');
    });

    it('should handle storage upload errors', async () => {
      const mockFile = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
      const mockError = new Error('Storage error');

      mockRef.mockReturnValue('mockStorageRef' as any);
      mockUploadBytes.mockRejectedValue(mockError);

      await expect(
        createEvent(mockEventData, mockFile, mockUser)
      ).rejects.toThrow('Storage error');
    });

    it('should handle Firestore errors', async () => {
      const mockError = new Error('Firestore error');

      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockRejectedValue(mockError);

      await expect(
        createEvent(mockEventData, null, mockUser)
      ).rejects.toThrow('Firestore error');
    });
  });
});