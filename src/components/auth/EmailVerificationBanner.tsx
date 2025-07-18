import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";

interface EmailVerificationBannerProps {
  className?: string;
}

const EmailVerificationBanner: React.FC<EmailVerificationBannerProps> = ({
  className = "",
}) => {
  const { user, sendVerificationEmail } = useAuth();
  const [sending, setSending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  if (!user || user.emailVerified) {
    return null;
  }

  const handleResendVerification = async () => {
    try {
      setSending(true);
      setError(null);
      setSuccess(false);
      await sendVerificationEmail();
      setSuccess(true);
    } catch (err) {
      setError("Failed to send verification email. Please try again later.");
    } finally {
      setSending(false);
    }
  };

  return (
    <div
      className={`bg-yellow-50 border-l-4 border-yellow-400 p-4 ${className}`}
    >
      <div className="flex">
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
          <p className="text-sm text-yellow-700">
            Please verify your email.
            {error && <span className="block mt-1 text-red-600">{error}</span>}
            {success && (
              <span className="block mt-1 text-green-600">
                Verification email sent! Please check your inbox.
              </span>
            )}
          </p>
          <div className="mt-2">
            <button
              type="button"
              onClick={handleResendVerification}
              disabled={sending}
              className="inline-flex items-center px-3 py-1.5 border border-transparent text-xs font-medium rounded-md text-yellow-700 bg-yellow-100 hover:bg-yellow-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-yellow-500 disabled:opacity-50"
            >
              {sending ? "Sending..." : "Resend verification email"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmailVerificationBanner;
