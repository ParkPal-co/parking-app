/**
 * src/pages/admin/ConversationsPage.tsx
 * Admin page for viewing conversations between hosts and renters
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  orderBy,
  where,
} from "firebase/firestore";
import { db } from "../../firebase/config";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  content: string;
  timestamp: any;
  read: boolean;
  bookingId?: string;
}

interface Conversation {
  id: string;
  participants: string[];
  lastMessage?: {
    content: string;
    timestamp: any;
    senderId: string;
  };
  bookingId: string;
  unreadCount: number;
  createdAt: any;
}

interface User {
  id: string;
  name?: string;
  email?: string;
}

interface Booking {
  id: string;
  totalPrice: number;
  startTime: any;
  endTime: any;
  status: string;
}

const ConversationsPage: React.FC = () => {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConversation, setSelectedConversation] =
    useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [participants, setParticipants] = useState<Record<string, User>>({});
  const [bookingDetails, setBookingDetails] = useState<Record<string, Booking>>(
    {}
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    fetchConversations();
  }, [user]);

  const fetchConversations = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch all conversations
      const conversationsQuery = query(
        collection(db, "conversations"),
        orderBy("lastMessage.timestamp", "desc")
      );
      const conversationsSnapshot = await getDocs(conversationsQuery);

      const conversationsData = conversationsSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Conversation[];

      setConversations(conversationsData);

      // Fetch participant details for all conversations
      const allParticipantIds = new Set<string>();
      conversationsData.forEach((conv) => {
        conv.participants.forEach((participantId) => {
          allParticipantIds.add(participantId);
        });
      });

      const participantsData: Record<string, User> = {};
      for (const participantId of allParticipantIds) {
        try {
          const userRef = doc(db, "users", participantId);
          const userDoc = await getDoc(userRef);
          if (userDoc.exists()) {
            participantsData[participantId] = {
              id: participantId,
              ...userDoc.data(),
            } as User;
          }
        } catch (err) {
          console.error(`Error fetching user ${participantId}:`, err);
        }
      }
      setParticipants(participantsData);

      // Fetch booking details for all conversations
      const allBookingIds = new Set<string>();
      conversationsData.forEach((conv) => {
        if (conv.bookingId) {
          allBookingIds.add(conv.bookingId);
        }
      });

      const bookingData: Record<string, Booking> = {};
      for (const bookingId of allBookingIds) {
        try {
          const bookingRef = doc(db, "bookings", bookingId);
          const bookingDoc = await getDoc(bookingRef);
          if (bookingDoc.exists()) {
            bookingData[bookingId] = {
              id: bookingId,
              ...bookingDoc.data(),
            } as Booking;
          }
        } catch (err) {
          console.error(`Error fetching booking ${bookingId}:`, err);
        }
      }
      setBookingDetails(bookingData);
    } catch (err) {
      console.error("Error fetching conversations:", err);
      setError("Failed to load conversations");
    } finally {
      setLoading(false);
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const messagesQuery = query(
        collection(db, "messages"),
        where("conversationId", "==", conversationId),
        orderBy("timestamp", "asc")
      );
      const messagesSnapshot = await getDocs(messagesQuery);

      const messagesData = messagesSnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
      })) as Message[];

      setMessages(messagesData);
    } catch (err) {
      console.error("Error fetching messages:", err);
      setError("Failed to load messages");
    }
  };

  const handleConversationSelect = (conversation: Conversation) => {
    setSelectedConversation(conversation);
    fetchMessages(conversation.id);
  };

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp) return "N/A";
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleString();
  };

  const getUserDisplayName = (userId: string) => {
    const user = participants[userId];
    return user?.name || user?.email || userId;
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Conversations Management</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading conversations...</div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Conversations List */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md">
              <div className="p-4 border-b border-gray-200">
                <h2 className="text-lg font-semibold">
                  Conversations ({conversations.length})
                </h2>
              </div>
              <div className="max-h-96 overflow-y-auto">
                {conversations.length === 0 ? (
                  <div className="p-4 text-gray-500 text-center">
                    No conversations found
                  </div>
                ) : (
                  conversations.map((conversation) => {
                    const participantNames = conversation.participants
                      .map((id) => getUserDisplayName(id))
                      .join(" & ");
                    const booking = bookingDetails[conversation.bookingId];

                    return (
                      <div
                        key={conversation.id}
                        onClick={() => handleConversationSelect(conversation)}
                        className={`p-4 border-b border-gray-100 cursor-pointer hover:bg-gray-50 ${
                          selectedConversation?.id === conversation.id
                            ? "bg-blue-50"
                            : ""
                        }`}
                      >
                        <div className="flex justify-between items-start">
                          <div className="flex-1">
                            <div className="font-medium text-sm text-gray-900">
                              {participantNames}
                            </div>
                            {booking && (
                              <div className="text-xs text-gray-500 mt-1">
                                Booking: ${booking.totalPrice} •{" "}
                                {booking.status}
                              </div>
                            )}
                            {conversation.lastMessage && (
                              <div className="text-xs text-gray-600 mt-1 truncate">
                                {conversation.lastMessage.content}
                              </div>
                            )}
                          </div>
                          <div className="text-right">
                            <div className="text-xs text-gray-400">
                              {conversation.lastMessage
                                ? formatTimestamp(
                                    conversation.lastMessage.timestamp
                                  )
                                : "No messages"}
                            </div>
                            {conversation.unreadCount > 0 && (
                              <div className="bg-red-500 text-white text-xs rounded-full px-2 py-1 mt-1">
                                {conversation.unreadCount}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          </div>

          {/* Messages View */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-lg shadow-md">
              {selectedConversation ? (
                <>
                  <div className="p-4 border-b border-gray-200">
                    <div className="flex justify-between items-center">
                      <div>
                        <h2 className="text-lg font-semibold">
                          {selectedConversation.participants
                            .map((id) => getUserDisplayName(id))
                            .join(" & ")}
                        </h2>
                        {bookingDetails[selectedConversation.bookingId] && (
                          <div className="text-sm text-gray-600 mt-1">
                            Booking ID: {selectedConversation.bookingId} • $
                            {
                              bookingDetails[selectedConversation.bookingId]
                                .totalPrice
                            }
                          </div>
                        )}
                      </div>
                      <div className="text-sm text-gray-500">
                        {selectedConversation.unreadCount > 0 && (
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs mr-2">
                            {selectedConversation.unreadCount} unread
                          </span>
                        )}
                        Created:{" "}
                        {formatTimestamp(selectedConversation.createdAt)}
                      </div>
                    </div>
                  </div>
                  <div className="max-h-96 overflow-y-auto p-4">
                    {messages.length === 0 ? (
                      <div className="text-gray-500 text-center py-8">
                        No messages in this conversation
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {messages.map((message) => (
                          <div key={message.id} className="flex flex-col">
                            <div className="flex items-start space-x-3">
                              <div className="flex-shrink-0">
                                <div className="w-8 h-8 bg-gray-300 rounded-full flex items-center justify-center text-xs font-medium">
                                  {getUserDisplayName(message.senderId)
                                    .charAt(0)
                                    .toUpperCase()}
                                </div>
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center space-x-2">
                                  <span className="text-sm font-medium text-gray-900">
                                    {getUserDisplayName(message.senderId)}
                                  </span>
                                  <span className="text-xs text-gray-500">
                                    {formatTimestamp(message.timestamp)}
                                  </span>
                                  {!message.read && (
                                    <span className="text-xs text-blue-600">
                                      (unread)
                                    </span>
                                  )}
                                </div>
                                <div className="mt-1 text-sm text-gray-700 bg-gray-50 rounded-lg p-3">
                                  {message.content}
                                </div>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </>
              ) : (
                <div className="p-8 text-center text-gray-500">
                  Select a conversation to view messages
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ConversationsPage;
