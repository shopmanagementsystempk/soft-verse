import { useEffect, useMemo, useState } from 'react';
import {
  collection,
  limit,
  onSnapshot,
  orderBy,
  query,
  where,
} from 'firebase/firestore';
import { db, isFirebaseConfigured } from '../firebase/config';

export const useCollection = (
  collectionName,
  { orderByField, orderDirection = 'asc', constraints = [], limitTo } = {},
) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const constraintsKey = useMemo(
    () => JSON.stringify(constraints || []),
    [constraints],
  );

  const memoizedConstraints = useMemo(
    () => JSON.parse(constraintsKey),
    [constraintsKey],
  );

  useEffect(() => {
    if (!collectionName) {
      setLoading(false);
      return () => {};
    }
    if (!db || !isFirebaseConfigured) {
      setData([]);
      setLoading(false);
      setError(
        new Error(
          'Firebase is not configured. Please provide REACT_APP_FIREBASE_* environment variables.',
        ),
      );
      return () => {};
    }
    setLoading(true);
    const baseRef = collection(db, collectionName);
    const clauses = [];
    memoizedConstraints.forEach((constraint) => {
      if (constraint.length === 3) {
        clauses.push(where(...constraint));
      }
    });
    if (orderByField) {
      clauses.push(orderBy(orderByField, orderDirection));
    }
    if (limitTo) {
      clauses.push(limit(limitTo));
    }
    const q = clauses.length ? query(baseRef, ...clauses) : baseRef;
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((docSnapshot) => ({
          id: docSnapshot.id,
          ...docSnapshot.data(),
        }));
        setData(docs);
        setLoading(false);
      },
      (snapshotError) => {
        setError(snapshotError);
        setLoading(false);
      },
    );
    return () => unsubscribe();
  }, [
    collectionName,
    orderByField,
    orderDirection,
    limitTo,
    constraintsKey,
    isFirebaseConfigured,
    db,
  ]);

  return { data, loading, error };
};

export default useCollection;

