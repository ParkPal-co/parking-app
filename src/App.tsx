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
import { PageLayout } from "./components/layout/PageLayout";
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
import { RegisteredEventsPage } from "./pages/RegisteredEventsPage";
import { ProtectedRoute } from "./components/auth/ProtectedRoute";

const App: React.FC = () => {
  return (
    <Router>
      <div className="min-h-screen bg-gray-100">
        <NavigationBar />
        <div className="pt-20">
          <Routes>
            <Route
              path="/"
              element={
                <PageLayout showBackButton={false} fullWidth={true}>
                  <EventSearchPage />
                </PageLayout>
              }
            />
            <Route
              path="/events"
              element={
                <PageLayout>
                  <UpcomingEventsPage />
                </PageLayout>
              }
            />
            <Route
              path="/rent"
              element={
                <PageLayout>
                  <DrivewaySelectPage />
                </PageLayout>
              }
            />
            <Route
              path="/booking-confirmation"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <BookingConfirmationPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/login"
              element={
                <PageLayout>
                  <LoginPage />
                </PageLayout>
              }
            />
            <Route
              path="/register"
              element={
                <PageLayout>
                  <RegisterPage />
                </PageLayout>
              }
            />
            <Route
              path="/my-listings"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <MyListingsPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/my-bookings"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <MyBookingsPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/messages"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <MessagesPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/account-settings"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <AccountSettingsPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/admin"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <AdminPanel />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-driveway"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <RegisterDrivewayPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/register-event"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <RegisterAnEventPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route
              path="/registered-events"
              element={
                <ProtectedRoute>
                  <PageLayout>
                    <RegisteredEventsPage />
                  </PageLayout>
                </ProtectedRoute>
              }
            />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>
      </div>
    </Router>
  );
};

export default App;
