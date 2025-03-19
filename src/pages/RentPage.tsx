import React, { useState, useEffect, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Event, ParkingSpot } from "../types";
import { useAuth } from "../hooks/useAuth";
import {
  GoogleMap,
  InfoWindow,
  useLoadScript,
  MarkerF,
} from "@react-google-maps/api";
import SignInPromptModal from "../components/auth/SignInPromptModal";

// Near the top of the file, add these lines
const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "";
const GOOGLE_MAPS_ID = "afe7d1d7d3545aa4";

if (!GOOGLE_MAPS_API_KEY) {
  console.error("Google Maps API key is missing! Check your .env file.");
}

// Function to calculate distance between two points using Haversine formula
function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number
): number {
  const R = 3959; // Earth's radius in miles (instead of 6371 km)
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((lat1 * Math.PI) / 180) *
      Math.cos((lat2 * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

// Function to safely convert a date value from Firestore
function convertToDate(dateValue: any): Date {
  if (!dateValue) return new Date();
  if (typeof dateValue === "string") return new Date(dateValue);
  if (dateValue.toDate && typeof dateValue.toDate === "function")
    return dateValue.toDate();
  return new Date();
}

const styles = `
  @keyframes fadeIn {
    from {
      opacity: 0;
      transform: translateY(-10px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  .animate-fade-in {
    animation: fadeIn 0.3s ease-out forwards;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.type = "text/css";
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const RentPage: React.FC = () => {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const eventQuery = searchParams.get("event");
  const [searchInput, setSearchInput] = useState(eventQuery || "");

  const [loading, setLoading] = useState(true);
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "map">("grid");

  // Location state
  const [userLocation, setUserLocation] = useState<{
    latitude: number;
    longitude: number;
  } | null>(null);
  const [locationError, setLocationError] = useState<string>("");
  const [isRequestingLocation, setIsRequestingLocation] = useState(false);

  const [isMapView, setIsMapView] = useState(false);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 40.7608, // Default to SLC center
    lng: -111.891,
  });

  const [isMapLoading, setIsMapLoading] = useState(false);

  // Add new state for map errors
  const [mapError, setMapError] = useState<string | null>(null);

  const [isSignInModalOpen, setIsSignInModalOpen] = useState(false);
  const [pendingSpotToBook, setPendingSpotToBook] =
    useState<ParkingSpot | null>(null);

  const navigate = useNavigate();

  const mapRef = useRef<google.maps.Map | null>(null);

  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: GOOGLE_MAPS_API_KEY,
  });

  // Request user's location
  const requestLocation = () => {
    setIsRequestingLocation(true);
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
          setLocationError("");
          setIsRequestingLocation(false);
        },
        (error) => {
          console.error("Error getting location:", error);
          setLocationError("Could not get your location. Please try again.");
          setIsRequestingLocation(false);
        }
      );
    } else {
      setLocationError("Geolocation is not supported by your browser");
      setIsRequestingLocation(false);
    }
  };

  // Fetch all upcoming events and sort by location if available
  useEffect(() => {
    const fetchEvents = async () => {
      try {
        console.log("Fetching events...");
        const eventsRef = collection(db, "events");
        const q = query(eventsRef);

        const querySnapshot = await getDocs(q);
        console.log("Query snapshot:", querySnapshot.size, "documents found");

        const eventResults: Event[] = [];
        const searchLower = eventQuery?.toLowerCase() || "";

        querySnapshot.forEach((doc) => {
          const eventData = doc.data();
          console.log("Event data from Firestore:", eventData);

          try {
            // Convert Firestore Timestamp to Date and ensure all required fields
            const event: Event = {
              id: doc.id,
              title: eventData.title || "Untitled Event",
              description: eventData.description || "",
              location: eventData.location || {
                address: "Location TBD",
                coordinates: null,
              },
              expectedAttendance: eventData.expectedAttendance || 0,
              status: eventData.status || "upcoming",
              startDate: convertToDate(eventData.startDate),
              endDate: convertToDate(eventData.endDate),
              createdAt: convertToDate(eventData.createdAt),
              imageUrl: eventData.imageUrl || "",
            };

            if (
              !eventQuery ||
              event.title.toLowerCase().includes(searchLower)
            ) {
              // Calculate distance if user location is available
              if (userLocation && event.location?.coordinates) {
                console.log("Calculating distance for event:", event.title);
                console.log("User location:", userLocation);
                console.log("Event coordinates:", event.location.coordinates);

                // Ensure coordinates exist and are numbers
                if (
                  typeof event.location.coordinates.lat === "number" &&
                  typeof event.location.coordinates.lng === "number"
                ) {
                  const distance = calculateDistance(
                    userLocation.latitude,
                    userLocation.longitude,
                    event.location.coordinates.lat,
                    event.location.coordinates.lng
                  );
                  event.distance = Number(distance.toFixed(1)); // Round to 1 decimal place
                  console.log("Calculated distance:", event.distance);
                } else {
                  console.log(
                    "Invalid coordinates format:",
                    event.location.coordinates
                  );
                }
              }

              eventResults.push(event);
              console.log("Added event to results:", event);
            }
          } catch (err) {
            console.error("Error processing event document:", doc.id, err);
          }
        });

        console.log("Final event results:", eventResults);

        // Sort by distance if location is available, otherwise sort by date
        if (userLocation) {
          eventResults.sort(
            (a, b) => (a.distance || Infinity) - (b.distance || Infinity)
          );
        } else {
          eventResults.sort(
            (a, b) => a.startDate.getTime() - b.startDate.getTime()
          );
        }

        setEvents(eventResults);
      } catch (error) {
        console.error("Error fetching events:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [eventQuery, userLocation]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      setSearchParams({ event: searchInput.trim() });
    }
  };

  // Fetch parking spots when an event is selected
  useEffect(() => {
    const fetchParkingSpots = async () => {
      if (!selectedEvent) return;

      try {
        const spotsRef = collection(db, "parkingSpots");
        const q = query(spotsRef, where("eventId", "==", selectedEvent.id));

        const querySnapshot = await getDocs(q);
        const spotResults: ParkingSpot[] = [];
        const seenCoordinates = new Set<string>();

        querySnapshot.forEach((doc) => {
          const spotData = doc.data() as ParkingSpot;
          const coordKey = `${spotData.coordinates.lat},${spotData.coordinates.lng}`;

          // Only add the spot if we haven't seen these coordinates before
          if (!seenCoordinates.has(coordKey)) {
            seenCoordinates.add(coordKey);
            spotResults.push({ id: doc.id, ...spotData });
          } else {
            console.log(`Duplicate spot found at coordinates: ${coordKey}`);
          }
        });

        console.log(
          `Found ${querySnapshot.size} total spots, ${spotResults.length} unique spots`
        );
        setParkingSpots(spotResults);
      } catch (error) {
        console.error("Error fetching parking spots:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchParkingSpots();
  }, [selectedEvent]);

  const handleEventSelect = async (event: Event) => {
    setSelectedEvent(event);
    setMapCenter({
      lat: event.location.coordinates.lat,
      lng: event.location.coordinates.lng,
    });
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setMapCenter({
      lat: spot.coordinates.lat,
      lng: spot.coordinates.lng,
    });
  };

  // Map container styles
  const mapContainerStyle = {
    width: "100%",
    height: "calc(100vh - 200px)", // Adjust height to fill the viewport
    borderRadius: "12px",
  };

  const handleBookSpot = (spot: ParkingSpot) => {
    if (!user) {
      setPendingSpotToBook(spot);
      setIsSignInModalOpen(true);
      return;
    }

    // If user is signed in, proceed with booking
    navigate(`/confirm/${spot.id}`);
  };

  const handleSignInConfirm = () => {
    setIsSignInModalOpen(false);
    const spotId = pendingSpotToBook?.id;
    if (spotId) {
      sessionStorage.setItem("returnTo", `/confirm/${spotId}`);
    }
    navigate("/login");
  };

  const renderParkingSpotCard = (spot: ParkingSpot) => (
    <div
      key={spot.id}
      className="bg-white rounded-lg shadow-md overflow-hidden"
    >
      <img
        src={spot.images[0]}
        alt={spot.address}
        className="w-full h-48 object-cover"
      />
      <div className="p-4">
        <h3 className="text-lg font-semibold">{spot.address}</h3>
        <p className="text-gray-600">{spot.description}</p>
        <div className="mt-4 flex justify-between items-center">
          <span className="text-2xl font-bold">${spot.price}</span>
          <button
            onClick={(e) => {
              e.stopPropagation();
              handleBookSpot(spot);
            }}
            className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800"
          >
            Book Now
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header Section */}
      {!selectedEvent && (
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-6">
            Find Parking Near Your Event
          </h1>

          <div className="max-w-4xl mx-auto">
            {/* Location Permission */}
            {!userLocation && !locationError && (
              <div className="mb-6 p-4 bg-blue-50 rounded-lg text-center">
                <p className="text-blue-800 mb-2">
                  See events happening near you!
                </p>
                <button
                  onClick={requestLocation}
                  disabled={isRequestingLocation}
                  className="px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
                >
                  {isRequestingLocation ? (
                    "Getting location..."
                  ) : (
                    <>
                      <span className="mr-2">📍</span>
                      Show Nearby Events
                    </>
                  )}
                </button>
              </div>
            )}

            {/* Location Error */}
            {locationError && (
              <div className="mb-6 p-4 bg-red-50 rounded-lg text-center">
                <p className="text-red-800">{locationError}</p>
                <button
                  onClick={requestLocation}
                  className="mt-2 text-red-600 hover:text-red-800"
                >
                  Try again
                </button>
              </div>
            )}

            {/* Search Form */}
            <form onSubmit={handleSearch} className="mb-8">
              <div className="flex gap-4">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
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

            {/* Location Status */}
            {userLocation && (
              <div className="mb-6 p-4 bg-green-50 rounded-lg text-center">
                <p className="text-green-800">
                  📍 Showing events near your location
                  <button
                    onClick={() => setUserLocation(null)}
                    className="ml-4 text-green-600 hover:text-green-800 underline"
                  >
                    Clear location
                  </button>
                </p>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-8">
          <p>Loading events...</p>
        </div>
      )}

      {/* No Results Message */}
      {!loading && events.length === 0 && (
        <div className="text-center py-8">
          <p className="text-gray-600">
            {eventQuery
              ? `No events found matching "${eventQuery}"`
              : "No upcoming events found"}
          </p>
        </div>
      )}

      {/* Event Results */}
      {!loading && events.length > 0 && !selectedEvent && (
        <div className="mb-8">
          <h2 className="text-2xl font-bold mb-4">
            {eventQuery
              ? `Search Results${userLocation ? " Near You" : ""}`
              : userLocation
              ? "Upcoming Events Near You"
              : "Upcoming Events"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {events.map((event) => (
              <div
                key={event.id}
                className="bg-white p-4 rounded-lg shadow cursor-pointer hover:shadow-md transition-shadow"
                onClick={() => handleEventSelect(event)}
              >
                <h3 className="font-semibold">{event.title}</h3>
                <p className="text-gray-600">{event.location.address}</p>
                <p className="text-sm text-gray-500">
                  {new Date(event.startDate).toLocaleDateString()}
                </p>
                {typeof event.distance === "number" && (
                  <p className="text-sm text-blue-600 mt-2">
                    {event.distance.toFixed(1)} mi away
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Selected Event and Parking Spots */}
      {selectedEvent && (
        <>
          <div className="mb-8">
            <button
              onClick={() => setSelectedEvent(null)}
              className="mb-4 text-gray-600 hover:text-black"
            >
              ← Back to events
            </button>
            <h1 className="text-3xl font-bold">{selectedEvent.title}</h1>
            <p className="text-gray-600">{selectedEvent.location.address}</p>
            {typeof selectedEvent.distance === "number" && (
              <p className="text-blue-600 mt-2">
                {selectedEvent.distance.toFixed(1)} mi away
              </p>
            )}
          </div>

          <div className="flex gap-6">
            {/* Left side - Grid View */}
            <div
              className="w-1/2 overflow-y-auto"
              style={{ maxHeight: "calc(100vh - 200px)" }}
            >
              <h2 className="text-2xl font-semibold mb-6">
                Available Parking Spots
              </h2>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {parkingSpots.map(renderParkingSpotCard)}
              </div>
            </div>

            {/* Right side - Map View */}
            <div className="w-1/2">
              {loadError && (
                <div className="h-[600px] flex items-center justify-center bg-red-50 rounded-lg">
                  <p className="text-red-600">
                    Error loading Google Maps: {loadError.message}
                  </p>
                </div>
              )}

              {!isLoaded ? (
                <div className="h-[600px] flex items-center justify-center bg-gray-50 rounded-lg">
                  <p className="text-gray-600">Loading map...</p>
                </div>
              ) : (
                <GoogleMap
                  mapContainerStyle={mapContainerStyle}
                  center={mapCenter}
                  zoom={14}
                  options={{
                    mapId: GOOGLE_MAPS_ID,
                    mapTypeId: "satellite",
                    disableDefaultUI: true,
                    zoomControl: true,
                    fullscreenControl: true,
                    styles: [
                      {
                        featureType: "all",
                        elementType: "labels",
                        stylers: [{ visibility: "off" }],
                      },
                      {
                        featureType: "poi",
                        stylers: [{ visibility: "off" }],
                      },
                      {
                        featureType: "transit",
                        stylers: [{ visibility: "off" }],
                      },
                    ],
                  }}
                  onLoad={(map) => {
                    console.log("Map loaded successfully");
                    console.log("Map center:", mapCenter);
                    mapRef.current = map;
                    setIsMapLoading(false);
                  }}
                >
                  {/* Event Marker */}
                  {selectedEvent?.location?.coordinates && (
                    <MarkerF
                      position={{
                        lat: selectedEvent.location.coordinates.lat,
                        lng: selectedEvent.location.coordinates.lng,
                      }}
                      label={{
                        text: "Event",
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                        className: "marker-label",
                      }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: "#000000",
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                        scale: 24,
                      }}
                    />
                  )}

                  {/* Parking Spot Markers */}
                  {parkingSpots.map((spot) => (
                    <MarkerF
                      key={spot.id}
                      position={{
                        lat: spot.coordinates.lat,
                        lng: spot.coordinates.lng,
                      }}
                      onClick={() => handleSpotClick(spot)}
                      label={{
                        text: `$${spot.price}`,
                        color: "white",
                        fontWeight: "bold",
                        fontSize: "14px",
                        className: "marker-label",
                      }}
                      icon={{
                        path: window.google.maps.SymbolPath.CIRCLE,
                        fillColor: "#000000",
                        fillOpacity: 1,
                        strokeColor: "#FFFFFF",
                        strokeWeight: 2,
                        scale: 20,
                      }}
                    />
                  ))}

                  {/* Info Window */}
                  {selectedSpot && (
                    <InfoWindow
                      position={{
                        lat: selectedSpot.coordinates.lat,
                        lng: selectedSpot.coordinates.lng,
                      }}
                      onCloseClick={() => setSelectedSpot(null)}
                      options={{
                        pixelOffset: new google.maps.Size(0, -20),
                      }}
                    >
                      <div
                        className="p-2 animate-fade-in"
                        style={{ maxWidth: "300px" }}
                      >
                        <div className="mb-3">
                          <img
                            src={selectedSpot.images[0]}
                            alt={selectedSpot.address}
                            className="w-full h-40 object-cover rounded-md"
                          />
                        </div>
                        <h3 className="font-bold text-xl mb-2">
                          ${selectedSpot.price}/day
                        </h3>
                        <p className="font-medium mb-1">
                          {selectedSpot.address}
                        </p>
                        <p className="text-gray-600 text-sm mb-3">
                          {selectedSpot.description}
                        </p>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleBookSpot(selectedSpot);
                          }}
                          className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 transition-colors duration-200 w-full"
                        >
                          Book Now
                        </button>
                      </div>
                    </InfoWindow>
                  )}
                </GoogleMap>
              )}
            </div>
          </div>
        </>
      )}

      <SignInPromptModal
        isOpen={isSignInModalOpen}
        onClose={() => {
          setIsSignInModalOpen(false);
          setPendingSpotToBook(null);
        }}
        onSignIn={handleSignInConfirm}
      />
    </div>
  );
};

export default RentPage;
