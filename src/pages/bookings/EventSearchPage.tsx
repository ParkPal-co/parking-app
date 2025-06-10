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
import { CheckIcon } from "@heroicons/react/24/outline";
import iconPinsImg from "../../assets/images/IconPins.png";
import LogoOverHouse from "../../assets/images/LogoOverHouse.png";

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
    <div className="relative overflow-x-hidden">
      <FloatingQuotesBackground />
      {/* Main content overlay */}
      <div className="w-full px-4 relative z-10 flex flex-col gap-4 items-center">
        {/* Search Section */}
        <section className="h-[calc(100dvh-120px)] flex flex-col justify-center max-w-4xl w-full">
          <h1 className="text-4xl font-bold text-center mb-8 text-gray-900 animate-fade-in-from-top [animation-fill-mode:forwards] lg:text-6xl">
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
        </section>
        {/* Renting Hero Section */}
        <section className="flex flex-col lg:flex-row lg:px-16 lg:gap-8 w-full">
          <Card
            className="h-full w-full flex flex-col gap-4 lg:flex-row lg:h-[calc(100dvh-320px)] animate-fade-in-from-top opacity-0 [animation-fill-mode:forwards]"
            style={{ animationDelay: "1s" }}
            padding="normal"
            shadow="large"
          >
            <div className="lg:w-1/2 h-full flex flex-col">
              <h1 className="text-5xl lg:text-6xl font-bold mb-4 text-gray-900">
                Skip the walk
              </h1>
              <p className="text-xl lg:text-2xl text-primary-700 font-bold">
                Book a neighbor's driveway as event parking
              </p>
              <Card
                className="flex-1 w-full bg-primary-50 border border-primary-200 rounded-lg p-4 mt-4 flex flex-col justify-center"
                padding="large"
              >
                <ul className="flex flex-col lg:gap-4">
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-6 h-6" />
                    <span>No walk-ups, no waiting</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-6 h-6" />
                    <span>Book ahead of time</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-6 h-6" />
                    <span>Payments are secure</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckIcon className="w-6 h-6" />
                    <span>Support the community</span>
                  </li>
                </ul>
                <Button
                  type="button"
                  onClick={() => navigate("/events")}
                  variant="primary"
                  size="large"
                  className="mt-4 lg:mt-4 lg:w-1/2"
                >
                  Find a driveway
                </Button>
              </Card>
            </div>
            <div className="max-h-[calc(100dvh-360px)] lg:w-1/2 rounded-2xl overflow-hidden border border-primary-300">
              <img
                src={iconPinsImg}
                alt="Event Search Page Hero"
                className="w-full h-full object-cover"
                style={{ filter: "brightness(1.1) saturate(.5)" }}
              />
            </div>
          </Card>
          
        </section>
        {/* Hosting Hero Section */}
        <section className="w-full lg:px-16 min-h-[calc(100dvh-280px)] mt-4">
          <Card
            className="h-full w-full flex flex-col lg:items-center lg:flex-row-reverse animate-fade-in-from-top opacity-0 [animation-fill-mode:forwards] gap-4"
            style={{ animationDelay: "1s" }}
            padding="large"
            shadow="large">
            <div className="h-full w-full flex flex-col gap-2 text-center lg:text-right">
              <h1 className="text-4xl lg:text-6xl font-bold mb-4 text-gray-900">
                The <span className="font-black text-5xl lg:text-7xl">purest</span> form of passive income
              </h1>
              <p className="text-xl lg:text-2xl text-primary-700 font-bold">
                With a few simple clicks, post your driveway to the platform and start earning.
              </p>
            </div>
            <div className="flex flex-col items-center">
              <div className="aspect-square w-[min(100%,500px)] rounded-2xl overflow-hidden">
                <img
                  src={LogoOverHouse}
                  alt="Event Search Page Hero"
                  className="w-full h-full object-cover"
                  style={{ filter: "brightness(1.1) saturate(.5)" }}
                />
              </div>
              <Button
                type="button"
                onClick={() => navigate("/list")}
                variant="primary"
                size="large"
                className="mt-2 lg:mt-4 lg:w-1/2"
              >
                Host your driveway
              </Button>
            </div>
          </Card>
        </section>
      </div>
    </div>
  );
};

export default EventSearchPage;
