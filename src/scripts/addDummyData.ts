import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config';

const dummyEvents = [
  {
    title: "Taylor Swift Concert",
    status: "upcoming",
    startDate: new Date("2024-05-15").toISOString(),
    location: {
      address: "Levi's Stadium, Santa Clara, CA",
      coordinates: { lat: 37.4032, lng: -121.9698 }
    }
  },
  {
    title: "SF Giants vs LA Dodgers",
    status: "upcoming",
    startDate: new Date("2024-04-20").toISOString(),
    location: {
      address: "Oracle Park, San Francisco, CA",
      coordinates: { lat: 37.7786, lng: -122.3893 }
    }
  },
  {
    title: "Warriors vs Lakers",
    status: "upcoming",
    startDate: new Date("2024-04-25").toISOString(),
    location: {
      address: "Chase Center, San Francisco, CA",
      coordinates: { lat: 37.7681, lng: -122.3877 }
    }
  }
];

const createDummyParkingSpots = (eventId: string) => [
  {
    eventId,
    address: "123 Main St",
    description: "Private driveway, 2 minute walk to venue",
    price: 40,
    images: ["https://placehold.co/600x400"],
    coordinates: { lat: 37.7749, lng: -122.4194 }
  },
  {
    eventId,
    address: "456 Park Ave",
    description: "Garage parking, covered and secure",
    price: 55,
    images: ["https://placehold.co/600x400"],
    coordinates: { lat: 37.7749, lng: -122.4194 }
  }
];

async function addDummyData() {
  try {
    console.log("Adding dummy events...");
    
    // Add events
    for (const event of dummyEvents) {
      const eventDoc = await addDoc(collection(db, "events"), event);
      console.log(`Added event: ${event.title} with ID: ${eventDoc.id}`);
      
      // Add parking spots for this event
      const parkingSpots = createDummyParkingSpots(eventDoc.id);
      for (const spot of parkingSpots) {
        const spotDoc = await addDoc(collection(db, "parkingSpots"), spot);
        console.log(`Added parking spot: ${spot.address} with ID: ${spotDoc.id}`);
      }
    }
    
    console.log("Successfully added all dummy data!");
  } catch (error) {
    console.error("Error adding dummy data:", error);
  }
}

// Execute the function
addDummyData(); 