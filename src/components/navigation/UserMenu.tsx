import React from "react";
import { Link } from "react-router-dom";
import { twMerge } from "tailwind-merge";

interface User {
  id: string;
  name: string;
  profileImageUrl?: string;
  isAdmin?: boolean;
}

interface MenuItem {
  label: string;
  to: string;
  icon?: React.ReactNode;
}

interface UserMenuProps {
  user: User;
  isOpen: boolean;
  onClose: () => void;
  onLogout: () => void;
  onOpenFeedback: () => void;
}

const menuItems: MenuItem[] = [
  { label: "Account Settings", to: "/account-settings" },
  { label: "My Listings", to: "/my-listings" },
  { label: "My Bookings", to: "/my-bookings" },
  { label: "Messages", to: "/messages" },
];

export const UserMenu: React.FC<UserMenuProps> = ({
  user,
  isOpen,
  onClose,
  onLogout,
  onOpenFeedback,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className={twMerge(
        "absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg py-2 z-50",
        "border border-primary-200",
        "transform transition-all duration-200 ease-out",
        "animate-menu-enter"
      )}
    >
      <div className="px-6 py-3 border-b border-primary-100">
        <p className="text-sm font-medium text-primary-900">{user.name}</p>
      </div>

      <div className="py-1">
        {menuItems.map((item) => (
          <Link
            key={item.to}
            to={item.to}
            className={twMerge(
              "flex items-center px-6 py-3 text-base",
              "text-primary-700 hover:bg-primary-50",
              "transition-colors duration-150"
            )}
            onClick={onClose}
          >
            {item.icon && <span className="mr-3">{item.icon}</span>}
            {item.label}
          </Link>
        ))}

        {/* Feedback Button */}
        <button
          type="button"
          className={twMerge(
            "flex w-full items-center px-6 py-3 text-base text-left",
            "text-primary-700 hover:bg-primary-50",
            "transition-colors duration-150"
          )}
          onClick={() => {
            onOpenFeedback();
            onClose();
          }}
        >
          Send Feedback
        </button>

        {user.isAdmin && (
          <Link
            to="/admin"
            className={twMerge(
              "flex items-center px-6 py-3 text-base",
              "text-primary-700 hover:bg-primary-50",
              "transition-colors duration-150"
            )}
            onClick={onClose}
          >
            Admin Panel
          </Link>
        )}
      </div>

      <div className="border-t border-primary-100 py-1">
        <button
          onClick={() => {
            onLogout();
            onClose();
          }}
          className={twMerge(
            "flex w-full items-center px-6 py-3 text-base",
            "text-primary-700 hover:bg-primary-50",
            "transition-colors duration-150"
          )}
        >
          Sign Out
        </button>
      </div>
    </div>
  );
};
