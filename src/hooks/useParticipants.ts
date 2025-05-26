import { useState, useEffect } from "react";
import { Conversation } from "../services/messageService";
import { User } from "../types";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../firebase/config";

export default function useParticipants(
  conversations: Conversation[],
  userId?: string
) {
  const [participantNames, setParticipantNames] = useState<{ [key: string]: string }>({});
  const [participantProfiles, setParticipantProfiles] = useState<{ [key: string]: User }>({});

  useEffect(() => {
    const fetchParticipantInfo = async () => {
      const names: { [key: string]: string } = {};
      const profiles: { [key: string]: User } = {};

      for (const conversation of conversations) {
        for (const participantId of conversation.participants) {
          if (!names[participantId] && participantId !== userId) {
            try {
              const userDoc = await getDoc(doc(db, "users", participantId));
              if (userDoc.exists()) {
                const userData = userDoc.data() as User;
                names[participantId] = userData.name || "Unknown User";
                profiles[participantId] = userData;
              }
            } catch (err) {
              console.error("Error fetching user info:", err);
              names[participantId] = "Unknown User";
            }
          }
        }
      }
      setParticipantNames(names);
      setParticipantProfiles(profiles);
    };

    if (conversations.length > 0) {
      fetchParticipantInfo();
    }
  }, [conversations, userId]);

  return { participantNames, participantProfiles };
} 