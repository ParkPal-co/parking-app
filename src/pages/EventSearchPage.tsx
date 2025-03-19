/**
 * src/pages/EventSearchPage.tsx
 * Landing page with a prominent search bar for finding events
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { Event } from "../types";

export const EventSearchPage: React.FC = () => {
  const navigate = useNavigate();
  const { searchInput, setSearchInput, handleSearch, events } = useEvents();
  const [filteredEvents, setFilteredEvents] = useState<Event[]>([]);
  const [showResults, setShowResults] = useState(false);

  useEffect(() => {
    console.log("Events from useEvents:", events);
    if (searchInput.trim() && Array.isArray(events)) {
      const filtered = events.filter((event) => {
        if (!event) return false;

        const searchLower = searchInput.toLowerCase();
        return (
          event.title?.toLowerCase().includes(searchLower) ||
          event.location?.address?.toLowerCase().includes(searchLower)
        );
      });
      console.log("Filtered events:", filtered);
      setFilteredEvents(filtered || []);
      setShowResults(true);
    } else {
      setFilteredEvents([]);
      setShowResults(false);
    }
  }, [searchInput, events]);

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    console.log("Form submitted with search input:", searchInput);
    if (searchInput.trim()) {
      handleSearch();
      console.log("Navigating to events page");
      navigate(`/events?q=${encodeURIComponent(searchInput)}`);
    }
  };

  const handleEventSelect = (event: Event) => {
    console.log("Event selected:", event);
    if (event?.id) {
      console.log("Navigating to rent page with event ID:", event.id);
      navigate(`/rent?event=${event.id}`);
    }
  };

  const handleClickOutside = () => {
    setShowResults(false);
  };

  useEffect(() => {
    document.addEventListener("click", handleClickOutside);
    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
      <div className="max-w-2xl w-full px-4">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900">
          Where is your next event?
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full relative"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search for events..."
              className="w-full px-6 py-4 text-lg border-2 border-gray-300 rounded-lg focus:outline-none focus:border-black shadow-lg"
            />
            <button
              type="submit"
              className="absolute right-3 top-1/2 transform -translate-y-1/2 bg-black text-white px-6 py-2 rounded-md hover:bg-gray-800 transition-colors"
            >
              Search
            </button>
          </div>
          <div className="text-center mt-4">
            <button
              type="button"
              onClick={() => navigate("/events?nearby=true")}
              className="px-4 py-2 text-sm border border-gray-300 rounded-md hover:border-black hover:text-black transition-colors text-gray-600"
            >
              events near me
            </button>
          </div>

          {showResults && filteredEvents.length > 0 && (
            <div className="absolute w-full mt-1 bg-white rounded-lg shadow-xl border border-gray-200 max-h-96 overflow-y-auto z-10">
              {filteredEvents.map((event) => (
                <div
                  key={event.id}
                  onClick={() => handleEventSelect(event)}
                  className="px-6 py-4 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                >
                  <h3 className="font-semibold text-gray-900">{event.title}</h3>
                  <p className="text-sm text-gray-600">
                    {event.location.address}
                  </p>
                  <p className="text-sm text-gray-500">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          )}
        </form>
      </div>
    </div>
  );
};
