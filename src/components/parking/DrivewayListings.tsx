import React, { useState } from "react";
import { Card } from "../ui/Card";
import { ParkingSpotCard } from "./ParkingSpotCard";
import { Event, ParkingSpot } from "../../types";
import { Button } from "../ui/Button";
import { Input } from "../ui/Input";
import { addEventNotificationEmail } from "../../services/events/eventService";

interface DrivewayListingsProps {
  event: Event;
  spots: ParkingSpot[];
  selectedSpot: ParkingSpot | null;
  onSpotSelect: (spot: ParkingSpot | null) => void;
  onBookSpot: (spot: ParkingSpot) => void;
}

export const DrivewayListings: React.FC<DrivewayListingsProps> = ({
  event,
  spots,
  selectedSpot,
  onSpotSelect,
  onBookSpot,
}) => {
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

  return (
    <div className="hidden lg:block lg:w-1/2 lg:pl-8 lg:pr-4 lg:pb-8 lg:overflow-y-auto lg:max-h-screen">
      <Card className="mb-6 opacity-0 animate-fade-in-from-top [animation-fill-mode:forwards]">
        <h1 className="text-2xl font-bold mb-2">{event.title}</h1>
        <p className="text-primary-600">
          {new Date(event.startDate).toLocaleDateString()}
        </p>
        <p className="text-primary-600">{event.location.address}</p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {spots.length === 0 ? (
          <Card className="text-center py-8 col-span-2 opacity-0 animate-fade-in-from-top [animation-delay:0.2s] [animation-fill-mode:forwards]">
            <p className="text-primary-600">
              All driveways for this event have already been booked, but more
              will be added as the event approaches! We can let you know when
              more spots are available.
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
                disabled={loading || !email}
                style={{ minWidth: 100 }}
              >
                {loading ? "Submitting..." : "Notify Me"}
              </Button>
            </div>
            {success && <p className="text-green-600 mt-2">{success}</p>}
            {error && <p className="text-red-600 mt-2">{error}</p>}
          </Card>
        ) : (
          spots.map((spot, index) => (
            <div
              key={spot.id}
              className="opacity-0 animate-fade-in-from-top transition-normal hover:shadow-xl hover:scale-[1.02]"
              style={{
                animationDelay: `${0.2 + index * 0.1}s`,
                animationFillMode: "forwards",
              }}
            >
              <ParkingSpotCard
                spot={spot}
                isSelected={selectedSpot?.id === spot.id}
                onSelect={onSpotSelect}
                onBook={onBookSpot}
              />
            </div>
          ))
        )}
      </div>
    </div>
  );
};
