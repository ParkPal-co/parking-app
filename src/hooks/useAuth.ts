import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
  sendEmailVerification,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [signupInProgress, setSignupInProgress] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        let userDoc;
        let attempts = 0;
        while (attempts < 5) {
          userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
          if (userDoc.exists()) break;
          await new Promise(res => setTimeout(res, 200));
          attempts++;
        }
        if (userDoc && userDoc.exists()) {
          const userData = userDoc.data() as User;
          // Update emailVerified status from Firebase Auth
          if (userData.emailVerified !== firebaseUser.emailVerified) {
            await updateDoc(doc(db, 'users', firebaseUser.uid), {
              emailVerified: firebaseUser.emailVerified
            });
            userData.emailVerified = firebaseUser.emailVerified;
          }
          // Check Firestore for admin status
          let isAdmin = false;
          if (firebaseUser.email) {
            const adminDoc = await getDoc(doc(db, 'admins', firebaseUser.email));
            isAdmin = adminDoc.exists();
          }
          setUser({ ...userData, isAdmin });
        } else {
          if (!signupInProgress) {
            console.warn('User document not found in Firestore:', firebaseUser.uid);
            setUser(null);
          }
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, [signupInProgress]);

  const signup = async (
    email: string,
    password: string,
    name: string,
    isHost: boolean,
    phoneNumber?: string,
    profileImageUrl?: string,
    address?: string,
    termsAccepted?: boolean,
    termsAcceptedAt?: Date
  ) => {
    setSignupInProgress(true);
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      // Send verification email
      await sendEmailVerification(firebaseUser);

      // Wait for authentication state to be fully established
      await new Promise<void>((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          if (user) {
            unsubscribe();
            resolve();
          }
        });
      });

      const userData: User = {
        id: firebaseUser.uid,
        email,
        name,
        isHost,
        emailVerified: false,
        createdAt: new Date(),
        termsAccepted: termsAccepted ?? true,
        ...(termsAcceptedAt ? { termsAcceptedAt } : {}),
        // stripeAccountId will be set later if the user becomes a host and connects Stripe
      };
      if (phoneNumber) userData.phoneNumber = phoneNumber;
      if (profileImageUrl) userData.profileImageUrl = profileImageUrl;
      if (address) userData.address = address;

      await setDoc(doc(db, 'users', firebaseUser.uid), userData);

      // Fetch the user document to ensure it's available and set it in state
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        setUser(userDoc.data() as User);
      } else {
        setUser(userData); // fallback, but this should not happen
      }
      return userData;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
    } finally {
      setSignupInProgress(false);
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        console.error('User document not found in Firestore:', firebaseUser.uid);
        await signOut(auth);
        throw new Error('User account not found. Please try signing up first.');
      }
      
      const userData = userDoc.data() as User;
      // Update emailVerified status from Firebase Auth
      if (userData.emailVerified !== firebaseUser.emailVerified) {
        await updateDoc(doc(db, 'users', firebaseUser.uid), {
          emailVerified: firebaseUser.emailVerified
        });
        userData.emailVerified = firebaseUser.emailVerified;
      }
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during login:', error);
      await signOut(auth);
      throw error;
    }
  };

  const sendVerificationEmail = async () => {
    try {
      if (!auth.currentUser) {
        throw new Error('No user is currently signed in');
      }
      await sendEmailVerification(auth.currentUser);
      return true;
    } catch (error) {
      console.error('Error sending verification email:', error);
      throw error;
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider, termsAccepted?: boolean, termsAcceptedAt?: Date) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = result;
      
      // Use a transaction to ensure atomicity
      const userData = await runTransaction(db, async (transaction) => {
        const userRef = doc(db, 'users', firebaseUser.uid);
        const userDoc = await transaction.get(userRef);
        
        if (!userDoc.exists()) {
          // Create new user document for social login
          const newUserData: User = {
            id: firebaseUser.uid,
            email: firebaseUser.email!,
            name: firebaseUser.displayName || '',
            profileImageUrl: firebaseUser.photoURL || undefined,
            isHost: false,
            emailVerified: firebaseUser.emailVerified,
            createdAt: new Date(),
            termsAccepted: termsAccepted ?? true,
            ...(termsAcceptedAt ? { termsAcceptedAt } : {}),
          };
          transaction.set(userRef, newUserData);
          return newUserData;
        } else {
          const existingData = userDoc.data() as User;
          // Update emailVerified status
          if (existingData.emailVerified !== firebaseUser.emailVerified) {
            transaction.update(userRef, { emailVerified: firebaseUser.emailVerified });
            return { ...existingData, emailVerified: firebaseUser.emailVerified };
          }
          return existingData;
        }
      });

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during social login:', error);
      throw error;
    }
  };

  const updateUserProfile = async (userId: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  };

  const logout = () => {
    return signOut(auth);
  };

  return {
    user,
    loading,
    signup,
    login,
    logout,
    updateUserProfile,
    handleSocialLogin,
    sendVerificationEmail,
  };
} 