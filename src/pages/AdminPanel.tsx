/**
 * src/pages/AdminPanel.tsx
 * Admin panel for managing events and driveways
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
} from "firebase/firestore";
import { db } from "../firebase/config";
import { Link } from "react-router-dom";

interface Event {
  id: string;
  title: string;
  description: string;
  location: {
    address: string;
    coordinates: { lat: number; lng: number };
  };
  startDate: string;
  endDate: string;
  status: "active" | "cancelled" | "completed";
}

interface Driveway {
  id: string;
  ownerId: string;
  ownerName: string;
  address: string;
  price: number;
  status: "available" | "booked" | "unavailable";
}

const AdminPanel: React.FC = () => {
  const { user } = useAuth();
  const [events, setEvents] = useState<Event[]>([]);
  const [driveways, setDriveways] = useState<Driveway[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"events" | "driveways">("events");

  useEffect(() => {
    if (!user?.isAdmin) {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }

    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);

        // Fetch events
        const eventsQuery = query(collection(db, "events"));
        const eventsSnapshot = await getDocs(eventsQuery);
        const eventsData = eventsSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Event[];
        setEvents(eventsData);

        // Fetch driveways
        const drivewaysQuery = query(collection(db, "driveways"));
        const drivewaysSnapshot = await getDocs(drivewaysQuery);
        const drivewaysData = drivewaysSnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        })) as Driveway[];
        setDriveways(drivewaysData);
      } catch (err) {
        console.error("Error fetching data:", err);
        setError("Failed to load data");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  const handleUpdateEventStatus = async (
    eventId: string,
    status: Event["status"]
  ) => {
    try {
      await updateDoc(doc(db, "events", eventId), { status });
      setEvents((prev) =>
        prev.map((event) =>
          event.id === eventId ? { ...event, status } : event
        )
      );
    } catch (err) {
      console.error("Error updating event:", err);
      setError("Failed to update event status");
    }
  };

  const handleUpdateDrivewayStatus = async (
    drivewayId: string,
    status: Driveway["status"]
  ) => {
    try {
      await updateDoc(doc(db, "driveways", drivewayId), { status });
      setDriveways((prev) =>
        prev.map((driveway) =>
          driveway.id === drivewayId ? { ...driveway, status } : driveway
        )
      );
    } catch (err) {
      console.error("Error updating driveway:", err);
      setError("Failed to update driveway status");
    }
  };

  const handleDeleteEvent = async (eventId: string) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return;

    try {
      await deleteDoc(doc(db, "events", eventId));
      setEvents((prev) => prev.filter((event) => event.id !== eventId));
    } catch (err) {
      console.error("Error deleting event:", err);
      setError("Failed to delete event");
    }
  };

  const handleDeleteDriveway = async (drivewayId: string) => {
    if (!window.confirm("Are you sure you want to delete this driveway?"))
      return;

    try {
      await deleteDoc(doc(db, "driveways", drivewayId));
      setDriveways((prev) =>
        prev.filter((driveway) => driveway.id !== drivewayId)
      );
    } catch (err) {
      console.error("Error deleting driveway:", err);
      setError("Failed to delete driveway");
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
      <h1 className="text-3xl font-bold mb-8">Admin Panel</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Events Management Card */}
        <Link
          to="/registered-events"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Events Management</h2>
          <p className="text-gray-600">
            View and manage all registered events, including their status and
            details.
          </p>
        </Link>

        {/* Register Event Card */}
        <Link
          to="/register-event"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Register New Event</h2>
          <p className="text-gray-600">
            Create and register new events with detailed information and images.
          </p>
        </Link>

        {/* Storage Metrics Card */}
        <Link
          to="/storage-metrics"
          className="block p-6 bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow"
        >
          <h2 className="text-xl font-semibold mb-2">Storage Metrics</h2>
          <p className="text-gray-600">
            Monitor storage usage, track costs, and view metrics for different
            file types.
          </p>
        </Link>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="mb-6">
        <div className="border-b border-gray-200">
          <nav className="-mb-px flex space-x-8">
            <button
              onClick={() => setActiveTab("events")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "events"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Events
            </button>
            <button
              onClick={() => setActiveTab("driveways")}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === "driveways"
                  ? "border-black text-black"
                  : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300"
              }`}
            >
              Driveways
            </button>
          </nav>
        </div>
      </div>

      {loading ? (
        <div className="text-center py-12">Loading...</div>
      ) : (
        <>
          {activeTab === "events" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Event
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Location
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Dates
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {events.map((event) => (
                    <tr key={event.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {event.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {event.description}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {event.location?.address || ""}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {new Date(event.startDate).toLocaleDateString()} -{" "}
                        {new Date(event.endDate).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={event.status}
                          onChange={(e) =>
                            handleUpdateEventStatus(
                              event.id,
                              e.target.value as Event["status"]
                            )
                          }
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="active">Active</option>
                          <option value="cancelled">Cancelled</option>
                          <option value="completed">Completed</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteEvent(event.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {activeTab === "driveways" && (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Owner
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Address
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Price
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {driveways.map((driveway) => (
                    <tr key={driveway.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {driveway.ownerName}
                        </div>
                        <div className="text-sm text-gray-500">
                          ID: {driveway.ownerId}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {driveway.address}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ${driveway.price}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <select
                          value={driveway.status}
                          onChange={(e) =>
                            handleUpdateDrivewayStatus(
                              driveway.id,
                              e.target.value as Driveway["status"]
                            )
                          }
                          className="text-sm border-gray-300 rounded-md"
                        >
                          <option value="available">Available</option>
                          <option value="booked">Booked</option>
                          <option value="unavailable">Unavailable</option>
                        </select>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <button
                          onClick={() => handleDeleteDriveway(driveway.id)}
                          className="text-red-600 hover:text-red-900"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default AdminPanel;
