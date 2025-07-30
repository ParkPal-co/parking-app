import { messaging } from "../../firebase/config";
import { getToken, onMessage } from "firebase/messaging";
import { doc, setDoc, getDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";

export interface NotificationPreferences {
  messages: boolean;
  bookings: boolean;
  events: boolean;
}

export class NotificationService {
  private static instance: NotificationService;
  private currentToken: string | null = null;

  private constructor() {}

  static getInstance(): NotificationService {
    if (!NotificationService.instance) {
      NotificationService.instance = new NotificationService();
    }
    return NotificationService.instance;
  }

  async requestPermission(): Promise<boolean> {
    try {
      const permission = await Notification.requestPermission();
      return permission === "granted";
    } catch (error) {
      console.error("Error requesting notification permission:", error);
      return false;
    }
  }

  async getToken(): Promise<string | null> {
    try {
      const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FIREBASE_VAPID_KEY,
      });

      if (token) {
        this.currentToken = token;
        return token;
      }

      console.log("No registration token available");
      return null;
    } catch (error) {
      console.error("Error getting token:", error);
      return null;
    }
  }

  async saveTokenToDatabase(userId: string, token: string): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        fcmToken: token,
        notificationPreferences: {
          messages: true,
          bookings: true,
          events: true,
        },
        tokenUpdatedAt: new Date(),
      });
    } catch (error) {
      console.error("Error saving token to database:", error);
      throw error;
    }
  }

  async getNotificationPreferences(
    userId: string
  ): Promise<NotificationPreferences> {
    try {
      const userRef = doc(db, "users", userId);
      const userDoc = await getDoc(userRef);

      if (userDoc.exists()) {
        const data = userDoc.data();
        return (
          data.notificationPreferences || {
            messages: true,
            bookings: true,
            events: true,
          }
        );
      }

      return {
        messages: true,
        bookings: true,
        events: true,
      };
    } catch (error) {
      console.error("Error getting notification preferences:", error);
      return {
        messages: true,
        bookings: true,
        events: true,
      };
    }
  }

  async updateNotificationPreferences(
    userId: string,
    preferences: Partial<NotificationPreferences>
  ): Promise<void> {
    try {
      const userRef = doc(db, "users", userId);
      await updateDoc(userRef, {
        notificationPreferences: preferences,
      });
    } catch (error) {
      console.error("Error updating notification preferences:", error);
      throw error;
    }
  }

  onMessageReceived(callback: (payload: any) => void): () => void {
    return onMessage(messaging, callback);
  }

  async initializeNotifications(userId: string): Promise<boolean> {
    try {
      // Request permission
      const hasPermission = await this.requestPermission();
      if (!hasPermission) {
        console.log("Notification permission denied");
        return false;
      }

      // Get FCM token
      const token = await this.getToken();
      if (!token) {
        console.log("Failed to get FCM token");
        return false;
      }

      // Save token to database
      await this.saveTokenToDatabase(userId, token);

      console.log("Notifications initialized successfully");
      return true;
    } catch (error) {
      console.error("Error initializing notifications:", error);
      return false;
    }
  }
}

export const notificationService = NotificationService.getInstance();
