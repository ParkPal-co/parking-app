import React from "react";
import { Event } from "../../types";
import { AddressComponents, VerifiedAddress } from "../../utils/geocoding";

interface RegisterDrivewayFormProps {
  loading: boolean;
  error: string | null;
  formData: any;
  setFormData: (data: any) => void;
  selectedEvent: Event | null;
  setSelectedEvent: (event: Event | null) => void;
  showEventResults: boolean;
  setShowEventResults: (show: boolean) => void;
  imageFile: File | null;
  setImageFile: (file: File | null) => void;
  imagePreview: string | null;
  setImagePreview: (url: string | null) => void;
  verifiedAddress: VerifiedAddress | null;
  setVerifiedAddress: (address: VerifiedAddress | null) => void;
  addressVerificationLoading: boolean;
  handleInputChange: (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => void;
  handleEventSelect: (event: Event) => void;
  handleImageChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddressChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  handleVerifyAddress: () => void;
  handleSubmit: (e: React.FormEvent) => void;
  filteredEvents: Event[];
  searchInput: string;
  setSearchInput: (input: string) => void;
}

const RegisterDrivewayForm: React.FC<RegisterDrivewayFormProps> = ({
  loading,
  error,
  formData,
  selectedEvent,
  showEventResults,
  imageFile,
  imagePreview,
  verifiedAddress,
  addressVerificationLoading,
  handleInputChange,
  handleEventSelect,
  handleImageChange,
  handleAddressChange,
  handleVerifyAddress,
  handleSubmit,
  filteredEvents,
  searchInput,
  setSearchInput,
  setShowEventResults,
}) => {
  return (
    <form onSubmit={handleSubmit} className="space-y-6">
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
            className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-medium file:bg-black file:text-white hover:file:bg-gray-800"
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
            disabled={addressVerificationLoading || !formData.address.street}
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
            <p className="font-medium">{verifiedAddress.formattedAddress}</p>
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
          Price
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
            placeholder="Enter price"
          />
        </div>
      </div>
      {/* Availability */}
      <div className="grid lg:grid-cols-2 gap-4">
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
  );
};

export default RegisterDrivewayForm;
