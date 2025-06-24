/**
 * eventNotificationService.ts
 * Handles adding notification emails for events
 */
import { addDoc, collection as firestoreCollection, serverTimestamp, getDocs, Timestamp } from "firebase/firestore";
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

/**
 * Fetches all notification emails for a specific event.
 * @param eventId The event's ID
 * @returns Promise that resolves to an array of emails
 */
export async function fetchEventNotificationEmails(eventId: string): Promise<{ id: string; email: string; createdAt: Timestamp }[]> {
  try {
    const emailsRef = firestoreCollection(db, "eventNotifications", eventId, "emails");
    const snapshot = await getDocs(emailsRef);
    return snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as { email: string; createdAt: Timestamp })
    }));
  } catch (error) {
    console.error("Error fetching notification emails:", error);
    throw error;
  }
} 