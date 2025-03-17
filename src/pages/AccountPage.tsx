import React, { useState, useRef, useEffect } from "react";
import { useAuthContext } from "../contexts/AuthContext";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";

export default function AccountPage() {
  const { user, updateUserProfile } = useAuthContext();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: user?.name || "",
    phoneNumber: user?.phoneNumber || "",
    address: user?.address || "",
    isHost: user?.isHost || false,
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [newProfileImage, setNewProfileImage] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [showHostConfirmation, setShowHostConfirmation] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    [key: string]: string;
  }>({});
  const fileInputRef = useRef<HTMLInputElement>(null);
  const storage = getStorage();

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || "",
        phoneNumber: user.phoneNumber || "",
        address: user.address || "",
        isHost: user.isHost || false,
      });
    }
  }, [user]);

  const validateForm = () => {
    const errors: { [key: string]: string } = {};

    if (!formData.name.trim()) {
      errors.name = "Name is required";
    }

    if (
      formData.phoneNumber &&
      !/^\+?\d{10,}$/.test(formData.phoneNumber.replace(/[\s-()]/g, ""))
    ) {
      errors.phoneNumber = "Please enter a valid phone number";
    }

    if (formData.isHost && !formData.address.trim()) {
      errors.address = "Address is required for hosts";
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
    // Clear validation error when user starts typing
    if (validationErrors[name]) {
      setValidationErrors((prev) => ({ ...prev, [name]: "" }));
    }
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    if (name === "isHost" && checked !== formData.isHost) {
      setShowHostConfirmation(true);
    } else {
      setFormData((prev) => ({
        ...prev,
        [name]: checked,
      }));
    }
  };

  const handleHostConfirmation = (confirmed: boolean) => {
    setShowHostConfirmation(false);
    if (confirmed) {
      setFormData((prev) => ({
        ...prev,
        isHost: !prev.isHost,
      }));
    }
  };

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

    // Validate form
    if (!validateForm()) {
      return;
    }

    try {
      setError("");
      setSuccess("");

      let profileImageUrl = undefined;
      if (newProfileImage) {
        const storageRef = ref(
          storage,
          `profile-images/${user.id}/${Date.now()}-${newProfileImage.name}`
        );
        await uploadBytes(storageRef, newProfileImage);
        profileImageUrl = await getDownloadURL(storageRef);
      }

      const updatedData = {
        ...formData,
        ...(profileImageUrl ? { profileImageUrl } : {}),
        ...(formData.isHost ? {} : { address: "" }),
      };

      await updateUserProfile(user.id, updatedData);
      setSuccess("Profile updated successfully!");
      setIsEditing(false);
      setNewProfileImage(null);
      setImagePreview(null);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError("Failed to update profile. Please try again.");
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setFormData({
      name: user?.name || "",
      phoneNumber: user?.phoneNumber || "",
      address: user?.address || "",
      isHost: user?.isHost || false,
    });
    setNewProfileImage(null);
    setImagePreview(null);
    setValidationErrors({});
    setError("");
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <div className="bg-white shadow rounded-lg p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold text-gray-900">Account Settings</h1>
          <button
            onClick={() => (isEditing ? handleCancel() : setIsEditing(true))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            {isEditing ? "Cancel" : "Edit"}
          </button>
        </div>

        {error && (
          <div className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Profile Image */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Profile Picture
            </label>
            <div className="flex items-center space-x-4">
              <div className="w-20 h-20 rounded-full overflow-hidden bg-gray-100 flex items-center justify-center">
                {imagePreview || user.profileImageUrl ? (
                  <img
                    src={imagePreview || user.profileImageUrl}
                    alt="Profile"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="text-2xl text-gray-400">
                    {user.name?.[0]?.toUpperCase() || "?"}
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
                    {user.profileImageUrl ? "Change Photo" : "Upload Photo"}
                  </button>
                  {(imagePreview || user.profileImageUrl) && (
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

          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={user.email}
              disabled
              className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm bg-gray-50 text-gray-500 sm:text-sm"
            />
          </div>

          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm ${
                validationErrors.name ? "border-red-300" : "border-gray-300"
              }`}
            />
            {validationErrors.name && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="phoneNumber"
              className="block text-sm font-medium text-gray-700"
            >
              Phone Number
            </label>
            <input
              type="tel"
              id="phoneNumber"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              disabled={!isEditing}
              className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm ${
                validationErrors.phoneNumber
                  ? "border-red-300"
                  : "border-gray-300"
              }`}
              placeholder="(123) 456-7890"
            />
            {validationErrors.phoneNumber && (
              <p className="mt-1 text-sm text-red-600">
                {validationErrors.phoneNumber}
              </p>
            )}
          </div>

          <div>
            <div className="flex items-center">
              <input
                id="isHost"
                name="isHost"
                type="checkbox"
                checked={formData.isHost}
                onChange={handleCheckboxChange}
                disabled={!isEditing}
                className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded"
              />
              <label
                htmlFor="isHost"
                className="ml-2 block text-sm text-gray-900"
              >
                I want to rent out my parking space
              </label>
            </div>
          </div>

          {(formData.isHost || user.isHost) && (
            <div>
              <label
                htmlFor="address"
                className="block text-sm font-medium text-gray-700"
              >
                Parking Space Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleInputChange}
                disabled={!isEditing}
                className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm focus:ring-black focus:border-black sm:text-sm ${
                  validationErrors.address
                    ? "border-red-300"
                    : "border-gray-300"
                }`}
                placeholder="123 Main St, City, State, ZIP"
              />
              {validationErrors.address && (
                <p className="mt-1 text-sm text-red-600">
                  {validationErrors.address}
                </p>
              )}
            </div>
          )}

          {isEditing && (
            <div>
              <button
                type="submit"
                className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Save Changes
              </button>
            </div>
          )}
        </form>
      </div>

      {/* Host Status Change Confirmation Modal */}
      {showHostConfirmation && (
        <div className="fixed inset-0 bg-gray-500 bg-opacity-75 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full">
            <h3 className="text-lg font-medium text-gray-900 mb-4">
              {formData.isHost
                ? "Are you sure you want to stop being a host?"
                : "Become a Host"}
            </h3>
            <p className="text-sm text-gray-500 mb-4">
              {formData.isHost
                ? "This will remove your parking space listings and you won't be able to receive new bookings."
                : "As a host, you'll be able to list your parking space and earn money by renting it out."}
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => handleHostConfirmation(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-md"
              >
                Cancel
              </button>
              <button
                onClick={() => handleHostConfirmation(true)}
                className="px-4 py-2 text-sm font-medium text-white bg-black hover:bg-gray-800 rounded-md"
              >
                Confirm
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
