import React, { useEffect, useState } from "react";
import ConversationsList from "./ConversationsList";
import { Conversation } from "../../services";
import { User } from "../../types";

interface ConversationsDrawerProps {
  open: boolean;
  onClose: () => void;
  conversations: Conversation[];
  activeConversation: string | null;
  setActiveConversation: (id: string) => void;
  participantNames: { [key: string]: string };
  participantProfiles: { [key: string]: User };
  user: User | null;
}

const ConversationsDrawer: React.FC<ConversationsDrawerProps> = ({
  open,
  onClose,
  conversations,
  activeConversation,
  setActiveConversation,
  participantNames,
  participantProfiles,
  user,
}) => {
  const [drawerVisible, setDrawerVisible] = useState(false);
  const [showDrawer, setShowDrawer] = useState(false);

  // Open drawer: when open becomes true
  useEffect(() => {
    if (open) {
      setDrawerVisible(true);
      setShowDrawer(false);
    }
  }, [open]);

  // Animate in
  useEffect(() => {
    if (drawerVisible) {
      const timeout = setTimeout(() => setShowDrawer(true), 10);
      return () => clearTimeout(timeout);
    }
  }, [drawerVisible]);

  // Animate out
  useEffect(() => {
    if (!showDrawer && drawerVisible) {
      const timeout = setTimeout(() => setDrawerVisible(false), 300);
      return () => clearTimeout(timeout);
    }
  }, [showDrawer, drawerVisible]);

  // Handle close
  const handleClose = () => {
    setShowDrawer(false);
    if (onClose) onClose();
  };

  // When a conversation is selected, close the drawer and call setActiveConversation
  const handleSetActiveConversation = (id: string) => {
    setActiveConversation(id);
    handleClose();
  };

  if (!drawerVisible) return null;

  return (
    <div className="absolute inset-0 z-40 flex md:hidden">
      {/* Overlay */}
      <div
        className={`absolute inset-0 bg-black transition-opacity duration-300 ${
          showDrawer ? "bg-opacity-40" : "bg-opacity-0"
        }`}
        onClick={handleClose}
        aria-label="Close conversations drawer"
      />
      {/* Drawer Panel */}
      <div
        className={`relative w-4/5 max-w-xs h-full bg-white shadow-xl flex flex-col transition-transform duration-300 ease-in-out transform ${
          showDrawer ? "translate-x-0" : "-translate-x-full"
        } rounded-r-lg`}
      >
        <div className="p-3 border-b border-gray-200 flex items-center justify-between">
          <h2 className="text-lg font-semibold">Conversations</h2>
          <button
            onClick={handleClose}
            className="p-2 rounded-full hover:bg-gray-100 focus:outline-none focus:ring-2 focus:ring-black"
            aria-label="Close drawer"
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
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>
        <ConversationsList
          conversations={conversations}
          activeConversation={activeConversation}
          setActiveConversation={handleSetActiveConversation}
          participantNames={participantNames}
          participantProfiles={participantProfiles}
          user={user}
        />
      </div>
    </div>
  );
};

export default ConversationsDrawer;
