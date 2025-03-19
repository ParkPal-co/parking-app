/**
 * src/pages/MyListingsPage.tsx
 * Page component for displaying user's driveway listings
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, query, where, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

interface Driveway {
  id: string;
  address: string;
  description: string;
  price: number;
  capacity: number;
  status: "available" | "booked" | "unavailable";
  availableFrom: string;
  availableTo: string;
  createdAt: string;
}

export const MyListingsPage: React.FC = () => {
  const { user } = useAuth();
  const [driveways, setDriveways] = useState<Driveway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user) {
      setError("Please log in to view your listings");
      setLoading(false);
      return;
    }

    const fetchDriveways = async () => {
      try {
        setLoading(true);
        setError(null);

        const drivewaysQuery = query(
          collection(db, "driveways"),
          where("ownerId", "==", user.id)
        );
        const drivewaysSnapshot = await getDocs(drivewaysQuery);
        const drivewaysData = drivewaysSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Driveway[];

        // Sort driveways by creation date (newest first)
        setDriveways(
          drivewaysData.sort(
            (a, b) =>
              new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          )
        );
      } catch (err) {
        console.error("Error fetching driveways:", err);
        setError("Failed to load your listings");
      } finally {
        setLoading(false);
      }
    };

    fetchDriveways();
  }, [user]);

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Please log in to view your listings.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold">My Listings</h1>
        <Link
          to="/register-driveway"
          className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
        >
          Register New Driveway
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : driveways.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            You haven't registered any driveways yet.
          </p>
          <Link
            to="/register-driveway"
            className="text-black hover:text-gray-800 font-medium"
          >
            Register your first driveway
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {driveways.map((driveway) => (
            <div
              key={driveway.id}
              className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden"
            >
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-lg font-medium text-gray-900">
                      {driveway.address}
                    </h3>
                    <p className="text-sm text-gray-500 mt-1">
                      {driveway.description}
                    </p>
                  </div>
                  <span
                    className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      driveway.status === "available"
                        ? "bg-green-100 text-green-800"
                        : driveway.status === "booked"
                        ? "bg-blue-100 text-blue-800"
                        : "bg-gray-100 text-gray-800"
                    }`}
                  >
                    {driveway.status.charAt(0).toUpperCase() +
                      driveway.status.slice(1)}
                  </span>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity</span>
                    <span className="text-gray-900">
                      {driveway.capacity} vehicles
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Price</span>
                    <span className="text-gray-900">${driveway.price}/day</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available</span>
                    <span className="text-gray-900">
                      {new Date(driveway.availableFrom).toLocaleDateString()} -{" "}
                      {new Date(driveway.availableTo).toLocaleDateString()}
                    </span>
                  </div>
                </div>

                <div className="mt-6 flex justify-end">
                  <Link
                    to={`/edit-driveway/${driveway.id}`}
                    className="text-black hover:text-gray-800 text-sm font-medium"
                  >
                    Edit Listing
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
