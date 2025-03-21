/**
 * src/pages/MessagesPage.tsx
 * Page component for user messaging
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { useMessages } from "../hooks/useMessages";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

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
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
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

  // Fetch participant names
  useEffect(() => {
    const fetchParticipantNames = async () => {
      const names: { [key: string]: string } = {};
      for (const conversation of conversations) {
        for (const participantId of conversation.participants) {
          if (!names[participantId] && participantId !== user?.id) {
            try {
              const userDoc = await getDoc(doc(db, "users", participantId));
              if (userDoc.exists()) {
                names[participantId] = userDoc.data().name || "Unknown User";
              }
            } catch (err) {
              console.error("Error fetching user name:", err);
              names[participantId] = "Unknown User";
            }
          }
        }
      }
      setParticipantNames(names);
    };

    if (conversations.length > 0) {
      fetchParticipantNames();
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
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="flex h-[calc(100vh-12rem)] bg-white rounded-lg shadow-lg overflow-hidden">
        {/* Conversations List */}
        <div className="w-1/3 border-r border-gray-200">
          <div className="p-4 border-b border-gray-200">
            <h1 className="text-xl font-semibold">Messages</h1>
          </div>
          <div className="overflow-y-auto h-full">
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
                    <div className="flex justify-between items-start mb-1">
                      <h3 className="font-medium">{otherParticipantName}</h3>
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
              <div className="flex-1 overflow-y-auto p-4">
                {messages.map((message) => {
                  const isCurrentUser = message.senderId === user?.id;
                  const senderName = isCurrentUser
                    ? user?.name || "You"
                    : participantNames[message.senderId] || "Loading...";

                  return (
                    <div
                      key={message.id}
                      className={`flex mb-4 ${
                        isCurrentUser ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`max-w-[70%] rounded-lg px-4 py-2 ${
                          isCurrentUser ? "bg-black text-white" : "bg-gray-100"
                        }`}
                      >
                        <p className="text-xs mb-1 opacity-75">{senderName}</p>
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
                <div ref={messagesEndRef} />
              </div>

              {/* Message Input */}
              <div className="p-4 border-t border-gray-200">
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
