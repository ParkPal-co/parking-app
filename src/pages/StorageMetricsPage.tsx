import React, { useState, useEffect } from "react";
import { collection, query, orderBy, limit, getDocs } from "firebase/firestore";
import { db } from "../firebase/config";
import { useAuth } from "../hooks/useAuth";

interface StorageMetrics {
  timestamp: string;
  total: {
    count: number;
    size: string;
  };
  profileImages: {
    count: number;
    size: string;
  };
  parkingSpots: {
    count: number;
    size: string;
  };
  events: {
    count: number;
    size: string;
  };
}

const StorageMetricsPage: React.FC = () => {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<StorageMetrics[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchMetrics = async () => {
      try {
        const metricsQuery = query(
          collection(db, "storageMetrics"),
          orderBy("timestamp", "desc"),
          limit(30) // Last 30 days
        );

        const snapshot = await getDocs(metricsQuery);
        const metricsData = snapshot.docs.map(
          (doc) => doc.data() as StorageMetrics
        );
        setMetrics(metricsData);
      } catch (err) {
        console.error("Error fetching storage metrics:", err);
        setError("Failed to load storage metrics");
      } finally {
        setLoading(false);
      }
    };

    fetchMetrics();
  }, []);

  if (
    user?.email !== "aleczaitz@gmail.com" &&
    user?.email !== "donminic30@gmail.com"
  ) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Access denied. Admin privileges required.
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Loading metrics...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          {error}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Storage Metrics</h1>

      <div className="grid gap-6">
        {metrics.map((metric, index) => (
          <div
            key={metric.timestamp}
            className="bg-white shadow rounded-lg p-6"
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold">
                {new Date(metric.timestamp).toLocaleDateString()}
              </h2>
              <span className="text-sm text-gray-500">
                {new Date(metric.timestamp).toLocaleTimeString()}
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900">Total Storage</h3>
                <p className="text-2xl font-bold">{metric.total.size} MB</p>
                <p className="text-sm text-gray-500">
                  {metric.total.count} files
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900">Profile Images</h3>
                <p className="text-2xl font-bold">
                  {metric.profileImages.size} MB
                </p>
                <p className="text-sm text-gray-500">
                  {metric.profileImages.count} files
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900">Parking Spots</h3>
                <p className="text-2xl font-bold">
                  {metric.parkingSpots.size} MB
                </p>
                <p className="text-sm text-gray-500">
                  {metric.parkingSpots.count} files
                </p>
              </div>

              <div className="bg-gray-50 p-4 rounded">
                <h3 className="font-medium text-gray-900">Events</h3>
                <p className="text-2xl font-bold">{metric.events.size} MB</p>
                <p className="text-sm text-gray-500">
                  {metric.events.count} files
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default StorageMetricsPage;
