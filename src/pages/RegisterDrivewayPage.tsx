/**
 * src/pages/RegisterDrivewayPage.tsx
 * Page component for registering new driveways
 */

import React, { useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, addDoc } from "firebase/firestore";
import { db } from "../firebase/config";
import { useNavigate } from "react-router-dom";

interface DrivewayFormData {
  address: string;
  description: string;
  price: number;
  capacity: number;
  latitude: number;
  longitude: number;
  availableFrom: string;
  availableTo: string;
}

export const RegisterDrivewayPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [formData, setFormData] = useState<DrivewayFormData>({
    address: "",
    description: "",
    price: 0,
    capacity: 1,
    latitude: 0,
    longitude: 0,
    availableFrom: "",
    availableTo: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "price" ||
        name === "capacity" ||
        name === "latitude" ||
        name === "longitude"
          ? Number(value)
          : value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to register a driveway");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Validate coordinates
      if (formData.latitude < -90 || formData.latitude > 90) {
        setError("Invalid latitude value");
        return;
      }

      if (formData.longitude < -180 || formData.longitude > 180) {
        setError("Invalid longitude value");
        return;
      }

      // Validate dates
      const availableFrom = new Date(formData.availableFrom);
      const availableTo = new Date(formData.availableTo);
      const now = new Date();

      if (availableFrom < now) {
        setError("Available from date cannot be in the past");
        return;
      }

      if (availableTo <= availableFrom) {
        setError("Available to date must be after available from date");
        return;
      }

      // Validate other fields
      if (formData.capacity <= 0) {
        setError("Capacity must be greater than 0");
        return;
      }

      if (formData.price < 0) {
        setError("Price cannot be negative");
        return;
      }

      const drivewayData = {
        ...formData,
        ownerId: user.id,
        ownerName: user.name,
        status: "available" as const,
        createdAt: new Date().toISOString(),
      };

      await addDoc(collection(db, "driveways"), drivewayData);
      navigate("/my-listings"); // Redirect to my listings page after successful creation
    } catch (err) {
      console.error("Error registering driveway:", err);
      setError("Failed to register driveway");
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Please log in to register a driveway.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Register a Driveway</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="address"
              className="block text-sm font-medium text-gray-700"
            >
              Address
            </label>
            <input
              type="text"
              name="address"
              id="address"
              required
              value={formData.address}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="description"
              className="block text-sm font-medium text-gray-700"
            >
              Description
            </label>
            <textarea
              name="description"
              id="description"
              required
              rows={4}
              value={formData.description}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              placeholder="Describe your driveway, including any special features or instructions..."
            />
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="latitude"
                className="block text-sm font-medium text-gray-700"
              >
                Latitude
              </label>
              <input
                type="number"
                name="latitude"
                id="latitude"
                required
                step="any"
                min="-90"
                max="90"
                value={formData.latitude}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="longitude"
                className="block text-sm font-medium text-gray-700"
              >
                Longitude
              </label>
              <input
                type="number"
                name="longitude"
                id="longitude"
                required
                step="any"
                min="-180"
                max="180"
                value={formData.longitude}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="availableFrom"
                className="block text-sm font-medium text-gray-700"
              >
                Available From
              </label>
              <input
                type="datetime-local"
                name="availableFrom"
                id="availableFrom"
                required
                value={formData.availableFrom}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="availableTo"
                className="block text-sm font-medium text-gray-700"
              >
                Available To
              </label>
              <input
                type="datetime-local"
                name="availableTo"
                id="availableTo"
                required
                value={formData.availableTo}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
            <div>
              <label
                htmlFor="capacity"
                className="block text-sm font-medium text-gray-700"
              >
                Capacity (vehicles)
              </label>
              <input
                type="number"
                name="capacity"
                id="capacity"
                required
                min="1"
                value={formData.capacity}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div>
              <label
                htmlFor="price"
                className="block text-sm font-medium text-gray-700"
              >
                Price per Day
              </label>
              <div className="mt-1 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <span className="text-gray-500 sm:text-sm">$</span>
                </div>
                <input
                  type="number"
                  name="price"
                  id="price"
                  required
                  min="0"
                  step="0.01"
                  value={formData.price}
                  onChange={handleInputChange}
                  className="block w-full pl-7 border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {loading ? "Registering..." : "Register Driveway"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
