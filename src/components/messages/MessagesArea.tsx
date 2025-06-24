import React, { useRef, useEffect } from "react";
import { Message } from "../../services/messages/messageService";
import { User } from "../../types";
import MessageBubble from "./MessageBubble";

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
            <MessageBubble
              key={message.id}
              message={message}
              isCurrentUser={isCurrentUser}
              senderName={senderName}
              senderProfile={senderProfile}
            />
          );
        })}
      </div>
      <div ref={messagesEndRef} />
    </div>
  );
};

export default MessagesArea;
