import { db } from "../firebase/config";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export interface Feedback {
  userId: string;
  userName: string;
  feedbackText: string;
}

export async function addFeedback({ userId, userName, feedbackText }: Feedback) {
  return addDoc(collection(db, "feedback"), {
    userId,
    userName,
    feedbackText,
    createdAt: serverTimestamp(),
  });
} 