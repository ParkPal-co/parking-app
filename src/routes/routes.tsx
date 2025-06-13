import { RouteObject, Navigate } from "react-router-dom";
import React from "react";
import { PageLayout } from "../components/layout/PageLayout";
import { ProtectedRoute } from "../components/auth/ProtectedRoute";
import VerifiedEmailRoute from "../components/auth/VerifiedEmailRoute";

const EventSearchPage = React.lazy(
  () => import("../pages/bookings/EventSearchPage")
);
const UpcomingEventsPage = React.lazy(
  () => import("../pages/bookings/UpcomingEventsPage")
);
const DrivewaySelectPage = React.lazy(
  () => import("../pages/bookings/DrivewaySelectPage")
);
const BookingConfirmationPage = React.lazy(
  () => import("../pages/bookings/BookingConfirmationPage")
);
const LoginPage = React.lazy(() => import("../pages/auth/LoginPage"));
const RegisterPage = React.lazy(
  () => import("../pages/auth/RegisterAccountPage")
);
const MyListingsPage = React.lazy(
  () => import("../pages/hosting/MyListingsPage")
);
const MyBookingsPage = React.lazy(
  () => import("../pages/bookings/MyBookingsPage")
);
const MessagesPage = React.lazy(() => import("../pages/messages/MessagesPage"));
const AccountSettingsPage = React.lazy(
  () => import("../pages/auth/AccountSettingsPage")
);
const AdminPanel = React.lazy(() => import("../pages/admin/AdminPanel"));
const RegisterDrivewayPage = React.lazy(
  () => import("../pages/hosting/RegisterDrivewayPage")
);
const RegisterAnEventPage = React.lazy(
  () => import("../pages/admin/RegisterAnEventPage")
);
const RegisteredEventsPage = React.lazy(
  () => import("../pages/admin/RegisteredEventsPage")
);
const BookingSuccessPage = React.lazy(
  () => import("../pages/bookings/BookingSuccessPage")
);
const ListPage = React.lazy(() => import("../pages/hosting/ListLandingPage"));
const StorageMetricsPage = React.lazy(
  () => import("../pages/admin/StorageMetricsPage")
);
const UnderConstruction = React.lazy(
  () => import("../pages/general/UnderConstruction")
);
const PortlandLandingPage = React.lazy(() => import("../pages/hosting/PortlandLandingPage"));

const FeedbackPage = React.lazy(() => import("../pages/admin/FeedbackPage"));

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
          <PageLayout fullWidth={true} showBackButton={false}>
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
          <PageLayout showBackButton={false}>
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
    path: "/admin/feedback",
    element: (
      <ProtectedRoute>
        <PageLayout>
          <FeedbackPage />
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
    path: "/about",
    element: (
      <PageLayout fullWidth={true} showBackButton={false}>
        <UnderConstruction />
      </PageLayout>
    ),
  },
  {
    path: "/contact",
    element: (
      <PageLayout fullWidth={true} showBackButton={false}>
        <UnderConstruction />
      </PageLayout>
    ),
  },
  {
    path: "/terms",
    element: (
      <PageLayout fullWidth={true} showBackButton={false}>
        <UnderConstruction />
      </PageLayout>
    ),
  },
  {
    path: "/privacy",
    element: (
      <PageLayout fullWidth={true} showBackButton={false}>
        <UnderConstruction />
      </PageLayout>
    ),
  },
  {
    path: "/portland-WLF",
    element: (
      <PageLayout fullWidth={true} showBackButton={false}>
        <PortlandLandingPage />
      </PageLayout>
    ),
  },
  { 
    path: "*",
    element: <Navigate to="/" replace />,
  },
];
