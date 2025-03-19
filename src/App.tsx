/**
 * src/App.tsx
 * Main application component with routing
 */

import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { NavigationBar } from "./components/navigation/NavigationBar";
import { EventSearchPage } from "./pages/EventSearchPage";
import { UpcomingEventsPage } from "./pages/UpcomingEventsPage";
import { DrivewaySelectPage } from "./pages/DrivewaySelectPage";
import { BookingConfirmationPage } from "./pages/BookingConfirmationPage";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { MyListingsPage } from "./pages/MyListingsPage";
import { MyBookingsPage } from "./pages/MyBookingsPage";
import { MessagesPage } from "./pages/MessagesPage";
import { AccountSettingsPage } from "./pages/AccountSettingsPage";
import { AdminPanel } from "./pages/AdminPanel";
import { RegisterDrivewayPage } from "./pages/RegisterDrivewayPage";
import { RegisterAnEventPage } from "./pages/RegisterAnEventPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <NavigationBar />
        <Routes>
          <Route path="/" element={<EventSearchPage />} />
          <Route path="/events" element={<UpcomingEventsPage />} />
          <Route path="/rent" element={<DrivewaySelectPage />} />
          <Route
            path="/booking-confirmation"
            element={
              <ProtectedRoute>
                <BookingConfirmationPage />
              </ProtectedRoute>
            }
          />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegisterPage />} />
          <Route
            path="/my-listings"
            element={
              <ProtectedRoute>
                <MyListingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/my-bookings"
            element={
              <ProtectedRoute>
                <MyBookingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/messages"
            element={
              <ProtectedRoute>
                <MessagesPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/account-settings"
            element={
              <ProtectedRoute>
                <AccountSettingsPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/admin"
            element={
              <ProtectedRoute>
                <AdminPanel />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-driveway"
            element={
              <ProtectedRoute>
                <RegisterDrivewayPage />
              </ProtectedRoute>
            }
          />
          <Route
            path="/register-event"
            element={
              <ProtectedRoute>
                <RegisterAnEventPage />
              </ProtectedRoute>
            }
          />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </div>
    </Router>
  );
};

export default App;
