import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

interface CreatePaymentIntentData {
  amount: number;
  currency: string;
}

export async function createPaymentIntentHandler(
  data: CreatePaymentIntentData,
  context: functions.https.CallableContext
) {
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
}

export const createPaymentIntent = functions.https.onCall(createPaymentIntentHandler); 