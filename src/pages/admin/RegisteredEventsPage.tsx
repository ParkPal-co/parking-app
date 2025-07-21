/**
 * src/pages/admin/RegisteredEventsPage.tsx
 * Page component for managing registered events
 */

import React, { useState, useEffect } from "react";
import { useAuth } from "../../hooks/useAuth";
import {
  collection,
  query,
  getDocs,
  getDoc,
  doc,
  updateDoc,
  deleteDoc,
  where,
} from "firebase/firestore";
import { db, storage } from "../../firebase/config";
import {
  ref,
  uploadBytes,
  getDownloadURL,
  deleteObject,
} from "firebase/storage";
import { fetchEventNotificationEmails } from "../../services/events/eventNotificationService";
import { getFunctions, httpsCallable } from "firebase/functions";

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
  payoutStatus: string;
}

interface ParkingSpot {
  id: string;
  eventId: string;
  status: "available" | "booked" | "unavailable";
  // other fields not needed for this operation
}

const RegisteredEventsPage: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [parkingSpotStats, setParkingSpotStats] = useState<
    Record<string, { available: number; booked: number; unavailable: number }>
  >({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [editingEvent, setEditingEvent] = useState<Event | null>(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(
    null
  );
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [expandedEventId, setExpandedEventId] = useState<string | null>(null);
  const [notificationEmails, setNotificationEmails] = useState<
    Record<
      string,
      {
        loading: boolean;
        emails: { id: string; email: string; createdAt: any }[];
        error: string | null;
      }
    >
  >({});
  const [expandedBookingsEventId, setExpandedBookingsEventId] = useState<
    string | null
  >(null);
  const [bookingsByEvent, setBookingsByEvent] = useState<Record<string, any[]>>(
    {}
  );
  const [payoutLoading, setPayoutLoading] = useState<string | null>(null);
  const [payoutError, setPayoutError] = useState<string | null>(null);

  // Fetch events and their associated parking spot counts
  useEffect(() => {
    const fetchEventsAndCounts = async () => {
      try {
        // Fetch events that are not completed
        const eventsQuery = query(
          collection(db, "events"),
          where("status", "!=", "completed")
        );
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];

        // Sort events by start date (earliest first)
        const sortedEvents = eventsData.sort(
          (a, b) =>
            new Date(a.startDate).getTime() - new Date(b.startDate).getTime()
        );

        setEvents(sortedEvents);

        // Fetch parking spot statistics for each event
        const parkingSpotsSnapshot = await getDocs(
          collection(db, "parkingSpots")
        );
        const stats: Record<
          string,
          { available: number; booked: number; unavailable: number }
        > = {};
        parkingSpotsSnapshot.docs.forEach((doc) => {
          const spot = doc.data() as ParkingSpot;
          if (!stats[spot.eventId]) {
            stats[spot.eventId] = { available: 0, booked: 0, unavailable: 0 };
          }
          stats[spot.eventId][spot.status]++;
        });
        setParkingSpotStats(stats);
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

  const handleFormChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    if (!editingEvent) return;

    const value =
      e.target.type === "number" ? Number(e.target.value) : e.target.value;

    if (e.target.name === "expectedAttendance") {
      setEditingEvent({
        ...editingEvent,
        expectedAttendance: Number(value),
      });
    } else if (e.target.name === "lat" || e.target.name === "lng") {
      setEditingEvent({
        ...editingEvent,
        location: {
          ...editingEvent.location,
          coordinates: {
            ...editingEvent.location.coordinates,
            [e.target.name]: Number(value),
          },
        },
      });
    } else {
      setEditingEvent({
        ...editingEvent,
        [e.target.name]: value,
      });
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

      // Convert expectedAttendance to number and ensure coordinates are numbers
      const updatedEvent = {
        ...editingEvent,
        imageUrl,
        expectedAttendance: Number(editingEvent.expectedAttendance),
        location: {
          ...editingEvent.location,
          coordinates: {
            lat: Number(editingEvent.location.coordinates.lat),
            lng: Number(editingEvent.location.coordinates.lng),
          },
        },
      };

      const eventRef = doc(db, "events", editingEvent.id);
      await updateDoc(eventRef, updatedEvent);

      // Update local state
      setEvents((prev) =>
        prev.map((event) =>
          event.id === editingEvent.id ? updatedEvent : event
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
      setParkingSpotStats((prev) => {
        const newStats = { ...prev };
        delete newStats[eventId];
        return newStats;
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

  const handleToggleEmails = async (eventId: string) => {
    if (expandedEventId === eventId) {
      setExpandedEventId(null);
      return;
    }
    setExpandedEventId(eventId);
    if (!notificationEmails[eventId]) {
      setNotificationEmails((prev) => ({
        ...prev,
        [eventId]: { loading: true, emails: [], error: null },
      }));
      try {
        const emails = await fetchEventNotificationEmails(eventId);
        setNotificationEmails((prev) => ({
          ...prev,
          [eventId]: { loading: false, emails, error: null },
        }));
      } catch (err) {
        setNotificationEmails((prev) => ({
          ...prev,
          [eventId]: {
            loading: false,
            emails: [],
            error: "Failed to load emails",
          },
        }));
      }
    }
  };

  const handleToggleBookings = async (eventId: string) => {
    if (expandedBookingsEventId === eventId) {
      setExpandedBookingsEventId(null);
      return;
    }
    setExpandedBookingsEventId(eventId);
    if (!bookingsByEvent[eventId]) {
      try {
        // First get all parking spots for this event
        const parkingSpotsSnap = await getDocs(
          query(collection(db, "parkingSpots"), where("eventId", "==", eventId))
        );

        const parkingSpotIds = parkingSpotsSnap.docs.map((doc) => doc.id);

        if (parkingSpotIds.length === 0) {
          setBookingsByEvent((prev) => ({ ...prev, [eventId]: [] }));
          return;
        }

        // Then get all bookings for these parking spots
        const bookingsSnap = await getDocs(
          query(
            collection(db, "bookings"),
            where("parkingSpotId", "in", parkingSpotIds)
          )
        );

        // Get booking data with additional details
        const bookingsWithDetails = await Promise.all(
          bookingsSnap.docs.map(async (bookingDoc) => {
            const bookingData = bookingDoc.data();

            // Get parking spot details
            const spotRef = doc(db, "parkingSpots", bookingData.parkingSpotId);
            const spotDoc = await getDoc(spotRef);
            const spotData = spotDoc.exists() ? spotDoc.data() : null;

            // Get host details
            const hostRef = doc(db, "users", bookingData.hostId);
            const hostDoc = await getDoc(hostRef);
            const hostData = hostDoc.exists() ? hostDoc.data() : null;

            // Get renter details
            const renterRef = doc(db, "users", bookingData.userId);
            const renterDoc = await getDoc(renterRef);
            const renterData = renterDoc.exists() ? renterDoc.data() : null;

            return {
              id: bookingDoc.id,
              ...bookingData,
              parkingSpot: spotData,
              host: hostData,
              renter: renterData,
            };
          })
        );

        setBookingsByEvent((prev) => ({
          ...prev,
          [eventId]: bookingsWithDetails,
        }));
      } catch (err) {
        console.error("Error fetching bookings:", err);
        setBookingsByEvent((prev) => ({ ...prev, [eventId]: [] }));
      }
    }
  };

  const handleInitiatePayouts = async (eventId: string) => {
    setPayoutLoading(eventId);
    setPayoutError(null);
    try {
      const functions = getFunctions();
      const initiatePayouts = httpsCallable(functions, "initiateEventPayouts");
      await initiatePayouts({ eventId });
      // Refresh event and bookings data
      const eventsSnapshot = await getDocs(collection(db, "events"));
      setEvents(
        eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[]
      );
      if (expandedBookingsEventId === eventId) {
        // Refresh bookings data using the same logic as handleToggleBookings
        const parkingSpotsSnap = await getDocs(
          query(collection(db, "parkingSpots"), where("eventId", "==", eventId))
        );

        const parkingSpotIds = parkingSpotsSnap.docs.map((doc) => doc.id);

        if (parkingSpotIds.length > 0) {
          const bookingsSnap = await getDocs(
            query(
              collection(db, "bookings"),
              where("parkingSpotId", "in", parkingSpotIds)
            )
          );

          // Get booking data with additional details (same logic as handleToggleBookings)
          const bookingsWithDetails = await Promise.all(
            bookingsSnap.docs.map(async (bookingDoc) => {
              const bookingData = bookingDoc.data();

              // Get parking spot details
              const spotRef = doc(
                db,
                "parkingSpots",
                bookingData.parkingSpotId
              );
              const spotDoc = await getDoc(spotRef);
              const spotData = spotDoc.exists() ? spotDoc.data() : null;

              // Get host details
              const hostRef = doc(db, "users", bookingData.hostId);
              const hostDoc = await getDoc(hostRef);
              const hostData = hostDoc.exists() ? hostDoc.data() : null;

              // Get renter details
              const renterRef = doc(db, "users", bookingData.userId);
              const renterDoc = await getDoc(renterRef);
              const renterData = renterDoc.exists() ? renterDoc.data() : null;

              return {
                id: bookingDoc.id,
                ...bookingData,
                parkingSpot: spotData,
                host: hostData,
                renter: renterData,
              };
            })
          );

          setBookingsByEvent((prev) => ({
            ...prev,
            [eventId]: bookingsWithDetails,
          }));
        }
      }
      setSuccess("Payouts initiated successfully!");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      setPayoutError("Failed to initiate payouts.");
    } finally {
      setPayoutLoading(null);
    }
  };

  const handleArchive = async (eventId: string) => {
    try {
      const eventRef = doc(db, "events", eventId);
      await updateDoc(eventRef, { status: "completed" });

      // Update local state
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
      setSuccess("Event archived successfully");
      setTimeout(() => setSuccess(null), 3000);
    } catch (err) {
      console.error("Error archiving event:", err);
      setError("Failed to archive event");
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
                      onChange={handleFormChange}
                      name="title"
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
                      onChange={handleFormChange}
                      name="description"
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
                      onChange={handleFormChange}
                      name="venue"
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
                      onChange={handleFormChange}
                      name="website"
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
                        onChange={handleFormChange}
                        name="startDate"
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
                        onChange={handleFormChange}
                        name="endDate"
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
                      onChange={handleFormChange}
                      name="expectedAttendance"
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
                          onChange={handleFormChange}
                          name="lat"
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
                          onChange={handleFormChange}
                          name="lng"
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
                      <p className="text-gray-600">Parking Spots:</p>
                      <div className="text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-green-600">Available:</span>
                          <span>
                            {parkingSpotStats[event.id]?.available || 0}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-blue-600">Booked:</span>
                          <span>{parkingSpotStats[event.id]?.booked || 0}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-red-600">Unavailable:</span>
                          <span>
                            {parkingSpotStats[event.id]?.unavailable || 0}
                          </span>
                        </div>
                      </div>
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

                  <div className="mt-4 flex items-center gap-2">
                    <span
                      className={`px-2 py-1 rounded text-xs font-semibold ${
                        event.payoutStatus === "complete"
                          ? "bg-green-100 text-green-800"
                          : "bg-yellow-100 text-yellow-800"
                      }`}
                    >
                      {event.payoutStatus === "complete"
                        ? "Payouts Complete"
                        : "Payouts Pending"}
                    </span>
                    {event.payoutStatus === "pending" && (
                      <button
                        className="ml-2 px-3 py-1 bg-blue-600 text-white rounded text-xs disabled:opacity-50"
                        onClick={() => handleInitiatePayouts(event.id)}
                        disabled={payoutLoading === event.id}
                      >
                        {payoutLoading === event.id
                          ? "Processing..."
                          : "Initiate Payouts"}
                      </button>
                    )}
                    {payoutError && (
                      <span className="ml-2 text-xs text-red-600">
                        {payoutError}
                      </span>
                    )}
                  </div>

                  <div className="mt-4">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => handleToggleBookings(event.id)}
                    >
                      {expandedBookingsEventId === event.id ? "Hide" : "Show"}{" "}
                      Bookings
                    </button>
                    {expandedBookingsEventId === event.id && (
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-4">
                        <h4 className="font-semibold mb-2">Bookings</h4>
                        {bookingsByEvent[event.id] ? (
                          bookingsByEvent[event.id].length > 0 ? (
                            <div className="overflow-x-auto">
                              <table className="min-w-full text-xs">
                                <thead>
                                  <tr className="border-b border-gray-300">
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Booking ID
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Renter
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Host
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Address
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Description
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Start Time
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      End Time
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Price
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Status
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      License Plate
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Car Description
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Created
                                    </th>
                                    <th className="text-left py-2 px-2 font-semibold">
                                      Payout
                                    </th>
                                  </tr>
                                </thead>
                                <tbody>
                                  {bookingsByEvent[event.id].map((booking) => (
                                    <tr
                                      key={booking.id}
                                      className="border-b border-gray-200 hover:bg-gray-100"
                                    >
                                      <td className="py-2 px-2 font-mono text-xs">
                                        {booking.id}
                                      </td>
                                      <td className="py-2 px-2">
                                        {booking.renter?.name ||
                                          booking.renter?.email ||
                                          booking.bookedByName ||
                                          booking.userId}
                                      </td>
                                      <td className="py-2 px-2">
                                        {booking.host?.name ||
                                          booking.host?.email ||
                                          booking.hostId}
                                      </td>
                                      <td
                                        className="py-2 px-2 max-w-xs truncate"
                                        title={booking.parkingSpot?.address}
                                      >
                                        {booking.parkingSpot?.address || "N/A"}
                                      </td>
                                      <td
                                        className="py-2 px-2 max-w-xs truncate"
                                        title={booking.parkingSpot?.description}
                                      >
                                        {booking.parkingSpot?.description ||
                                          "N/A"}
                                      </td>
                                      <td className="py-2 px-2">
                                        {booking.startTime?.toDate
                                          ? booking.startTime
                                              .toDate()
                                              .toLocaleString()
                                          : new Date(
                                              booking.startTime
                                            ).toLocaleString()}
                                      </td>
                                      <td className="py-2 px-2">
                                        {booking.endTime?.toDate
                                          ? booking.endTime
                                              .toDate()
                                              .toLocaleString()
                                          : new Date(
                                              booking.endTime
                                            ).toLocaleString()}
                                      </td>
                                      <td className="py-2 px-2 font-semibold">
                                        ${booking.totalPrice}
                                      </td>
                                      <td className="py-2 px-2">
                                        <span
                                          className={`px-2 py-1 rounded text-xs font-semibold ${
                                            booking.status === "confirmed"
                                              ? "bg-green-100 text-green-800"
                                              : booking.status === "pending"
                                              ? "bg-yellow-100 text-yellow-800"
                                              : booking.status === "cancelled"
                                              ? "bg-red-100 text-red-800"
                                              : "bg-gray-100 text-gray-800"
                                          }`}
                                        >
                                          {booking.status}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2 font-mono">
                                        {booking.licensePlate}
                                      </td>
                                      <td
                                        className="py-2 px-2 max-w-xs truncate"
                                        title={booking.carDescription}
                                      >
                                        {booking.carDescription}
                                      </td>
                                      <td className="py-2 px-2">
                                        {booking.createdAt?.toDate
                                          ? booking.createdAt
                                              .toDate()
                                              .toLocaleString()
                                          : new Date(
                                              booking.createdAt
                                            ).toLocaleString()}
                                      </td>
                                      <td className="py-2 px-2">
                                        <span
                                          className={`text-xs font-semibold ${
                                            booking.paidOut
                                              ? "text-green-600"
                                              : "text-yellow-600"
                                          }`}
                                        >
                                          {booking.paidOut ? "Paid" : "Unpaid"}
                                        </span>
                                      </td>
                                    </tr>
                                  ))}
                                </tbody>
                              </table>
                            </div>
                          ) : (
                            <div className="text-gray-500">
                              No bookings for this event.
                            </div>
                          )
                        ) : (
                          <div>Loading bookings...</div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6">
                    <button
                      className="text-sm text-blue-600 hover:underline"
                      onClick={() => handleToggleEmails(event.id)}
                    >
                      {expandedEventId === event.id ? "Hide" : "Show"}{" "}
                      Notification Emails
                    </button>
                    {expandedEventId === event.id && (
                      <div className="mt-2 bg-gray-50 border border-gray-200 rounded p-4">
                        {notificationEmails[event.id]?.loading ? (
                          <div>Loading emails...</div>
                        ) : notificationEmails[event.id]?.error ? (
                          <div className="text-red-600">
                            {notificationEmails[event.id].error}
                          </div>
                        ) : notificationEmails[event.id]?.emails.length ? (
                          <ul className="divide-y divide-gray-200">
                            {notificationEmails[event.id].emails.map(
                              (email) => (
                                <li
                                  key={email.id}
                                  className="py-1 flex justify-between items-center"
                                >
                                  <span>{email.email}</span>
                                  <span className="text-xs text-gray-400 ml-2">
                                    {email.createdAt?.seconds
                                      ? new Date(
                                          email.createdAt.seconds * 1000
                                        ).toLocaleString()
                                      : ""}
                                  </span>
                                </li>
                              )
                            )}
                          </ul>
                        ) : (
                          <div className="text-gray-500">
                            No notification emails for this event.
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex justify-end space-x-3">
                    <button
                      onClick={() => handleEdit(event)}
                      className="px-4 py-2 border border-gray-300 rounded-md text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Edit
                    </button>
                    <button
                      onClick={() => handleArchive(event.id)}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
                    >
                      Archive
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

export default RegisteredEventsPage;
