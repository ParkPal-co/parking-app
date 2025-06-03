/**
 * src/pages/hosting/MyListingsPage.tsx
 * Page component for displaying user's driveway listings
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  updateDoc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebase/config";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  startDate: string;
  endDate: string;
  imageUrl: string;
}

interface Driveway {
  id: string;
  address: string;
  description: string;
  price: number;
  capacity: number;
  status: "available" | "booked" | "unavailable";
  availability: {
    start: string;
    end: string;
  };
  createdAt: string;
  images: string[];
  bookedBy?: string;
  eventId: string;
  event?: Event;
  bookedByName?: string;
  availableFrom?: string;
  availableTo?: string;
}

interface EditDrivewayModalProps {
  driveway: Driveway;
  onClose: () => void;
  onSave: (updatedDriveway: Partial<Driveway>) => Promise<void>;
  onDelete: () => Promise<void>;
}

const EditDrivewayModal: React.FC<EditDrivewayModalProps> = ({
  driveway,
  onClose,
  onSave,
  onDelete,
}) => {
  const [formData, setFormData] = useState<Partial<Driveway>>({
    ...driveway,
    availableFrom: driveway.availability?.start,
    availableTo: driveway.availability?.end,
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      // Convert availableFrom/To to the correct structure
      const updatedDriveway = {
        ...formData,
        availability: {
          start: formData.availableFrom || "",
          end: formData.availableTo || "",
        },
      };
      delete updatedDriveway.availableFrom;
      delete updatedDriveway.availableTo;

      await onSave(updatedDriveway);
      onClose();
    } catch (err) {
      setError("Failed to update driveway. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this listing?")) {
      setLoading(true);
      setError(null);
      try {
        await onDelete();
        onClose();
      } catch (err) {
        setError("Failed to delete driveway. Please try again.");
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <h2 className="text-2xl font-bold mb-4">Edit Driveway Listing</h2>
        {error && (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
            {error}
          </div>
        )}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              value={formData.address || ""}
              onChange={(e) =>
                setFormData({ ...formData, address: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Description
            </label>
            <textarea
              value={formData.description || ""}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              rows={3}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Price
              </label>
              <input
                type="number"
                value={formData.price || ""}
                onChange={(e) =>
                  setFormData({ ...formData, price: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Capacity
              </label>
              <input
                type="number"
                value={formData.capacity || ""}
                onChange={(e) =>
                  setFormData({ ...formData, capacity: Number(e.target.value) })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Available From
              </label>
              <input
                type="datetime-local"
                value={formData.availableFrom || ""}
                onChange={(e) =>
                  setFormData({ ...formData, availableFrom: e.target.value })
                }
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
                value={formData.availableTo || ""}
                onChange={(e) =>
                  setFormData({ ...formData, availableTo: e.target.value })
                }
                className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
                required
              />
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              value={formData.status || ""}
              onChange={(e) =>
                setFormData({
                  ...formData,
                  status: e.target.value as Driveway["status"],
                })
              }
              className="w-full px-4 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-black focus:border-black"
              required
            >
              <option value="available">Available</option>
              <option value="unavailable">Unavailable</option>
            </select>
          </div>
          <div className="flex justify-between pt-4">
            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
            >
              Delete Listing
            </button>
            <div className="space-x-4">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 bg-black text-white rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:bg-gray-400"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
};

const MyListingsPage: React.FC = () => {
  const { user, loading: authLoading } = useAuth();
  const [driveways, setDriveways] = useState<Driveway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingDriveway, setEditingDriveway] = useState<Driveway | null>(null);

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
          collection(db, "parkingSpots"),
          where("ownerId", "==", user.id)
        );
        const drivewaysSnapshot = await getDocs(drivewaysQuery);
        const drivewaysData = drivewaysSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Driveway[];

        // Fetch event information for each driveway
        const drivewaysWithEvents = await Promise.all(
          drivewaysData.map(async (driveway) => {
            if (driveway.eventId) {
              const eventRef = doc(db, "events", driveway.eventId);
              const eventDoc = await getDoc(eventRef);
              if (eventDoc.exists()) {
                return {
                  ...driveway,
                  event: eventDoc.data() as Event,
                };
              }
            }
            return driveway;
          })
        );

        // Sort driveways by creation date (newest first)
        setDriveways(
          drivewaysWithEvents.sort(
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

  const handleUpdateDriveway = async (updatedDriveway: Partial<Driveway>) => {
    if (!editingDriveway) return;

    const drivewayRef = doc(db, "parkingSpots", editingDriveway.id);
    await updateDoc(drivewayRef, updatedDriveway);

    // Update local state
    setDriveways((prev) =>
      prev.map((d) =>
        d.id === editingDriveway.id ? { ...d, ...updatedDriveway } : d
      )
    );
  };

  const handleDeleteDriveway = async () => {
    if (!editingDriveway) return;

    const drivewayRef = doc(db, "parkingSpots", editingDriveway.id);
    await deleteDoc(drivewayRef);

    // Update local state
    setDriveways((prev) => prev.filter((d) => d.id !== editingDriveway.id));
  };

  // Show loading state while auth is loading or while fetching driveways
  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-5rem)]">
        <div className="flex flex-col items-center space-y-4">
          <div className="w-12 h-12 border-4 border-black border-t-transparent rounded-full animate-spin"></div>
          <p className="text-gray-600">Loading your listings...</p>
        </div>
      </div>
    );
  }

  // Only show error if we're not loading and there's no user
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

      {driveways.length === 0 ? (
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
              <div className="relative h-48">
                <img
                  src={driveway.images[0] || "https://placehold.co/600x400"}
                  alt={driveway.address}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-2 right-2 bg-black bg-opacity-50 text-white px-2 py-1 rounded text-lg">
                  ${driveway.price}
                </div>
              </div>
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
                    {driveway.status === "booked"
                      ? "Booked"
                      : driveway.status.charAt(0).toUpperCase() +
                        driveway.status.slice(1)}
                  </span>
                </div>

                {driveway.event && (
                  <div className="mb-4 p-3 bg-gray-50 rounded-md">
                    <h4 className="font-medium text-gray-900 mb-1">
                      {driveway.event.title}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {new Date(driveway.event.startDate).toLocaleDateString()}{" "}
                      - {new Date(driveway.event.endDate).toLocaleDateString()}
                    </p>
                    <p className="text-sm text-gray-500">
                      {driveway.event.location.address}
                    </p>
                  </div>
                )}

                <div className="mt-4 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Capacity</span>
                    <span className="text-gray-900">
                      {driveway.capacity} vehicles
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Available</span>
                    <span className="text-gray-900">
                      {new Date(driveway.availability.start).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}{" "}
                      -{" "}
                      {new Date(driveway.availability.end).toLocaleTimeString(
                        [],
                        {
                          hour: "2-digit",
                          minute: "2-digit",
                        }
                      )}
                    </span>
                  </div>
                </div>

                {driveway.status === "booked" && driveway.bookedBy && (
                  <div className="mt-4">
                    <Link
                      to={`/messages?user=${driveway.bookedBy}`}
                      className="w-full inline-block bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black text-center"
                    >
                      Message Renter
                    </Link>
                  </div>
                )}

                <div className="mt-6">
                  <button
                    onClick={() => setEditingDriveway(driveway)}
                    className="w-full bg-black text-white py-2 px-4 rounded-md hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black"
                  >
                    Edit Listing
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {editingDriveway && (
        <EditDrivewayModal
          driveway={editingDriveway}
          onClose={() => setEditingDriveway(null)}
          onSave={handleUpdateDriveway}
          onDelete={handleDeleteDriveway}
        />
      )}
    </div>
  );
};

export default MyListingsPage;
