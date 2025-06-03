/**
 * src/pages/bookings/EventSearchPage.tsx
 * Landing page with a prominent search bar for finding events
 */

import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { Event } from "../../types";
import { FloatingQuotesBackground } from "../../components/background/FloatingQuotesBackground";
import { Input } from "../../components/ui/Input";
import { Button } from "../../components/ui/Button";
import { Card } from "../../components/ui/Card";

const EventSearchPage: React.FC = () => {
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
    <div className="h-min-[calc(100dvh-80px)] flex flex-col items-center justify-center relative overflow-hidden">
      <FloatingQuotesBackground />
      <div className="max-w-2xl w-full px-4 relative z-10 py-48 h-100dvh">
        <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 animate-fade-in-from-top [animation-fill-mode:forwards]">
          Where is your next event?
        </h1>

        <form
          onSubmit={handleSubmit}
          className="w-full relative opacity-0 animate-fade-in-from-top [animation-delay:0.2s] [animation-fill-mode:forwards]"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="relative">
            <Input
              type="text"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              onFocus={() => setShowResults(true)}
              placeholder="Search for events..."
              dsSize="xlarge"
              className="shadow-lg bg-white"
            />
            <Button
              type="submit"
              size="medium"
              variant="primary"
              className="absolute right-3 top-1/2 -translate-y-1/2"
              style={{ minWidth: 100 }}
            >
              Search
            </Button>
          </div>

          {showResults && filteredEvents.length > 0 && (
            <div
              className="absolute w-full max-h-72 overflow-y-auto z-10 mt-2"
              style={{
                WebkitMaskImage:
                  "linear-gradient(to bottom, black 66%, transparent 100%)",
                maskImage:
                  "linear-gradient(to bottom, black 66%, transparent 100%)",
              }}
            >
              {filteredEvents.map((event) => (
                <Card
                  key={event.id}
                  padding="small"
                  shadow="small"
                  border={true}
                  variant="interactive"
                  className="mb-2 last:mb-0 cursor-pointer p-2 lg:p-4"
                  onClick={() => handleEventSelect(event)}
                >
                  <h5 className="font-semibold text-primary-900">
                    {event.title}
                  </h5>
                  <p className="text-sm text-primary-600">
                    {event.location.address}
                  </p>
                  <p className="text-sm text-primary-500">
                    {new Date(event.startDate).toLocaleDateString()}
                  </p>
                </Card>
              ))}
            </div>
          )}

          <div className="text-center mt-4 opacity-0 animate-fade-in-from-top [animation-delay:0.4s] [animation-fill-mode:forwards]">
            <Button
              type="button"
              onClick={() => navigate("/events")}
              variant="secondary"
              size="small"
              className="font-medium shadow-md bg-white"
            >
              Upcoming Events
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EventSearchPage;
