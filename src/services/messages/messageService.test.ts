import {
  createConversation,
  sendMessage,
  subscribeToConversations,
  subscribeToMessages,
  markConversationAsRead,
  type Message,
  type Conversation,
} from './messageService';
import {
  collection,
  query,
  where,
  orderBy,
  getDocs,
  addDoc,
  onSnapshot,
  doc,
  updateDoc,
  Timestamp,
  increment,
} from 'firebase/firestore';

// Mock Firebase functions
jest.mock('firebase/firestore');
jest.mock('../../firebase/config', () => ({
  db: {},
}));

const mockCollection = collection as jest.MockedFunction<typeof collection>;
const mockQuery = query as jest.MockedFunction<typeof query>;
const mockWhere = where as jest.MockedFunction<typeof where>;
const mockOrderBy = orderBy as jest.MockedFunction<typeof orderBy>;
const mockGetDocs = getDocs as jest.MockedFunction<typeof getDocs>;
const mockAddDoc = addDoc as jest.MockedFunction<typeof addDoc>;
const mockOnSnapshot = onSnapshot as jest.MockedFunction<typeof onSnapshot>;
const mockDoc = doc as jest.MockedFunction<typeof doc>;
const mockUpdateDoc = updateDoc as jest.MockedFunction<typeof updateDoc>;
const mockTimestamp = {
  now: jest.fn(() => ({ seconds: Date.now() / 1000, nanoseconds: 0, toDate: () => new Date() })),
} as any;
const mockIncrement = increment as jest.MockedFunction<typeof increment>;

// Replace Timestamp with our mock
(Timestamp as any) = mockTimestamp;

describe('messageService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createConversation', () => {
    it('should return existing conversation if found', async () => {
      const mockExistingConversation = {
        id: 'conversation123',
        data: () => ({
          participants: ['renter123', 'host456'],
          bookingId: 'booking789',
        }),
      };

      const mockSnapshot = {
        docs: [mockExistingConversation],
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);

      const result = await createConversation('renter123', 'host456', 'booking789', 'Hello!');

      expect(result).toBe('conversation123');
      expect(addDoc).not.toHaveBeenCalled();
    });

    it('should create new conversation if none exists', async () => {
      const mockSnapshot = {
        docs: [],
      };

      const mockConversationRef = { id: 'newConversation456' };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);
      mockAddDoc.mockResolvedValue(mockConversationRef as any);
      mockTimestamp.now.mockReturnValue('mockTimestamp' as any);

      const result = await createConversation('renter123', 'host456', 'booking789', 'Hello!');

      expect(result).toBe('newConversation456');
      expect(addDoc).toHaveBeenCalledTimes(2); // Once for conversation, once for message
      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        participants: ['renter123', 'host456'],
        bookingId: 'booking789',
        createdAt: 'mockTimestamp',
        lastMessage: {
          content: 'Hello!',
          timestamp: 'mockTimestamp',
          senderId: 'renter123',
        },
        unreadCount: 1,
      });
    });

    it('should handle errors when creating conversation', async () => {
      const mockError = new Error('Firestore error');
      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockRejectedValue(mockError);

      await expect(
        createConversation('renter123', 'host456', 'booking789', 'Hello!')
      ).rejects.toThrow('Firestore error');
    });
  });

  describe('sendMessage', () => {
    it('should successfully send a message', async () => {
      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockResolvedValue({ id: 'message123' } as any);
      mockDoc.mockReturnValue('mockDocRef' as any);
      mockUpdateDoc.mockResolvedValue(undefined);
      mockTimestamp.now.mockReturnValue('mockTimestamp' as any);
      mockIncrement.mockReturnValue('mockIncrement' as any);

      await sendMessage('conversation123', 'sender456', 'receiver789', 'Test message', 'booking123');

      expect(addDoc).toHaveBeenCalledWith('mockCollection', {
        conversationId: 'conversation123',
        senderId: 'sender456',
        receiverId: 'receiver789',
        content: 'Test message',
        timestamp: 'mockTimestamp',
        read: false,
        bookingId: 'booking123',
      });

      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', {
        lastMessage: {
          content: 'Test message',
          timestamp: 'mockTimestamp',
          senderId: 'sender456',
        },
        unreadCount: 'mockIncrement',
      });
    });

    it('should handle errors when sending message', async () => {
      const mockError = new Error('Firestore error');
      mockCollection.mockReturnValue('mockCollection' as any);
      mockAddDoc.mockRejectedValue(mockError);

      await expect(
        sendMessage('conversation123', 'sender456', 'receiver789', 'Test message')
      ).rejects.toThrow('Firestore error');
    });
  });

  describe('subscribeToConversations', () => {
    it('should set up subscription and call callback with conversations', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      const mockConversationData = {
        participants: ['user123', 'user456'],
        lastMessage: {
          content: 'Last message',
          timestamp: { toDate: () => new Date() },
          senderId: 'user123',
        },
        bookingId: 'booking123',
        unreadCount: 2,
      };

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'conversation123',
            data: () => mockConversationData,
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockOrderBy.mockReturnValue('mockOrderBy' as any);
      mockOnSnapshot.mockImplementation((query, callback) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      const unsubscribe = subscribeToConversations('user123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'conversation123',
          participants: ['user123', 'user456'],
          bookingId: 'booking123',
          unreadCount: 2,
        }),
      ]);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('subscribeToMessages', () => {
    it('should set up subscription and call callback with messages', () => {
      const mockCallback = jest.fn();
      const mockUnsubscribe = jest.fn();

      const mockMessageData = {
        conversationId: 'conversation123',
        senderId: 'sender456',
        receiverId: 'receiver789',
        content: 'Test message',
        timestamp: { toDate: () => new Date() },
        read: false,
        bookingId: 'booking123',
      };

      const mockSnapshot = {
        forEach: jest.fn((callback) => {
          callback({
            id: 'message123',
            data: () => mockMessageData,
          });
        }),
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockOrderBy.mockReturnValue('mockOrderBy' as any);
      mockOnSnapshot.mockImplementation((query, callback) => {
        callback(mockSnapshot);
        return mockUnsubscribe;
      });

      const unsubscribe = subscribeToMessages('conversation123', mockCallback);

      expect(mockCallback).toHaveBeenCalledWith([
        expect.objectContaining({
          id: 'message123',
          conversationId: 'conversation123',
          senderId: 'sender456',
          receiverId: 'receiver789',
          content: 'Test message',
          read: false,
          bookingId: 'booking123',
        }),
      ]);

      expect(unsubscribe).toBe(mockUnsubscribe);
    });
  });

  describe('markConversationAsRead', () => {
    it('should mark messages as read and reset unread count', async () => {
      const mockMessages = [
        { ref: 'messageRef1' },
        { ref: 'messageRef2' },
      ];

      const mockSnapshot = {
        docs: mockMessages,
      };

      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockResolvedValue(mockSnapshot as any);
      mockDoc.mockReturnValue('mockDocRef' as any);
      mockUpdateDoc.mockResolvedValue(undefined);

      await markConversationAsRead('conversation123', 'user456');

      expect(updateDoc).toHaveBeenCalledTimes(3); // 2 messages + 1 conversation
      expect(updateDoc).toHaveBeenCalledWith('messageRef1', { read: true });
      expect(updateDoc).toHaveBeenCalledWith('messageRef2', { read: true });
      expect(updateDoc).toHaveBeenCalledWith('mockDocRef', { unreadCount: 0 });
    });

    it('should handle errors when marking conversation as read', async () => {
      const mockError = new Error('Firestore error');
      mockCollection.mockReturnValue('mockCollection' as any);
      mockQuery.mockReturnValue('mockQuery' as any);
      mockWhere.mockReturnValue('mockWhere' as any);
      mockGetDocs.mockRejectedValue(mockError);

      await expect(
        markConversationAsRead('conversation123', 'user456')
      ).rejects.toThrow('Firestore error');
    });
  });
});