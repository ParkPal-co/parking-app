/**
 * src/components/navigation/NavigationBar.tsx
 * Component for site-wide navigation
 */

import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          <Link to="/" className="text-xl font-bold">
            Event Parking
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/events" className="text-gray-600 hover:text-black">
              Events
            </Link>
            {user ? (
              <>
                <Link
                  to="/my-bookings"
                  className="text-gray-600 hover:text-black"
                >
                  My Bookings
                </Link>
                <Link
                  to="/my-listings"
                  className="text-gray-600 hover:text-black"
                >
                  My Listings
                </Link>
                <Link to="/messages" className="text-gray-600 hover:text-black">
                  Messages
                </Link>
                <Link
                  to="/account-settings"
                  className="text-gray-600 hover:text-black"
                >
                  Account
                </Link>
                <button
                  onClick={handleLogout}
                  className="text-gray-600 hover:text-black"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link to="/login" className="text-gray-600 hover:text-black">
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800"
                >
                  Sign Up
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            <svg
              className="w-6 h-6"
              fill="none"
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              {isMenuOpen ? (
                <path d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-4">
            <div className="flex flex-col space-y-4">
              <Link to="/events" className="text-gray-600 hover:text-black">
                Events
              </Link>
              {user ? (
                <>
                  <Link
                    to="/my-bookings"
                    className="text-gray-600 hover:text-black"
                  >
                    My Bookings
                  </Link>
                  <Link
                    to="/my-listings"
                    className="text-gray-600 hover:text-black"
                  >
                    My Listings
                  </Link>
                  <Link
                    to="/messages"
                    className="text-gray-600 hover:text-black"
                  >
                    Messages
                  </Link>
                  <Link
                    to="/account-settings"
                    className="text-gray-600 hover:text-black"
                  >
                    Account
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="text-gray-600 hover:text-black text-left"
                  >
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="text-gray-600 hover:text-black">
                    Login
                  </Link>
                  <Link
                    to="/register"
                    className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 text-center"
                  >
                    Sign Up
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
