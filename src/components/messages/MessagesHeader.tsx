import React from "react";

interface MessagesHeaderProps {
  onOpenDrawer: () => void;
  title?: string;
}

const MessagesHeader: React.FC<MessagesHeaderProps> = ({
  onOpenDrawer,
  title = "Messages",
}) => {
  return (
    <div className="md:hidden flex items-center justify-between p-3 border-b border-gray-200 bg-white z-10">
      <button
        onClick={onOpenDrawer}
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
      <h1 className="text-lg font-semibold">{title}</h1>
      <div className="w-10" /> {/* Spacer for alignment */}
    </div>
  );
};

export default MessagesHeader;
