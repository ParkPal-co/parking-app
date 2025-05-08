/**
 * Import function triggers from their respective submodules:
 *
 * import {onCall} from "firebase-functions/v2/https";
 * import {onDocumentWritten} from "firebase-functions/v2/firestore";
 *
 * See a full list of supported triggers at https://firebase.google.com/docs/functions
 */

import { initializeApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getStorage } from 'firebase-admin/storage';
import * as functions from 'firebase-functions';
import Stripe from 'stripe';

// Initialize Firebase Admin
initializeApp();

// Initialize Firestore and Storage
const db = getFirestore();
const storage = getStorage();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Create a payment intent
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
    try {
      // Check if user is authenticated
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
      }

    const { amount, currency } = data;

      // Validate amount
      if (!amount || amount <= 0) {
      throw new functions.https.HttpsError('invalid-argument', 'Invalid amount');
      }

    // Initialize Stripe using secret from functions config
    const stripe = new Stripe(functions.config().stripe.secret_key, {
        apiVersion: '2023-10-16',
      });

      // Create a payment intent
      const paymentIntent = await stripe.paymentIntents.create({
        amount,
        currency,
        automatic_payment_methods: {
          enabled: true,
        },
      });

      // Log payment intent in Firestore
      await db.collection('paymentIntents').doc(paymentIntent.id).set({
      userId: context.auth.uid,
        amount,
        currency,
        status: paymentIntent.status,
        created: paymentIntent.created,
      });

    console.log(`Payment intent ${paymentIntent.id} created for user ${context.auth.uid}`);

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create payment intent');
  }
});

// Monitor storage usage
export const monitorStorageUsage = functions.pubsub
  .schedule('every 24 hours')
  .onRun(async () => {
    try {
      const bucket = storage.bucket();
      const [files] = await bucket.getFiles();
      
      // Initialize metrics
      const metrics = {
        profileImages: { count: 0, size: 0 },
        parkingSpots: { count: 0, size: 0 },
        events: { count: 0, size: 0 },
        total: { count: 0, size: 0 },
        timestamp: new Date().toISOString()
      };

      // Process each file
      for (const file of files) {
        const [metadata] = await file.getMetadata();
        const size = parseInt(String(metadata.size || '0'));
        const path = file.name;

        // Update total metrics
        metrics.total.count++;
        metrics.total.size += size;

        // Update specific folder metrics
        if (path.startsWith('profile-images/')) {
          metrics.profileImages.count++;
          metrics.profileImages.size += size;
        } else if (path.startsWith('parkingSpots/')) {
          metrics.parkingSpots.count++;
          metrics.parkingSpots.size += size;
        } else if (path.startsWith('events/')) {
          metrics.events.count++;
          metrics.events.size += size;
        }
      }

      // Convert sizes to MB for easier reading
      const convertToMB = (bytes: number) => (bytes / (1024 * 1024)).toFixed(2);
      
      // Store metrics in Firestore
      await db.collection('storageMetrics').add({
        ...metrics,
        profileImages: {
          ...metrics.profileImages,
          size: convertToMB(metrics.profileImages.size)
        },
        parkingSpots: {
          ...metrics.parkingSpots,
          size: convertToMB(metrics.parkingSpots.size)
        },
        events: {
          ...metrics.events,
          size: convertToMB(metrics.events.size)
        },
        total: {
          ...metrics.total,
          size: convertToMB(metrics.total.size)
        }
      });

      // Log metrics
      console.log('Storage metrics:', {
        timestamp: metrics.timestamp,
        totalFiles: metrics.total.count,
        totalSize: `${convertToMB(metrics.total.size)} MB`,
        profileImages: {
          count: metrics.profileImages.count,
          size: `${convertToMB(metrics.profileImages.size)} MB`
        },
        parkingSpots: {
          count: metrics.parkingSpots.count,
          size: `${convertToMB(metrics.parkingSpots.size)} MB`
        },
        events: {
          count: metrics.events.count,
          size: `${convertToMB(metrics.events.size)} MB`
        }
      });

      // Check for unusual patterns
      const lastMetrics = await db.collection('storageMetrics')
        .orderBy('timestamp', 'desc')
        .limit(1)
        .get();

      if (!lastMetrics.empty) {
        const lastMetric = lastMetrics.docs[0].data();
        const sizeIncrease = parseFloat(metrics.total.size.toString()) - parseFloat(lastMetric.total.size);
        
        // Alert if storage increased by more than 100MB in 24 hours
        if (sizeIncrease > 100) {
          console.warn(`Unusual storage increase detected: ${sizeIncrease.toFixed(2)} MB in 24 hours`);
          // You could add additional alert mechanisms here (email, Slack, etc.)
        }
      }

      return null;
    } catch (error) {
      console.error('Error monitoring storage usage:', error);
      throw error;
    }
  });
