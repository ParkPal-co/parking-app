import { useState, useEffect, useCallback } from "react";
import { useAuth } from "./useAuth";
import {
  notificationService,
  NotificationPreferences,
} from "../services/notifications/notificationService";
import { useNotification } from "../components/ui/NotificationProvider";

export function useNotifications() {
  const { user } = useAuth();
  const { notify } = useNotification();
  const [isInitialized, setIsInitialized] = useState(false);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    messages: true,
    bookings: true,
    events: true,
  });
  const [isLoading, setIsLoading] = useState(false);

  // Initialize notifications when user logs in
  useEffect(() => {
    if (!user) {
      setIsInitialized(false);
      return;
    }

    const initializeNotifications = async () => {
      setIsLoading(true);
      try {
        const success = await notificationService.initializeNotifications(
          user.id
        );
        if (success) {
          setIsInitialized(true);
          notify(
            "Notifications enabled! You'll receive alerts for new messages.",
            {
              variant: "success",
              title: "Notifications Enabled",
            }
          );
        } else {
          notify(
            "Failed to enable notifications. Please check your browser settings.",
            {
              variant: "error",
              title: "Notification Setup Failed",
            }
          );
        }
      } catch (error) {
        console.error("Error initializing notifications:", error);
        notify("Failed to enable notifications. Please try again.", {
          variant: "error",
          title: "Notification Setup Failed",
        });
      } finally {
        setIsLoading(false);
      }
    };

    initializeNotifications();
  }, [user, notify]);

  // Load notification preferences
  useEffect(() => {
    if (!user) return;

    const loadPreferences = async () => {
      try {
        const prefs = await notificationService.getNotificationPreferences(
          user.id
        );
        setPreferences(prefs);
      } catch (error) {
        console.error("Error loading notification preferences:", error);
      }
    };

    loadPreferences();
  }, [user]);

  // Handle foreground messages
  useEffect(() => {
    if (!user) return;

    const unsubscribe = notificationService.onMessageReceived((payload) => {
      console.log("Foreground message received:", payload);

      // Show in-app notification
      notify(payload.notification?.body || "You have a new message!", {
        variant: "info",
        title: payload.notification?.title || "New Message",
        duration: 5000,
      });
    });

    return unsubscribe;
  }, [user, notify]);

  const updatePreferences = useCallback(
    async (newPreferences: Partial<NotificationPreferences>) => {
      if (!user) return;

      try {
        await notificationService.updateNotificationPreferences(
          user.id,
          newPreferences
        );
        setPreferences((prev) => ({ ...prev, ...newPreferences }));
        notify("Notification preferences updated!", { variant: "success" });
      } catch (error) {
        console.error("Error updating notification preferences:", error);
        notify("Failed to update notification preferences.", {
          variant: "error",
        });
      }
    },
    [user, notify]
  );

  const requestPermission = useCallback(async () => {
    try {
      const hasPermission = await notificationService.requestPermission();
      if (hasPermission) {
        notify("Notification permission granted!", { variant: "success" });
        return true;
      } else {
        notify(
          "Notification permission denied. Please enable notifications in your browser settings.",
          {
            variant: "error",
            title: "Permission Denied",
          }
        );
        return false;
      }
    } catch (error) {
      console.error("Error requesting permission:", error);
      notify("Failed to request notification permission.", {
        variant: "error",
      });
      return false;
    }
  }, [notify]);

  return {
    isInitialized,
    isLoading,
    preferences,
    updatePreferences,
    requestPermission,
  };
}
