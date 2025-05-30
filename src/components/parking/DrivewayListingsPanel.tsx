import React, { useRef, useState } from "react";
import { ParkingSpot } from "../../types";
import { ParkingSpotCard } from "./ParkingSpotCard";

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
  const PEEK_HEIGHT = 150; // px
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
    setDragging(true);
    setDragStartY(e.clientY);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
  };

  const handlePointerMove = (e: PointerEvent) => {
    if (dragStartY !== null) {
      setDragDelta(e.clientY - dragStartY);
    }
  };

  const handlePointerUp = () => {
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

  return (
    <div className="lg:hidden">
      <div
        ref={panelRef}
        className={`fixed bottom-0 left-0 w-full bg-white rounded-t-2xl shadow-lg z-30 transition-transform duration-300 ease-in-out select-none overflow-y-auto`}
        style={{
          maxHeight: PANEL_MAX_HEIGHT,
          height: PANEL_MAX_HEIGHT,
          transform: `translateY(${translateY}px)`,
          touchAction: "none",
        }}
      >
        {/* Sticky handle and header */}
        <div className="sticky top-0 z-10 bg-white border-b border-primary-100">
          <div
            className="flex flex-col items-center cursor-pointer py-2"
            style={{ userSelect: "none" }}
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
              <p className="text-center text-gray-600">
                No parking spots available for this event
              </p>
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
