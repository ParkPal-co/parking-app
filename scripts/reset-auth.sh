#!/bin/bash
# Script: reset-auth.sh
# Purpose: Delete ALL Firebase Auth users (test and non-test) for the given project.
# Usage: ./scripts/reset-auth.sh --project=your-project-id --force
#
# WARNING: This is DESTRUCTIVE. Never run on production. Always use --force.
#
# Requirements:
#   - Node.js installed
#   - GOOGLE_APPLICATION_CREDENTIALS env var set to service account key
#   - Project ID specified with --project
#   - Use --force to confirm deletion
#
# This script will delete ALL users in Firebase Auth for the specified project.

set -e

for arg in "$@"; do
  case $arg in
    --project=*)
      PROJECT="${arg#*=}"
      ;;
    --force)
      FORCE=1
      ;;
  esac
  shift
done

if [ -z "$PROJECT" ]; then
  echo "Error: --project argument is required."
  exit 1
fi

if [ -z "$FORCE" ]; then
  echo "Error: --force flag is required to actually delete auth users."
  exit 1
fi

if [ -z "$GOOGLE_APPLICATION_CREDENTIALS" ]; then
  echo "Error: GOOGLE_APPLICATION_CREDENTIALS env var must be set to your service account key."
  exit 1
fi

# Use a Node.js one-liner to delete all users
node -e '
const admin = require("firebase-admin");
admin.initializeApp({
  credential: admin.credential.applicationDefault(),
});
const auth = admin.auth();
(async () => {
  let nextPageToken = undefined;
  let totalDeleted = 0;
  do {
    const result = await auth.listUsers(1000, nextPageToken);
    for (const user of result.users) {
      await auth.deleteUser(user.uid);
      totalDeleted++;
      console.log(`Deleted auth user: ${user.email}`);
    }
    nextPageToken = result.pageToken;
  } while (nextPageToken);
  if (totalDeleted === 0) {
    console.log("No auth users found.");
  } else {
    console.log(`Deleted ${totalDeleted} auth users.`);
  }
  process.exit(0);
})();
'

echo "Firebase Auth reset complete (ALL users deleted)." 