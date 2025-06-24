import { db } from "../../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface Feedback {
  userId: string | null;
  userName: string;
  feedbackText: string;
  email?: string;
}

export async function addFeedback({ userId, userName, feedbackText, email }: Feedback) {
  return addDoc(collection(db, "feedback"), {
    userId,
    userName,
    feedbackText,
    email: email || null,
    createdAt: serverTimestamp(),
  });
} 