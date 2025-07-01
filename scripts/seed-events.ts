#!/usr/bin/env ts-node
/**
 * Script: seed-events.ts
 * Purpose: Seed test events in Firestore for staging.
 * Usage: npx ts-node scripts/seed-events.ts --count 5
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
 *   - .env with gcp_project_id set
 *
 * All events created will have isTest: true for easy cleanup.
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

type Event = {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startDate: Date;
  endDate: Date;
  expectedAttendance: number;
  imageUrl?: string;
  createdAt: Date;
  status: 'upcoming' | 'ongoing' | 'completed';
  distance?: number;
  isTest: boolean;
};

const argv = yargs(hideBin(process.argv))
  .option('count', {
    alias: 'n',
    type: 'number',
    description: 'Number of test events to create',
    default: 5,
  })
  .help()
  .argv as { count: number };

// Predefined events (add more as needed)
const PREDEFINED_EVENTS: Omit<Event, 'id' | 'createdAt' | 'isTest'>[] = [
  {
    title: 'San Jose Water Lantern Festival',
    description: 'Experience the magic of lanterns as they light up Almaden Lake Park in San Jose. Food trucks, music, and a beautiful lakeside view!',
    location: {
      address: 'Almaden Lake Park, 6099 Winfield Blvd, San Jose, CA 95120',
      coordinates: { lat: 37.2358, lng: -121.8662 },
    },
    startDate: new Date('2025-06-21T17:00:00-07:00'),
    endDate: new Date('2025-06-21T22:00:00-07:00'),
    expectedAttendance: 2000,
    imageUrl: 'https://images.unsplash.com/photo-1725566585424-9e15e77e48e1?q=80&w=2618&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: "Eaglewood 3rd of July Celebration",
    description: "A North Salt Lake tradition! Enjoy fireworks, food, live music, and family fun at Eaglewood Golf Course.",
    location: {
      address: 'Eaglewood Golf Course, 1110 E Eaglewood Dr, North Salt Lake, UT 84054',
      coordinates: { lat: 40.8441, lng: -111.9062 },
    },
    startDate: new Date('2025-07-03T17:00:00-06:00'),
    endDate: new Date('2025-07-03T22:30:00-06:00'),
    expectedAttendance: 5000,
    imageUrl: 'https://images.unsplash.com/photo-1562379876-c04d8b15acc4?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8Zm91cnRoJTIwb2YlMjBqdWx5fGVufDB8fDB8fHww',
    status: 'upcoming',
  },
  {
    title: 'BYU 4th of July Stadium of Fire 2025',
    description: 'Rascal Flatts will headline the Stadium of Fire on July 4th, 2025, at LaVell Edwards Stadium in Provo, Utah. Enjoy music, fireworks, and a thrilling flyover!',
    location: {
      address: '1700 North Canyon Road, Provo, UT 84604',
      coordinates: { lat: 40.257568, lng: -111.654527 },
    },
    startDate: new Date('2025-07-04T19:00:00-06:00'),
    endDate: new Date('2025-07-04T22:00:00-06:00'),
    expectedAttendance: 40000,
    imageUrl: 'https://images.unsplash.com/photo-1623000200667-cdccdd849ff7?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Portland Rose Festival Grand Floral Parade',
    description: 'The largest single-day spectator event in Oregon! Floats, bands, and equestrian units parade through downtown Portland.',
    location: {
      address: 'Veterans Memorial Coliseum, 300 N Winning Way, Portland, OR 97227',
      coordinates: { lat: 45.5336, lng: -122.6699 },
    },
    startDate: new Date('2025-06-07T10:00:00-07:00'),
    endDate: new Date('2025-06-07T13:00:00-07:00'),
    expectedAttendance: 300000,
    imageUrl: 'https://plus.unsplash.com/premium_photo-1661274050137-edc61fa89ffc?q=80&w=1738&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Chicago Air and Water Show',
    description: 'The largest free show of its kind in the United States, featuring daredevil pilots, parachute teams, and jets over Lake Michigan.',
    location: {
      address: 'North Avenue Beach, 1600 N Lake Shore Dr, Chicago, IL 60613',
      coordinates: { lat: 41.9115, lng: -87.6315 },
    },
    startDate: new Date('2025-08-16T10:00:00-05:00'),
    endDate: new Date('2025-08-16T15:00:00-05:00'),
    expectedAttendance: 2000000,
    imageUrl: 'https://plus.unsplash.com/premium_photo-1697730086436-78cb393f0dab?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Central Park SummerStage Concert',
    description: 'Enjoy live music under the stars at Central Parks iconic SummerStage in New York City.',
    location: {
      address: 'Central Park, New York, NY 10024',
      coordinates: { lat: 40.7829, lng: -73.9654 },
    },
    startDate: new Date('2025-07-15T18:00:00-04:00'),
    endDate: new Date('2025-07-15T22:00:00-04:00'),
    expectedAttendance: 8000,
    imageUrl: 'https://plus.unsplash.com/premium_photo-1697730064923-dd664fc81d19?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Seattle Seafair Weekend Festival',
    description: 'Hydroplane races, air shows, and family fun on the shores of Lake Washington.',
    location: {
      address: 'Genesee Park, 4316 S Genesee St, Seattle, WA 98118',
      coordinates: { lat: 47.5646, lng: -122.2771 },
    },
    startDate: new Date('2025-08-02T10:00:00-07:00'),
    endDate: new Date('2025-08-04T18:00:00-07:00'),
    expectedAttendance: 100000,
    imageUrl: 'https://plus.unsplash.com/premium_photo-1746019870904-8cd658cf1742?q=80&w=1732&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Austin City Limits Music Festival',
    description: 'A two-weekend, eight-stage music festival in Zilker Park, Austin, TX.',
    location: {
      address: 'Zilker Park, 2100 Barton Springs Rd, Austin, TX 78704',
      coordinates: { lat: 30.266962, lng: -97.772859 },
    },
    startDate: new Date('2025-10-03T11:00:00-05:00'),
    endDate: new Date('2025-10-12T22:00:00-05:00'),
    expectedAttendance: 450000,
    imageUrl: 'https://plus.unsplash.com/premium_photo-1697730030250-e89c608af43c?q=80&w=1932&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'San Diego Comic-Con',
    description: "The world's largest pop culture event, featuring comics, movies, and cosplay.",
    location: {
      address: 'San Diego Convention Center, 111 W Harbor Dr, San Diego, CA 92101',
      coordinates: { lat: 32.7075, lng: -117.1611 },
    },
    startDate: new Date('2025-07-24T09:00:00-07:00'),
    endDate: new Date('2025-07-27T18:00:00-07:00'),
    expectedAttendance: 135000,
    imageUrl: 'https://images.unsplash.com/photo-1697480157582-43d68447f959?q=80&w=1748&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Denver Great American Beer Festival',
    description: 'Sample beers from hundreds of breweries at the Colorado Convention Center.',
    location: {
      address: 'Colorado Convention Center, 700 14th St, Denver, CO 80202',
      coordinates: { lat: 39.7447, lng: -104.9950 },
    },
    startDate: new Date('2025-09-24T17:00:00-06:00'),
    endDate: new Date('2025-09-26T22:00:00-06:00'),
    expectedAttendance: 60000,
    imageUrl: 'https://images.unsplash.com/photo-1639061725875-29968d6e221d?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Miami Art Basel',
    description: 'International art fair with modern and contemporary works from around the world.',
    location: {
      address: 'Miami Beach Convention Center, 1901 Convention Center Dr, Miami Beach, FL 33139',
      coordinates: { lat: 25.7959, lng: -80.1332 },
    },
    startDate: new Date('2025-12-04T11:00:00-05:00'),
    endDate: new Date('2025-12-07T19:00:00-05:00'),
    expectedAttendance: 77000,
    imageUrl: 'https://images.unsplash.com/photo-1545518514-ce8448f542b3?q=80&w=1742&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Boston Marathon',
    description: "The world's oldest annual marathon, attracting runners from all over the globe.",
    location: {
      address: 'Hopkinton to Boston, MA',
      coordinates: { lat: 42.3601, lng: -71.0589 },
    },
    startDate: new Date('2025-04-21T09:00:00-04:00'),
    endDate: new Date('2025-04-21T15:00:00-04:00'),
    expectedAttendance: 30000,
    imageUrl: 'https://images.unsplash.com/photo-1596727362302-b8d891c42ab8?q=80&w=1385&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Houston Livestock Show and Rodeo',
    description: 'The largest livestock exhibition and rodeo in the world, with concerts and a carnival.',
    location: {
      address: 'NRG Stadium, 1 NRG Pkwy, Houston, TX 77054',
      coordinates: { lat: 29.6847, lng: -95.4107 },
    },
    startDate: new Date('2025-02-25T08:00:00-06:00'),
    endDate: new Date('2025-03-17T23:00:00-06:00'),
    expectedAttendance: 2200000,
    imageUrl: 'https://images.unsplash.com/photo-1726534609988-c0feeeb77df0?q=80&w=2576&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Philadelphia Flower Show',
    description: "The nation's largest and longest-running horticultural event.",
    location: {
      address: 'Pennsylvania Convention Center, 1101 Arch St, Philadelphia, PA 19107',
      coordinates: { lat: 39.9540, lng: -75.1590 },
    },
    startDate: new Date('2025-03-01T10:00:00-05:00'),
    endDate: new Date('2025-03-10T20:00:00-05:00'),
    expectedAttendance: 250000,
    imageUrl: 'https://images.unsplash.com/photo-1552764040-3001daba7d81?q=80&w=1374&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'Indianapolis 500',
    description: 'The greatest spectacle in racing, held annually at the Indianapolis Motor Speedway.',
    location: {
      address: '4790 W 16th St, Indianapolis, IN 46222',
      coordinates: { lat: 39.7950, lng: -86.2347 },
    },
    startDate: new Date('2025-05-25T12:00:00-04:00'),
    endDate: new Date('2025-05-25T18:00:00-04:00'),
    expectedAttendance: 300000,
    imageUrl: 'https://images.unsplash.com/photo-1575566530168-f26fb53cfa15?q=80&w=2575&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  },
  {
    title: 'San Francisco Pride Parade',
    description: 'One of the oldest and largest LGBTQ+ parades in the world, celebrating diversity and inclusion.',
    location: {
      address: 'Market St, San Francisco, CA 94103',
      coordinates: { lat: 37.7749, lng: -122.4194 },
    },
    startDate: new Date('2025-06-29T10:30:00-07:00'),
    endDate: new Date('2025-06-29T16:00:00-07:00'),
    expectedAttendance: 1000000,
    imageUrl: 'https://images.unsplash.com/photo-1551841820-ccdb8a712f74?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D',
    status: 'upcoming',
  }
];

async function createTestEvent(i: number): Promise<Event> {
  const base = PREDEFINED_EVENTS[i % PREDEFINED_EVENTS.length];
  const now = new Date();
  const eventId = uuidv4();
  const event: Event = {
    ...base,
    id: eventId,
    createdAt: now,
    isTest: true,
  };
  await db.collection('events').doc(eventId).set(event);
  return event;
}

(async () => {
  console.log(`Seeding ${argv.count} test events...`);
  for (let i = 0; i < argv.count; i++) {
    try {
      const event = await createTestEvent(i);
      console.log(`Created event: ${event.title} (${event.id})`);
    } catch (err) {
      console.error('Error creating event:', err);
    }
  }
  console.log('Done.');
  process.exit(0);
})(); 