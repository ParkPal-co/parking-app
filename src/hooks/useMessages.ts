/**
 * src/hooks/useMessages.ts
 * Custom hook for managing messages and conversations
 */

import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  Message,
  Conversation,
  subscribeToConversations,
  subscribeToMessages,
  sendMessage as sendMessageService,
  markConversationAsRead as markRead,
} from "../services/messages/messageService";

export function useMessages() {
  const { user } = useAuth();
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [activeConversation, setActiveConversation] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Subscribe to conversations
  useEffect(() => {
    if (!user) return;

    const unsubscribe = subscribeToConversations(user.id, (newConversations) => {
      setConversations(newConversations);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [user]);

  // Subscribe to messages for active conversation
  useEffect(() => {
    if (!activeConversation) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(activeConversation, (newMessages) => {
      setMessages(newMessages);
    });

    return () => unsubscribe();
  }, [activeConversation]);

  const sendMessage = useCallback(
    async (content: string) => {
      if (!user || !activeConversation) return;

      try {
        setError(null);
        const conversation = conversations.find((c) => c.id === activeConversation);
        if (!conversation) return;

        const receiverId = conversation.participants.find((id) => id !== user.id);
        if (!receiverId) return;

        await sendMessageService(
          activeConversation,
          user.id,
          receiverId,
          content,
          conversation.bookingId
        );
      } catch (err) {
        console.error("Error sending message:", err);
        setError("Failed to send message");
      }
    },
    [user, activeConversation, conversations]
  );

  const markConversationAsRead = useCallback(
    async (conversationId: string) => {
      if (!user) return;

      try {
        await markRead(conversationId, user.id);
      } catch (err) {
        console.error("Error marking conversation as read:", err);
      }
    },
    [user]
  );

  return {
    conversations,
    messages,
    loading,
    error,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markConversationAsRead,
  };
} 