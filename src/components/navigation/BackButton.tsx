/**
 * src/components/navigation/BackButton.tsx
 * Reusable back button component that uses browser history
 */

import React from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeftIcon } from "@heroicons/react/24/outline";

export const BackButton: React.FC<{ className?: string }> = ({
  className = "",
}) => {
  const navigate = useNavigate();

  const handleBack = () => {
    navigate(-1);
  };

  return (
    <button
      onClick={handleBack}
      className={`flex items-center text-gray-600 hover:text-black transition-colors py-2 ${className}`}
      aria-label="Go back"
    >
      <ArrowLeftIcon className="h-5 w-5 mr-1" />
    </button>
  );
};
