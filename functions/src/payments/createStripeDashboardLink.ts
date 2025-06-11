import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const createStripeDashboardLink = functions.https.onCall(async (data, context) => {
  try {
    if (!context.auth) {
      throw new functions.https.HttpsError('unauthenticated', 'Authentication required');
    }
    const userId = context.auth.uid;
    // Fetch user from Firestore
    const userRef = db.collection('users').doc(userId);
    const userSnap = await userRef.get();
    if (!userSnap.exists) {
      throw new functions.https.HttpsError('not-found', 'User not found');
    }
    const userData = userSnap.data();
    if (!userData) {
      throw new functions.https.HttpsError('not-found', 'User data not found');
    }
    const stripeAccountId = userData.stripeAccountId;
    if (!stripeAccountId) {
      throw new functions.https.HttpsError('failed-precondition', 'No Stripe account connected');
    }
    const stripe = new Stripe(functions.config().stripe.secret_key, {
      apiVersion: '2023-10-16',
    });
    // Create a login link for the Stripe Express Dashboard
    const loginLink = await stripe.accounts.createLoginLink(stripeAccountId);
    return { url: loginLink.url };
  } catch (error) {
    console.error('Error creating Stripe dashboard link:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create Stripe dashboard link');
  }
}); 