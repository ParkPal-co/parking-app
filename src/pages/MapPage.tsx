import React, { useState, useEffect } from "react";
import {
  GoogleMap,
  LoadScript,
  Marker,
  InfoWindow,
} from "@react-google-maps/api";
import { collection, getDocs, query, where } from "firebase/firestore";
import { db } from "../firebase/config";
import { ParkingSpot } from "../types";

const MapPage: React.FC = () => {
  const [parkingSpots, setParkingSpots] = useState<ParkingSpot[]>([]);
  const [selectedSpot, setSelectedSpot] = useState<ParkingSpot | null>(null);
  const [mapCenter, setMapCenter] = useState({
    lat: 40.7608, // Default to SLC center
    lng: -111.891,
  });

  // Map container styles
  const containerStyle = {
    width: "100%",
    height: "100vh",
  };

  const mapContainerStyle = {
    width: "60%",
    height: "100vh",
    position: "fixed",
    right: 0,
    top: 0,
  } as const;

  const listContainerStyle = {
    width: "40%",
    height: "100vh",
    overflowY: "auto",
    padding: "20px",
    boxSizing: "border-box",
    backgroundColor: "#f5f5f5",
  } as const;

  // Fetch parking spots from Firestore
  useEffect(() => {
    const fetchParkingSpots = async () => {
      try {
        const spotsRef = collection(db, "parkingSpots");
        const spotsSnapshot = await getDocs(spotsRef);
        const spotsData = spotsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as ParkingSpot[];
        setParkingSpots(spotsData);
      } catch (error) {
        console.error("Error fetching parking spots:", error);
      }
    };

    fetchParkingSpots();
  }, []);

  const handleMarkerClick = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
  };

  const handleSpotClick = (spot: ParkingSpot) => {
    setSelectedSpot(spot);
    setMapCenter({
      lat: spot.coordinates.lat,
      lng: spot.coordinates.lng,
    });
  };

  return (
    <div style={{ display: "flex" }}>
      {/* List View */}
      <div style={listContainerStyle}>
        <h2>Available Parking Spots</h2>
        {parkingSpots.map((spot) => (
          <div
            key={spot.id}
            onClick={() => handleSpotClick(spot)}
            style={{
              padding: "15px",
              margin: "10px 0",
              backgroundColor: "white",
              borderRadius: "8px",
              cursor: "pointer",
              boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
              transition: "transform 0.2s",
              ":hover": {
                transform: "scale(1.02)",
              },
            }}
          >
            <h3 style={{ margin: "0 0 10px 0" }}>${spot.price}/day</h3>
            <p style={{ margin: "5px 0" }}>{spot.address}</p>
            <p style={{ margin: "5px 0", color: "#666" }}>{spot.description}</p>
            <div style={{ display: "flex", gap: "10px", marginTop: "10px" }}>
              {spot.amenities.map((amenity, index) => (
                <span
                  key={index}
                  style={{
                    backgroundColor: "#f0f0f0",
                    padding: "4px 8px",
                    borderRadius: "4px",
                    fontSize: "0.9em",
                  }}
                >
                  {amenity}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Map View */}
      <div style={mapContainerStyle}>
        <LoadScript
          googleMapsApiKey={process.env.REACT_APP_GOOGLE_MAPS_API_KEY || ""}
        >
          <GoogleMap
            mapContainerStyle={containerStyle}
            center={mapCenter}
            zoom={13}
          >
            {parkingSpots.map((spot) => (
              <Marker
                key={spot.id}
                position={{
                  lat: spot.coordinates.lat,
                  lng: spot.coordinates.lng,
                }}
                onClick={() => handleMarkerClick(spot)}
                label={{
                  text: `$${spot.price}`,
                  color: "white",
                  fontWeight: "bold",
                }}
              />
            ))}
            {selectedSpot && (
              <InfoWindow
                position={{
                  lat: selectedSpot.coordinates.lat,
                  lng: selectedSpot.coordinates.lng,
                }}
                onCloseClick={() => setSelectedSpot(null)}
              >
                <div>
                  <h3>${selectedSpot.price}/day</h3>
                  <p>{selectedSpot.address}</p>
                  <p>{selectedSpot.description}</p>
                  <button
                    onClick={() => {
                      // Navigate to confirmation page
                      window.location.href = `/confirm/${selectedSpot.id}`;
                    }}
                    style={{
                      backgroundColor: "#007AFF",
                      color: "white",
                      border: "none",
                      padding: "8px 16px",
                      borderRadius: "4px",
                      cursor: "pointer",
                    }}
                  >
                    Book Now
                  </button>
                </div>
              </InfoWindow>
            )}
          </GoogleMap>
        </LoadScript>
      </div>
    </div>
  );
};

export default MapPage;
