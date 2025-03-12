import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

interface ParkingSpot {
  eventId: string;
  address: string;
  description: string;
  price: number;
  images: string[];
  availability: {
    start: string;
    end: string;
  };
  amenities: string[];
  coordinates: {
    lat: number;
    lng: number;
  };
  createdAt: string;
}

const slcEvents = [
  {
    title: "Utah Jazz vs Golden State Warriors",
    description: "NBA Regular Season Game",
    status: "upcoming",
    startDate: new Date("2024-04-30T19:00:00").toISOString(),
    endDate: new Date("2024-04-30T22:00:00").toISOString(),
    location: {
      address: "Delta Center, 301 S Temple, Salt Lake City, UT",
      coordinates: { lat: 40.7683, lng: -111.9011 }
    },
    expectedAttendance: 18000,
    imageUrl: "https://placehold.co/600x400",
    createdAt: new Date().toISOString()
  },
  {
    title: "Real Salt Lake vs LA Galaxy",
    description: "MLS Soccer Match",
    status: "upcoming",
    startDate: new Date("2024-05-15T19:30:00").toISOString(),
    endDate: new Date("2024-05-15T21:30:00").toISOString(),
    location: {
      address: "America First Field, 9256 State St, Sandy, UT",
      coordinates: { lat: 40.5827, lng: -111.8930 }
    },
    expectedAttendance: 20000,
    imageUrl: "https://placehold.co/600x400",
    createdAt: new Date().toISOString()
  },
  {
    title: "Red Hot Chili Peppers Concert",
    description: "Global Stadium Tour 2024",
    status: "upcoming",
    startDate: new Date("2024-05-25T19:00:00").toISOString(),
    endDate: new Date("2024-05-25T23:00:00").toISOString(),
    location: {
      address: "Rice-Eccles Stadium, 451 1400 E, Salt Lake City, UT",
      coordinates: { lat: 40.7504, lng: -111.8486 }
    },
    expectedAttendance: 45000,
    imageUrl: "https://placehold.co/600x400",
    createdAt: new Date().toISOString()
  }
];

const createParkingSpots = (eventId: string, eventLocation: { lat: number, lng: number }): ParkingSpot[] => {
  // Create spots within 0.5 mile radius with slight coordinate variations
  const spots: ParkingSpot[] = [];
  const latVariations = [-0.002, -0.001, 0.001, 0.002];
  const lngVariations = [-0.002, -0.001, 0.001, 0.002];
  
  latVariations.forEach((latVar) => {
    lngVariations.forEach((lngVar) => {
      if (Math.random() > 0.5) { // Randomly select about half of possible spots
        spots.push({
          eventId,
          address: `${Math.floor(Math.random() * 1000)} ${['Park', 'Main', 'State', 'Temple', 'Highland'][Math.floor(Math.random() * 5)]} St`,
          description: [
            "Private driveway, easy access to venue",
            "Covered garage parking, well-lit",
            "Spacious driveway with security camera",
            "Private spot with direct path to venue"
          ][Math.floor(Math.random() * 4)],
          price: Math.floor(Math.random() * 30) + 20, // Random price between 20-50
          images: ["https://placehold.co/600x400"],
          availability: {
            start: new Date().toISOString(),
            end: new Date(Date.now() + 86400000).toISOString() // 24 hours from now
          },
          amenities: ["Security Camera", "Well Lit", "Easy Access"],
          coordinates: {
            lat: eventLocation.lat + latVar,
            lng: eventLocation.lng + lngVar
          },
          createdAt: new Date().toISOString()
        });
      }
    });
  });
  
  return spots;
};

async function addSLCData() {
  try {
    console.log("Adding SLC events and parking spots...");
    
    // Add events
    for (const event of slcEvents) {
      const eventDoc = await addDoc(collection(db, "events"), event);
      console.log(`Added event: ${event.title} with ID: ${eventDoc.id}`);
      
      // Add parking spots for this event
      const parkingSpots = createParkingSpots(eventDoc.id, event.location.coordinates);
      for (const spot of parkingSpots) {
        const spotDoc = await addDoc(collection(db, "parkingSpots"), spot);
        console.log(`Added parking spot: ${spot.address} with ID: ${spotDoc.id}`);
      }
    }
    
    console.log("Successfully added all SLC data!");
  } catch (error) {
    console.error("Error adding SLC data:", error);
  }
}

// Execute the function
addSLCData(); 