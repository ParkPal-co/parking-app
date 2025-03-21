/**
 * src/scripts/addTestMessages.ts
 * Script to add test messages and conversations
 */

import { collection, addDoc, Timestamp, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';

async function getTestUsers() {
  const usersRef = collection(db, 'users');
  const hostQuery = query(usersRef, where('email', '==', 'testhost@example.com'));
  const renterQuery = query(usersRef, where('email', '==', 'testrenter@example.com'));

  const [hostDocs, renterDocs] = await Promise.all([
    getDocs(hostQuery),
    getDocs(renterQuery)
  ]);

  const hostDoc = hostDocs.docs[0];
  const renterDoc = renterDocs.docs[0];

  if (!hostDoc || !renterDoc) {
    throw new Error('Test users not found. Please run add-test-users first.');
  }

  return {
    host: { id: hostDoc.id, ...hostDoc.data() },
    renter: { id: renterDoc.id, ...renterDoc.data() }
  };
}

async function addTestMessages() {
  try {
    console.log("Adding test conversations and messages...");

    // Get test users
    const users = await getTestUsers();
    
    // Create a test conversation
    const conversationRef = await addDoc(collection(db, "conversations"), {
      participants: [users.renter.id, users.host.id],
      createdAt: Timestamp.now(),
      lastMessage: {
        content: "Hi! I'm interested in renting your parking spot.",
        timestamp: Timestamp.now(),
        senderId: users.renter.id,
      },
      bookingId: "test-booking-id",
      unreadCount: 1,
    });

    console.log(`Created conversation with ID: ${conversationRef.id}`);

    // Add some test messages
    const messages = [
      {
        conversationId: conversationRef.id,
        senderId: users.renter.id,
        receiverId: users.host.id,
        content: "Hi! I'm interested in renting your parking spot.",
        timestamp: Timestamp.now(),
        read: true,
      },
      {
        conversationId: conversationRef.id,
        senderId: users.host.id,
        receiverId: users.renter.id,
        content: "Hello! Thanks for your interest. When would you like to park?",
        timestamp: Timestamp.fromMillis(Date.now() + 1000),
        read: false,
      },
      {
        conversationId: conversationRef.id,
        senderId: users.renter.id,
        receiverId: users.host.id,
        content: "I'm looking to park during the Taylor Swift concert. Is your spot still available?",
        timestamp: Timestamp.fromMillis(Date.now() + 2000),
        read: false,
      },
    ];

    for (const message of messages) {
      const messageRef = await addDoc(collection(db, "messages"), message);
      console.log(`Added message with ID: ${messageRef.id}`);
    }

    console.log("\nTest User Credentials for reference:");
    console.log("Host Login:");
    console.log("Email: testhost@example.com");
    console.log("Password: password123");
    console.log("\nRenter Login:");
    console.log("Email: testrenter@example.com");
    console.log("Password: password123");

    console.log("\nSuccessfully added test messages!");
  } catch (error) {
    console.error("Error adding test messages:", error);
  }
}

// Execute the function
addTestMessages(); 