import React, { useEffect, useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import { db } from "../../firebase/config";
import { Card } from "../../components/ui/Card";
import { Alert } from "../../components/ui/Alert";

interface Feedback {
  id: string;
  userId: string;
  userName: string;
  feedbackText: string;
  createdAt?: { seconds: number; nanoseconds: number };
}

export const FeedbackPage: React.FC = () => {
  const { user } = useAuth();
  const [feedbacks, setFeedbacks] = useState<Feedback[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!user?.isAdmin) {
      setError("Access denied. Admin privileges required.");
      setLoading(false);
      return;
    }
    const fetchFeedback = async () => {
      setLoading(true);
      setError(null);
      try {
        const q = query(collection(db, "feedback"), orderBy("createdAt", "desc"));
        const snapshot = await getDocs(q);
        const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Feedback[];
        setFeedbacks(data);
      } catch (err) {
        setError("Failed to load feedback.");
      } finally {
        setLoading(false);
      }
    };
    fetchFeedback();
  }, [user]);

  if (!user?.isAdmin) {
    return (
      <div className="container mx-auto px-4 py-8">
        <Alert variant="error" message="Access denied. Admin privileges required." />
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">User Feedback</h1>
      {loading ? (
        <div className="text-center text-primary-500 py-12">Loading...</div>
      ) : error ? (
        <Alert variant="error" message={error} />
      ) : feedbacks.length === 0 ? (
        <Alert variant="info" message="No feedback submitted yet." />
      ) : (
        <div className="space-y-4">
          {feedbacks.map(fb => (
            <Card key={fb.id} padding="small" shadow="small">
              <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
                <div>
                  <div className="font-semibold text-primary-900">{fb.userName || "Unknown User"}</div>
                  <div className="text-primary-700 text-sm mt-1 whitespace-pre-line">{fb.feedbackText}</div>
                </div>
                <div className="text-primary-500 text-xs md:text-right mt-2 md:mt-0">
                  {fb.createdAt &&
                    new Date(fb.createdAt.seconds * 1000).toLocaleString([], {
                      year: "numeric",
                      month: "short",
                      day: "numeric",
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                </div>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
};

export default FeedbackPage; 