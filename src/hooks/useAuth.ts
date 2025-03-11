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
import { doc, setDoc, getDoc, updateDoc } from 'firebase/firestore';
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
        phoneNumber,
        profileImageUrl,
        isHost,
        address,
        createdAt: new Date(),
      };
      await setDoc(doc(db, 'users', firebaseUser.uid), userData);
      setUser(userData);
      return userData;
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { user: firebaseUser } = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data() as User;
        setUser(userData);
        return userData;
      }
    } catch (error) {
      throw error;
    }
  };

  const updateUserProfile = async (userId: string, data: Partial<User>) => {
    try {
      await updateDoc(doc(db, 'users', userId), data);
      setUser(prev => prev ? { ...prev, ...data } : null);
    } catch (error) {
      throw error;
    }
  };

  const handleSocialLogin = async (provider: GoogleAuthProvider | FacebookAuthProvider) => {
    try {
      const result = await signInWithPopup(auth, provider);
      const { user: firebaseUser } = result;
      
      // Check if user exists
      const userDoc = await getDoc(doc(db, 'users', firebaseUser.uid));
      
      if (!userDoc.exists()) {
        // Create new user document for social login
        const userData: User = {
          id: firebaseUser.uid,
          email: firebaseUser.email!,
          name: firebaseUser.displayName || '',
          profileImageUrl: firebaseUser.photoURL || undefined,
          isHost: false,
          createdAt: new Date(),
        };
        await setDoc(doc(db, 'users', firebaseUser.uid), userData);
        setUser(userData);
        return userData;
      } else {
        const userData = userDoc.data() as User;
        setUser(userData);
        return userData;
      }
    } catch (error) {
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