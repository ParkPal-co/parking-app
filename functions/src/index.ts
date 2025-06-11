/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from 'firebase-admin/app';

// Initialize Firebase Admin
initializeApp();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Create a payment intent
export { createPaymentIntent } from './payments/createPaymentIntent';

// Monitor storage usage
export { monitorStorageUsage } from './storage/monitorStorageUsage';

// Create or get a Stripe Connect account onboarding link for a host
export { createOrGetStripeAccountLink } from './payments/createOrGetStripeAccountLink';

// Export Stripe Express Dashboard login link function
export { createStripeDashboardLink } from './payments/createStripeDashboardLink';

// Export admin-initiated event payout function
export { initiateEventPayouts } from './payments/initiateEventPayouts';
