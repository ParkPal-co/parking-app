/**
 * eventNotificationService.ts
 * Handles adding notification emails for events
 */
import { addDoc, collection as firestoreCollection, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config";

/**
 * Adds an email to the notification list for a specific event.
 * @param eventId The event's ID
 * @param email The user's email address
 */
export async function addEventNotificationEmail(eventId: string, email: string): Promise<void> {
  try {
    const emailsRef = firestoreCollection(db, "eventNotifications", eventId, "emails");
    await addDoc(emailsRef, {
      email,
      createdAt: serverTimestamp(),
    });
  } catch (error) {
    console.error("Error adding notification email:", error);
    throw error;
  }
} 