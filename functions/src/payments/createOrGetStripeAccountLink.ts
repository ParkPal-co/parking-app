import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();

export const createOrGetStripeAccountLink = functions.https.onCall(async (data, context) => {
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
    if (!userData.email) {
      throw new functions.https.HttpsError('invalid-argument', 'User email is required for Stripe onboarding');
    }
    if (!userData.emailVerified) {
      throw new functions.https.HttpsError('permission-denied', 'Email must be verified for Stripe onboarding');
    }
    let stripeAccountId = userData.stripeAccountId;
    const stripe = new Stripe(functions.config().stripe.secret_key, {
      apiVersion: '2023-10-16',
    });
    // If no Stripe account, create one
    if (!stripeAccountId) {
      console.log('userData for Stripe Connect:', userData);
      if (!userData.email) {
        throw new functions.https.HttpsError('invalid-argument', 'User email is required for Stripe onboarding');
      }
      const account = await stripe.accounts.create({
        type: 'express',
        email: userData.email,
        capabilities: {
          transfers: { requested: true },
          card_payments: { requested: true },
        },
        business_type: 'individual',
        metadata: {
          firebaseUID: userId,
        },
      });
      stripeAccountId = account.id;
      // Save to Firestore
      await userRef.update({ stripeAccountId });
    }
    // Ensure user is marked as a host
    if (!userData.isHost) {
      await userRef.update({ isHost: true });
      userData.isHost = true;
    }
    // Create an account link for onboarding
    const origin = data.origin || 'https://parkpal.co';
    const accountLink = await stripe.accountLinks.create({
      account: stripeAccountId,
      refresh_url: `${origin}/account-settings?stripe=refresh`,
      return_url: `${origin}/account-settings?stripe=return`,
      type: 'account_onboarding',
    });
    return { url: accountLink.url };
  } catch (error) {
    console.error('Error creating Stripe Connect onboarding link:', error);
    throw new functions.https.HttpsError('internal', 'Failed to create Stripe onboarding link');
  }
}); 