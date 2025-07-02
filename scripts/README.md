# ParkPal Staging Scripts

This directory contains scripts for managing test data in the **staging** Firebase environment. These scripts help you quickly seed, reset, and clean up Firestore, Firebase Auth, and Storage for safe, repeatable testing.

---

## **Setup**

### 1. **Service Account**

- Generate a service account key for your staging Firebase project ([instructions](https://cloud.google.com/iam/docs/creating-managing-service-account-keys)).
- Download the JSON key and save it securely (e.g., `serviceAccount.staging.json`).
- Set the environment variable before running scripts:
  ```sh
  export GOOGLE_APPLICATION_CREDENTIALS="/absolute/path/to/serviceAccount.staging.json"
  ```

### 2. **Environment Variables**

- Copy `.env.example` to `.env` and fill in your staging project ID and any other required values.

---

## **Script Overview**

### **CLI Scripts (Shell)**

- `reset-firestore.sh` — Wipe all Firestore data **except** the `admins` collection. This now includes: bookings, conversations, eventNotifications, events, feedback, messages, parkingSpots, paymentIntents, storageMetrics, users. You will be prompted to confirm each deletion.
- `reset-storage.sh` — Wipe all Firebase Storage files.
- `reset-auth.sh` — Wipe **ALL** Firebase Auth users (not just test users). **WARNING: This deletes every user in the project.**

### **Node.js Scripts (TypeScript)**

- `seed-all.ts` — Run all seeding scripts (`seed-users.ts`, `seed-events.ts`, `seed-driveways.ts`) in sequence. Accepts `--userCount`, `--eventCount`, and `--drivewayCount` arguments.
- `seed-users.ts` — Create test users in Firestore and Firebase Auth. The password set for each user is "testtest"
- `seed-events.ts` — Create test events with realistic data.
- `seed-driveways.ts` — Create test parking spots (driveways) linked to users/events.
- `delete-test-data.ts` — Delete all test data (`isTest: true`) from Firestore, Storage, and Auth.
- `export-data.ts` — Export Firestore data to JSON for backup.
- `import-data.ts` — Import Firestore data from JSON for repeatable setups.

---

## **Usage Examples**

```sh
# Seed all test data (users, events, driveways)
npx ts-node scripts/seed-all.ts --userCount 10 --eventCount 15 --drivewayCount 20

# Seed 10 test users
npx ts-node scripts/seed-users.ts --count 10

# Wipe all test data (staging only)
npx ts-node scripts/delete-test-data.ts --env staging --force

# Reset Firestore (except admins)
./scripts/reset-firestore.sh --project=parking-app-staging --force
# NOTE: You will be prompted to confirm each collection deletion. There is no --yes flag for firestore:delete.

# Reset ALL Firebase Auth users (irreversible!)
./scripts/reset-auth.sh --project=parking-app-staging --force
```

---

## **Safety & Best Practices**

- **Never run destructive scripts on production!**
- **reset-auth.sh deletes ALL Firebase Auth users. Use with extreme caution.**
- All scripts are hard-coded to protect the `admins` collection.
- All test data is marked with `isTest: true` for easy cleanup.
- Always back up data before running destructive scripts.
- Use the `--force` flag to confirm destructive actions.
- Scripts require a service account with admin privileges.

---

## **Adding New Scripts**

- Place new scripts in this directory.
- Document their purpose and usage here.
- Review and test before using on staging.

---

## **Questions?**

Contact the engineering team or check the Firebase documentation for more details.
