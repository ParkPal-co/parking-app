import React, { useState, useEffect } from "react";
import { Event, ParkingSpot } from "../../types";
import { ParkingSpotCard } from "./ParkingSpotCard";
import { addEventNotificationEmail } from "../../services/events/eventNotificationService";
import { Input } from "../ui/Input";
import { Button } from "../ui/Button";

interface DrivewayListingsPanelProps {
  event: Event;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot) => void;
  onSpotBook: (spot: ParkingSpot) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const DrivewayListingsPanel: React.FC<DrivewayListingsPanelProps> = ({
  event,
  spots,
  selectedSpot,
  onSpotSelect,
  onSpotBook,
  isOpen,
  onToggle,
}) => {
  // Panel heights
  const PEEK_HEIGHT = 100; // px
  const PANEL_MAX_HEIGHT = 0.8 * window.innerHeight; // 80vh

  // Remove drag calculations
  const closedY = PANEL_MAX_HEIGHT - PEEK_HEIGHT;
  const openY = 0;
  const translateY = isOpen ? openY : closedY;

  // Click/tap on handle toggles
  const handleHandleClick = () => {
    onToggle();
  };

  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState("");
  const [error, setError] = useState("");

  const handleNotifyMe = async () => {
    setLoading(true);
    setSuccess("");
    setError("");
    try {
      if (!email || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
        setError("Please enter a valid email address.");
        setLoading(false);
        return;
      }
      await addEventNotificationEmail(event.id, email);
      setSuccess("You'll be notified when more spots are available!");
      setEmail("");
    } catch (e) {
      setError("There was a problem signing up. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent background scroll when panel is open
  useEffect(() => {
    if (isOpen) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen]);

  return (
    <div className="lg:hidden">
      <div
        className={`fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow- z-50 transition-transform duration-300 ease-in-out select-none overflow-y-auto`}
        style={{
          maxHeight: PANEL_MAX_HEIGHT,
          height: PANEL_MAX_HEIGHT,
          transform: `translateY(${translateY}px)`,
          zIndex: 9999, // Ensure panel is above all other content
        }}
      >
        {/* Sticky handle and header */}
        <div className="sticky top-0 z-10 bg-white border-b border-primary-100">
          <div
            className="flex flex-col items-center cursor-pointer py-2"
            style={{ userSelect: "none" }}
            onClick={handleHandleClick}
          >
            <div
              className="bg-primary-200 rounded-full px-4 py-2 shadow-md flex items-center justify-center"
              style={{ minWidth: 48, minHeight: 32 }}
            >
              {isOpen ? (
                // Down arrow SVG
                <svg
                  width="32"
                  height="16"
                  viewBox="0 0 32 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M4 6L16 14L28 6"
                    stroke="#A0AEC0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              ) : (
                // Up arrow SVG
                <svg
                  width="32"
                  height="16"
                  viewBox="0 0 32 16"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M28 10L16 2L4 10"
                    stroke="#A0AEC0"
                    strokeWidth="3"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              )}
            </div>
          </div>
          <h2 className="text-xl font-bold mb-4 text-center">
            Available Spots
          </h2>
        </div>
        <div className="p-4 pt-0">
          <div className="grid grid-cols-1 gap-4">
            {spots.length === 0 ? (
              <div className="text-center text-gray-600">
                <p className="text-primary-600 pt-4">
                  It looks like all the driveways for this event have already
                  been booked, but more will be added as the event approaches!
                  We can let you know when more spots are available.
                </p>
                <div className="relative mt-4">
                  <Input
                    placeholder="Enter your email"
                    className="pr-32"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <Button
                    className="absolute top-1/2 right-0 -translate-y-1/2 px-4 py-2"
                    onClick={handleNotifyMe}
                    style={{ minWidth: 100 }}
                  >
                    {loading ? "Submitting..." : "Notify Me"}
                  </Button>
                </div>
                {success && <p className="text-green-600 mt-2">{success}</p>}
                {error && <p className="text-red-600 mt-2">{error}</p>}
              </div>
            ) : (
              spots.map((spot) => (
                <ParkingSpotCard
                  key={spot.id}
                  spot={spot}
                  isSelected={selectedSpot?.id === spot.id}
                  onSelect={onSpotSelect}
                  onBook={onSpotBook}
                />
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
