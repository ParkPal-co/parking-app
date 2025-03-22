/**
 * src/pages/RegisteredEventsPage.tsx
 * Page component for managing registered events
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../hooks/useAuth";
import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import {
  verifyAndGeocodeAddress,
  type AddressComponents,
} from "../utils/geocoding";

interface Event {
  id: string;
  title: string;
  description: string;
  venue: string;
  website: string;
  startDate: string;
  endDate: string;
  expectedAttendance: number;
  imageUrl: string;
  location: {
    address: string;
    coordinates: {
      lat: number;
      lng: number;
    };
  };
  status: string;
  createdAt: string;
  createdBy: string;
}

interface ParkingSpot {
  id: string;
  eventId: string;
  // other fields not needed for this operation
}

export const RegisteredEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [parkingSpotCounts, setParkingSpotCounts] = useState<
    Record<string, number>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Fetch events and their associated parking spot counts
  useEffect(() => {
    const fetchEventsAndCounts = async () => {
      try {
        // Fetch events
        const eventsSnapshot = await getDocs(collection(db, "events"));
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(eventsData);

        // Fetch parking spot counts for each event
        const parkingSpotsSnapshot = await getDocs(
          collection(db, "parkingSpots")
        );
        const counts: Record<string, number> = {};
        parkingSpotsSnapshot.docs.forEach((doc) => {
          const spot = doc.data() as ParkingSpot;
          counts[spot.eventId] = (counts[spot.eventId] || 0) + 1;
        });
        setParkingSpotCounts(counts);
      } catch (err) {
        console.error("Error fetching events:", err);
        setError("Failed to load events");
      } finally {
        setLoading(false);
      }
    };

    fetchEventsAndCounts();
  }, []);

  const handleEdit = (event: Event) => {
    setEditingEvent(event);
    setImageFile(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setImageFile(e.target.files[0]);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEvent) return;

    try {
      setLoading(true);
      setError(null);

      let imageUrl = editingEvent.imageUrl;
      if (imageFile) {
        // Upload new image
        const storageRef = ref(
          storage,
          `events/${Date.now()}-${imageFile.name}`
        );
        const snapshot = await uploadBytes(storageRef, imageFile);
        imageUrl = await getDownloadURL(snapshot.ref);

        // Delete old image if it exists
        if (editingEvent.imageUrl) {
          try {
            const oldImageRef = ref(storage, editingEvent.imageUrl);
            await deleteObject(oldImageRef);
          } catch (err) {
            console.error("Error deleting old image:", err);
          }
        }
      }

      const eventRef = doc(db, "events", editingEvent.id);
      await updateDoc(eventRef, {
        ...editingEvent,
        imageUrl,
      });

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id ? { ...editingEvent, imageUrl } : event
        )
      );

      setSuccess("Event updated successfully");
      setEditingEvent(null);
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (eventId: string) => {
    try {
      setLoading(true);
      setError(null);

      // Delete associated parking spots
      const parkingSpotsSnapshot = await getDocs(
        query(collection(db, "parkingSpots"), where("eventId", "==", eventId))
      );

      for (const doc of parkingSpotsSnapshot.docs) {
        await deleteDoc(doc.ref);
      }

      // Delete the event
      const event = events.find((e) => e.id === eventId);
      if (event?.imageUrl) {
        try {
          const imageRef = ref(storage, event.imageUrl);
          await deleteObject(imageRef);
        } catch (err) {
          console.error("Error deleting event image:", err);
        }
      }

      await deleteDoc(doc(db, "events", eventId));

      // Update local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setParkingSpotCounts((prev) => {
        const newCounts = { ...prev };
        delete newCounts[eventId];
        return newCounts;
      });

      setSuccess("Event and associated parking spots deleted successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event and associated parking spots");
    } finally {
      setLoading(false);
      setShowDeleteConfirm(null);
    }
  };

  if (user?.email !== "aleczaitz@gmail.com") {
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
      <h1 className="text-3xl font-bold mb-8">Registered Events</h1>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-6">
          {success}
        </div>
      )}

      {loading && !editingEvent ? (
        <div className="text-center py-8">Loading events...</div>
      ) : (
        <div className="space-y-6">
          {events.map((event) => (
            <div
              key={event.id}
              className="bg-white rounded-lg shadow-md p-6 border border-gray-200"
            >
              {editingEvent?.id === event.id ? (
                <form onSubmit={handleUpdate} className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Title
                    </label>
                    <input
                      type="text"
                      value={editingEvent.title}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          title: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Description
                    </label>
                    <textarea
                      value={editingEvent.description}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          description: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      rows={4}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Venue
                    </label>
                    <input
                      type="text"
                      value={editingEvent.venue}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          venue: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Website
                    </label>
                    <input
                      type="url"
                      value={editingEvent.website}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          website: e.target.value,
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Start Date/Time
                      </label>
                      <input
                        type="datetime-local"
                        value={editingEvent.startDate}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            startDate: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        End Date/Time
                      </label>
                      <input
                        type="datetime-local"
                        value={editingEvent.endDate}
                        onChange={(e) =>
                          setEditingEvent({
                            ...editingEvent,
                            endDate: e.target.value,
                          })
                        }
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Expected Attendance
                    </label>
                    <input
                      type="text"
                      value={editingEvent.expectedAttendance || ""}
                      onChange={(e) =>
                        setEditingEvent({
                          ...editingEvent,
                          expectedAttendance:
                            e.target.value === "" ? "" : Number(e.target.value),
                        })
                      }
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Location Coordinates
                    </label>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm text-gray-600">
                          Latitude
                        </label>
                        <input
                          type="text"
                          value={editingEvent.location.coordinates.lat || ""}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              location: {
                                ...editingEvent.location,
                                coordinates: {
                                  ...editingEvent.location.coordinates,
                                  lat:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-sm text-gray-600">
                          Longitude
                        </label>
                        <input
                          type="text"
                          value={editingEvent.location.coordinates.lng || ""}
                          onChange={(e) =>
                            setEditingEvent({
                              ...editingEvent,
                              location: {
                                ...editingEvent.location,
                                coordinates: {
                                  ...editingEvent.location.coordinates,
                                  lng:
                                    e.target.value === ""
                                      ? ""
                                      : Number(e.target.value),
                                },
                              },
                            })
                          }
                          className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3"
                          required
                        />
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Event Image
                    </label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageChange}
                      className="mt-1 block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-black file:text-white hover:file:bg-gray-900"
                    />
                    {editingEvent.imageUrl && !imageFile && (
                      <div className="mt-2">
                        <img
                          src={editingEvent.imageUrl}
                          alt={editingEvent.title}
                          className="h-20 w-auto object-contain"
                        />
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end space-x-3">
                    <button
                      type="button"
                      onClick={() => setEditingEvent(null)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={loading}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-black hover:bg-gray-900"
                    >
                      {loading ? "Saving..." : "Save Changes"}
                    </button>
                  </div>
                </form>
              ) : (
                <>
                  <div className="flex justify-between items-start">
                    <div>
                      <h2 className="text-xl font-semibold">{event.title}</h2>
                      <p className="text-gray-600 mt-1">{event.venue}</p>
                      <p className="text-gray-500 text-sm mt-2">
                        {event.description}
                      </p>
                    </div>
                    <img
                      src={event.imageUrl}
                      alt={event.title}
                      className="h-20 w-auto object-contain"
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-gray-600">Start Date:</p>
                      <p>{new Date(event.startDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">End Date:</p>
                      <p>{new Date(event.endDate).toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Expected Attendance:</p>
                      <p>{event.expectedAttendance.toLocaleString()}</p>
                    </div>
                    <div>
                      <p className="text-gray-600">Listed Driveways:</p>
                      <p>{parkingSpotCounts[event.id] || 0}</p>
                    </div>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600">Location:</p>
                    <p>{event.location.address}</p>
                  </div>

                  <div className="mt-4">
                    <p className="text-gray-600">Website:</p>
                    <a
                      href={event.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline"
                    >
                      {event.website}
                    </a>
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    {showDeleteConfirm === event.id ? (
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowDeleteConfirm(null)}
                          className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={() => handleDelete(event.id)}
                          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                        >
                          Confirm Delete
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => setShowDeleteConfirm(event.id)}
                        className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
