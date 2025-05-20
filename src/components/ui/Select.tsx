import React from "react";
import { twMerge } from "tailwind-merge";

export interface SelectOption {
  value: string | number;
  label: string;
}

export interface SelectProps
  extends Omit<React.SelectHTMLAttributes<HTMLSelectElement>, "size"> {
  options: SelectOption[];
  label?: string;
  error?: string;
  helperText?: string;
  size?: "small" | "medium" | "large";
}

export const Select: React.FC<SelectProps> = ({
  options,
  label,
  error,
  helperText,
  className,
  size = "medium",
  disabled,
  id,
  ...props
}) => {
  const selectId = id || props.name;

  const sizeClasses = {
    small: "px-2 py-1.5 text-sm",
    medium: "px-3 py-2 text-base",
    large: "px-4 py-2.5 text-lg",
  };

  const baseStyles = twMerge(
    "block w-full border rounded-md font-normal appearance-none",
    "focus-ring transition-normal",
    "bg-white",
    error
      ? "border-error-300 text-error-900 focus:ring-error-500 focus:border-error-500"
      : "border-primary-300 text-primary-900 focus:ring-accent focus:border-accent",
    disabled && "bg-primary-50 text-primary-500 cursor-not-allowed",
    sizeClasses[size],
    className
  );

  return (
    <div className="form-group">
      {label && (
        <label
          htmlFor={selectId}
          className="block text-sm font-medium text-primary-700 mb-1"
        >
          {label}
        </label>
      )}
      <div className="relative">
        <select
          id={selectId}
          className={baseStyles}
          disabled={disabled}
          aria-describedby={
            error
              ? `${selectId}-error`
              : helperText
              ? `${selectId}-helper`
              : undefined
          }
          {...props}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2">
          <svg
            className="h-5 w-5 text-primary-500"
            xmlns="http://www.w3.org/2000/svg"
            viewBox="0 0 20 20"
            fill="currentColor"
            aria-hidden="true"
          >
            <path
              fillRule="evenodd"
              d="M10 3a1 1 0 01.707.293l3 3a1 1 0 01-1.414 1.414L10 5.414 7.707 7.707a1 1 0 01-1.414-1.414l3-3A1 1 0 0110 3zm-3.707 9.293a1 1 0 011.414 0L10 14.586l2.293-2.293a1 1 0 011.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
              clipRule="evenodd"
            />
          </svg>
        </div>
      </div>
      {error ? (
        <p className="mt-1 text-sm text-error-600" id={`${selectId}-error`}>
          {error}
        </p>
      ) : helperText ? (
        <p className="mt-1 text-sm text-primary-500" id={`${selectId}-helper`}>
          {helperText}
        </p>
      ) : null}
    </div>
  );
};
 