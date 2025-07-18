#!/usr/bin/env ts-node
/**
 * Script: batch-create-water-lantern-spots.ts
 * Purpose: Batch-create 6 house and 20 commercial parking spots for the Utah County Water Lantern Festival.
 * Usage: npx ts-node scripts/batch-create-water-lantern-spots.ts
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
 *   - .env with gcp_project_id set
 *   - Run from project root (so image paths are correct)
 *
 * This script uploads images to Firebase Storage and creates Firestore docs for each spot.
 */
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import path from 'path';
import fs from 'fs';

// ---- ENV/ADMIN SETUP ----
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
    storageBucket: `${projectId}.firebasestorage.app`, // <-- Edit here if needed
  });
}

const db = admin.firestore();
const bucket = admin.storage().bucket();

// ---- CONFIGURABLE CONSTANTS ----
// Owner/event info (edit here if needed)
const OWNER_ID = 'Rd0w85B6phgoVkcKFQq0i35KDzw1';
const OWNER_NAME = 'Glen Cole';
const EVENT_ID = 'zOu8CWPGSbcNtstVrBTx';
const PRICE = 15;
const CREATED_AT = new Date().toISOString();
const AVAILABILITY = {
  start: '2025-07-19T18:00',
  end: '2025-07-19T22:30',
};

// House spot config
const HOUSE_ADDRESS = '240 S 200 W St, Salem, UT 84653';
const HOUSE_COORDINATES = { lat: 40.050929, lng: -111.678231 };
const HOUSE_IMAGE_PATH = path.join('src/assets/images/240-S-200-W.png');

// Commercial lot config
const COMM_ADDRESS = '251 UT-198, Salem, UT 84653';
const COMM_COORDINATES = { lat: 40.053537, lng: -111.678228 };
const COMM_IMAGE_PATH = path.join('src/assets/images/251 UT-198.png');

// ---- IMAGE UPLOAD ----
async function uploadImage(localPath: string, storagePath: string): Promise<string> {
  if (!fs.existsSync(localPath)) {
    throw new Error(`Image file not found: ${localPath}`);
  }
  const uploadResp = await bucket.upload(localPath, {
    destination: storagePath,
    public: true, // Make public for easy access (edit if you want private)
    metadata: {
      cacheControl: 'public, max-age=31536000',
    },
  });
  // Get public URL
  const file = uploadResp[0];
  return file.publicUrl();
}

async function main() {
  // Upload images first
  console.log('Uploading images to Firebase Storage...');
  const houseImageUrl = await uploadImage(
    HOUSE_IMAGE_PATH,
    `parkingSpots/manual/240-S-200-W.png` // <-- Edit storage path if needed
  );
  const commImageUrl = await uploadImage(
    COMM_IMAGE_PATH,
    `parkingSpots/manual/251-UT-198.png`
  );
  console.log('Image upload complete.');
  console.log('House image URL:', houseImageUrl);
  console.log('Commercial image URL:', commImageUrl);

  // ---- CREATE SPOTS ----
  // House spots (6)
  for (let i = 1; i <= 6; i++) {
    const doc = {
      address: HOUSE_ADDRESS, // <-- Edit here if needed
      availability: { ...AVAILABILITY },
      coordinates: { ...HOUSE_COORDINATES },
      createdAt: CREATED_AT,
      description: `#${i} right accross the street from venue, parking spot ${i} of 6. Leave room and exit space for other cars.`,
      eventId: EVENT_ID,
      images: [houseImageUrl],
      ownerId: OWNER_ID,
      ownerName: OWNER_NAME,
      price: PRICE,
      status: 'available',
    };
    const ref = await db.collection('parkingSpots').add(doc);
    console.log(`Created house spot ${i} with doc ID: ${ref.id}`);
  }

  // Commercial spots (20)
  for (let i = 1; i <= 20; i++) {
    const doc = {
      address: COMM_ADDRESS, // <-- Edit here if needed
      availability: { ...AVAILABILITY },
      coordinates: { ...COMM_COORDINATES },
      createdAt: CREATED_AT,
      description: `#${i} commercial lot accross the bridge from the park. Parking spot ${i} of 20.`,
      eventId: EVENT_ID,
      images: [commImageUrl],
      ownerId: OWNER_ID,
      ownerName: OWNER_NAME,
      price: PRICE,
      status: 'available',
    };
    const ref = await db.collection('parkingSpots').add(doc);
    console.log(`Created commercial spot ${i} with doc ID: ${ref.id}`);
  }

  console.log('All spots created!');
  process.exit(0);
}

main().catch((err) => {
  console.error('Error:', err);
  process.exit(1);
}); 