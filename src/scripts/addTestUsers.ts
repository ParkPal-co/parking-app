/**
 * src/scripts/addTestUsers.ts
 * Script to add test users to Firestore and Firebase Auth
 */

import { collection, doc, setDoc, getDoc } from 'firebase/firestore';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, getAuth } from 'firebase/auth';
import { db } from '../firebase/config';

// Test user credentials - keep these simple and memorable
const testUsers = [
  {
    email: 'testhost@example.com',
    password: 'password123', // Simple password for testing
    name: 'Test Host',
    isHost: true,
    phoneNumber: '555-0123',
    address: '123 Host Street, Test City, TC 12345',
    createdAt: new Date(),
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=host1'
  },
  {
    email: 'testrenter@example.com',
    password: 'password123', // Simple password for testing
    name: 'Test Renter',
    isHost: false,
    phoneNumber: '555-0124',
    createdAt: new Date(),
    profileImageUrl: 'https://api.dicebear.com/7.x/avataaars/svg?seed=renter1'
  }
];

async function addTestUsers() {
  const auth = getAuth();
  
  try {
    console.log("Adding test users...");
    
    for (const user of testUsers) {
      try {
        let firebaseUser;
        
        try {
          // Try to create a new user
          const userCredential = await createUserWithEmailAndPassword(
            auth,
            user.email,
            user.password
          );
          firebaseUser = userCredential.user;
          console.log(`Created new Firebase Auth account for ${user.email}`);
        } catch (error: any) {
          if (error.code === 'auth/email-already-in-use') {
            // If user exists, try to sign in
            console.log(`User ${user.email} already exists in Firebase Auth, signing in...`);
            const userCredential = await signInWithEmailAndPassword(
              auth,
              user.email,
              user.password
            );
            firebaseUser = userCredential.user;
          } else {
            throw error;
          }
        }

        // Check if Firestore document exists
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        
        if (!userDoc.exists()) {
          // Create or update Firestore document
          const userData = {
            id: firebaseUser.uid,
            email: user.email,
            name: user.name,
            isHost: user.isHost,
            phoneNumber: user.phoneNumber,
            createdAt: user.createdAt,
            profileImageUrl: user.profileImageUrl
          };

          // Only add address if it exists
          if (user.address) {
            userData['address'] = user.address;
          }

          await setDoc(doc(db, 'users', firebaseUser.uid), userData);
          console.log(`Created Firestore document for ${user.email}`);
        } else {
          console.log(`Firestore document already exists for ${user.email}`);
        }

        console.log(`Completed setup for: ${user.email}\n`);
      } catch (error: any) {
        console.error(`Error processing user ${user.email}:`, error);
        throw error;
      }
    }
    
    console.log("\nTest User Credentials for reference:");
    console.log("Host Login:");
    console.log("Email: testhost@example.com");
    console.log("Password: password123");
    console.log("\nRenter Login:");
    console.log("Email: testrenter@example.com");
    console.log("Password: password123");
    
    console.log("\nSuccessfully added test users!");
  } catch (error) {
    console.error("Error adding test users:", error);
    process.exit(1);
  } finally {
    // Sign out after we're done
    await auth.signOut();
  }
}

// Execute the function
addTestUsers(); 