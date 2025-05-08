/**
 * src/components/auth/ProtectedRoute.tsx
 * Component for protecting routes that require authentication
 */

import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

interface ProtectedRouteProps {
  children: React.ReactNode;
}

export const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Verifying your session...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    // Store the current path for redirect after login
    sessionStorage.setItem("returnPath", window.location.pathname);
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};
