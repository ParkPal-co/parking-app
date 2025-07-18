import * as functions from 'firebase-functions';
import sgMail from '@sendgrid/mail';

// Initialize SendGrid with API key from Firebase Functions config
const sendgridApiKey = functions.config().sendgrid.api_key;
sgMail.setApiKey(sendgridApiKey);

/**
 * Data expected by the function:
 * {
 *   renterEmail: string,
 *   renterName: string,
 *   hostEmail: string,
 *   hostName: string,
 *   bookingDetails: {
 *     startTime: string,
 *     endTime: string,
 *     location: string,
 *     price: number,
 *   }
 * }
 */
export const sendBookingConfirmation = functions.https.onCall(async (data) => {
  const {
    renterEmail,
    renterName,
    hostEmail,
    hostName,
    bookingDetails
  } = data;

  if (!renterEmail || !hostEmail || !bookingDetails) {
    throw new functions.https.HttpsError('invalid-argument', 'Missing required booking or user info.');
  }

  // Email content for renter
  const renterMsg = {
    to: renterEmail,
    from: {
      email: 'no-reply@parkpal.co', // Change to your verified sender
      name: 'ParkPal',
    },
    subject: 'Your Parking Booking is Confirmed! 🚗',
    html: `
      <div style="color:#000000;">
        <h2>Hi ${renterName || 'there'},</h2>
        <p>Your booking is confirmed! Here are your details:</p>
        <ul>
          <li><b>Location:</b> ${bookingDetails.location}</li>
          <li><b>Description:</b> ${bookingDetails.description}</li>
          <li><b>Start:</b> ${bookingDetails.startTime}</li>
          <li><b>End:</b> ${bookingDetails.endTime}</li>
          <li><b>Price:</b> $${bookingDetails.price}</li>
          <li><b>Car:</b> ${bookingDetails.carDescription}</li>
          <li><b>License Plate:</b> ${bookingDetails.licensePlate}</li>
        </ul>
        <p>You can view or manage your bookings <a href="https://parkpal.co/bookings/mybookings">here</a>.</p>
        <p>If you have any questions, reply to this email or contact support at <a href="mailto:alec@parkpal.co">support@parkpal.co</a>.</p>
        <br>
        <p>Thank you for using ParkPal!</p>
      </div>
    `,
  };

  // Email content for host
  const hostMsg = {
    to: hostEmail,
    from: {
      email: 'no-reply@parkpal.co', // Change to your verified sender
      name: 'ParkPal',
    },
    subject: 'Your Listing Has Been Booked! 🎉',
    html: `
      <div style="color:#000000;">
        <h2>Hi ${hostName || 'there'},</h2>
        <p>Your parking spot has been booked! Here are the details:</p>
        <ul>
          <li><b>Location:</b> ${bookingDetails.location}</li>
          <li><b>Description:</b> ${bookingDetails.description}</li>
          <li><b>Start:</b> ${bookingDetails.startTime}</li>
          <li><b>End:</b> ${bookingDetails.endTime}</li>
          <li><b>Price:</b> $${bookingDetails.price}</li>
          <li><b>Car:</b> ${bookingDetails.carDescription}</li>
          <li><b>License Plate:</b> ${bookingDetails.licensePlate}</li>
        </ul>
        <p>You can view your listings <a href="https://parkpal.co/hosting/mylistingspage">here</a>.</p>
        <p>If you have any questions, reply to this email or contact support at <a href="mailto:alec@parkpal.co">support@parkpal.co</a>.</p>
        <br>
        <p>Thank you for being a ParkPal host!</p>
      </div>
    `,
  };

  try {
    await Promise.all([
      sgMail.send(renterMsg),
      sgMail.send(hostMsg),
    ]);
    return { success: true };
  } catch (error) {
    console.error('Error sending booking confirmation emails:', error);
    throw new functions.https.HttpsError('internal', 'Failed to send confirmation emails.');
  }
}); 