import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  serverTimestamp,
  setDoc,
  updateDoc,
} from 'firebase/firestore';
import { db } from '../firebase/config';

export const createDocument = async (collectionName, payload) => {
  const colRef = collection(db, collectionName);
  return addDoc(colRef, {
    ...payload,
    createdAt: serverTimestamp(),
    updatedAt: serverTimestamp(),
  });
};

export const saveDocument = async (collectionName, documentId, payload) => {
  const docRef = doc(db, collectionName, documentId);
  await setDoc(
    docRef,
    {
      ...payload,
      updatedAt: serverTimestamp(),
    },
    { merge: true },
  );
  return docRef;
};

export const updateDocument = async (collectionName, documentId, payload) => {
  const docRef = doc(db, collectionName, documentId);
  return updateDoc(docRef, {
    ...payload,
    updatedAt: serverTimestamp(),
  });
};

export const deleteDocument = async (collectionName, documentId) => {
  const docRef = doc(db, collectionName, documentId);
  return deleteDoc(docRef);
};

