import React, { useRef, useState, useEffect } from "react";
import { ParkingSpot } from "../../types";
import { ParkingSpotCard } from "./ParkingSpotCard";
import { addEventNotificationEmail } from "../../services/events/eventNotificationService";

interface DrivewayListingsPanelProps {
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot) => void;
  onSpotBook: (spot: ParkingSpot) => void;
  isOpen: boolean;
  onToggle: () => void;
}

export const DrivewayListingsPanel: React.FC<DrivewayListingsPanelProps> = ({
  spots,
  selectedSpot,
  onSpotSelect,
  onSpotBook,
  isOpen,
  onToggle,
}) => {
  // Drag state
  const panelRef = useRef<HTMLDivElement>(null);
  const [dragStartY, setDragStartY] = useState<number | null>(null);
  const [dragDelta, setDragDelta] = useState(0);
  const [dragging, setDragging] = useState(false);

  // Panel heights
  const PEEK_HEIGHT = 100; // px
  const PANEL_MAX_HEIGHT = 0.8 * window.innerHeight; // 80vh

  // Calculate translateY for drag
  const closedY = PANEL_MAX_HEIGHT - PEEK_HEIGHT;
  const openY = 0;
  let translateY = isOpen ? openY : closedY;
  if (dragging && dragDelta > 0) {
    translateY = Math.min(
      closedY,
      Math.max(openY, isOpen ? dragDelta : closedY + dragDelta)
    );
  } else if (dragging && dragDelta < 0) {
    translateY = Math.max(
      openY,
      Math.min(closedY, isOpen ? dragDelta : closedY + dragDelta)
    );
  }

  // Drag handlers
  const handlePointerDown = (e: React.PointerEvent) => {
    console.log("Pointer down", e.type, e.clientY);
    setDragging(true);
    setDragStartY(e.clientY);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (dragStartY !== null) {
      console.log(
        "Pointer move",
        e.type,
        e.clientY,
        "Delta:",
        e.clientY - dragStartY
      );
      setDragDelta(e.clientY - dragStartY);
    }
  };

  const handlePointerUp = () => {
    console.log("Pointer up");
    setDragging(false);
    if (Math.abs(dragDelta) > 60) {
      // If dragged more than 60px, toggle
      onToggle();
    }
    setDragStartY(null);
    setDragDelta(0);
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
  };

  // Click/tap on handle toggles
  const handleHandleClick = () => {
    if (!dragging) onToggle();
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
      // Use the first spot's eventId if available, otherwise fallback to a placeholder
      const eventId = spots[0]?.eventId || "unknownEvent";
      await addEventNotificationEmail(eventId, email);
      setSuccess("You'll be notified when more spots are available!");
      setEmail("");
    } catch (e) {
      setError("There was a problem signing up. Please try again later.");
    } finally {
      setLoading(false);
    }
  };

  // Prevent background scroll when panel is open or dragging
  useEffect(() => {
    if (isOpen || dragging) {
      document.body.classList.add("overflow-hidden");
    } else {
      document.body.classList.remove("overflow-hidden");
    }
    return () => {
      document.body.classList.remove("overflow-hidden");
    };
  }, [isOpen, dragging]);

  return (
    <div className="lg:hidden">
      <div
        ref={panelRef}
        className={`fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg z-30 transition-transform duration-300 ease-in-out select-none overflow-y-auto`}
        style={{
          maxHeight: PANEL_MAX_HEIGHT,
          height: PANEL_MAX_HEIGHT,
          transform: `translateY(${translateY}px)`,
        }}
      >
        {/* Sticky handle and header */}
        <div className="sticky top-0 z-10 bg-white border-b border-primary-100">
          <div
            className="flex flex-col items-center cursor-pointer py-2"
            style={{ userSelect: "none", touchAction: "none" }}
            onPointerDown={handlePointerDown}
            onClick={handleHandleClick}
          >
            <div className="w-10 h-1.5 rounded-full bg-primary-200 mb-1" />
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
                  <input
                    type="email"
                    placeholder="Enter your email"
                    className="w-full border border-gray-300 rounded-md px-4 pr-32 py-2 focus:outline-none focus:ring-2 focus:ring-primary-300"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={loading}
                  />
                  <button
                    className="absolute top-1/2 right-0 -translate-y-1/2 px-4 py-2 bg-primary-600 text-white rounded-md font-semibold disabled:opacity-50"
                    onClick={handleNotifyMe}
                    disabled={loading || !email}
                    style={{ minWidth: 100 }}
                  >
                    {loading ? "Submitting..." : "Notify Me"}
                  </button>
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
