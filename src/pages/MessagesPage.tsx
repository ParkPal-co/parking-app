/**
 * src/pages/MessagesPage.tsx
 * Page component for user messaging
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import ConversationsList from "../components/messages/ConversationsList";
import MessagesArea from "../components/messages/MessagesArea";
import MessageInput from "../components/messages/MessageInput";
import ConversationsDrawer from "../components/messages/ConversationsDrawer";
import MessagesHeader from "../components/messages/MessagesHeader";
import EmptyState from "../components/messages/EmptyState";
import useParticipants from "../hooks/useParticipants";

const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const {
    conversations,
    messages,
    loading,
    error,
    activeConversation,
    setActiveConversation,
    sendMessage,
    markConversationAsRead,
  } = useMessages();
  const [newMessage, setNewMessage] = useState("");
  const [showDrawer, setShowDrawer] = useState(false);

  // Mark conversation as read when selected
  useEffect(() => {
    if (activeConversation) {
      markConversationAsRead(activeConversation);
    }
  }, [activeConversation, markConversationAsRead]);

  // Use participants hook
  const { participantNames, participantProfiles } = useParticipants(
    conversations,
    user?.id
  );

  // Open drawer
  const openDrawer = () => setShowDrawer(true);
  // Close drawer
  const closeDrawer = () => setShowDrawer(false);

  // When a conversation is selected on mobile, close the drawer
  const handleSetActiveConversation = (id: string) => {
    setActiveConversation(id);
    closeDrawer();
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim()) return;

    try {
      await sendMessage(newMessage.trim());
      setNewMessage("");
    } catch (err) {
      console.error("Error sending message:", err);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading messages...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center text-red-600">{error}</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 max-w-6xl">
      <div className="flex h-[calc(100vh-200px)] bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* Conversations List - Desktop/Tablet */}
        <div className="hidden md:flex w-1/3 border-r border-gray-200 flex-col">
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          {conversations.length === 0 ? (
            <EmptyState message="No conversations yet" />
          ) : (
            <ConversationsList
              conversations={conversations}
              activeConversation={activeConversation}
              setActiveConversation={setActiveConversation}
              participantNames={participantNames}
              participantProfiles={participantProfiles}
              user={user}
            />
          )}
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col relative h-full">
          {/* Mobile: Drawer Button/Header */}
          <MessagesHeader onOpenDrawer={openDrawer} />

          {/* Mobile: Drawer Modal (now inside the messages window) */}
          <ConversationsDrawer
            open={showDrawer}
            onClose={closeDrawer}
            conversations={conversations}
            activeConversation={activeConversation}
            setActiveConversation={handleSetActiveConversation}
            participantNames={participantNames}
            participantProfiles={participantProfiles}
            user={user}
          />

          {/* Main Messages Area */}
          {activeConversation ? (
            <>
              <MessagesArea
                messages={messages}
                user={user}
                participantNames={participantNames}
                participantProfiles={participantProfiles}
              />
              <div className="p-3 border-t border-gray-200 flex-shrink-0">
                <MessageInput
                  newMessage={newMessage}
                  setNewMessage={setNewMessage}
                  handleSendMessage={handleSendMessage}
                />
              </div>
            </>
          ) : (
            <EmptyState
              message="Select a conversation to start messaging"
              className="flex-1"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
