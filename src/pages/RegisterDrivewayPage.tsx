/**
 * src/pages/RegisterDrivewayPage.tsx
 * Page component for registering new driveways
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { collection, addDoc } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { db, storage } from "../firebase/config";
import { useNavigate } from "react-router-dom";
import { useEvents } from "../hooks/useEvents";
import { Event } from "../types";

interface DrivewayFormData {
  eventId: string;
  address: string;
  description: string;
  price: string;
  imageUrl: string;
  availableFrom: string;
  availableTo: string;
}

export const RegisterDrivewayPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { events, searchInput, setSearchInput, handleSearch } = useEvents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventResults, setShowEventResults] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);

  const [formData, setFormData] = useState<DrivewayFormData>({
    eventId: "",
    address: "",
    description: "",
    price: "",
    imageUrl: "",
    availableFrom: "",
    availableTo: "",
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      setError("You must be logged in to register a driveway");
      return;
    }

    if (!selectedEvent) {
      setError("Please select an event");
      return;
    }

    if (!imageFile) {
      setError("Please upload a driveway image");
      return;
    }

    try {
      setLoading(true);
      setError(null);

      // Upload image to Firebase Storage using the initialized storage instance
      const imageRef = ref(
        storage,
        `driveways/${user.id}/${Date.now()}_${imageFile.name}`
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

      const drivewayData = {
        ...formData,
        price: price,
        imageUrl,
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

          {/* Address */}
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
              placeholder="Enter your driveway's address"
            />
          </div>

          {/* Description */}
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

          {/* Price */}
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

          {/* Availability */}
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

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={loading}
              className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
            >
              {loading ? "Registering..." : "Confirm Listing"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
