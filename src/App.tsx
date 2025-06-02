/**
 * src/App.tsx
 * Main application component with routing
 */

import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import { NavigationBar } from "./components/navigation/NavigationBar";
import { routes } from "./routes/routes";
import { ErrorBoundary } from "./components/error/ErrorBoundary";
import EmailVerificationBanner from "./components/auth/EmailVerificationBanner";

const App: React.FC = () => {
  return (
    <Router>
      <ErrorBoundary>
        <div className="min-h-dvh bg-gray-100">
          <NavigationBar />
          <EmailVerificationBanner className="sticky top-20 z-40" />
          <div className="pt-20">
            <React.Suspense
              fallback={
                <div className="flex items-center justify-center  min-h-[calc(100vh-5rem)]">
                  <div className="flex flex-col items-center space-y-4">
                    <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-lg text-gray-600">Loading...</p>
                  </div>
                </div>
              }
            >
              <Routes>
                {routes.map((route) => (
                  <Route
                    key={route.path}
                    path={route.path}
                    element={route.element}
                  />
                ))}
              </Routes>
            </React.Suspense>
          </div>
        </div>
      </ErrorBoundary>
    </Router>
  );
};

export default App;
