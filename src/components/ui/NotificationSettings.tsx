import React from "react";
import { useNotifications } from "../../hooks/useNotifications";
import { Button } from "./Button";
import { Card } from "./Card";

export const NotificationSettings: React.FC = () => {
  const {
    isInitialized,
    isLoading,
    preferences,
    updatePreferences,
    requestPermission,
  } = useNotifications();

  const handleToggle = async (key: keyof typeof preferences) => {
    await updatePreferences({ [key]: !preferences[key] });
  };

  const handleEnableNotifications = async () => {
    await requestPermission();
  };

  if (isLoading) {
    return (
      <Card className="p-6">
        <div className="animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
          <div className="space-y-3">
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
            <div className="h-4 bg-gray-200 rounded"></div>
          </div>
        </div>
      </Card>
    );
  }

  return (
    <Card className="p-6">
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">
            Notification Settings
          </h3>
          <p className="text-sm text-gray-600">
            Choose what notifications you want to receive from ParkPal
          </p>
        </div>

        {!isInitialized && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-start">
              <div className="flex-shrink-0">
                <svg
                  className="h-5 w-5 text-yellow-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <div className="ml-3">
                <h3 className="text-sm font-medium text-yellow-800">
                  Notifications not enabled
                </h3>
                <div className="mt-2 text-sm text-yellow-700">
                  <p>
                    Enable notifications to receive alerts for new messages and
                    updates.
                  </p>
                </div>
                <div className="mt-4">
                  <Button
                    onClick={handleEnableNotifications}
                    variant="primary"
                    size="small"
                  >
                    Enable Notifications
                  </Button>
                </div>
              </div>
            </div>
          </div>
        )}

        {isInitialized && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  New Messages
                </h4>
                <p className="text-sm text-gray-500">
                  Get notified when someone sends you a message
                </p>
              </div>
              <button
                onClick={() => handleToggle("messages")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences.messages ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.messages ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Booking Updates
                </h4>
                <p className="text-sm text-gray-500">
                  Get notified about booking confirmations and changes
                </p>
              </div>
              <button
                onClick={() => handleToggle("bookings")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences.bookings ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.bookings ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>

            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium text-gray-900">
                  Event Updates
                </h4>
                <p className="text-sm text-gray-500">
                  Get notified about new events and event changes
                </p>
              </div>
              <button
                onClick={() => handleToggle("events")}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                  preferences.events ? "bg-blue-600" : "bg-gray-200"
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    preferences.events ? "translate-x-6" : "translate-x-1"
                  }`}
                />
              </button>
            </div>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-xs text-gray-500">
            You can change these settings at any time. Notifications will be
            sent to your device even when the app is closed.
          </p>
        </div>
      </div>
    </Card>
  );
};
