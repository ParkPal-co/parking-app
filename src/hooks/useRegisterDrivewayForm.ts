import { useState } from 'react';
import { useAuth } from './useAuth';
import { useNavigate } from 'react-router-dom';
import { useEvents } from './useEvents';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage, auth } from '../firebase/config';
import { createParkingSpot } from '../services/parkingSpots/parkingSpotService';
import { ParkingSpot, Event } from '../types';
import { verifyAndGeocodeAddress, AddressComponents, VerifiedAddress } from '../utils/geocoding';
import { validatePrice } from '../utils/priceUtils';
import { validateRequiredFields } from '../utils/requiredFieldsUtils';
import { validateAvailabilityDates } from '../utils/dateValidationUtils';

export function useRegisterDrivewayForm() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { allEvents, searchInput, setSearchInput } = useEvents();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedEvent, setSelectedEvent] = useState<Event | null>(null);
  const [showEventResults, setShowEventResults] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [verifiedAddress, setVerifiedAddress] = useState<VerifiedAddress | null>(null);
  const [addressVerificationLoading, setAddressVerificationLoading] = useState(false);

  const [formData, setFormData] = useState({
    eventId: '',
    description: '',
    price: '',
    imageUrl: '',
    availableFrom: '',
    availableTo: '',
    address: {
      street: '',
      city: '',
      state: '',
      zipCode: '',
    } as AddressComponents,
  });

  // Filter events based on search input (always filter the full list)
  const filteredEvents = allEvents.filter((event) => {
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
    // Set availability window to 1 hour before start and 1 hour after end
    const eventStart = new Date(event.startDate);
    const eventEnd = new Date(event.endDate);
    const availableFrom = new Date(eventStart.getTime() - 60 * 60 * 1000); // 1 hour before
    const availableTo = new Date(eventEnd.getTime() + 60 * 60 * 1000); // 1 hour after
    const formatDateTimeLocal = (date: Date) => {
      const pad = (n: number) => n.toString().padStart(2, '0');
      return `${date.getFullYear()}-${pad(date.getMonth() + 1)}-${pad(date.getDate())}T${pad(date.getHours())}:${pad(date.getMinutes())}`;
    };
    setFormData((prev) => ({
      ...prev,
      eventId: event.id,
      availableFrom: formatDateTimeLocal(availableFrom),
      availableTo: formatDateTimeLocal(availableTo),
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
    setVerifiedAddress(null);
  };

  const handleVerifyAddress = async () => {
    setAddressVerificationLoading(true);
    setError(null);
    try {
      const verified = await verifyAndGeocodeAddress(formData.address);
      setVerifiedAddress(verified);
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
        setError('Address verification failed. Please check the address and try again.');
      }
      setVerifiedAddress(null);
    } finally {
      setAddressVerificationLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !auth.currentUser) {
      setError('You must be logged in to register a driveway');
      return;
    }
    if (!selectedEvent) {
      setError('Please select an event');
      return;
    }
    if (!verifiedAddress) {
      setError('Please verify the address before submitting');
      return;
    }
    if (!imageFile) {
      setError('Please upload a driveway image');
      return;
    }
    // Validate required fields
    const requiredFields = ['description', 'price', 'availableFrom', 'availableTo'];
    const requiredError = validateRequiredFields(formData, requiredFields);
    if (requiredError) {
      setError(requiredError);
      return;
    }
    // Validate price
    const priceError = validatePrice(formData.price);
    if (priceError) {
      setError(priceError);
      return;
    }
    // Validate dates
    const dateError = validateAvailabilityDates(formData.availableFrom, formData.availableTo);
    if (dateError) {
      setError(dateError);
      return;
    }
    try {
      setLoading(true);
      setError(null);
      const userId = auth.currentUser.uid;
      // Upload image to Firebase Storage
      const imageRef = ref(
        storage,
        `parkingSpots/${userId}/${Date.now()}_${imageFile.name}`
      );
      await uploadBytes(imageRef, imageFile);
      const imageUrl = await getDownloadURL(imageRef);
      const price = parseFloat(formData.price);
      const parkingSpotData: Omit<ParkingSpot, 'id'> = {
        address: verifiedAddress.formattedAddress,
        amenities: [],
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
        ownerId: userId,
        ownerName: user.name || auth.currentUser.email || 'Anonymous',
        status: 'available',
      };
      await createParkingSpot(parkingSpotData);
      navigate('/listing-success');
    } catch (err) {
      console.error('Error registering parking spot:', err);
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to register parking spot. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    user,
    loading,
    error,
    formData,
    setFormData,
    selectedEvent,
    setSelectedEvent,
    showEventResults,
    setShowEventResults,
    imageFile,
    setImageFile,
    imagePreview,
    setImagePreview,
    verifiedAddress,
    setVerifiedAddress,
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
  };
} 