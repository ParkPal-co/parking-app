/**
 * src/pages/admin/RegisterAnEventPage.tsx
 * Page component for registering new events
 */

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { useNavigate } from "react-router-dom";
import {
  verifyAndGeocodeAddress,
  type AddressComponents,
  type VerifiedAddress,
} from "../../utils/geocoding";
import { createEvent } from "../../services";

interface EventFormData {
  title: string;
  address: AddressComponents;
  website: string;
  startDate: string;
  endDate: string;
  venue: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  expectedAttendance: string;
  description: string;
}

const RegisterAnEventPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [verifiedAddress, setVerifiedAddress] =
    useState<VerifiedAddress | null>(null);
  const [addressVerificationLoading, setAddressVerificationLoading] =
    useState(false);
  const [formData, setFormData] = useState<EventFormData>({
    title: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
    website: "",
    startDate: "",
    endDate: "",
    venue: "",
    coordinates: {
      lat: 0,
      lng: 0,
    },
    imageUrl: "",
    expectedAttendance: "",
    description: "",
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;

    // Handle address fields
    if (name.startsWith("address.")) {
      const addressField = name.split(".")[1];
      setFormData((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value,
        },
      }));
      // Clear verified address when user modifies any address field
      setVerifiedAddress(null);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: value,
      }));
    }
  };

  const handleVerifyAddress = async () => {
    setAddressVerificationLoading(true);
    setError(null);
    try {
      const verified = await verifyAndGeocodeAddress(formData.address);
      setVerifiedAddress(verified);

      // Update form data with verified address components
      // Only update if verification was successful
      if (verified) {
        setFormData((prev) => ({
          ...prev,
          address: {
            street: verified.street || prev.address.street,
            city: verified.city || prev.address.city,
            state: verified.state || prev.address.state,
            zipCode: verified.zipCode || prev.address.zipCode,
          },
          coordinates: verified.coordinates,
        }));
      }
    } catch (err) {
      console.error("Error verifying address:", err);
      setError(err instanceof Error ? err.message : "Failed to verify address");
      setVerifiedAddress(null);
    } finally {
      setAddressVerificationLoading(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user?.isAdmin) {
      setError("Only administrators can register events");
      return;
    }

    try {
      setLoading(true);
      setError(null);
      // Use the modular event creation service
      // Coerce isAdmin to boolean to satisfy the type
      await createEvent(formData, imageFile, {
        email: user.email,
        isAdmin: !!user.isAdmin,
      });
      setSuccess(true);
      setTimeout(() => {
        navigate("/registered-events");
      }, 2000);
    } catch (err) {
      console.error("Error registering event:", err);
      setError(err instanceof Error ? err.message : "Failed to register event");
    } finally {
      setLoading(false);
    }
  };

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-8">Register an Event</h1>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            Event registered successfully! Redirecting...
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-gray-700"
            >
              Event Title
            </label>
            <input
              type="text"
              name="title"
              id="title"
              required
              value={formData.title}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="venue"
              className="block text-sm font-medium text-gray-700"
            >
              Venue
            </label>
            <input
              type="text"
              name="venue"
              id="venue"
              required
              value={formData.venue}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>

          <div className="space-y-4">
            <div>
              <label
                htmlFor="address.street"
                className="block text-sm font-medium text-gray-700"
              >
                Street Address
              </label>
              <input
                type="text"
                name="address.street"
                id="address.street"
                required
                value={formData.address.street}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="address.city"
                  className="block text-sm font-medium text-gray-700"
                >
                  City
                </label>
                <input
                  type="text"
                  name="address.city"
                  id="address.city"
                  required
                  value={formData.address.city}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
              <div>
                <label
                  htmlFor="address.state"
                  className="block text-sm font-medium text-gray-700"
                >
                  State
                </label>
                <input
                  type="text"
                  name="address.state"
                  id="address.state"
                  required
                  value={formData.address.state}
                  onChange={handleInputChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
                />
              </div>
            </div>

            <div>
              <label
                htmlFor="address.zipCode"
                className="block text-sm font-medium text-gray-700"
              >
                ZIP Code
              </label>
              <input
                type="text"
                name="address.zipCode"
                id="address.zipCode"
                required
                value={formData.address.zipCode}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>

            <div className="flex flex-col space-y-2">
              <button
                type="button"
                onClick={handleVerifyAddress}
                disabled={addressVerificationLoading}
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                {addressVerificationLoading ? "Verifying..." : "Verify Address"}
              </button>

              {verifiedAddress && (
                <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded text-sm">
                  ✓ Address verified: {verifiedAddress.formattedAddress}
                </div>
              )}
            </div>

            {formData.coordinates.lat !== 0 &&
              formData.coordinates.lng !== 0 && (
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Latitude
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.coordinates.lat}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Longitude
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={formData.coordinates.lng}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 bg-gray-50 sm:text-sm"
                    />
                  </div>
                </div>
              )}
          </div>

          <div>
            <label
              htmlFor="website"
              className="block text-sm font-medium text-gray-700"
            >
              Website
            </label>
            <input
              type="url"
              name="website"
              id="website"
              required
              value={formData.website}
              onChange={handleInputChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="startDate"
                className="block text-sm font-medium text-gray-700"
              >
                Start Date/Time
              </label>
              <input
                type="datetime-local"
                name="startDate"
                id="startDate"
                required
                value={formData.startDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="endDate"
                className="block text-sm font-medium text-gray-700"
              >
                End Date/Time
              </label>
              <input
                type="datetime-local"
                name="endDate"
                id="endDate"
                required
                value={formData.endDate}
                onChange={handleInputChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-black focus:border-black sm:text-sm"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="expectedAttendance"
              className="block text-sm font-medium text-gray-700"
            >
              Expected Attendance
            </label>
            <input
              type="text"
              name="expectedAttendance"
              id="expectedAttendance"
              required
              value={formData.expectedAttendance}
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
            />
          </div>

          <div>
            <label
              htmlFor="image"
              className="block text-sm font-medium text-gray-700"
            >
              Event Logo/Image
            </label>
            <input
              type="file"
              name="image"
              id="image"
              accept="image/*"
              required
              onChange={handleImageChange}
              className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black ${
              loading ? "opacity-50 cursor-not-allowed" : ""
            }`}
          >
            {loading ? "Registering..." : "Register Event"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterAnEventPage;
