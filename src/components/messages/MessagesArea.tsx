import React, { useRef, useEffect } from "react";
import { Message } from "../../services/messageService";
import { User } from "../../types";
import Avatar from "./Avatar";

interface MessagesAreaProps {
  messages: Message[];
  user: User | null;
  participantNames: { [key: string]: string };
  participantProfiles: { [key: string]: User };
}

const MessagesArea: React.FC<MessagesAreaProps> = ({
  messages,
  user,
  participantNames,
  participantProfiles,
}) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const messagesContainerRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of messages
  useEffect(() => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
    }
  }, [messages]);

  return (
    <div ref={messagesContainerRef} className="flex-1 overflow-y-auto p-3">
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
                <Avatar
                  src={senderProfile?.profileImageUrl || ""}
                  alt={senderName}
                  size={32}
                />
              </div>
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
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesArea;
