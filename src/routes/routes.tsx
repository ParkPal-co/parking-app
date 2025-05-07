import { RouteObject, Navigate } from "react-router-dom";
import { PageLayout } from "../components/layout/PageLayout";
import { EventSearchPage } from "../pages/EventSearchPage";
import { UpcomingEventsPage } from "../pages/UpcomingEventsPage";
import { DrivewaySelectPage } from "../pages/DrivewaySelectPage";
import { BookingConfirmationPage } from "../pages/BookingConfirmationPage";
import { LoginPage } from "../pages/LoginPage";
import { RegisterPage } from "../pages/RegisterPage";
import { MyListingsPage } from "../pages/MyListingsPage";
import { MyBookingsPage } from "../pages/MyBookingsPage";
import { MessagesPage } from "../pages/MessagesPage";
import { AccountSettingsPage } from "../pages/AccountSettingsPage";
import { AdminPanel } from "../pages/AdminPanel";
import { RegisterDrivewayPage } from "../pages/RegisterDrivewayPage";
import { RegisterAnEventPage } from "../pages/RegisterAnEventPage";
import { RegisteredEventsPage } from "../pages/RegisteredEventsPage";
import { BookingSuccessPage } from "../pages/BookingSuccessPage";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

export const routes: RouteObject[] = [
  {
    path: "/",
    element: (
      <PageLayout showBackButton={false} fullWidth={true}>
        <EventSearchPage />
      </PageLayout>
    ),
  },
  {
    path: "/events",
    element: (
      <PageLayout>
        <UpcomingEventsPage />
      </PageLayout>
    ),
  },
  {
    path: "/rent",
    element: (
      <PageLayout>
        <DrivewaySelectPage />
      </PageLayout>
    ),
  },
  {
    path: "/booking-confirmation",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <BookingConfirmationPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/login",
    element: (
      <PageLayout>
        <LoginPage />
      </PageLayout>
    ),
  },
  {
    path: "/register",
    element: (
      <PageLayout>
        <RegisterPage />
      </PageLayout>
    ),
  },
  {
    path: "/my-listings",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <MyListingsPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-bookings",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <MyBookingsPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <MessagesPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/account-settings",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <AccountSettingsPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/admin",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <AdminPanel />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-driveway",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <RegisterDrivewayPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-event",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <RegisterAnEventPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/registered-events",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <RegisteredEventsPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "/booking-success",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <BookingSuccessPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
