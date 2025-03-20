/**
 * src/components/navigation/NavigationBar.tsx
 * Component for site-wide navigation
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";

export const NavigationBar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

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
      navigate("/");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  const isAdmin = user?.email === "aleczaitz@gmail.com";

  return (
    <nav className="bg-white shadow-md relative z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo/Title */}
          <Link to="/" className="text-xl font-bold w-1/4">
            Event Parking
          </Link>

          {/* Rent/List Toggle */}
          <div className="flex items-center justify-center space-x-4 w-2/4">
            <Link
              to="/"
              className={`${
                location.pathname === "/" ? "font-bold" : "text-gray-600"
              } hover:text-black`}
            >
              Rent
            </Link>
            <Link
              to={user ? "/my-listings" : "/register-driveway"}
              className={`${
                location.pathname.includes("my-listings") ||
                location.pathname.includes("register-driveway")
                  ? "font-bold"
                  : "text-gray-600"
              } hover:text-black`}
            >
              List
            </Link>
          </div>

          {/* Account Icon and Menu */}
          <div className="relative w-1/4 flex justify-end" ref={menuRef}>
            {user ? (
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="flex items-center focus:outline-none"
              >
                {user.profileImageUrl ? (
                  <img
                    src={user.profileImageUrl}
                    alt={user.name}
                    className="w-8 h-8 rounded-full"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <Link to="/login" className="text-gray-600 hover:text-black">
                Sign In
              </Link>
            )}

            {/* Dropdown Menu */}
            {isMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50">
                <Link
                  to="/account-settings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account Settings
                </Link>
                <Link
                  to="/my-listings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Listings
                </Link>
                <Link
                  to="/my-bookings"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  to="/messages"
                  className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                {isAdmin && (
                  <Link
                    to="/registered-events"
                    className="block px-4 py-2 text-gray-700 hover:bg-gray-100"
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Registered Events
                  </Link>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Sign Out
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};
