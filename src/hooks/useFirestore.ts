import { useState, useEffect } from 'react';
import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc,
  query,
  where,
  orderBy,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestore(collectionName: string) {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = async (constraints: QueryConstraint[] = []) => {
    try {
      setLoading(true);
      const q = query(collection(db, collectionName), ...constraints);
      const snapshot = await getDocs(q);
      const items = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setData(items);
      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const getById = async (id: string) => {
    try {
      const docRef = doc(db, collectionName, id);
      const docSnap = await getDoc(docRef);
      if (docSnap.exists()) {
        return { id: docSnap.id, ...docSnap.data() };
      }
      return null;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const add = async (item: any) => {
    try {
      const docRef = await addDoc(collection(db, collectionName), item);
      return docRef.id;
    } catch (err: any) {
      setError(err.message);
      return null;
    }
  };

  const update = async (id: string, item: any) => {
    try {
      const docRef = doc(db, collectionName, id);
      await updateDoc(docRef, item);
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  const remove = async (id: string) => {
    try {
      await deleteDoc(doc(db, collectionName, id));
      return true;
    } catch (err: any) {
      setError(err.message);
      return false;
    }
  };

  return {
    data,
    loading,
    error,
    fetchData,
    getById,
    add,
    update,
    remove,
  };
}

export default useFirestore;
