import { useState, useEffect } from 'react';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  setDoc,
  DocumentData,
  QueryConstraint
} from 'firebase/firestore';
import { db } from '@/lib/firebase';

export function useFirestore<T>(collectionName: string) {
  const [data, setData] = useState<T[]>([]);
  const [loading, setLoading] = useState(true);

  // LISTAR (REAL-TIME)
  const list = (constraints: QueryConstraint[] = []) => {
    const q = query(collection(db, collectionName), ...constraints);
    
    return onSnapshot(q, (snapshot) => {
      const items = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      })) as T[];
      setData(items);
      setLoading(false);
    }, (error) => {
      console.error(`ERRO AO BUSCAR ${collectionName.toUpperCase()}:`, error);
      setLoading(false);
    });
  };

  // ADICIONAR (AUTO ID)
  const add = async (item: Omit<T, 'id'>) => {
    return await addDoc(collection(db, collectionName), item as DocumentData);
  };

  // ADICIONAR (ID MANUAL - USADO EM PROFISSIONAIS)
  const addWithId = async (id: string, item: Omit<T, 'id'>) => {
    return await setDoc(doc(db, collectionName, id.toUpperCase()), item as DocumentData);
  };

  // ATUALIZAR
  const update = async (id: string, item: Partial<T>) => {
    const docRef = doc(db, collectionName, id);
    return await updateDoc(docRef, item as DocumentData);
  };

  // REMOVER
  const remove = async (id: string) => {
    return await deleteDoc(doc(db, collectionName, id));
  };

  return { data, loading, list, add, addWithId, update, remove };
}