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

// Default avatar to use when image fails to load or is not available
const DEFAULT_AVATAR =
  "data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='%23999999'%3E%3Cpath d='M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 3c1.66 0 3 1.34 3 3s-1.34 3-3 3-3-1.34-3-3 1.34-3 3-3zm0 14.2c-2.5 0-4.71-1.28-6-3.22.03-1.99 4-3.08 6-3.08 1.99 0 5.97 1.09 6 3.08-1.29 1.94-3.5 3.22-6 3.22z'/%3E%3C/svg%3E";

export const MessagesPage: React.FC = () => {
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
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

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

  // Handle image load error
  const handleImageError = (
    e: React.SyntheticEvent<HTMLImageElement, Event>
  ) => {
    e.currentTarget.src = DEFAULT_AVATAR;
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
      <div className="flex h-[90vh] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200 flex flex-col">
          <div className="p-3 border-b border-gray-200 flex-shrink-0">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 ? (
              <div className="p-4 text-center text-gray-500">
                No conversations yet
              </div>
            ) : (
              conversations.map((conversation) => {
                const otherParticipantId = conversation.participants.find(
                  (id) => id !== user?.id
                );
                const otherParticipantName = otherParticipantId
                  ? participantNames[otherParticipantId] || "Loading..."
                  : "Unknown User";
                const otherParticipantProfile = otherParticipantId
                  ? participantProfiles[otherParticipantId]
                  : null;

                return (
                  <div
                    key={conversation.id}
                    onClick={() => setActiveConversation(conversation.id)}
                    className={`p-4 border-b border-gray-200 cursor-pointer hover:bg-gray-50 ${
                      activeConversation === conversation.id
                        ? "bg-gray-100"
                        : ""
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex-shrink-0">
                        <img
                          src={
                            otherParticipantProfile?.profileImageUrl ||
                            DEFAULT_AVATAR
                          }
                          alt={otherParticipantName}
                          onError={handleImageError}
                          className="w-10 h-10 rounded-full object-cover bg-gray-100"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex justify-between items-start mb-1">
                          <h3 className="font-medium truncate">
                            {otherParticipantName}
                          </h3>
                          {conversation.unreadCount > 0 && (
                            <span className="bg-black text-white text-xs px-2 py-1 rounded-full">
                              {conversation.unreadCount}
                            </span>
                          )}
                        </div>
                        {conversation.lastMessage && (
                          <p className="text-sm text-gray-500 truncate">
                            {conversation.lastMessage.content}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {conversation.lastMessage?.timestamp.toLocaleString()}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Messages Area */}
        <div className="flex-1 flex flex-col">
          {activeConversation ? (
            <>
              {/* Messages */}
              <div
                ref={messagesContainerRef}
                className="flex-1 overflow-y-auto p-3"
              >
                <div className="space-y-3">
                  {messages.map((message) => {
                    const isCurrentUser = message.senderId === user?.id;
                    const senderName = isCurrentUser
                      ? user?.name || "You"
                      : participantNames[message.senderId] || "Loading...";
                    const senderProfile = isCurrentUser
                      ? user
                      : participantProfiles[message.senderId];

                    return (
                      <div
                        key={message.id}
                        className={`flex items-start gap-3 ${
                          isCurrentUser ? "flex-row-reverse" : "flex-row"
                        }`}
                      >
                        <div className="flex-shrink-0">
                          <img
                            src={
                              senderProfile?.profileImageUrl || DEFAULT_AVATAR
                            }
                            alt={senderName}
                            onError={handleImageError}
                            className="w-8 h-8 rounded-full object-cover bg-gray-100"
                          />
                        </div>
                        <div
                          className={`max-w-[70%] rounded-lg px-4 py-2 ${
                            isCurrentUser
                              ? "bg-black text-white"
                              : "bg-gray-100"
                          }`}
                        >
                          <p className="text-xs mb-1 opacity-75">
                            {senderName}
                          </p>
                          <p>{message.content}</p>
                          <p
                            className={`text-xs mt-1 ${
                              isCurrentUser ? "text-gray-300" : "text-gray-500"
                            }`}
                          >
                            {message.timestamp.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-3 border-t border-gray-200 flex-shrink-0">
                <form onSubmit={handleSendMessage} className="flex gap-2">
                  <input
                    type="text"
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-black"
                  />
                  <button
                    type="submit"
                    disabled={!newMessage.trim()}
                    className="px-6 py-2 bg-black text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    Send
                  </button>
                </form>
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
