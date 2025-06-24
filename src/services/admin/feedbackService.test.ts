import { addFeedback, type Feedback } from './feedbackService';
import { addDoc, collection, serverTimestamp } from 'firebase/firestore';
import { db } from '../../firebase/config';

// Mock the Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config');

const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockServerTimestamp = serverTimestamp as jest.MockedFunction<typeof serverTimestamp>;

describe('feedbackService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('addFeedback', () => {
    it('should successfully add feedback with all fields', async () => {
      const mockFeedback: Feedback = {
        userId: 'user123',
        userName: 'John Doe',
        feedbackText: 'Great app!',
        email: 'john@example.com',
      };

      const mockDocRef = { id: 'feedback123' };
      mockAddDoc.mockResolvedValue(mockDocRef as any);
      mockCollection.mockReturnValue('mockCollection' as any);
      mockServerTimestamp.mockReturnValue('mockTimestamp' as any);

      const result = await addFeedback(mockFeedback);

      expect(collection).toHaveBeenCalledWith(db, 'feedback');
      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        userId: 'user123',
        userName: 'John Doe',
        feedbackText: 'Great app!',
        email: 'john@example.com',
        createdAt: 'mockTimestamp',
      });
      expect(result).toBe(mockDocRef);
    });

    it('should add feedback without userId (anonymous)', async () => {
      const mockFeedback: Feedback = {
        userId: null,
        userName: 'Anonymous User',
        feedbackText: 'Good service',
      };

      const mockDocRef = { id: 'feedback456' };
      mockAddDoc.mockResolvedValue(mockDocRef as any);
      mockCollection.mockReturnValue('mockCollection' as any);
      mockServerTimestamp.mockReturnValue('mockTimestamp' as any);

      const result = await addFeedback(mockFeedback);

      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        userId: null,
        userName: 'Anonymous User',
        feedbackText: 'Good service',
        email: null,
        createdAt: 'mockTimestamp',
      });
      expect(result).toBe(mockDocRef);
    });

    it('should add feedback without email', async () => {
      const mockFeedback: Feedback = {
        userId: 'user789',
        userName: 'Jane Smith',
        feedbackText: 'Needs improvement',
      };

      const mockDocRef = { id: 'feedback789' };
      mockAddDoc.mockResolvedValue(mockDocRef as any);
      mockCollection.mockReturnValue('mockCollection' as any);
      mockServerTimestamp.mockReturnValue('mockTimestamp' as any);

      const result = await addFeedback(mockFeedback);

      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        userId: 'user789',
        userName: 'Jane Smith',
        feedbackText: 'Needs improvement',
        email: null,
        createdAt: 'mockTimestamp',
      });
      expect(result).toBe(mockDocRef);
    });

    it('should handle Firestore errors', async () => {
      const mockFeedback: Feedback = {
        userId: 'user123',
        userName: 'John Doe',
        feedbackText: 'Test feedback',
      };

      const mockError = new Error('Firestore error');
      mockAddDoc.mockRejectedValue(mockError);
      mockCollection.mockReturnValue('mockCollection' as any);
      mockServerTimestamp.mockReturnValue('mockTimestamp' as any);

      await expect(addFeedback(mockFeedback)).rejects.toThrow('Firestore error');
    });
  });
});