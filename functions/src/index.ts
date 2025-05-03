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
import { onCall } from 'firebase-functions/v2/https';
import Stripe from 'stripe';

// Initialize Firebase Admin
initializeApp();

// Initialize Firestore
const db = getFirestore();

// Start writing functions
// https://firebase.google.com/docs/functions/typescript

// export const helloWorld = onRequest((request, response) => {
//   logger.info("Hello logs!", {structuredData: true});
//   response.send("Hello from Firebase!");
// });

// Create a payment intent
export const createPaymentIntent = onCall(
  { secrets: ['STRIPE_SECRET_KEY'] },
  async (request) => {
    try {
      // Check if user is authenticated
      if (!request.auth) {
        throw new Error('Authentication required');
      }

      const { amount, currency } = request.data;

      // Validate amount
      if (!amount || amount <= 0) {
        throw new Error('Invalid amount');
      }

      // Initialize Stripe using secret from env
      const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
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
        userId: request.auth.uid,
        amount,
        currency,
        status: paymentIntent.status,
        created: paymentIntent.created,
      });

      console.log(`Payment intent ${paymentIntent.id} created for user ${request.auth.uid}`);

      return {
        clientSecret: paymentIntent.client_secret,
      };
    } catch (error) {
      console.error('Error creating payment intent:', error);
      throw new Error('Failed to create payment intent');
    }
  }
);
