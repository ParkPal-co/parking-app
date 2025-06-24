import React from "react";
import { Message } from "../../services";
import { User } from "../../types";
import Avatar from "./Avatar";

interface MessageBubbleProps {
  message: Message;
  isCurrentUser: boolean;
  senderName: string;
  senderProfile?: User;
  avatarSize?: number;
}

const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isCurrentUser,
  senderName,
  senderProfile,
  avatarSize = 32,
}) => {
  return (
    <div
      className={`flex items-start gap-3 ${
        isCurrentUser ? "flex-row-reverse" : "flex-row"
      }`}
    >
      <div className="flex-shrink-0">
        <Avatar
          src={senderProfile?.profileImageUrl || ""}
          alt={senderName}
          size={avatarSize}
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
};

export default MessageBubble;
