import { useState, useEffect } from 'react';
import {
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  User as FirebaseUser,
  GoogleAuthProvider,
  FacebookAuthProvider,
  signInWithPopup,
} from 'firebase/auth';
import { doc, setDoc, getDoc, updateDoc, runTransaction } from 'firebase/firestore';
import { auth, db } from '../firebase/config';
import { User } from '../types';

export function useAuth() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
        if (userDoc.exists()) {
          setUser(userDoc.data() as User);
        } else {
          console.error('User document not found in Firestore:', firebaseUser.uid);
          await signOut(auth);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signup = async (
    email: string,
    password: string,
    name: string,
    isHost: boolean,
    phoneNumber?: string,
    profileImageUrl?: string,
    address?: string
  ) => {
    try {
      const { user: firebaseUser } = await createUserWithEmailAndPassword(auth, email, password);
      const userData: User = {
        id: firebaseUser.uid,
        email,
        name,
        isHost,
        createdAt: new Date(),
      };
      if (phoneNumber) userData.phoneNumber = phoneNumber;
      if (profileImageUrl) userData.profileImageUrl = profileImageUrl;
      if (address) userData.address = address;
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during signup:', error);
      throw error;
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
      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during login:', error);
      // Sign out the user if they were signed in but their document wasn't found
      await signOut(auth);
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

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
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
            createdAt: new Date(),
          };
          transaction.set(userRef, newUserData);
          return newUserData;
        } else {
          return userDoc.data() as User;
        }
      });

      setUser(userData);
      return userData;
    } catch (error) {
      console.error('Error during social login:', error);
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
  };
} 