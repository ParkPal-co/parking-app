/**
 * src/components/layout/PageLayout.tsx
 * Layout component that wraps pages with common elements like back button
 */

import React from "react";
import { BackButton } from "../navigation/BackButton";

interface PageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
  fullWidth?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showBackButton = true,
  fullWidth = false,
}) => {
  return (
    <div className={fullWidth ? "" : "container mx-auto px-4 py-8"}>
      {showBackButton && (
          <BackButton />
      )}
      {children}
    </div>
  );
};
