#!/usr/bin/env ts-node
/**
 * Script: seed-users.ts
 * Purpose: Seed test users in Firestore and Firebase Auth for staging.
 * Usage: npx ts-node scripts/seed-users.ts --count 10
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
 *   - .env with gcp_project_id set
 *
 * All users created will have isTest: true for easy cleanup.
 * This script will NEVER touch the 'admins' collection.
 */
import admin from 'firebase-admin';
import { UserRecord } from 'firebase-admin/auth';
import { v4 as uuidv4 } from 'uuid';
import * as dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

// Load .env from the scripts/ directory (run from project root)
dotenv.config({ path: process.cwd() + '/scripts/.env' });

const projectId = process.env.gcp_project_id;
if (!projectId) {
  console.error('Missing gcp_project_id in .env');
  process.exit(1);
}

if (!process.env.GOOGLE_APPLICATION_CREDENTIALS) {
  console.error('Missing GOOGLE_APPLICATION_CREDENTIALS env var');
  process.exit(1);
}

// Initialize Firebase Admin
try {
  admin.app();
} catch (e) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
    projectId,
  });
}

const db = admin.firestore();
const auth = admin.auth();

// User type (from src/types/User.ts)
type User = {
  id: string;
  email: string;
  name: string;
  phoneNumber?: string;
  profileImageUrl?: string;
  isHost: boolean;
  isAdmin?: boolean;
  address?: string;
  emailVerified: boolean;
  createdAt: Date;
  stripeAccountId?: string;
  termsAccepted?: boolean;
  termsAcceptedAt?: Date;
  isTest: boolean;
};

const argv = yargs(hideBin(process.argv))
  .option('count', {
    alias: 'n',
    type: 'number',
    description: 'Number of test users to create',
    default: 10,
  })
  .help()
  .argv as { count: number };

const TEST_NAMES = [
  'Alex Johnson', 'Jamie Lee', 'Morgan Smith', 'Taylor Brown', 'Jordan Kim',
  'Casey Martinez', 'Riley Patel', 'Drew Chen', 'Avery Nguyen', 'Skyler Davis',
];

const TEST_EMAILS = [
  'alex.johnson+test@parkpal.co', 'jamie.lee+test@parkpal.co', 'morgan.smith+test@parkpal.co',
  'taylor.brown+test@parkpal.co', 'jordan.kim+test@parkpal.co', 'casey.martinez+test@parkpal.co',
  'riley.patel+test@parkpal.co', 'drew.chen+test@parkpal.co', 'avery.nguyen+test@parkpal.co',
  'skyler.davis+test@parkpal.co',
];

const TEST_IMAGES = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/6.jpg',
  'https://randomuser.me/api/portraits/men/7.jpg',
  'https://randomuser.me/api/portraits/women/8.jpg',
  'https://randomuser.me/api/portraits/men/9.jpg',
  'https://randomuser.me/api/portraits/women/10.jpg',
];

async function createTestUser(i: number): Promise<User> {
  const name = TEST_NAMES[i % TEST_NAMES.length];
  const email = TEST_EMAILS[i % TEST_EMAILS.length].replace('+test', `+test${i}`);
  const profileImageUrl = TEST_IMAGES[i % TEST_IMAGES.length];
  const isHost = i % 2 === 0;
  const now = new Date();
  const userId = uuidv4();

  // Create Firebase Auth user
  let authUser: UserRecord;
  try {
    authUser = await auth.createUser({
      uid: userId,
      email,
      emailVerified: true,
      displayName: name,
      photoURL: profileImageUrl,
      password: 'testtest',
      disabled: false,
    });
  } catch (err: any) {
    if (err.code === 'auth/email-already-exists') {
      authUser = await auth.getUserByEmail(email);
    } else {
      throw err;
    }
  }

  // Compose Firestore user
  const user: User = {
    id: userId,
    email,
    name,
    profileImageUrl,
    isHost,
    emailVerified: true,
    createdAt: now,
    termsAccepted: true,
    termsAcceptedAt: now,
    isTest: true,
  };

  await db.collection('users').doc(userId).set(user);
  return user;
}

(async () => {
  console.log(`Seeding ${argv.count} test users...`);
  for (let i = 0; i < argv.count; i++) {
    try {
      const user = await createTestUser(i);
      console.log(`Created user: ${user.email} (${user.id})`);
    } catch (err) {
      console.error('Error creating user:', err);
    }
  }
  console.log('Done.');
  process.exit(0);
})(); 