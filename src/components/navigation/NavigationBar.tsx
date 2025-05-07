/**
 * src/components/navigation/NavigationBar.tsx
 * Component for site-wide navigation
 */

import React, { useState, useRef, useEffect } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import Icon1 from "../../assets/images/Icon1.png";

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

  const isAdmin =
    user?.email === "aleczaitz@gmail.com" ||
    user?.email === "donminic30@gmail.com";

  return (
    <nav className="bg-white shadow-md fixed top-0 left-0 right-0 z-50">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center h-20">
          {/* Logo/Title */}
          <Link to="/" className="flex items-center w-1/4">
            <img src={Icon1} alt="ParkPal Logo" className="h-14 w-auto" />
            <span className="text-2xl font-bold -ml-2">ParkPal</span>
          </Link>

          {/* Rent/List Toggle */}
          <div className="flex items-center justify-center space-x-8 w-2/4">
            <Link
              to="/"
              className={`text-lg ${
                location.pathname === "/" ? "font-bold" : "text-gray-600"
              } hover:text-black`}
            >
              Rent
            </Link>
            <Link
              to={user ? "/my-listings" : "/register-driveway"}
              className={`text-lg ${
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
                    className="w-10 h-10 rounded-full"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-full bg-gray-200 text-gray-700 flex items-center justify-center text-lg font-medium">
                    {user.name.charAt(0).toUpperCase()}
                  </div>
                )}
              </button>
            ) : (
              <Link
                to="/login"
                className="text-lg text-gray-600 hover:text-black"
              >
                Sign In
              </Link>
            )}

            {/* Dropdown Menu */}
            {isMenuOpen && user && (
              <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg py-2 z-50">
                <Link
                  to="/account-settings"
                  className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Account Settings
                </Link>
                <Link
                  to="/my-listings"
                  className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Listings
                </Link>
                <Link
                  to="/my-bookings"
                  className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  My Bookings
                </Link>
                <Link
                  to="/messages"
                  className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Messages
                </Link>
                {isAdmin && (
                  <>
                    <Link
                      to="/registered-events"
                      className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Registered Events
                    </Link>
                    <Link
                      to="/register-event"
                      className="block px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Register an Event
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    handleLogout();
                    setIsMenuOpen(false);
                  }}
                  className="block w-full text-left px-6 py-3 text-base text-gray-700 hover:bg-gray-100"
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
