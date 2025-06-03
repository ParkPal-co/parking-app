/**
 * src/pages/AccountSettingsPage.tsx
 * Page component for user account settings
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Alert } from "../components/ui/Alert";
import { getFunctions, httpsCallable } from "firebase/functions";

const AccountSettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [name, setName] = useState(user?.name || "");
  const [phoneNumber, setPhoneNumber] = useState(user?.phoneNumber || "");
  const [isHost, setIsHost] = useState(user?.isHost || false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage = getStorage();
  const [stripeLoading, setStripeLoading] = useState(false);
  const [stripeError, setStripeError] = useState<string | null>(null);
  const [stripeSuccess, setStripeSuccess] = useState<string | null>(null);

  // Format phone number as (XXX) XXX-XXXX
  const formatPhoneNumber = (value: string) => {
    // Remove all non-numeric characters
    const numbers = value.replace(/\D/g, "");

    // Format the number
    if (numbers.length === 0) return "";
    if (numbers.length <= 3) return `(${numbers}`;
    if (numbers.length <= 6)
      return `(${numbers.slice(0, 3)}) ${numbers.slice(3)}`;
    return `(${numbers.slice(0, 3)}) ${numbers.slice(3, 6)}-${numbers.slice(
      6,
      10
    )}`;
  };

  // Handle phone number input changes
  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setPhoneNumber(formattedNumber);
  };

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setName(user.name || "");
      setPhoneNumber(formatPhoneNumber(user.phoneNumber || ""));
      setIsHost(user.isHost || false);
    }
  }, [user]);

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        setError("Image size should be less than 5MB");
        return;
      }

      const validTypes = ["image/jpeg", "image/png", "image/gif"];
      if (!validTypes.includes(file.type)) {
        setError("Please upload a valid image file (JPEG, PNG, or GIF)");
        return;
      }

      setNewProfileImage(file);
      setImagePreview(URL.createObjectURL(file));
      setError(""); // Clear any previous errors
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    try {
      setLoading(true);
      setError(null);
      setSuccess(false);

      let profileImageUrl = undefined;
      if (newProfileImage) {
        const storageRef = ref(
          storage,
          `profile-images/${user.id}/${Date.now()}-${newProfileImage.name}`
        );
        await uploadBytes(storageRef, newProfileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      // Remove formatting before saving
      const cleanPhoneNumber = phoneNumber.replace(/\D/g, "");

      await updateUserProfile(user.id, {
        name,
        phoneNumber: cleanPhoneNumber,
        isHost,
        ...(profileImageUrl ? { profileImageUrl } : {}),
      });

      setSuccess(true);
      setIsEditing(false);
      setNewProfileImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setName(user?.name || "");
    setPhoneNumber(formatPhoneNumber(user?.phoneNumber || ""));
    setIsHost(user?.isHost || false);
    setNewProfileImage(null);
    setImagePreview(null);
    setError(null);
  };

  const handleConnectStripe = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSuccess(null);
    try {
      const functions = getFunctions();
      const createOrGetStripeAccountLink = httpsCallable(
        functions,
        "createOrGetStripeAccountLink"
      );
      const origin = window.location.origin;
      const { data } = await createOrGetStripeAccountLink({ origin });
      const url = (data as any).url;
      if (url) {
        setStripeSuccess("Redirecting to Stripe...");
        window.location.href = url;
      } else {
        setStripeError("Failed to get Stripe onboarding link.");
      }
    } catch (err: any) {
      setStripeError(err.message || "Failed to connect with Stripe.");
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-3xl font-bold">Account Settings</h1>
        </div>

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
            {error}
          </div>
        )}

        {success && (
          <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
            Profile updated successfully!
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-32 h-32 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview || user?.profileImageUrl ? (
                  <img
                    src={imagePreview || user?.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-4xl text-gray-400">
                    {user?.name?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              {isEditing && (
                <div className="flex flex-col space-y-2">
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/jpeg,image/png,image/gif"
                    className="hidden"
                  />
                  <button
                    type="button"
                    onClick={() => fileInputRef.current?.click()}
                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
                  >
                    {user?.profileImageUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  {(imagePreview || user?.profileImageUrl) && (
                    <button
                      type="button"
                      onClick={() => {
                        setNewProfileImage(null);
                        setImagePreview(null);
                      }}
                      className="px-4 py-2 text-sm font-medium text-red-600 hover:text-red-700"
                    >
                      Remove Photo
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end mb-4">
            <button
              type="button"
              onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
              className={`px-6 py-2.5 font-medium rounded-md transition-colors ${
                isEditing
                  ? "bg-red-100 text-red-700 hover:bg-red-200"
                  : "bg-black text-white hover:bg-gray-800"
              }`}
            >
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              value={user?.email || ""}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
            />
            <p className="mt-1 text-sm text-gray-500">
              Email cannot be changed
            </p>
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Full Name
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              disabled={!isEditing}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          <div>
            <label
              htmlFor="phone"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              value={phoneNumber}
              onChange={handlePhoneChange}
              disabled={!isEditing}
              placeholder="(XXX) XXX-XXXX"
              maxLength={14}
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black sm:text-sm disabled:bg-gray-50 disabled:text-gray-500"
            />
          </div>

          {/* Host Status Section */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Host Status
            </label>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-700">
                  {isHost
                    ? "You are currently a host and can list your driveway for rent."
                    : "Become a host to list your driveway for rent."}
                </p>
                {!isHost && (
                  <p className="text-sm text-gray-500 mt-1">
                    As a host, you can list your driveway for events and earn
                    money.
                  </p>
                )}
              </div>
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={isHost}
                  onChange={(e) => setIsHost(e.target.checked)}
                  disabled={!isEditing}
                  className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded disabled:bg-gray-50 disabled:text-gray-500"
                />
                <span className="ml-2 text-sm text-gray-700">
                  {isHost ? "Host" : "Not a Host"}
                </span>
              </div>
            </div>
          </div>

          {/* Stripe Connect Section for Hosts */}
          {user?.isHost && (
            <Card className="mt-8">
              <div className="flex flex-col gap-4">
                <h2 className="text-lg font-semibold text-primary-900 mb-2">
                  Payout Method
                </h2>
                <p className="text-primary-700 text-sm">
                  Connect your Stripe account to receive payouts for your
                  driveway bookings. You can update your payout method at any
                  time.
                </p>
                {user.stripeAccountId ? (
                  <Alert
                    variant="success"
                    message="Stripe account connected. You can update your payout method below."
                    className="mb-2"
                  />
                ) : (
                  <Alert
                    variant="info"
                    message="You have not connected a Stripe account yet."
                    className="mb-2"
                  />
                )}
                {stripeError && (
                  <Alert
                    variant="error"
                    message={stripeError}
                    className="mb-2"
                  />
                )}
                {stripeSuccess && (
                  <Alert
                    variant="success"
                    message={stripeSuccess}
                    className="mb-2"
                  />
                )}
                <Button
                  type="button"
                  variant="primary"
                  isLoading={stripeLoading}
                  onClick={handleConnectStripe}
                  fullWidth
                >
                  {user.stripeAccountId
                    ? "Update Payout Method"
                    : "Connect Stripe Account"}
                </Button>
              </div>
            </Card>
          )}

          {isEditing && (
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </form>

        <div className="mt-12 pt-8 border-t border-gray-200">
          <h2 className="text-xl font-semibold mb-4">Delete Account</h2>
          <p className="text-gray-600 mb-4">
            Once you delete your account, there is no going back. Please be
            certain.
          </p>
          <button className="text-red-600 hover:text-red-500 font-medium">
            Delete Account
          </button>
        </div>
      </div>
    </div>
  );
};

export default AccountSettingsPage;
