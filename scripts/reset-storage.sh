#!/bin/bash
# Script: reset-storage.sh
# Purpose: Delete all files in the default Firebase Storage bucket for the given project.
# Usage: ./scripts/reset-storage.sh --project=your-project-id --force
#
# WARNING: This is DESTRUCTIVE. Never run on production. Always use --force.
#
# Requirements:
#   - gsutil (from Google Cloud SDK) installed and authenticated
#   - Project ID specified with --project
#   - Use --force to confirm deletion
#
# This script will delete all files in the default storage bucket, but will NOT delete the bucket itself.

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
  echo "Error: --force flag is required to actually delete storage files."
  exit 1
fi

BUCKET="gs://$PROJECT.firebasestorage.app"

echo "Deleting all files in $BUCKET ..."
gsutil -m rm -r "$BUCKET/**"
echo "Firebase Storage reset complete (all files deleted, bucket retained)." 