import { 
  collection, 
  getDocs, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  doc, 
  onSnapshot,
  setDoc
} from 'firebase/firestore';
import { db, isDemoMode, firebaseStatus, firebaseError } from './config';
import { initialSeedData } from '../utils/seedData';

// ─── In-memory Demo Store ──────────────────────────────────────────────────
// Deep clone seed data so mutations don't modify the original export
const cloneDeep = (obj) => JSON.parse(JSON.stringify(obj));

const demoStore = {
  faculties:     cloneDeep(initialSeedData.faculties),
  departments:   cloneDeep(initialSeedData.departments),
  courses:       cloneDeep(initialSeedData.courses),
  teachers:      cloneDeep(initialSeedData.teachers),
  exams:         cloneDeep(initialSeedData.exams),
  examSchedules: cloneDeep(initialSeedData.examSchedules),
  results:       cloneDeep(initialSeedData.results || []),
  users:         cloneDeep(initialSeedData.users)
};

// Demo listeners: { collectionName: [callback, ...] }
const demoListeners = {};

const notifyListeners = (collectionName) => {
  if (demoListeners[collectionName]) {
    demoListeners[collectionName].forEach(cb => cb([...demoStore[collectionName]]));
  }
};

// ─── Demo CRUD ────────────────────────────────────────────────────────────
const demoSubscribe = (collectionName, callback) => {
  if (!demoListeners[collectionName]) demoListeners[collectionName] = [];
  demoListeners[collectionName].push(callback);
  // Emit current data immediately
  callback([...(demoStore[collectionName] || [])]);
  // Return unsubscribe
  return () => {
    demoListeners[collectionName] = demoListeners[collectionName].filter(cb => cb !== callback);
  };
};

const demoCreate = (collectionName, data) => {
  const timestamp = new Date().toISOString();
  const id = `${collectionName}_${Date.now()}`;
  const doc = { id, ...data, createdAt: timestamp, updatedAt: timestamp };
  if (!demoStore[collectionName]) demoStore[collectionName] = [];
  demoStore[collectionName].push(doc);
  notifyListeners(collectionName);
  return doc;
};

const demoUpdate = (collectionName, id, updates) => {
  const timestamp = new Date().toISOString();
  const idx = demoStore[collectionName]?.findIndex(d => d.id === id);
  if (idx === -1 || idx === undefined) throw new Error(`Document ${id} not found.`);
  demoStore[collectionName][idx] = { ...demoStore[collectionName][idx], ...updates, updatedAt: timestamp };
  notifyListeners(collectionName);
  return demoStore[collectionName][idx];
};

const demoDelete = (collectionName, id) => {
  if (!demoStore[collectionName]) return true;
  demoStore[collectionName] = demoStore[collectionName].filter(d => d.id !== id);
  notifyListeners(collectionName);
  return true;
};

// ─── Public API ───────────────────────────────────────────────────────────

/**
 * Fetch all documents from a collection (one-time read)
 */
export const getCollectionData = async (collectionName) => {
  if (firebaseStatus === 'ERROR') {
    throw new Error(`Firestore Error: ${firebaseError || 'Initialization failed'}`);
  }
  if (isDemoMode) {
    return [...(demoStore[collectionName] || [])];
  }
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    return querySnapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
  } catch (err) {
    console.error(`[Firestore] Error getting ${collectionName}:`, err);
    throw err;
  }
};

/**
 * Real-time subscription to a collection
 */
export const subscribeToCollection = (collectionName, callback, onError) => {
  if (isDemoMode) {
    return demoSubscribe(collectionName, callback);
  }
  if (firebaseStatus === 'ERROR' || !db) {
    if (onError) onError(new Error(firebaseError || 'Firebase database not initialized'));
    return () => {};
  }
  const q = collection(db, collectionName);
  return onSnapshot(q, (snapshot) => {
    const data = snapshot.docs.map(docSnap => ({ id: docSnap.id, ...docSnap.data() }));
    callback(data);
  }, (error) => {
    console.error(`[Firestore] Subscription error on ${collectionName}:`, error);
    if (onError) onError(error);
  });
};

/**
 * Create a new document
 */
export const createDocument = async (collectionName, data) => {
  if (firebaseStatus === 'ERROR') {
    throw new Error(`Firestore Error: ${firebaseError || 'Initialization failed'}`);
  }
  if (isDemoMode) {
    return demoCreate(collectionName, data);
  }
  try {
    const timestamp = new Date().toISOString();
    const payload = { ...data, createdAt: timestamp, updatedAt: timestamp };
    const docRef = await addDoc(collection(db, collectionName), payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error(`[Firestore] Error creating in ${collectionName}:`, err);
    throw err;
  }
};

/**
 * Update an existing document
 */
export const updateDocument = async (collectionName, id, updates) => {
  if (firebaseStatus === 'ERROR') {
    throw new Error(`Firestore Error: ${firebaseError || 'Initialization failed'}`);
  }
  if (isDemoMode) {
    return demoUpdate(collectionName, id, updates);
  }
  try {
    const timestamp = new Date().toISOString();
    const payload = { ...updates, updatedAt: timestamp };
    const docRef = doc(db, collectionName, id);
    await updateDoc(docRef, payload);
    return { id, ...payload };
  } catch (err) {
    console.error(`[Firestore] Error updating ${id} in ${collectionName}:`, err);
    throw err;
  }
};

/**
 * Delete a document
 */
export const deleteDocument = async (collectionName, id) => {
  if (firebaseStatus === 'ERROR') {
    throw new Error(`Firestore Error: ${firebaseError || 'Initialization failed'}`);
  }
  if (isDemoMode) {
    return demoDelete(collectionName, id);
  }
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
    return true;
  } catch (err) {
    console.error(`[Firestore] Error deleting ${id} from ${collectionName}:`, err);
    throw err;
  }
};

/**
 * Write a document at a specific ID (used for users/{uid})
 */
export const setDocumentWithId = async (collectionName, id, data) => {
  if (firebaseStatus === 'ERROR') {
    throw new Error(`Firestore Error: ${firebaseError || 'Initialization failed'}`);
  }
  if (isDemoMode) {
    const timestamp = new Date().toISOString();
    const record = { id, ...data, createdAt: timestamp, updatedAt: timestamp };
    if (!demoStore[collectionName]) demoStore[collectionName] = [];
    const existing = demoStore[collectionName].findIndex(d => d.id === id);
    if (existing >= 0) {
      demoStore[collectionName][existing] = record;
    } else {
      demoStore[collectionName].push(record);
    }
    notifyListeners(collectionName);
    return record;
  }
  try {
    const timestamp = new Date().toISOString();
    const payload = { ...data, createdAt: timestamp, updatedAt: timestamp };
    const docRef = doc(db, collectionName, id);
    await setDoc(docRef, payload);
    return { id, ...payload };
  } catch (err) {
    console.error(`[Firestore] Error setting document ${id} in ${collectionName}:`, err);
    throw err;
  }
};


