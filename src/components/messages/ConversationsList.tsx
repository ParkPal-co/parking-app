import React from "react";
import { Conversation } from "../../services/messages/messageService";
import { User } from "../../types";
import Avatar from "./Avatar";

interface ConversationsListProps {
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
  participantNames: { [key: string]: string };
  participantProfiles: { [key: string]: User };
  user: User | null;
}

const ConversationsList: React.FC<ConversationsListProps> = ({
  conversations,
  activeConversation,
  setActiveConversation,
  participantNames,
  participantProfiles,
  user,
}) => {
  if (conversations.length === 0) {
    return (
      <div className="p-4 text-center text-gray-500">No conversations yet</div>
    );
  }

  return (
    <div className="flex-1 overflow-y-auto">
      {conversations.map((conversation) => {
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
              activeConversation === conversation.id ? "bg-gray-100" : ""
            }`}
          >
            <div className="flex items-center gap-3">
              <div className="flex-shrink-0">
                <Avatar
                  src={otherParticipantProfile?.profileImageUrl || ""}
                  alt={otherParticipantName}
                  size={40}
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
      })}
    </div>
  );
};

export default ConversationsList;
