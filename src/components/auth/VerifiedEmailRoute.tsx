import React from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
// import EmailVerificationBanner from "./EmailVerificationBanner";

interface VerifiedEmailRouteProps {
  children: React.ReactNode;
}

const VerifiedEmailRoute: React.FC<VerifiedEmailRouteProps> = ({
  children,
}) => {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Checking email verification status...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/login" />;
  }

  if (!user.emailVerified) {
    return (
      <div className="min-h-screen bg-gray-50">
        {/* EmailVerificationBanner is now only rendered globally */}
        <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="border-4 border-dashed border-gray-200 rounded-lg p-8 text-center">
              <h2 className="text-2xl font-semibold text-gray-900 mb-4">
                Email Verification Required
              </h2>
              <p className="text-gray-600 mb-4">
                Please verify your email address to access this feature. We've
                sent you a verification email. If you haven't received it, you
                can request a new one using the button above.
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default VerifiedEmailRoute;
