/**
 * src/pages/MessagesPage.tsx
 * Page component for user messaging
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { User } from "../types";
import ConversationsList from "../components/messages/ConversationsList";
import MessagesArea from "../components/messages/MessagesArea";
import MessageInput from "../components/messages/MessageInput";
import ConversationsDrawer from "../components/messages/ConversationsDrawer";

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
  const [participantNames, setParticipantNames] = useState<{
    [key: string]: string;
  }>({});
  const [participantProfiles, setParticipantProfiles] = useState<{
    [key: string]: User;
  }>({});
  const [showDrawer, setShowDrawer] = useState(false);

  // Mark conversation as read when selected
  useEffect(() => {
    if (activeConversation) {
      markConversationAsRead(activeConversation);
    }
  }, [activeConversation, markConversationAsRead]);

  // Fetch participant names and profiles
  useEffect(() => {
    const fetchParticipantInfo = async () => {
      const names: { [key: string]: string } = {};
      const profiles: { [key: string]: User } = {};

      for (const conversation of conversations) {
        for (const participantId of conversation.participants) {
          if (!names[participantId] && participantId !== user?.id) {
            try {
              const userDoc = await getDoc(doc(db, "users", participantId));
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                names[participantId] = userData.name || "Unknown User";
                profiles[participantId] = userData;
              }
            } catch (err) {
              console.error("Error fetching user info:", err);
              names[participantId] = "Unknown User";
            }
          }
        }
      }
      setParticipantNames(names);
      setParticipantProfiles(profiles);
    };

    if (conversations.length > 0) {
      fetchParticipantInfo();
    }
  }, [conversations, user?.id]);

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
    <div className="container mx-auto px-4 py-2 max-w-6xl">
      <div className="flex h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden relative">
        {/* Conversations List - Desktop/Tablet */}
        <div className="hidden md:flex w-1/3 border-r border-gray-200 flex-col">
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          <ConversationsList
            conversations={conversations}
            activeConversation={activeConversation}
            setActiveConversation={setActiveConversation}
            participantNames={participantNames}
            participantProfiles={participantProfiles}
            user={user}
          />
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col relative">
          {/* Mobile: Drawer Button */}
          <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 bg-white z-10">
            <button
              onClick={openDrawer}
              className="inline-flex items-center px-3 py-2 rounded-lg text-black hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
              aria-label="Open conversations"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
                aria-hidden="true"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
              <span className="ml-2 font-medium">Conversations</span>
            </button>
            <h1 className="text-lg font-semibold">Messages</h1>
            <div className="w-10" /> {/* Spacer for alignment */}
          </div>

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
            <div className="flex-1 flex items-center justify-center text-gray-500">
              Select a conversation to start messaging
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MessagesPage;
