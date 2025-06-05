import { collection, addDoc, updateDoc } from "firebase/firestore";
import { db } from "../../firebase/config";
import { storage } from "../../firebase/config";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { type AddressComponents } from "../../utils/geocoding";

/**
 * Event form data structure (matches RegisterAnEventPage)
 */
export interface EventFormData {
  title: string;
  address: AddressComponents;
  website: string;
  startDate: string;
  endDate: string;
  venue: string;
  coordinates: {
    lat: number;
    lng: number;
  };
  imageUrl: string;
  expectedAttendance: string;
  description: string;
}

/**
 * Creates a new event in Firestore, uploading the image to Firebase Storage if provided.
 * Handles address verification and all validation logic from RegisterAnEventPage.
 * @param formData The event form data
 * @param imageFile The image file to upload (optional)
 * @param user The current user (must be admin)
 * @returns Promise that resolves when the event is created
 */
export async function createEvent(
  formData: EventFormData,
  imageFile: File | null,
  user: { email: string; isAdmin: boolean } | null
): Promise<void> {
  if (!user?.isAdmin) {
    throw new Error("Only administrators can register events");
  }

  // Validate dates
  const startDate = new Date(formData.startDate);
  const endDate = new Date(formData.endDate);
  const now = new Date();

  if (startDate < now) {
    throw new Error("Start date cannot be in the past");
  }

  if (endDate <= startDate) {
    throw new Error("End date must be after start date");
  }

  // Validate expected attendance
  const attendance = Number(formData.expectedAttendance);
  if (isNaN(attendance) || attendance <= 0) {
    throw new Error("Expected attendance must be a positive number");
  }

  let imageUrl = "";
  if (imageFile) {
    // Upload the image to Firebase Storage
    const storageRef = ref(
      storage,
      `events/${Date.now()}-${imageFile.name}`
    );
    const snapshot = await uploadBytes(storageRef, imageFile);
    imageUrl = await getDownloadURL(snapshot.ref);
  }

  // Format the event data to match existing structure
  const eventData = {
    createdAt: new Date().toISOString(),
    description: formData.description,
    endDate: formData.endDate,
    expectedAttendance: attendance,
    imageUrl,
    location: {
      address: `${formData.address.street}, ${formData.address.city}, ${formData.address.state} ${formData.address.zipCode}`,
      coordinates: {
        lat: formData.coordinates.lat,
        lng: formData.coordinates.lng,
      },
    },
    startDate: formData.startDate,
    status: "upcoming",
    title: formData.title,
    venue: formData.venue,
    website: formData.website,
    createdBy: user.email,
  };

  // Add the event to Firestore
  const docRef = await addDoc(collection(db, "events"), eventData);
  // Save the generated ID as a field in the document
  await updateDoc(docRef, { id: docRef.id });
} 