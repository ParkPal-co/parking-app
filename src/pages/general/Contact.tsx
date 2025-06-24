import React, { useState } from "react";
import Footer from "../../components/navigation/Footer";
import { Card } from "../../components/ui/Card";
import { Button } from "../../components/ui/Button";
import { FeedbackModal } from "./FeedbackModal";
import { addFeedback } from "../../services/admin/feedbackService";
import { useAuth } from "../../hooks/useAuth";

const CONTACTS = [
  { label: "Technical Support", value: "alec@parkpal.co" },
  { label: "General Inquiries", value: "donminic@parkpal.co" },
];
const SUPPORT_NUMBER = "+1 (801) 309-3579"; // Replace with real number

const Contact: React.FC = () => {
  const [modalOpen, setModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();

  const handleFeedbackSubmit = async (feedback: string) => {
    setIsLoading(true);
    setError(undefined);
    setSuccess(false);
    try {
      await addFeedback({
        userId: user ? user.id : null,
        userName: user ? user.name : "Anonymous",
        feedbackText: feedback,
        email: user ? user.email : undefined,
      });
      setSuccess(true);
    } catch (e) {
      setError("Failed to send feedback. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="relative min-h-screen flex flex-col justify-between bg-primary-50">
      <div className="flex-1 flex flex-col items-center justify-center py-12 px-4">
        <Card className="w-full max-w-lg mx-auto flex flex-col gap-6 items-center bg-white shadow-lg">
          <h1 className="text-2xl font-bold text-primary-900">
            Contact & Support
          </h1>
          <div className="w-full flex flex-col gap-2">
            {CONTACTS.map((c) => (
              <div key={c.value} className="flex items-center gap-2">
                <span className="font-medium text-primary-700">{c.label}:</span>
                <a
                  href={`mailto:${c.value}`}
                  className="text-accent-700 underline"
                >
                  {c.value}
                </a>
              </div>
            ))}
            <div className="flex items-center gap-2">
              <span className="font-medium text-primary-700">
                Support Number:
              </span>
              <a
                href={`tel:${SUPPORT_NUMBER.replace(/[^\d+]/g, "")}`}
                className="text-accent-700 underline"
              >
                {SUPPORT_NUMBER}
              </a>
              <span className="text-xs text-primary-500">(call or text)</span>
            </div>
          </div>
          <Button variant="primary" onClick={() => setModalOpen(true)}>
            Send Feedback
          </Button>
        </Card>
        <FeedbackModal
          isOpen={modalOpen}
          onClose={() => {
            setModalOpen(false);
            setSuccess(false);
            setError(undefined);
          }}
          onSubmit={handleFeedbackSubmit}
          isLoading={isLoading}
          error={error}
          success={success}
        />
      </div>
      <Footer />
    </div>
  );
};

export default Contact;
