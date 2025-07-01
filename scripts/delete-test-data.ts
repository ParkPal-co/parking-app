#!/usr/bin/env ts-node
/**
 * Script: delete-test-data.ts
 * Purpose: Delete all test data (isTest: true) from Firestore and Firebase Auth for staging.
 * Usage: npx ts-node scripts/delete-test-data.ts --force
 *
 * Requirements:
 *   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
 *   - .env with gcp_project_id set
 *
 * This script will NEVER touch the 'admins' collection.
 * Use --force to confirm deletion.
 */
import admin from 'firebase-admin';
import * as dotenv from 'dotenv';
import yargs from 'yargs';
import { hideBin } from 'yargs/helpers';

dotenv.config({ path: process.cwd() + '/scripts/.env' });

const projectId = process.env.gcp_project_id;
if (!projectId) {
  console.error('Missing gcp_project_id in .env');
  process.exit(1);
}

const argv = yargs(hideBin(process.argv))
  .option('force', {
    type: 'boolean',
    description: 'Actually delete data (required)',
    default: false,
  })
  .help()
  .argv as { force: boolean };

if (!argv.force) {
  console.error('You must use --force to actually delete test data.');
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
const auth = admin.auth();

const COLLECTIONS = ['users', 'events', 'parkingSpots'];

async function deleteFirestoreTestDocs() {
  for (const col of COLLECTIONS) {
    if (col === 'admins') continue; // Never touch admins
    const snap = await db.collection(col).where('isTest', '==', true).get();
    if (snap.empty) {
      console.log(`No test docs found in ${col}`);
      continue;
    }
    const batch = db.batch();
    snap.docs.forEach(doc => batch.delete(doc.ref));
    await batch.commit();
    console.log(`Deleted ${snap.size} test docs from ${col}`);
  }
}

async function deleteTestAuthUsers() {
  // List all users in batches
  let nextPageToken: string | undefined = undefined;
  let totalDeleted = 0;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    const testUsers = result.users.filter(u => u.email && u.email.includes('+test'));
    for (const user of testUsers) {
      await auth.deleteUser(user.uid);
      totalDeleted++;
      console.log(`Deleted test auth user: ${user.email}`);
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  if (totalDeleted === 0) {
    console.log('No test auth users found.');
  } else {
    console.log(`Deleted ${totalDeleted} test auth users.`);
  }
}

(async () => {
  console.log('Deleting all test data (isTest: true) from Firestore and Auth...');
  await deleteFirestoreTestDocs();
  await deleteTestAuthUsers();
  console.log('Done.');
  process.exit(0);
})(); 