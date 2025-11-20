import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import {
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import {
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { auth, db, googleProvider, isFirebaseConfigured } from '../firebase/config';

const AuthContext = createContext(null);

const parseAdminEmails = () => {
  const raw = process.env.REACT_APP_ADMIN_EMAILS || '';
  return raw
    .split(',')
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [initializing, setInitializing] = useState(true);
  const [error, setError] = useState(null);

  const adminEmails = useMemo(parseAdminEmails, []);

  const createProfileDocument = useCallback(
    async (firebaseUser, extra = {}) => {
      if (!firebaseUser || !db || !isFirebaseConfigured) return null;
      const profileRef = doc(db, 'users', firebaseUser.uid);
      const payload = {
        uid: firebaseUser.uid,
        email: firebaseUser.email,
        displayName: firebaseUser.displayName,
        photoURL: firebaseUser.photoURL,
        role: adminEmails.includes(firebaseUser.email?.toLowerCase())
          ? 'admin'
          : 'user',
        status: 'active',
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        ...extra,
      };
      await setDoc(profileRef, payload, { merge: true });
      return payload;
    },
    [adminEmails],
  );

  const loadProfile = useCallback(async (uid) => {
    if (!uid) return null;
    const profileRef = doc(db, 'users', uid);
    const snapshot = await getDoc(profileRef);
    if (snapshot.exists()) {
      return snapshot.data();
    }
    return null;
  }, []);

  useEffect(() => {
    if (!auth || !isFirebaseConfigured) {
      setInitializing(false);
      return () => {};
    }
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser);
      setError(null);
      if (firebaseUser) {
        const firestoreProfile =
          (await loadProfile(firebaseUser.uid)) ||
          (await createProfileDocument(firebaseUser));
        setProfile(firestoreProfile);
        if (firestoreProfile?.status === 'blocked') {
          await signOut(auth);
          setError(
            'Your account has been blocked. Please contact Soft Verse support.',
          );
        }
      } else {
        setProfile(null);
      }
      setInitializing(false);
    });
    return () => unsubscribe();
  }, [createProfileDocument, loadProfile]);

  const registerUser = async ({ email, password, fullName }) => {
    if (!auth || !isFirebaseConfigured) {
      throw new Error('Firebase authentication is not configured.');
    }
    const result = await createUserWithEmailAndPassword(auth, email, password);
    if (fullName) {
      await updateProfile(result.user, { displayName: fullName });
    }
    await createProfileDocument(result.user, {
      displayName: fullName,
    });
    return result.user;
  };

  const loginUser = (email, password) => {
    if (!auth || !isFirebaseConfigured) {
      return Promise.reject(new Error('Firebase authentication is not configured.'));
    }
    return signInWithEmailAndPassword(auth, email, password);
  };

  const loginWithGoogle = async () => {
    if (!auth || !googleProvider || !isFirebaseConfigured) {
      throw new Error('Google authentication is not available without Firebase configuration.');
    }
    const result = await signInWithPopup(auth, googleProvider);
    await createProfileDocument(result.user);
  };

  const logoutUser = () => {
    if (!auth || !isFirebaseConfigured) {
      return Promise.resolve();
    }
    return signOut(auth);
  };

  const toggleUserStatus = async (uid, status) => {
    if (!db || !isFirebaseConfigured) {
      throw new Error('Firebase is not configured.');
    }
    const profileRef = doc(db, 'users', uid);
    await updateDoc(profileRef, {
      status,
      updatedAt: serverTimestamp(),
    });
  };

  const isAdmin =
    !!user &&
    (profile?.role === 'admin' ||
      adminEmails.includes(user.email?.toLowerCase() || ''));

  const value = {
    user,
    profile,
    initializing,
    error,
    registerUser,
    loginUser,
    loginWithGoogle,
    logoutUser,
    toggleUserStatus,
    isAdmin,
    firebaseReady: isFirebaseConfigured,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

