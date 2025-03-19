/**
 * src/components/events/EventSearch.tsx
 * Reusable component for event search functionality
 */

import React from "react";

interface EventSearchProps {
  searchInput: string;
  onSearchInputChange: (value: string) => void;
  onSubmit: (e: React.FormEvent) => void;
}

export const EventSearch: React.FC<EventSearchProps> = ({
  searchInput,
  onSearchInputChange,
  onSubmit,
}) => {
  return (
    <form onSubmit={onSubmit} className="mb-8">
      <div className="flex gap-4">
        <input
          type="text"
          value={searchInput}
          onChange={(e) => onSearchInputChange(e.target.value)}
          placeholder="Search for a specific event..."
          className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black"
        />
        <button
          type="submit"
          className="px-6 py-2 bg-black text-white rounded-md hover:bg-gray-800"
        >
          Search
        </button>
      </div>
    </form>
  );
};
