import { onDocumentCreated } from "firebase-functions/v2/firestore";
import { getMessaging } from "firebase-admin/messaging";
import { getFirestore } from "firebase-admin/firestore";
import { logger } from "firebase-functions";

const db = getFirestore();

export const sendMessageNotification = onDocumentCreated(
  "messages/{messageId}",
  async (event) => {
    try {
      const messageData = event.data?.data();
      if (!messageData) {
        logger.error("No message data found");
        return;
      }

      const { receiverId, senderId, content, conversationId } = messageData;

      // Don't send notification if sender is the same as receiver
      if (senderId === receiverId) {
        return;
      }

      // Get receiver's FCM token and notification preferences
      const receiverDoc = await db.collection("users").doc(receiverId).get();
      if (!receiverDoc.exists) {
        logger.error("Receiver user not found:", receiverId);
        return;
      }

      const receiverData = receiverDoc.data();
      const fcmToken = receiverData?.fcmToken;
      const notificationPreferences =
        receiverData?.notificationPreferences || {};

      // Check if user has notifications enabled for messages
      if (!notificationPreferences.messages) {
        logger.info("User has disabled message notifications:", receiverId);
        return;
      }

      if (!fcmToken) {
        logger.info("No FCM token found for user:", receiverId);
        return;
      }

      // Get sender's name for the notification
      const senderDoc = await db.collection("users").doc(senderId).get();
      const senderName = senderDoc.exists
        ? senderDoc.data()?.name || "Someone"
        : "Someone";

      // Get conversation details for better context
      const conversationDoc = await db
        .collection("conversations")
        .doc(conversationId)
        .get();
      const conversationData = conversationDoc.exists
        ? conversationDoc.data()
        : null;
      const bookingId = conversationData?.bookingId;

      // Prepare notification message
      const notification = {
        title: `New message from ${senderName}`,
        body:
          content.length > 100 ? `${content.substring(0, 100)}...` : content,
      };

      const message = {
        token: fcmToken,
        notification,
        data: {
          type: "message",
          conversationId,
          senderId,
          receiverId,
          bookingId: bookingId || "",
          clickAction: "FLUTTER_NOTIFICATION_CLICK",
        },
        android: {
          notification: {
            channelId: "messages",
            priority: "high",
            sound: "default",
          },
        },
        apns: {
          payload: {
            aps: {
              sound: "default",
              badge: 1,
            },
          },
        },
        webpush: {
          notification: {
            icon: "/favicon.svg",
            badge: "/favicon.svg",
            actions: [
              {
                action: "open",
                title: "Open",
              },
              {
                action: "dismiss",
                title: "Dismiss",
              },
            ],
          },
          fcmOptions: {
            link: "/messages",
          },
        },
      };

      // Send the notification
      const response = await getMessaging().send(message);
      logger.info("Message notification sent successfully:", response);
    } catch (error) {
      logger.error("Error sending message notification:", error);
    }
  }
);
