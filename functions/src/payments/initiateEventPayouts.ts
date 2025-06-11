import * as functions from 'firebase-functions';
import Stripe from 'stripe';
import { getFirestore } from 'firebase-admin/firestore';

const db = getFirestore();
const stripe = new Stripe(functions.config().stripe.secret_key, { apiVersion: '2023-10-16' });

// Helper to check admin privileges (update as needed for your app)
function isAdmin(email: string | undefined): boolean {
  const admins = [
    'aleczaitz@gmail.com',
    'donminic30@gmail.com',
    // Add more admin emails as needed
  ];
  return !!email && admins.includes(email);
}

export const initiateEventPayouts = functions.https.onCall(async (data, context) => {
  // 1. Check admin privileges
  const email = context.auth?.token?.email;
  if (!context.auth || !isAdmin(email)) {
    throw new functions.https.HttpsError('permission-denied', 'Admin only');
  }
  const { eventId } = data;
  if (!eventId) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing eventId');
  }
  // 2. Get event and bookings
  const eventRef = db.collection('events').doc(eventId);
  const eventDoc = await eventRef.get();
  if (!eventDoc.exists) throw new functions.https.HttpsError('not-found', 'Event not found');
  const bookingsSnap = await db.collection('bookings')
    .where('eventId', '==', eventId)
    .where('paidOut', '==', false)
    .get();
  // 3. For each booking, pay host
  let payoutCount = 0;
  for (const bookingDoc of bookingsSnap.docs) {
    const booking = bookingDoc.data();
    const hostSnap = await db.collection('users').doc(booking.hostId).get();
    const host = hostSnap.data();
    if (!host?.stripeAccountId) continue;
    const amount = Math.round(booking.totalPrice * 100); // in cents
    const waiveFee = host.waivePlatformFee || false;
    const platformFee = waiveFee ? 0 : Math.round(amount * 0.15);
    const payoutAmount = amount - platformFee;
    try {
      await stripe.transfers.create({
        amount: payoutAmount,
        currency: 'usd',
        destination: host.stripeAccountId,
        transfer_group: `event_${eventId}`,
        metadata: { bookingId: bookingDoc.id }
      });
      await bookingDoc.ref.update({ paidOut: true });
      payoutCount++;
    } catch (err) {
      console.error(`Failed to pay out booking ${bookingDoc.id}:`, err);
    }
  }
  // 4. Mark event as payout complete if all bookings paid
  const remaining = await db.collection('bookings')
    .where('eventId', '==', eventId)
    .where('paidOut', '==', false)
    .get();
  if (remaining.empty) {
    await eventRef.update({ payoutStatus: 'complete' });
  } else {
    await eventRef.update({ payoutStatus: 'pending' });
  }
  return { success: true, payouts: payoutCount };
}); 