/**
 * src/pages/ListPage.tsx
 * Page component for handling the List navigation option
 */

import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";

const ListPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user?.isHost) {
      navigate("/my-listings");
    }
  }, [user, navigate]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="bg-yellow-50 border border-yellow-200 text-yellow-700 px-4 py-3 rounded mb-6">
          You need to become a host before you can list your driveway.
        </div>
        <button
          onClick={() => navigate("/account-settings")}
          className="inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Become a Host
        </button>
      </div>
    </div>
  );
};

export default ListPage;
