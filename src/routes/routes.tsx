import { RouteObject, Navigate } from "react-router-dom";
import React from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";

const EventSearchPage = React.lazy(() => import("../pages/EventSearchPage"));
const UpcomingEventsPage = React.lazy(
  () => import("../pages/UpcomingEventsPage")
);
const DrivewaySelectPage = React.lazy(
  () => import("../pages/DrivewaySelectPage")
);
const BookingConfirmationPage = React.lazy(
  () => import("../pages/BookingConfirmationPage")
);
const LoginPage = React.lazy(() => import("../pages/LoginPage"));
const RegisterPage = React.lazy(() => import("../pages/RegisterPage"));
const MyListingsPage = React.lazy(() => import("../pages/MyListingsPage"));
const MyBookingsPage = React.lazy(() => import("../pages/MyBookingsPage"));
const MessagesPage = React.lazy(() => import("../pages/MessagesPage"));
const AccountSettingsPage = React.lazy(
  () => import("../pages/AccountSettingsPage")
);
const AdminPanel = React.lazy(() => import("../pages/AdminPanel"));
const RegisterDrivewayPage = React.lazy(
  () => import("../pages/RegisterDrivewayPage")
);
const RegisterAnEventPage = React.lazy(
  () => import("../pages/RegisterAnEventPage")
);
const RegisteredEventsPage = React.lazy(
  () => import("../pages/RegisteredEventsPage")
);
const BookingSuccessPage = React.lazy(
  () => import("../pages/BookingSuccessPage")
);

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
