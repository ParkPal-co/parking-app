/**
 * src/pages/auth/AccountSettingsPage.tsx
 * Page component for user account settings
 */

import React, { useState, useRef, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import { getStorage, ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";
import { getFunctions, httpsCallable } from "firebase/functions";
import { useNavigate, useLocation } from "react-router-dom";
import { PageLayout } from "../../components/layout/PageLayout";
import { NotificationSettings } from "../../components/ui/NotificationSettings";

const AccountSettingsPage: React.FC = () => {
  const { user, updateUserProfile } = useAuth();
  const location = useLocation();
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
  const navigate = useNavigate();

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

  useEffect(() => {
    if (location.search.includes("stripe=return")) {
      navigate("/register-driveway", { replace: true });
    }
  }, [location, navigate]);

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

  const handleGoToStripeDashboard = async () => {
    setStripeLoading(true);
    setStripeError(null);
    setStripeSuccess(null);
    try {
      const functions = getFunctions();
      const createStripeDashboardLink = httpsCallable(
        functions,
        "createStripeDashboardLink"
      );
      const { data } = await createStripeDashboardLink({});
      const url = (data as any).url;
      if (url) {
        setStripeSuccess("Redirecting to Stripe...");
        window.location.href = url;
      } else {
        setStripeError("Failed to get Stripe dashboard link.");
      }
    } catch (err: any) {
      setStripeError(err.message || "Failed to open Stripe dashboard.");
    } finally {
      setStripeLoading(false);
    }
  };

  return (
    <PageLayout>
      <div className="max-w-4xl mx-auto px-4 py-8">
        <div className="space-y-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Account Settings
            </h1>
            <p className="text-gray-600">
              Manage your account preferences and notification settings
            </p>
          </div>

          <NotificationSettings />
        </div>
      </div>
    </PageLayout>
  );
};

export default AccountSettingsPage;
