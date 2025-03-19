/**
 * src/pages/MessagesPage.tsx
 * Page component for user messaging
 */

import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, query, where, orderBy, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";

interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  senderName: string;
  receiverName: string;
  content: string;
  timestamp: Date;
  read: boolean;
}

export const MessagesPage: React.FC = () => {
  const { user } = useAuth();
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMessages = async () => {
      if (!user) return;

      try {
        setLoading(true);
        const messagesRef = collection(db, "messages");
        const q = query(
          messagesRef,
          where("receiverId", "==", user.id),
          orderBy("timestamp", "desc")
        );
        const querySnapshot = await getDocs(q);

        const messagesData: Message[] = [];
        querySnapshot.forEach((doc) => {
          const data = doc.data();
          messagesData.push({
            id: doc.id,
            ...data,
            timestamp: data.timestamp.toDate(),
          } as Message);
        });

        setMessages(messagesData);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError("Failed to load messages");
      } finally {
        setLoading(false);
      }
    };

    fetchMessages();
  }, [user]);

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
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Messages</h1>

      {messages.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-gray-600">No messages yet.</p>
        </div>
      ) : (
        <div className="grid gap-4">
          {messages.map((message) => (
            <div
              key={message.id}
              className={`bg-white rounded-lg shadow-md p-6 ${
                !message.read ? "border-l-4 border-black" : ""
              }`}
            >
              <div className="flex justify-between items-start mb-4">
                <div>
                  <h2 className="text-lg font-semibold">
                    From: {message.senderName}
                  </h2>
                  <p className="text-gray-500 text-sm">
                    {message.timestamp.toLocaleString()}
                  </p>
                </div>
                {!message.read && (
                  <span className="bg-black text-white text-xs px-2 py-1 rounded">
                    New
                  </span>
                )}
              </div>
              <p className="text-gray-700">{message.content}</p>
              <div className="mt-4 flex justify-end">
                <button className="text-black hover:text-gray-700 text-sm font-medium">
                  Reply
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
