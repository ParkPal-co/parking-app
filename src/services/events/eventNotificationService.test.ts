import { addEventNotificationEmail, fetchEventNotificationEmails } from './eventNotificationService';
import { addDoc, collection, serverTimestamp, getDocs, Timestamp } from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config', () => ({
  db: {},
}));

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;

describe('eventNotificationService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addEventNotificationEmail', () => {
    it('should successfully add notification email', async () => {
      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockResolvedValue({ id: 'doc123' } as any);
      mockServerTimestamp.mockReturnValue('mockTimestamp' as any);

      await addEventNotificationEmail('event123', 'user@example.com');

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'eventNotifications', 'event123', 'emails');
      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        email: 'user@example.com',
        createdAt: 'mockTimestamp',
      });
    });

    it('should handle errors when adding notification email', async () => {
      const mockError = new Error('Firestore error');
      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockRejectedValue(mockError);

      await expect(addEventNotificationEmail('event123', 'user@example.com')).rejects.toThrow('Firestore error');
    });
  });

  describe('fetchEventNotificationEmails', () => {
    it('should successfully fetch notification emails', async () => {
      const mockDocs = [
        {
          id: 'doc1',
          data: () => ({
            email: 'user1@example.com',
            createdAt: { seconds: 1234567890, nanoseconds: 0 } as Timestamp,
          }),
        },
        {
          id: 'doc2',
          data: () => ({
            email: 'user2@example.com',
            createdAt: { seconds: 1234567891, nanoseconds: 0 } as Timestamp,
          }),
        },
      ];

      const mockSnapshot = {
        docs: mockDocs,
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const result = await fetchEventNotificationEmails('event123');

      expect(collection).toHaveBeenCalledWith(expect.anything(), 'eventNotifications', 'event123', 'emails');
      expect(result).toHaveLength(2);
      expect(result[0]).toMatchObject({
        id: 'doc1',
        email: 'user1@example.com',
      });
      expect(result[1]).toMatchObject({
        id: 'doc2',
        email: 'user2@example.com',
      });
    });

    it('should handle errors when fetching notification emails', async () => {
      const mockError = new Error('Firestore error');
      mockCollection.mockReturnValue('mockCollection' as any);
      mockGetDocs.mockRejectedValue(mockError);

      await expect(fetchEventNotificationEmails('event123')).rejects.toThrow('Firestore error');
    });
  });
});