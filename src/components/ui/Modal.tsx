import React, { useEffect } from "react";
import { twMerge } from "tailwind-merge";

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  description?: string;
  children: React.ReactNode;
  size?: "small" | "medium" | "large" | "fullscreen";
  className?: string;
  hideCloseButton?: boolean;
  footer?: React.ReactNode;
}

export const Modal: React.FC<ModalProps> = ({
  isOpen,
  onClose,
  title,
  description,
  children,
  size = "medium",
  className,
  hideCloseButton = false,
  footer,
}) => {
  // Handle escape key press
  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener("keydown", handleEscape);
      document.body.style.overflow = "hidden";
    }

    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.body.style.overflow = "unset";
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClasses = {
    small: "max-w-md",
    medium: "max-w-lg",
    large: "max-w-2xl",
    fullscreen: "w-screen h-screen max-w-none max-h-none rounded-none",
  };

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto"
      role="dialog"
      aria-modal="true"
      aria-labelledby={title ? "modal-title" : undefined}
      aria-describedby={description ? "modal-description" : undefined}
    >
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-primary-900 bg-opacity-50 backdrop-blur-sm transition-opacity"
        aria-hidden="true"
        onClick={onClose}
      />

      {/* Modal panel */}
      <div className="flex min-h-screen items-center justify-center p-4">
        <div
          className={twMerge(
            "relative bg-white shadow-xl w-full transform transition-all",
            "animate-modal-enter",
            sizeClasses[size],
            className
          )}
          style={size === "fullscreen" ? { height: "100vh" } : {}}
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          {(title || !hideCloseButton) && (
            <div className="px-6 py-4 border-b border-primary-200">
              <div className="flex justify-between items-start">
                {title && (
                  <div>
                    <h3
                      className="text-lg font-semibold text-primary-900"
                      id="modal-title"
                    >
                      {title}
                    </h3>
                    {description && (
                      <p
                        className="mt-1 text-sm text-primary-500"
                        id="modal-description"
                      >
                        {description}
                      </p>
                    )}
                  </div>
                )}
                {!hideCloseButton && (
                  <button
                    type="button"
                    className={twMerge(
                      "rounded-md text-primary-400 hover:text-primary-500",
                      "focus-ring transition-normal p-1 -m-1",
                      !title && "ml-auto"
                    )}
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <svg
                      className="h-5 w-5"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                      strokeWidth={2}
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M6 18L18 6M6 6l12 12"
                      />
                    </svg>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Content */}
          <div className="px-6 py-4">{children}</div>

          {/* Footer */}
          {footer && (
            <div className="px-6 py-4 border-t border-primary-200 bg-primary-50">
              {footer}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
