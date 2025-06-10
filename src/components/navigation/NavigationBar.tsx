/**
 * src/components/navigation/NavigationBar.tsx
 * Component for site-wide navigation
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Icon1 from "../../assets/images/Icon1.png";
import { twMerge } from "tailwind-merge";
import { UserMenu } from "./UserMenu";
import { FeedbackModal } from "../../pages/general/FeedbackModal";
import { addFeedback } from "../../services/feedbackService";
import { ChatBubbleLeftRightIcon } from "@heroicons/react/24/outline";
import { useNotification } from "../ui/NotificationProvider";

interface NavLinkProps {
  to: string;
  children: React.ReactNode;
  isActive?: boolean;
  className?: string;
}

const NavLink: React.FC<NavLinkProps> = ({
  to,
  children,
  isActive,
  className,
}) => (
  <Link
    to={to}
    className={twMerge(
      "text-lg transition-colors duration-150",
      isActive
        ? "font-bold text-primary-900"
        : "text-primary-600 hover:text-primary-900",
      className
    )}
  >
    {children}
  </Link>
);

export const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const { notify } = useNotification();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | undefined>(
    undefined
  );
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = async () => {
    try {
      await logout();
      notify("Sign out successful", { variant: "success" });
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isRentActive = location.pathname === "/";
  const isListActive =
    location.pathname.includes("list") ||
    location.pathname.includes("my-listings") ||
    location.pathname.includes("register-driveway");

  const handleOpenFeedback = () => {
    setIsFeedbackOpen(true);
    setFeedbackError(undefined);
    setFeedbackSuccess(false);
  };

  const handleCloseFeedback = () => {
    setIsFeedbackOpen(false);
    setFeedbackError(undefined);
    setFeedbackSuccess(false);
  };

  const handleSubmitFeedback = async (feedbackText: string) => {
    setFeedbackLoading(true);
    setFeedbackError(undefined);
    setFeedbackSuccess(false);
    try {
      await addFeedback({
        userId: user ? user.id : null,
        userName: user ? user.name : "Anonymous",
        feedbackText,
      });
      setFeedbackSuccess(true);
    } catch (err) {
      setFeedbackError("Failed to send feedback. Please try again.");
    } finally {
      setFeedbackLoading(false);
    }
  };

  return (
    <nav className="bg-white shadow-sm fixed top-0 left-0 right-0 z-50 border-b border-primary-200">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center w-1/4">
            <img src={Icon1} alt="ParkPal Logo" className="h-14 w-auto" />
            <span className="text-2xl font-bold text-primary-900 -ml-2 hidden md:inline">
              ParkPal
            </span>
          </Link>

          {/* Rent/List Toggle */}
          <div className="flex items-center justify-center space-x-8 w-2/4">
            <NavLink to="/" isActive={isRentActive}>
              Rent
            </NavLink>
            <NavLink to="/list" isActive={isListActive}>
              List
            </NavLink>
          </div>

          {/* Account Icon and Menu */}
          <div className="relative w-1/4 flex justify-end" ref={menuRef}>
            {user ? (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={twMerge(
                  "flex items-center focus-ring transition-normal rounded-full",
                  isMenuOpen && "ring-2 ring-accent ring-offset-2"
                )}
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-primary-100 text-primary-700 flex items-center justify-center text-lg font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <NavLink to="/login">Sign In</NavLink>
            )}

            {user && (
              <UserMenu
                user={user}
                isOpen={isMenuOpen}
                onClose={() => setIsMenuOpen(false)}
                onLogout={handleLogout}
              />
            )}
          </div>
        </div>
      </div>
      {/* Feedback Modal */}
      <FeedbackModal
        isOpen={isFeedbackOpen}
        onClose={handleCloseFeedback}
        onSubmit={handleSubmitFeedback}
        isLoading={feedbackLoading}
        error={feedbackError}
        success={feedbackSuccess}
      />
      {/* Floating Feedback Button */}
      <button
        className="fixed z-40 mt-4 right-6 bg-accent text-white rounded-full shadow-lg flex items-center gap-2 px-5 py-3 hover:bg-accent-light focus-ring transition-normal"
        onClick={handleOpenFeedback}
        aria-label="Send Feedback"
        style={{ boxShadow: "0 4px 16px rgba(0,0,0,0.12)" }}
      >
        <ChatBubbleLeftRightIcon className="h-6 w-6" />
        <span className="font-semibold">Feedback</span>
      </button>
    </nav>
  );
};
