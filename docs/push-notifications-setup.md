# Push Notifications Setup

This document explains how to set up push notifications for ParkPal to notify users of new messages.

## Overview

The push notification system includes:

- Firebase Cloud Messaging (FCM) for sending notifications
- Service worker for handling background notifications
- User notification preferences management
- Cloud Functions for automatic notification sending

## Prerequisites

1. **Firebase Project Setup**: Ensure your Firebase project has Cloud Messaging enabled
2. **VAPID Key**: Generate a VAPID key for web push notifications
3. **Environment Variables**: Add the required environment variables

## Environment Variables

Add these to your `.env` file:

```env
# Firebase Configuration
VITE_FIREBASE_API_KEY=your_api_key
VITE_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your_project_id
VITE_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
VITE_FIREBASE_MEASUREMENT_ID=your_measurement_id

# VAPID Key for Web Push Notifications
VITE_FIREBASE_VAPID_KEY=your_vapid_key
```

## Firebase Console Setup

### 1. Enable Cloud Messaging

1. Go to your Firebase Console
2. Navigate to Project Settings
3. Go to the "Cloud Messaging" tab
4. Generate a new Web Push certificate (VAPID key)
5. Copy the VAPID key to your environment variables

### 2. Configure Cloud Functions

1. Ensure Firebase Admin SDK is initialized in your functions
2. Deploy the message notification function:
   ```bash
   npm run deploy:functions
   ```

## Service Worker

The service worker (`public/firebase-messaging-sw.js`) is automatically generated during build. It handles:

- Background message reception
- Notification display
- Click actions to open the app

## User Experience

### Automatic Setup

- When users log in, they're prompted to enable notifications
- FCM tokens are automatically saved to their user profile
- Users can manage notification preferences in Account Settings

### Notification Types

- **New Messages**: Notified when someone sends them a message
- **Booking Updates**: Notified about booking confirmations/changes
- **Event Updates**: Notified about new events and changes

### User Controls

- Enable/disable notifications per category
- Notification preferences are saved to their profile
- Users can revoke permissions at any time

## Testing

### Local Development

1. Run the development server: `npm run dev`
2. Log in to the app
3. Accept notification permissions when prompted
4. Send a test message to trigger a notification

### Production Testing

1. Deploy the app: `npm run deploy`
2. Test notifications on a real device
3. Verify background notifications work when app is closed

## Troubleshooting

### Common Issues

1. **Notifications not showing**

   - Check browser permissions
   - Verify VAPID key is correct
   - Check Firebase Console for errors

2. **Service worker not loading**

   - Ensure service worker is in the public directory
   - Check that build script generates the file correctly

3. **FCM token not generated**
   - Check Firebase configuration
   - Verify user is authenticated
   - Check browser console for errors

### Debug Steps

1. Check browser console for FCM errors
2. Verify environment variables are loaded
3. Test notification permissions manually
4. Check Firebase Functions logs for errors

## Security Considerations

- FCM tokens are stored securely in Firestore
- Users can revoke permissions at any time
- Notifications respect user preferences
- No sensitive data is included in notifications

## Performance

- Notifications are sent asynchronously
- Background processing doesn't affect app performance
- FCM tokens are cached locally
- Service worker is lightweight and efficient
