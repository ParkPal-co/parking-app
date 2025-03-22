/**
 * src/components/layout/PageLayout.tsx
 * Layout component that wraps pages with common elements like back button
 */

import React from "react";
import { BackButton } from "../navigation/BackButton";

interface PageLayoutProps {
  children: React.ReactNode;
  showBackButton?: boolean;
}

export const PageLayout: React.FC<PageLayoutProps> = ({
  children,
  showBackButton = true,
}) => {
  return (
    <div className="container mx-auto px-4 py-8">
      {showBackButton && (
        <div className="mb-6">
          <BackButton />
        </div>
      )}
      {children}
    </div>
  );
};
