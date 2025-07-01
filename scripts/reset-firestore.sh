#!/bin/bash
# Script: reset-firestore.sh
# Purpose: Delete all Firestore data except the 'admins' collection using Firebase CLI.
# Usage: ./scripts/reset-firestore.sh --project=your-project-id --force
#
# WARNING: This is DESTRUCTIVE. Never run on production. Always use --force.
#
# Requirements:
#   - Firebase CLI installed and authenticated (https://firebase.google.com/docs/cli)
#   - Project ID specified with --project
#   - Use --force to confirm deletion
#
# NOTE: You will be prompted to confirm each collection deletion. There is no --yes flag for firestore:delete.

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
  echo "Error: --force flag is required to actually delete data."
  exit 1
fi

COLLECTIONS=(bookings conversations eventNotifications events feedback messages parkingSpots paymentIntents storageMetrics users)

for COL in "${COLLECTIONS[@]}"; do
  if [ "$COL" = "admins" ]; then
    echo "Skipping admins collection."
    continue
  fi
  echo "Deleting all documents in $COL..."
  firebase firestore:delete "$COL" --project="$PROJECT" --recursive
  # You will be prompted to confirm deletion for each collection
  # Type 'y' or 'yes' to confirm
  # There is no --yes flag for this command
  # See: https://github.com/firebase/firebase-tools/issues/6722
  #      https://github.com/firebase/firebase-tools/issues/6723
done

echo "Firestore reset complete (except admins collection)." 