import { RouteObject, Navigate } from "react-router-dom";
import React from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import VerifiedEmailRoute from "../components/auth/VerifiedEmailRoute";

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
const ListPage = React.lazy(() => import("../pages/ListPage"));
const StorageMetricsPage = React.lazy(
  () => import("../pages/StorageMetricsPage")
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
    path: "/list",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <ListPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
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
    element: <DrivewaySelectPage />,
  },
  {
    path: "/booking-confirmation",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <BookingConfirmationPage />
          </PageLayout>
        </VerifiedEmailRoute>
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
        <VerifiedEmailRoute>
          <PageLayout>
            <MyListingsPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/my-bookings",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <MyBookingsPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/messages",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <MessagesPage />
          </PageLayout>
        </VerifiedEmailRoute>
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
        <VerifiedEmailRoute>
          <PageLayout>
            <RegisterDrivewayPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/register-event",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <RegisterAnEventPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/registered-events",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <RegisteredEventsPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/booking-success",
    element: (
      <ProtectedRoute>
        <VerifiedEmailRoute>
          <PageLayout>
            <BookingSuccessPage />
          </PageLayout>
        </VerifiedEmailRoute>
      </ProtectedRoute>
    ),
  },
  {
    path: "/storage-metrics",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <StorageMetricsPage />
        </PageLayout>
      </ProtectedRoute>
    ),
  },
  {
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
