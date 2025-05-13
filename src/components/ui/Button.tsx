import React from "react";
import { twMerge } from "tailwind-merge";

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger";
  isLoading?: boolean;
  fullWidth?: boolean;
  size?: "small" | "medium" | "large";
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = "primary",
  isLoading = false,
  fullWidth = false,
  size = "medium",
  className,
  disabled,
  ...props
}) => {
  const sizeClasses = {
    small: "px-3 py-2 text-sm",
    medium: "px-4 py-2.5 text-base",
    large: "px-5 py-3 text-lg",
  };

  const variants = {
    primary:
      "bg-accent text-white hover:bg-accent-light focus:ring-accent border-transparent",
    secondary:
      "bg-white text-primary-700 hover:bg-primary-50 focus:ring-accent border-primary-300",
    danger:
      "bg-error-600 text-white hover:bg-error-700 focus:ring-error-500 border-transparent",
  };

  const baseStyles = twMerge(
    "inline-flex justify-center items-center border font-medium rounded-md",
    "focus-ring transition-normal disabled:opacity-50 disabled:cursor-not-allowed",
    sizeClasses[size],
    variants[variant],
    fullWidth && "w-full",
    className
  );

  return (
    <button className={baseStyles} disabled={disabled || isLoading} {...props}>
      {isLoading ? (
        <>
          <svg
            className="animate-spin -ml-1 mr-2 h-4 w-4"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            />
          </svg>
          Loading...
        </>
      ) : (
        children
      )}
    </button>
  );
};
