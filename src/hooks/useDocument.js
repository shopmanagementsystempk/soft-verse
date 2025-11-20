import { useEffect, useState } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

const useDocument = (collectionName, documentId) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionName || !documentId) {
      setLoading(false);
      return () => {};
    }
    if (!db || !isFirebaseConfigured) {
      setData(null);
      setLoading(false);
      setError(
        new Error(
          'Firebase is not configured. Please provide REACT_APP_FIREBASE_* environment variables.',
        ),
      );
      return () => {};
    }
    const docRef = doc(db, collectionName, documentId);
    setLoading(true);
    const unsubscribe = onSnapshot(
      docRef,
      (snapshot) => {
        setData(snapshot.exists() ? snapshot.data() : null);
        setLoading(false);
      },
      (err) => {
        setError(err);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [collectionName, documentId, db, isFirebaseConfigured]);

  return { data, loading, error };
};

export default useDocument;

