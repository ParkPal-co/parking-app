import React, { useState } from "react";
import { Modal } from "../../components/ui/Modal";
import { Button } from "../../components/ui/Button";
import { Alert } from "../../components/ui/Alert";

interface FeedbackModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (feedbackText: string) => Promise<void>;
  isLoading: boolean;
  error?: string;
  success?: boolean;
}

export const FeedbackModal: React.FC<FeedbackModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  isLoading,
  error,
  success,
}) => {
  const [feedback, setFeedback] = useState("");
  const [touched, setTouched] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    if (!feedback.trim()) return;
    await onSubmit(feedback);
    setFeedback("");
    setTouched(false);
  };

  const handleClose = () => {
    setFeedback("");
    setTouched(false);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Send Feedback"
      description="We value your feedback! Please let us know your thoughts or suggestions."
      size="medium"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        {success && (
          <Alert variant="success" message="Thank you for your feedback!" />
        )}
        {error && <Alert variant="error" message={error} />}
        <div className="form-group">
          <label htmlFor="feedback-textarea" className="block text-sm font-medium text-primary-700">
            Your Feedback
          </label>
          <textarea
            id="feedback-textarea"
            className="block w-full border rounded-md font-normal focus-ring transition-normal placeholder:text-primary-500 border-primary-300 text-primary-900 focus:ring-accent focus:border-accent min-h-[100px] resize-vertical p-3"
            placeholder="Type your feedback here..."
            value={feedback}
            onChange={e => setFeedback(e.target.value)}
            disabled={isLoading}
            maxLength={1000}
            onBlur={() => setTouched(true)}
            required
          />
          {touched && !feedback.trim() && (
            <p className="text-sm text-error-600 mt-1">Feedback cannot be empty.</p>
          )}
        </div>
        <div className="flex justify-end gap-2 pt-2">
          <Button type="button" variant="secondary" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" variant="primary" isLoading={isLoading} disabled={!feedback.trim() || isLoading}>
            Submit
          </Button>
        </div>
      </form>
    </Modal>
  );
}; 