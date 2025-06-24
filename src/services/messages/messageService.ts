/**
 * src/services/messageService.ts
 * Service for handling message-related operations
 */

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
} from "firebase/firestore";
import { db } from "../../firebase/config";

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  read: boolean;
  bookingId?: string;
}

export interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: Date;
    senderId: string;
  };
  bookingId: string;
  unreadCount: number;
}

export async function createConversation(
  renterId: string,
  hostId: string,
  bookingId: string,
  initialMessage: string
): Promise<string> {
  try {
    // Check if a conversation already exists for these participants and bookingId
    const conversationsQuery = query(
      collection(db, "conversations"),
      where("participants", "array-contains", renterId),
      where("bookingId", "==", bookingId)
    );
    const snapshot = await getDocs(conversationsQuery);
    // Check if any conversation includes both participants
    const existingConversation = snapshot.docs.find(docSnap => {
      const data = docSnap.data();
      return (
        Array.isArray(data.participants) &&
        data.participants.includes(renterId) &&
        data.participants.includes(hostId) &&
        data.bookingId === bookingId
      );
    });
    if (existingConversation) {
      return existingConversation.id;
    }

    // Create the conversation
    const conversationRef = await addDoc(collection(db, "conversations"), {
      participants: [renterId, hostId],
      bookingId,
      createdAt: Timestamp.now(),
      lastMessage: {
        content: initialMessage,
        timestamp: Timestamp.now(),
        senderId: renterId,
      },
      unreadCount: 1,
    });

    // Create the initial message
    await addDoc(collection(db, "messages"), {
      conversationId: conversationRef.id,
      senderId: renterId,
      receiverId: hostId,
      content: initialMessage,
      timestamp: Timestamp.now(),
      read: false,
      bookingId,
    });

    return conversationRef.id;
  } catch (error) {
    console.error("Error creating conversation:", error);
    throw error;
  }
}

export async function sendMessage(
  conversationId: string,
  senderId: string,
  receiverId: string,
  content: string,
  bookingId?: string
): Promise<void> {
  try {
    // Add the message
    await addDoc(collection(db, "messages"), {
      conversationId,
      senderId,
      receiverId,
      content,
      timestamp: Timestamp.now(),
      read: false,
      bookingId,
    });

    // Update the conversation's last message
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, {
      lastMessage: {
        content,
        timestamp: Timestamp.now(),
        senderId,
      },
      unreadCount: increment(1),
    });
  } catch (error) {
    console.error("Error sending message:", error);
    throw error;
  }
}

export function subscribeToConversations(
  userId: string,
  callback: (conversations: Conversation[]) => void
): () => void {
  const q = query(
    collection(db, "conversations"),
    where("participants", "array-contains", userId),
    orderBy("lastMessage.timestamp", "desc")
  );

  return onSnapshot(q, (snapshot) => {
    const conversations: Conversation[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      conversations.push({
        id: doc.id,
        participants: data.participants,
        lastMessage: data.lastMessage
          ? {
              content: data.lastMessage.content,
              timestamp: data.lastMessage.timestamp.toDate(),
              senderId: data.lastMessage.senderId,
            }
          : undefined,
        bookingId: data.bookingId,
        unreadCount: data.unreadCount || 0,
      });
    });
    callback(conversations);
  });
}

export function subscribeToMessages(
  conversationId: string,
  callback: (messages: Message[]) => void
): () => void {
  const q = query(
    collection(db, "messages"),
    where("conversationId", "==", conversationId),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = [];
    snapshot.forEach((doc) => {
      const data = doc.data();
      messages.push({
        id: doc.id,
        ...data,
        timestamp: data.timestamp.toDate(),
      } as Message);
    });
    callback(messages);
  });
}

export async function markConversationAsRead(
  conversationId: string,
  userId: string
): Promise<void> {
  try {
    const messagesRef = collection(db, "messages");
    const q = query(
      messagesRef,
      where("conversationId", "==", conversationId),
      where("receiverId", "==", userId),
      where("read", "==", false)
    );

    const snapshot = await getDocs(q);
    const updatePromises = snapshot.docs.map((doc) =>
      updateDoc(doc.ref, { read: true })
    );

    await Promise.all(updatePromises);

    // Reset unread count for the conversation
    const conversationRef = doc(db, "conversations", conversationId);
    await updateDoc(conversationRef, { unreadCount: 0 });
  } catch (error) {
    console.error("Error marking conversation as read:", error);
    throw error;
  }
} 