/**
 * src/pages/hosting/RegisterDrivewayPage.tsx
 * Page component for registering new driveways
 */

import React, { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage, auth } from "../../firebase/config";
import { useNavigate, Link } from "react-router-dom";
import { useEvents } from "../../hooks/useEvents";
import { Event } from "../../types";
import {
  verifyAndGeocodeAddress,
  type AddressComponents,
  type VerifiedAddress,
} from "../../utils/geocoding";

interface DrivewayFormData {
  eventId: string;
  description: string;
  price: string;
  imageUrl: string;
  availableFrom: string;
  availableTo: string;
  address: AddressComponents;
}

const RegisterDrivewayPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events, searchInput, setSearchInput } = useEvents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventResults, setShowEventResults] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [verifiedAddress, setVerifiedAddress] =
    useState<VerifiedAddress | null>(null);
  const [addressVerificationLoading, setAddressVerificationLoading] =
    useState(false);

  const [formData, setFormData] = useState<DrivewayFormData>({
    eventId: "",
    description: "",
    price: "",
    imageUrl: "",
    availableFrom: "",
    availableTo: "",
    address: {
      street: "",
      city: "",
      state: "",
      zipCode: "",
    },
  });

  // Filter events based on search input
  const filteredEvents = events.filter((event) => {
    if (!searchInput.trim()) return false;
    const searchLower = searchInput.toLowerCase();
    return (
      event.title.toLowerCase().includes(searchLower) ||
      event.location.address.toLowerCase().includes(searchLower)
    );
  });

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleEventSelect = (event: Event) => {
    setSelectedEvent(event);
    // Format the event date for datetime-local input
    const eventDate = new Date(event.startDate);
    // Ensure we're using the local timezone
    const year = eventDate.getFullYear();
    const month = String(eventDate.getMonth() + 1).padStart(2, "0");
    const day = String(eventDate.getDate()).padStart(2, "0");
    const formattedDate = `${year}-${month}-${day}T00:00`; // Set to beginning of the event day

    setFormData((prev) => ({
      ...prev,
      eventId: event.id,
      availableFrom: formattedDate,
      availableTo: formattedDate,
    }));
    setShowEventResults(false);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [name]: value,
      },
    }));
    // Clear verified address when user modifies any address field
    setVerifiedAddress(null);
  };

  const handleVerifyAddress = async () => {
    setAddressVerificationLoading(true);
    setError(null);
    try {
      const verified = await verifyAndGeocodeAddress(formData.address);
      setVerifiedAddress(verified);
      // Update form data with verified address components
      setFormData((prev) => ({
        ...prev,
        address: {
          street: verified.street,
          city: verified.city,
          state: verified.state,
          zipCode: verified.zipCode,
        },
      }));
    } catch (err) {
      if (err instanceof Error) {
        setError(`Address verification failed: ${err.message}`);
      } else {
        setError(
          "Address verification failed. Please check the address and try again."
        );
      }
      setVerifiedAddress(null);
    } finally {
      setAddressVerificationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) {
      setError("You must be logged in to register a driveway");
      return;
    }

    if (!selectedEvent) {
      setError("Please select an event");
      return;
    }

    if (!verifiedAddress) {
      setError("Please verify the address before submitting");
      return;
    }

    if (!imageFile) {
      setError("Please upload a driveway image");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Use Firebase Auth currentUser for storage path
      const userId = auth.currentUser.uid;

      // Upload image to Firebase Storage
      const imageRef = ref(
        storage,
        `parkingSpots/${userId}/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);

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

      // Validate price
      const price = parseFloat(formData.price);
      if (isNaN(price) || price <= 0) {
        setError("Price must be greater than 0");
        return;
      }

      const parkingSpotData = {
        address: verifiedAddress.formattedAddress,
        amenities: [], // Will be implemented later
        availability: {
          start: formData.availableFrom,
          end: formData.availableTo,
        },
        coordinates: verifiedAddress.coordinates,
        createdAt: new Date().toISOString(),
        description: formData.description,
        eventId: selectedEvent.id,
        images: [imageUrl],
        price,
        status: "available" as const,
        ownerId: userId,
        ownerName: user.name || auth.currentUser.email || "Anonymous",
      };

      // Log the data before saving to help with debugging
      console.log("Saving parking spot data:", parkingSpotData);

      await addDoc(collection(db, "parkingSpots"), parkingSpotData);
      navigate("/my-listings");
    } catch (err) {
      console.error("Error registering parking spot:", err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError("Failed to register parking spot. Please try again.");
      }
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

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {/* Event Search Section */}
        <div className="mb-8">
          <h2 className="text-lg font-medium text-gray-700 mb-4">
            What event are you registering with?
          </h2>
          <div className="relative">
            <input
              type="text"
              value={searchInput}
              onChange={(e) => {
                setSearchInput(e.target.value);
                setShowEventResults(true);
              }}
              onFocus={() => setShowEventResults(true)}
              placeholder="Search for an event..."
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
            />
            {showEventResults && filteredEvents.length > 0 && (
              <div className="absolute z-10 w-full mt-1 bg-white rounded-md shadow-lg border border-gray-200 max-h-60 overflow-y-auto">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    onClick={() => handleEventSelect(event)}
                    className="px-4 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
                  >
                    <h3 className="font-medium">{event.title}</h3>
                    <p className="text-sm text-gray-600">
                      {event.location.address}
                    </p>
                    <p className="text-sm text-gray-500">
                      {new Date(event.startDate).toLocaleDateString()}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
          {selectedEvent && (
            <div className="mt-4 p-4 bg-gray-50 rounded-md">
              <h3 className="font-medium">{selectedEvent.title}</h3>
              <p className="text-sm text-gray-600">
                {selectedEvent.location.address}
              </p>
              <p className="text-sm text-gray-500">
                {new Date(selectedEvent.startDate).toLocaleDateString()}
              </p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Image Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Driveway Image
            </label>
            <div className="mt-1 flex items-center">
              <input
                type="file"
                accept="image/*"
                onChange={handleImageChange}
                className="block w-full text-sm text-gray-500
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-medium
                  file:bg-black file:text-white
                  hover:file:bg-gray-800"
              />
            </div>
            {imagePreview && (
              <div className="mt-2">
                <img
                  src={imagePreview}
                  alt="Driveway preview"
                  className="h-32 w-full object-cover rounded-md"
                />
              </div>
            )}
          </div>

          {/* Address Section */}
          <div className="space-y-4">
            <h2 className="text-lg font-medium text-gray-700">
              Address Information
            </h2>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Street Address
              </label>
              <input
                type="text"
                name="street"
                value={formData.address.street}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                City
              </label>
              <input
                type="text"
                name="city"
                value={formData.address.city}
                onChange={handleAddressChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  State
                </label>
                <input
                  type="text"
                  name="state"
                  value={formData.address.state}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  ZIP Code
                </label>
                <input
                  type="text"
                  name="zipCode"
                  value={formData.address.zipCode}
                  onChange={handleAddressChange}
                  className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                  required
                />
              </div>
            </div>

            <div className="flex items-center justify-between">
              <button
                type="button"
                onClick={handleVerifyAddress}
                disabled={
                  addressVerificationLoading || !formData.address.street
                }
                className="px-4 py-2 bg-gray-800 text-white rounded-md hover:bg-gray-700 disabled:bg-gray-400 disabled:cursor-not-allowed"
              >
                {addressVerificationLoading ? "Verifying..." : "Verify Address"}
              </button>

              {verifiedAddress && (
                <div className="text-green-600 flex items-center">
                  <svg
                    className="w-5 h-5 mr-1"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  Address Verified
                </div>
              )}
            </div>

            {verifiedAddress && (
              <div className="bg-gray-50 p-4 rounded-md">
                <p className="text-sm text-gray-600">Verified Address:</p>
                <p className="font-medium">
                  {verifiedAddress.formattedAddress}
                </p>
              </div>
            )}
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>

          {/* Price */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price per Day
            </label>
            <div className="relative">
              <span className="absolute left-3 top-2">$</span>
              <input
                type="number"
                name="price"
                value={formData.price}
                onChange={handleInputChange}
                className="w-full pl-8 pr-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          {/* Availability */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From
              </label>
              <input
                type="datetime-local"
                name="availableFrom"
                value={formData.availableFrom}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available To
              </label>
              <input
                type="datetime-local"
                name="availableTo"
                value={formData.availableTo}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading || !verifiedAddress}
            className="w-full px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed"
          >
            {loading ? "Registering..." : "Confirm Listing"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default RegisterDrivewayPage;
