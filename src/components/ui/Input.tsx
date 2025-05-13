import React from "react";
import { twMerge } from "tailwind-merge";

export interface InputProps
  extends React.InputHTMLAttributes<HTMLInputElement> {
  error?: string;
  label?: string;
  dsSize?: "small" | "medium" | "large" | "xlarge";
  helperText?: string;
}

export const Input: React.FC<InputProps> = ({
  className,
  error,
  label,
  helperText,
  disabled,
  dsSize = "medium",
  id,
  ...props
}) => {
  const inputId = id || props.name;

  const sizeClasses = {
    small: "px-2 py-1.5 text-sm",
    medium: "px-3 py-2 text-base",
    large: "px-4 py-2.5 text-lg",
    xlarge: "px-5 py-4 text-xl",
  };

  const baseStyles = twMerge(
    "block w-full border rounded-md font-normal",
    "focus-ring transition-normal",
    "placeholder:text-primary-500",
    error
      ? "border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500"
      : "border-primary-300 text-primary-900 focus:ring-accent focus:border-accent",
    disabled && "bg-primary-50 text-primary-500 cursor-not-allowed",
    sizeClasses[dsSize],
    className
  );

  return (
    <div className="form-group">
      {label && (
        <label
          htmlFor={inputId}
          className="block text-sm font-medium text-primary-700"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <input
          id={inputId}
          className={baseStyles}
          disabled={disabled}
          aria-describedby={
            error
              ? `${inputId}-error`
              : helperText
              ? `${inputId}-helper`
              : undefined
          }
          {...props}
        />
      </div>
      {error ? (
        <p className="text-sm text-error-600" id={`${inputId}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="text-sm text-primary-500" id={`${inputId}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
