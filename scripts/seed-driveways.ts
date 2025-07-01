#!/usr/bin/env ts-node
/**
 * Script: seed-driveways.ts
 * Purpose: Seed test parking spots (driveways) in Firestore for staging.
 * Usage: npx ts-node scripts/seed-driveways.ts --count 10
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
 *   - .env with gcp_project_id set
 *
 * All spots created will have isTest: true for easy cleanup.
 * This script will NEVER touch the 'admins' collection.
 */
import admin from 'firebase-admin';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config({ path: process.cwd() + '/scripts/.env' });

const projectId = process.env.gcp_project_id;
if (!projectId) {
  console.error('Missing gcp_project_id in .env');
  process.exit(1);
}

try {
  admin.app();
} catch (e) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

const db = admin.firestore();

type ParkingSpot = {
  id?: string;
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
  ownerId: string;
  ownerName: string;
  status: 'available' | 'booked' | 'unavailable';
  isTest: boolean;
};

type User = {
  id: string;
  name: string;
  isTest: boolean;
};

type Event = {
  id: string;
  title: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate: Date;
  isTest: boolean;
};

const argv = yargs(hideBin(process.argv))
  .option('count', {
    alias: 'n',
    type: 'number',
    description: 'Number of test driveways to create',
    default: 10,
  })
  .help()
  .argv as { count: number };

const AMENITIES = [
  'EV Charger', 'Covered Parking', 'Security Camera', 'Easy Access', 'Lighting', 'Near Venue', 'Fenced', '24/7 Access',
];

const IMAGES = [
  'https://images.unsplash.com/photo-1506744038136-46273834b3fb',
  'https://images.unsplash.com/photo-1464983953574-0892a716854b',
  'https://images.unsplash.com/photo-1519125323398-675f0ddb6308',
  'https://images.unsplash.com/photo-1523413363574-c30aa1c2a516',
  'https://images.unsplash.com/photo-1465101046530-73398c7f28ca',
];

function randomOffset() {
  // Offset in degrees, ~0.001 is about 100m
  return (Math.random() - 0.5) * 0.01;
}

function randomFromArray<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function toDate(val: any): Date {
  if (!val) return new Date(NaN);
  if (val instanceof Date) return val;
  if (val.toDate) return val.toDate(); // Firestore Timestamp
  return new Date(val);
}

async function getTestUsers(): Promise<User[]> {
  const snap = await db.collection('users')
  .where('isTest', '==', true)
  .where('emailVerified', '==', true)
  .where('isHost', '==', true)
  .get();
  return snap.docs.map(doc => ({
    id: doc.id,
    name: doc.get('name') || 'Test User',
    isTest: true,
  }));
}

async function getTestEvents(): Promise<Event[]> {
  const snap = await db.collection('events').where('isTest', '==', true).get();
  return snap.docs.map(doc => {
    const data = doc.data();
    return {
      id: doc.id,
      title: data.title,
      location: data.location,
      startDate: toDate(data.startDate),
      endDate: toDate(data.endDate),
      isTest: true,
    };
  });
}

function randomNearbyAddress(baseAddress: string, eventTitle: string): string {
  // For demo, just append a random house number and street
  const houseNum = Math.floor(100 + Math.random() * 900);
  const street = baseAddress.split(',')[0].replace(/[0-9]/g, '').trim() || 'Main St';
  return `${houseNum} ${street}, near ${eventTitle}`;
}

async function createTestDriveway(users: User[], events: Event[], i: number): Promise<ParkingSpot> {
  const event = randomFromArray(events);
  const user = randomFromArray(users);
  const now = new Date();
  const spotId = uuidv4();
  const baseCoords = event.location.coordinates;
  const coords = {
    lat: baseCoords.lat + randomOffset(),
    lng: baseCoords.lng + randomOffset(),
  };
  const address = randomNearbyAddress(event.location.address, event.title);
  const price = 10 + Math.floor(Math.random() * 20); // $10-$30
  const amenities = Array.from(new Set([
    randomFromArray(AMENITIES),
    randomFromArray(AMENITIES),
    randomFromArray(AMENITIES),
  ]));
  const images = [randomFromArray(IMAGES)];
  const spot: ParkingSpot = {
    id: spotId,
    eventId: event.id,
    address,
    description: `Driveway for ${event.title} - ${amenities.join(', ')}`,
    price,
    images,
    availability: {
      start: event.startDate.toISOString(),
      end: event.endDate.toISOString(),
    },
    amenities,
    coordinates: coords,
    createdAt: now.toISOString(),
    ownerId: user.id,
    ownerName: user.name,
    status: 'available',
    isTest: true,
  };
  await db.collection('parkingSpots').doc(spotId).set(spot);
  return spot;
}

(async () => {
  console.log(`Seeding ${argv.count} test driveways...`);
  const users = await getTestUsers();
  const events = await getTestEvents();
  if (users.length === 0 || events.length === 0) {
    console.error('No test users or events found. Please seed users and events first.');
    process.exit(1);
  }
  for (let i = 0; i < argv.count; i++) {
    try {
      const spot = await createTestDriveway(users, events, i);
      console.log(`Created driveway: ${spot.address} (${spot.id}) for event ${spot.eventId}`);
    } catch (err) {
      console.error('Error creating driveway:', err);
    }
  }
  console.log('Done.');
  process.exit(0);
})(); 