/**
 * functions/src/index.ts
 * Firebase Functions for the Event Parking App
 */

import * as functions from 'firebase-functions';
import * as admin from 'firebase-admin';
import Stripe from 'stripe';

// Initialize Firebase Admin
admin.initializeApp();

// Initialize Stripe with secret key from environment variables
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create a payment intent
export const createPaymentIntent = functions.https.onCall(async (data, context) => {
  // Ensure user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError(
      'unauthenticated',
      'The function must be called while authenticated.'
    );
  }

  const { amount, currency = 'usd' } = data;

  // Validate amount
  if (!amount || amount <= 0) {
    throw new functions.https.HttpsError(
      'invalid-argument',
      'Invalid amount provided.'
    );
  }

  try {
    // Create payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(amount * 100), // Convert to cents
      currency,
      automatic_payment_methods: {
        enabled: true,
      },
      metadata: {
        userId: context.auth.uid,
      },
    });

    // Log the payment intent creation in Firestore
    await admin.firestore().collection('paymentIntents').doc(paymentIntent.id).set({
      userId: context.auth.uid,
      amount,
      currency,
      status: paymentIntent.status,
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
    });

    return { clientSecret: paymentIntent.client_secret };
  } catch (error) {
    console.error('Error creating payment intent:', error);
    throw new functions.https.HttpsError(
      'internal',
      'An error occurred while creating the payment intent.'
    );
  }
}); 