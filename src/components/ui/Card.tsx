import React from "react";
import { twMerge } from "tailwind-merge";

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  padding?: "none" | "small" | "normal" | "large";
  shadow?: "none" | "small" | "normal" | "large";
  border?: boolean;
  variant?: "default" | "hover" | "interactive";
  isLoading?: boolean;
}

export const Card: React.FC<CardProps> = ({
  children,
  className,
  padding = "normal",
  shadow = "normal",
  border = true,
  variant = "default",
  isLoading = false,
  ...props
}) => {
  const paddingStyles = {
    none: "",
    small: "p-4",
    normal: "p-6",
    large: "p-8",
  };

  const shadowStyles = {
    none: "",
    small: "shadow-sm",
    normal: "shadow",
    large: "shadow-lg",
  };

  const variantStyles = {
    default: "",
    hover: "hover:border-accent hover:shadow-md transition-normal",
    interactive:
      "hover:border-accent hover:shadow-md transition-normal cursor-pointer active:scale-[0.99]",
  };

  const baseStyles = twMerge(
    "bg-white rounded-lg",
    border && "border border-primary-200",
    paddingStyles[padding],
    shadowStyles[shadow],
    variantStyles[variant],
    className
  );

  if (isLoading) {
    return (
      <div className={baseStyles} {...props}>
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-primary-100 rounded w-3/4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-primary-100 rounded"></div>
            <div className="h-4 bg-primary-100 rounded w-5/6"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={baseStyles} {...props}>
      {children}
    </div>
  );
};
