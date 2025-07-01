/**
 * src/pages/hosting/RegisterDrivewayPage.tsx
 * Page component for registering new driveways
 */

import React from "react";
import { Link } from "react-router-dom";
import { useRegisterDrivewayForm } from "../../hooks/useRegisterDrivewayForm";
import RegisterDrivewayForm from "../../components/parkingSpots/RegisterDrivewayForm";

const RegisterDrivewayPage: React.FC = () => {
  const form = useRegisterDrivewayForm();
  const { user } = form;

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Please log in to register a driveway.
        </div>
      </div>
    );
  }

  if (!user.isHost) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
            You need to become a host before you can register a driveway.
          </div>
          <Link
            to="/account-settings"
            className="inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
          >
            Become a Host
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Register a Driveway</h1>
        <RegisterDrivewayForm
          {...form}
          setShowEventResults={form.setShowEventResults}
        />
      </div>
    </div>
  );
};

export default RegisterDrivewayPage;
