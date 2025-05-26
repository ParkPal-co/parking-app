import React from "react";

interface EmptyStateProps {
  message: string;
  icon?: React.ReactNode;
  className?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({
  message,
  icon,
  className = "",
}) => {
  return (
    <div
      className={`flex flex-col items-center justify-center text-gray-500 py-8 ${className}`}
    >
      {icon && <div className="mb-2 text-4xl">{icon}</div>}
      <div className="text-center text-base font-medium">{message}</div>
    </div>
  );
};

export default EmptyState;
