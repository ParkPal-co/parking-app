/**
 * src/scripts/cleanupTestData.ts
 * Script to clean up all test data from Firebase Auth and Firestore
 */

import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { getAuth, signInWithEmailAndPassword, deleteUser } from 'firebase/auth';
import { db } from '../firebase/config';

const TEST_EMAILS = ['testhost@example.com', 'testrenter@example.com'];

async function cleanupTestData() {
  const auth = getAuth();
  
  try {
    console.log("Starting cleanup of test data...");

    // Clean up users collection
    console.log("\nCleaning up users collection...");
    const usersRef = collection(db, 'users');
    const usersSnapshot = await getDocs(
      query(usersRef, where('email', 'in', TEST_EMAILS))
    );
    
    for (const userDoc of usersSnapshot.docs) {
      await deleteDoc(userDoc.ref);
      console.log(`Deleted Firestore user document: ${userDoc.data().email}`);
    }

    // Clean up conversations and messages
    console.log("\nCleaning up conversations and messages...");
    const conversationsRef = collection(db, 'conversations');
    const conversationsSnapshot = await getDocs(conversationsRef);
    
    for (const convDoc of conversationsSnapshot.docs) {
      const convData = convDoc.data();
      if (TEST_EMAILS.includes(convData.hostEmail) || TEST_EMAILS.includes(convData.renterEmail)) {
        // Delete all messages in the conversation
        const messagesRef = collection(db, 'conversations', convDoc.id, 'messages');
        const messagesSnapshot = await getDocs(messagesRef);
        
        for (const messageDoc of messagesSnapshot.docs) {
          await deleteDoc(messageDoc.ref);
          console.log(`Deleted message: ${messageDoc.id}`);
        }
        
        // Delete the conversation
        await deleteDoc(convDoc.ref);
        console.log(`Deleted conversation between ${convData.hostEmail} and ${convData.renterEmail}`);
      }
    }

    // Clean up Firebase Auth accounts
    console.log("\nCleaning up Firebase Auth accounts...");
    for (const email of TEST_EMAILS) {
      try {
        // Sign in to get user credential
        const userCredential = await signInWithEmailAndPassword(auth, email, 'password123');
        // Delete the user
        await deleteUser(userCredential.user);
        console.log(`Deleted Firebase Auth account: ${email}`);
      } catch (error: any) {
        if (error.code === 'auth/user-not-found') {
          console.log(`No Firebase Auth account found for: ${email}`);
        } else {
          console.error(`Error deleting Firebase Auth account ${email}:`, error);
        }
      }
    }

    console.log("\nCleanup completed successfully!");
  } catch (error) {
    console.error("Error during cleanup:", error);
    process.exit(1);
  } finally {
    // Sign out after we're done
    await auth.signOut();
  }
}

// Execute the function
cleanupTestData(); 